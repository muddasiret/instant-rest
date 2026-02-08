// Background Service Worker for handling API requests
// This bypasses CORS restrictions by making requests from the extension context

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'makeRequest') {
    handleApiRequest(request)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function handleApiRequest(request) {
  const { url, method, headers = {}, body, bodyType = 'json' } = request;
  const startTime = Date.now();

  try {
    // Build fetch options
    const fetchOptions = {
      method: method,
      headers: {
        'Accept': 'application/json, text/html, text/plain, */*',
        ...headers
      }
    };
    
    // Add Content-Type based on body type if not already set
    if (body && !fetchOptions.headers['Content-Type']) {
      if (bodyType === 'json') {
        fetchOptions.headers['Content-Type'] = 'application/json';
      } else if (bodyType === 'form' || bodyType === 'urlencoded') {
        fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
    
    // Add body for methods that support it
    if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (bodyType === 'json') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      } else {
        fetchOptions.body = body;
      }
    }

    // Make the fetch request
    const response = await fetch(url, fetchOptions);

    // Calculate response time
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Extract headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get content type
    const contentType = response.headers.get('content-type') || '';

    // Read response body
    let responseBody;
    if (contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch (e) {
        // If JSON parsing fails, fall back to text
        responseBody = await response.text();
      }
    } else {
      responseBody = await response.text();
    }

    // Return structured response
    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      contentType: contentType,
      time: responseTime,
      url: response.url
    };

  } catch (error) {
    // Handle network errors, timeouts, etc.
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      error: error.message,
      time: responseTime
    };
  }
}

// Open extension in a new tab when icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// Log when service worker is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Instant REST Extension installed');
});
