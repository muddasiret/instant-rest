// DOM Elements
const urlInput = document.getElementById('url');
const methodSelect = document.getElementById('method');
const sendBtn = document.getElementById('sendBtn');
const responseContent = document.getElementById('responseContent');
const statusCodeEl = document.getElementById('statusCode');
const responseTimeEl = document.getElementById('responseTime');
const headersSection = document.getElementById('headersSection');
const headersToggle = document.getElementById('headersToggle');
const headersContent = document.getElementById('headersContent');
const bodySection = document.getElementById('bodySection');
const bodyContent = document.getElementById('bodyContent');
const bodyTypeEl = document.getElementById('bodyType');
const copyBtn = document.getElementById('copyBtn');

// Phase 2: New DOM Elements
const paramsToggle = document.getElementById('paramsToggle');
const paramsContent = document.getElementById('paramsContent');
const paramsContainer = document.getElementById('paramsContainer');
const requestHeadersToggle = document.getElementById('requestHeadersToggle');
const requestHeadersContent = document.getElementById('requestHeadersContent');
const headersContainer = document.getElementById('headersContainer');
const requestBodySection = document.getElementById('requestBodySection');
const requestBodyToggle = document.getElementById('requestBodyToggle');
const requestBodyContent = document.getElementById('requestBodyContent');
const requestBodyInput = document.getElementById('requestBodyInput');
const bodyValidationError = document.getElementById('bodyValidationError');

// Phase 3: Curl Import and History DOM Elements
const importCurlBtn = document.getElementById('importCurlBtn');
const curlModal = document.getElementById('curlModal');
const closeCurlModal = document.getElementById('closeCurlModal');
const cancelCurlBtn = document.getElementById('cancelCurlBtn');
const importCurlSubmitBtn = document.getElementById('importCurlSubmitBtn');
const curlInput = document.getElementById('curlInput');
const curlError = document.getElementById('curlError');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Phase 4: Collections DOM Elements
const historyTab = document.getElementById('historyTab');
const collectionsTab = document.getElementById('collectionsTab');
const historyView = document.getElementById('historyView');
const collectionsView = document.getElementById('collectionsView');
const sidebarSearch = document.getElementById('sidebarSearch');
const saveBtn = document.getElementById('saveBtn');
const newCollectionBtn = document.getElementById('newCollectionBtn');
const collectionsList = document.getElementById('collectionsList');
const collectionPickerModal = document.getElementById('collectionPickerModal');
const closeCollectionPickerModal = document.getElementById('closeCollectionPickerModal');
const cancelCollectionPickerBtn = document.getElementById('cancelCollectionPickerBtn');
const saveToCollectionBtn = document.getElementById('saveToCollectionBtn');
const requestNameInput = document.getElementById('requestNameInput');
const collectionSelect = document.getElementById('collectionSelect');
const collectionPickerError = document.getElementById('collectionPickerError');
const newCollectionModal = document.getElementById('newCollectionModal');
const closeNewCollectionModal = document.getElementById('closeNewCollectionModal');
const cancelNewCollectionBtn = document.getElementById('cancelNewCollectionBtn');
const createCollectionBtn = document.getElementById('createCollectionBtn');
const collectionNameInput = document.getElementById('collectionNameInput');
const newCollectionError = document.getElementById('newCollectionError');
const importCollectionFile = document.getElementById('importCollectionFile');

// State
let currentResponse = null;
let headersExpanded = false;
let paramsExpanded = false;
let requestHeadersExpanded = false;
let requestBodyExpanded = false;
let queryParams = [];
let customHeaders = [];
let currentBodyType = 'json';
let requestHistory = [];
let collections = [];
let currentTab = 'history';
let searchQuery = '';
let currentEditingRequest = null; // For updating saved requests

// Event Listeners
sendBtn.addEventListener('click', sendRequest);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendRequest();
});
urlInput.addEventListener('input', handleUrlChange);
headersToggle.addEventListener('click', toggleHeaders);
copyBtn.addEventListener('click', copyResponse);
methodSelect.addEventListener('change', handleMethodChange);

// Phase 2: New Event Listeners
paramsToggle.addEventListener('click', toggleParams);
requestHeadersToggle.addEventListener('click', toggleRequestHeaders);
requestBodyToggle.addEventListener('click', toggleRequestBody);

// Body type tabs
document.querySelectorAll('.body-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    document.querySelectorAll('.body-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    currentBodyType = e.target.dataset.type;
    updateBodyPlaceholder();
  });
});

// Common headers checkboxes
document.querySelectorAll('.common-header-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', handleCommonHeaderToggle);
});

// Phase 3: Curl Import Event Listeners
importCurlBtn.addEventListener('click', openCurlModal);
closeCurlModal.addEventListener('click', closeCurlModalHandler);
cancelCurlBtn.addEventListener('click', closeCurlModalHandler);
importCurlSubmitBtn.addEventListener('click', handleCurlImport);
curlModal.addEventListener('click', (e) => {
  if (e.target === curlModal) closeCurlModalHandler();
});
clearHistoryBtn.addEventListener('click', clearAllHistory);

// Phase 4: Collections Event Listeners
historyTab.addEventListener('click', () => switchTab('history'));
collectionsTab.addEventListener('click', () => switchTab('collections'));
sidebarSearch.addEventListener('input', handleSearch);
saveBtn.addEventListener('click', openCollectionPicker);
newCollectionBtn.addEventListener('click', openNewCollectionModal);
closeCollectionPickerModal.addEventListener('click', closeCollectionPickerHandler);
cancelCollectionPickerBtn.addEventListener('click', closeCollectionPickerHandler);
saveToCollectionBtn.addEventListener('click', handleSaveToCollection);
collectionPickerModal.addEventListener('click', (e) => {
  if (e.target === collectionPickerModal) closeCollectionPickerHandler();
});
closeNewCollectionModal.addEventListener('click', closeNewCollectionHandler);
cancelNewCollectionBtn.addEventListener('click', closeNewCollectionHandler);
createCollectionBtn.addEventListener('click', handleCreateCollection);
newCollectionModal.addEventListener('click', (e) => {
  if (e.target === newCollectionModal) closeNewCollectionHandler();
});
importCollectionFile.addEventListener('change', handleImportCollectionFile);

// Event delegation for dynamically generated elements
collectionsList.addEventListener('click', handleCollectionsClick);
historyList.addEventListener('click', handleHistoryClick);
collectionsList.addEventListener('blur', handleCollectionNameBlur, true);
collectionsList.addEventListener('keypress', handleCollectionNameKeypress);

// Initialize
initialize();

async function initialize() {
  renderParams();
  renderHeaders();
  handleMethodChange();
  await loadHistory();
  loadCollections();
  loadTab();
  
  // Load the latest request from history if available
  if (requestHistory.length > 0) {
    loadRequestFromHistory(requestHistory[0]);
  }
}

// Handle Method Change
function handleMethodChange() {
  const method = methodSelect.value;
  const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  // Remove all method classes
  methodSelect.className = 'method-selector';
  
  // Add method-specific class
  methodSelect.classList.add(`method-${method.toLowerCase()}`);
  
  if (methodsWithBody.includes(method)) {
    requestBodySection.style.display = 'block';
  } else {
    requestBodySection.style.display = 'none';
  }
}

// Toggle Functions
function toggleParams() {
  paramsExpanded = !paramsExpanded;
  paramsContent.style.display = paramsExpanded ? 'block' : 'none';
  paramsToggle.querySelector('.toggle-icon').textContent = paramsExpanded ? '▲' : '▼';
}

function toggleRequestHeaders() {
  requestHeadersExpanded = !requestHeadersExpanded;
  requestHeadersContent.style.display = requestHeadersExpanded ? 'block' : 'none';
  requestHeadersToggle.querySelector('.toggle-icon').textContent = requestHeadersExpanded ? '▲' : '▼';
}

function toggleRequestBody() {
  requestBodyExpanded = !requestBodyExpanded;
  requestBodyContent.style.display = requestBodyExpanded ? 'block' : 'none';
  requestBodyToggle.querySelector('.toggle-icon').textContent = requestBodyExpanded ? '▲' : '▼';
}

// Query Parameters Management
function renderParams() {
  paramsContainer.innerHTML = '';
  
  // Render existing params
  queryParams.forEach((param, index) => {
    const row = createParamRow(param.key, param.value, index);
    paramsContainer.appendChild(row);
  });
  
  // Always add one empty row at the bottom
  const emptyRow = createParamRow('', '', -1);
  paramsContainer.appendChild(emptyRow);
}

function createParamRow(key, value, index) {
  const row = document.createElement('div');
  row.className = 'param-row';
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Key';
  keyInput.value = key;
  keyInput.addEventListener('input', (e) => handleParamInput(index, 'key', e.target.value));
  
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Value';
  valueInput.value = value;
  valueInput.addEventListener('input', (e) => handleParamInput(index, 'value', e.target.value));
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-row-btn';
  deleteBtn.textContent = '×';
  deleteBtn.disabled = index === -1;
  deleteBtn.addEventListener('click', () => deleteParam(index));
  
  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(deleteBtn);
  
  return row;
}

function handleParamInput(index, field, value) {
  if (index === -1) {
    // New row - add to params if both key and value are not empty
    const allInputs = paramsContainer.querySelectorAll('.param-row:last-child input');
    const key = allInputs[0].value.trim();
    const val = allInputs[1].value.trim();
    
    if (key || val) {
      queryParams.push({ key: key, value: val });
      renderParams();
      updateUrlFromParams();
    }
  } else {
    // Update existing param
    queryParams[index][field] = value;
    updateUrlFromParams();
  }
}

function deleteParam(index) {
  if (index >= 0) {
    queryParams.splice(index, 1);
    renderParams();
    updateUrlFromParams();
  }
}

function updateUrlFromParams() {
  const url = urlInput.value.trim();
  if (!url) return;
  
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    
    const validParams = queryParams.filter(p => p.key.trim());
    validParams.forEach(param => {
      urlObj.searchParams.append(param.key, param.value);
    });
    
    urlInput.value = urlObj.toString();
  } catch (e) {
    // Invalid URL, skip update
  }
}

function handleUrlChange() {
  const url = urlInput.value.trim();
  if (!url) return;
  
  try {
    const urlObj = new URL(url);
    const params = [];
    
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });
    
    // Only update if params changed
    if (JSON.stringify(params) !== JSON.stringify(queryParams)) {
      queryParams = params;
      renderParams();
    }
  } catch (e) {
    // Invalid URL, skip parsing
  }
}

// Custom Headers Management
function renderHeaders() {
  headersContainer.innerHTML = '';
  
  // Render existing headers
  customHeaders.forEach((header, index) => {
    const enabled = header.enabled !== undefined ? header.enabled : true;
    const row = createHeaderRow(header.key, header.value, index, enabled);
    headersContainer.appendChild(row);
  });
  
  // Always add one empty row at the bottom
  const emptyRow = createHeaderRow('', '', -1);
  headersContainer.appendChild(emptyRow);
}

function createHeaderRow(key, value, index, enabled = true) {
  const row = document.createElement('div');
  row.className = 'header-input-row';
  
  // Checkbox for enabling/disabling header
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'header-checkbox';
  checkbox.checked = enabled;
  checkbox.disabled = index === -1;
  checkbox.addEventListener('change', (e) => toggleHeaderEnabled(index, e.target.checked));
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Header name';
  keyInput.value = key;
  keyInput.addEventListener('input', (e) => handleHeaderInput(index, 'key', e.target.value));
  
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Header value';
  valueInput.value = value;
  valueInput.addEventListener('input', (e) => handleHeaderInput(index, 'value', e.target.value));
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-row-btn';
  deleteBtn.textContent = '×';
  deleteBtn.disabled = index === -1;
  deleteBtn.addEventListener('click', () => deleteHeader(index));
  
  row.appendChild(checkbox);
  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(deleteBtn);
  
  // Apply disabled styling if header is disabled
  if (!enabled && index !== -1) {
    row.classList.add('disabled-header');
    keyInput.style.opacity = '0.5';
    valueInput.style.opacity = '0.5';
  }
  
  return row;
}

function handleHeaderInput(index, field, value) {
  if (index === -1) {
    // New row - add to headers if both key and value are not empty
    const allInputs = headersContainer.querySelectorAll('.header-input-row:last-child input');
    const key = allInputs[1].value.trim();
    const val = allInputs[2].value.trim();
    
    if (key || val) {
      customHeaders.push({ key: key, value: val, enabled: true });
      renderHeaders();
    }
  } else {
    // Update existing header
    customHeaders[index][field] = value;
  }
}

function deleteHeader(index) {
  if (index >= 0) {
    customHeaders.splice(index, 1);
    renderHeaders();
  }
}

function toggleHeaderEnabled(index, enabled) {
  if (index >= 0) {
    customHeaders[index].enabled = enabled;
    renderHeaders();
  }
}

function handleCommonHeaderToggle(e) {
  const checkbox = e.target;
  const headerName = checkbox.dataset.header;
  const headerValue = checkbox.dataset.value;
  
  if (checkbox.checked) {
    // Add to custom headers if not already present
    const exists = customHeaders.some(h => h.key === headerName);
    if (!exists) {
      customHeaders.push({ key: headerName, value: headerValue, enabled: true });
      renderHeaders();
    }
  } else {
    // Remove from custom headers
    const index = customHeaders.findIndex(h => h.key === headerName);
    if (index >= 0) {
      customHeaders.splice(index, 1);
      renderHeaders();
    }
  }
}

// Request Body Management
function updateBodyPlaceholder() {
  const placeholders = {
    json: '{\n  "key": "value"\n}',
    form: 'key1=value1&key2=value2',
    urlencoded: 'key1=value1&key2=value2'
  };
  requestBodyInput.placeholder = placeholders[currentBodyType] || '';
}

function validateRequestBody() {
  bodyValidationError.classList.remove('show');
  bodyValidationError.textContent = '';
  
  const body = requestBodyInput.value.trim();
  if (!body) return true;
  
  if (currentBodyType === 'json') {
    try {
      JSON.parse(body);
      return true;
    } catch (e) {
      bodyValidationError.textContent = 'Invalid JSON: ' + e.message;
      bodyValidationError.classList.add('show');
      return false;
    }
  }
  
  return true;
}

function buildHeadersObject() {
  const headers = {};
  
  // Add custom headers (only enabled ones)
  customHeaders.forEach(header => {
    const isEnabled = header.enabled !== undefined ? header.enabled : true;
    if (header.key.trim() && isEnabled) {
      headers[header.key.trim()] = header.value;
    }
  });
  
  return headers;
}

function getRequestBody() {
  const body = requestBodyInput.value.trim();
  if (!body) return null;
  
  if (currentBodyType === 'json') {
    try {
      return JSON.parse(body);
    } catch (e) {
      return body;
    }
  }
  
  return body;
}

// Send API Request
async function sendRequest() {
  const url = urlInput.value.trim();
  const method = methodSelect.value;

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    showError('Invalid URL format');
    return;
  }
  
  // Validate request body if present
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!validateRequestBody()) {
      return;
    }
  }

  // Show loading state
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';
  clearResponse();

  try {
    // Build request payload
    const requestPayload = {
      action: 'makeRequest',
      url: url,
      method: method,
      headers: buildHeadersObject(),
      body: getRequestBody(),
      bodyType: currentBodyType
    };
    
    // Send request to background script
    const response = await chrome.runtime.sendMessage(requestPayload);

    if (response.error) {
      showError(response.error);
    } else {
      displayResponse(response);
      // Add to history after successful request
      addToHistory(method, url);
    }
  } catch (error) {
    showError('Failed to send request: ' + error.message);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

// Display Response
function displayResponse(response) {
  currentResponse = response;

  // Display status code
  statusCodeEl.textContent = `Status: ${response.status} ${response.statusText}`;
  statusCodeEl.className = 'status-code ' + getStatusClass(response.status);

  // Display response time
  responseTimeEl.textContent = `Time: ${response.time}ms`;

  // Hide empty state, show response sections
  responseContent.innerHTML = '';
  responseContent.style.display = 'none';
  
  // Display headers
  displayHeaders(response.headers);

  // Display body
  displayBody(response.body, response.contentType);

  // Show sections
  headersSection.style.display = 'block';
  bodySection.style.display = 'block';
  
  // Collapse request accordions
  if (requestHeadersExpanded) {
    requestHeadersExpanded = false;
    requestHeadersContent.style.display = 'none';
    requestHeadersToggle.querySelector('.toggle-icon').textContent = '▼';
  }
  
  if (requestBodyExpanded) {
    requestBodyExpanded = false;
    requestBodyContent.style.display = 'none';
    requestBodyToggle.querySelector('.toggle-icon').textContent = '▼';
  }
  
  // Scroll to response section
  const responseSection = document.querySelector('.response-section');
  if (responseSection) {
    responseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Display Headers
function displayHeaders(headers) {
  headersContent.innerHTML = '';
  
  const headerEntries = Object.entries(headers);
  if (headerEntries.length === 0) {
    headersContent.innerHTML = '<div class="no-headers">No headers</div>';
    return;
  }

  const table = document.createElement('div');
  table.className = 'headers-table';

  headerEntries.forEach(([key, value]) => {
    const row = document.createElement('div');
    row.className = 'header-row';
    
    const keyEl = document.createElement('div');
    keyEl.className = 'header-key';
    keyEl.textContent = key;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'header-value';
    valueEl.textContent = value;
    
    row.appendChild(keyEl);
    row.appendChild(valueEl);
    table.appendChild(row);
  });

  headersContent.appendChild(table);
}

// Display Body
function displayBody(body, contentType) {
  bodyTypeEl.textContent = contentType || 'text/plain';

  // Determine content type and format accordingly
  if (contentType && contentType.includes('application/json')) {
    formatJSON(body);
  } else if (contentType && contentType.includes('text/html')) {
    formatHTML(body);
  } else {
    formatPlainText(body);
  }
}

// Format JSON
function formatJSON(body) {
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const formatted = JSON.stringify(parsed, null, 2);
    bodyContent.innerHTML = syntaxHighlightJSON(formatted);
    bodyContent.className = 'body-content json';
  } catch (e) {
    bodyContent.textContent = body;
    bodyContent.className = 'body-content';
  }
}

// Format HTML
function formatHTML(body) {
  bodyContent.textContent = body;
  bodyContent.className = 'body-content html';
}

// Format Plain Text
function formatPlainText(body) {
  bodyContent.textContent = body;
  bodyContent.className = 'body-content plain';
}

// Syntax Highlight JSON
function syntaxHighlightJSON(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        // Check if the string value is a URL
        const stringValue = match.slice(1, -1); // Remove quotes
        if (/^https?:\/\//.test(stringValue)) {
          cls = 'json-url';
        } else {
          cls = 'json-string';
        }
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// Get Status Code Class
function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'status-success';
  if (status >= 300 && status < 400) return 'status-redirect';
  if (status >= 400 && status < 500) return 'status-client-error';
  if (status >= 500) return 'status-server-error';
  return '';
}

// Show Error
function showError(message) {
  responseContent.style.display = 'block';
  headersSection.style.display = 'none';
  bodySection.style.display = 'none';
  
  responseContent.innerHTML = `
    <div class="error-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p class="error-message">${escapeHtml(message)}</p>
    </div>
  `;

  statusCodeEl.textContent = '';
  responseTimeEl.textContent = '';
}

// Clear Response
function clearResponse() {
  currentResponse = null;
  statusCodeEl.textContent = '';
  responseTimeEl.textContent = '';
  headersContent.innerHTML = '';
  bodyContent.textContent = '';
  headersSection.style.display = 'none';
  bodySection.style.display = 'none';
  
  // Show empty state
  responseContent.innerHTML = `
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <p>Enter a URL and click Send to get started</p>
    </div>
  `;
  responseContent.style.display = 'block';
}

// Toggle Headers
function toggleHeaders() {
  headersExpanded = !headersExpanded;
  headersContent.style.display = headersExpanded ? 'block' : 'none';
  headersToggle.querySelector('.toggle-icon').textContent = headersExpanded ? '▲' : '▼';
}

// Copy Response
function copyResponse() {
  if (!currentResponse) return;

  const textToCopy = bodyContent.textContent;
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Show feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== PHASE 3: CURL IMPORT ====================

// Open Curl Modal
function openCurlModal() {
  curlModal.style.display = 'flex';
  curlInput.value = '';
  curlError.textContent = '';
  curlError.style.display = 'none';
  curlInput.focus();
}

// Close Curl Modal
function closeCurlModalHandler() {
  curlModal.style.display = 'none';
  curlInput.value = '';
  curlError.textContent = '';
  curlError.style.display = 'none';
}

// Parse Curl Command
function parseCurlCommand(curlCmd) {
  try {
    // Normalize the curl command - handle multi-line with backslashes
    let normalized = curlCmd
      .replace(/\\\n/g, ' ')  // Remove backslash line breaks
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
    
    // Remove 'curl' from the beginning if present
    normalized = normalized.replace(/^curl\s+/i, '');
    
    const result = {
      method: 'GET',
      url: '',
      headers: [],
      body: null,
      bodyType: 'json'
    };
    
    // Extract URL - handle quoted and unquoted URLs
    let urlMatch = normalized.match(/^['"]?(https?:\/\/[^'"\s]+)['"]?/i);
    if (!urlMatch) {
      // Try to find URL after flags
      urlMatch = normalized.match(/(?:\s|^)['"]?(https?:\/\/[^'"\s]+)['"]?/i);
    }
    if (!urlMatch) {
      throw new Error('No URL found in curl command');
    }
    result.url = urlMatch[1];
    
    // Extract method (-X or --request)
    const methodMatch = normalized.match(/(?:-X|--request)\s+([A-Z]+)/i);
    if (methodMatch) {
      result.method = methodMatch[1].toUpperCase();
    }
    
    // Extract headers (-H or --header) - improved to handle complex header values
    // Match headers more carefully to handle quotes inside values
    const headerRegex = /(?:-H|--header)\s+(['"])((?:\\.|(?!\1).)*?)\1/gi;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(normalized)) !== null) {
      const headerStr = headerMatch[2];
      const colonIndex = headerStr.indexOf(':');
      if (colonIndex > 0) {
        const key = headerStr.substring(0, colonIndex).trim();
        const value = headerStr.substring(colonIndex + 1).trim();
        result.headers.push({ key, value });
      }
    }
    
    // Extract body data (-d, --data, --data-raw, --data-binary)
    // Improved pattern to handle JSON with quotes inside
    const dataRegex = /(?:-d|--data|--data-raw|--data-binary)\s+(['"])((?:\\.|(?!\1).)*?)\1/i;
    const dataMatch = normalized.match(dataRegex);
    if (dataMatch) {
      result.body = dataMatch[2];
      
      // If body data is present and no explicit method was set, default to POST
      // (curl behavior: -d/--data implies POST unless -X is specified)
      if (!methodMatch) {
        result.method = 'POST';
      }
      
      // Determine body type from Content-Type header or body format
      const contentTypeHeader = result.headers.find(h => h.key.toLowerCase() === 'content-type');
      if (contentTypeHeader) {
        if (contentTypeHeader.value.includes('application/json')) {
          result.bodyType = 'json';
        } else if (contentTypeHeader.value.includes('application/x-www-form-urlencoded')) {
          result.bodyType = 'urlencoded';
        } else {
          result.bodyType = 'form';
        }
      } else {
        // Try to detect if it's JSON
        try {
          JSON.parse(result.body);
          result.bodyType = 'json';
        } catch (e) {
          result.bodyType = 'urlencoded';
        }
      }
    }
    
    // Extract basic auth (-u or --user)
    const authMatch = normalized.match(/(?:-u|--user)\s+['"]?([^'"\s]+)['"]?/i);
    if (authMatch) {
      const [username, password] = authMatch[1].split(':');
      const authValue = 'Basic ' + btoa(`${username}:${password || ''}`);
      result.headers.push({ key: 'Authorization', value: authValue });
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

// Handle Curl Import
function handleCurlImport() {
  const curlCmd = curlInput.value.trim();
  
  if (!curlCmd) {
    showCurlError('Please enter a curl command');
    return;
  }
  
  try {
    const parsed = parseCurlCommand(curlCmd);
    
    // Populate URL
    urlInput.value = parsed.url;
    
    // Populate method
    methodSelect.value = parsed.method;
    handleMethodChange();
    
    // Populate headers
    customHeaders = parsed.headers;
    renderHeaders();
    
    // Parse URL to extract query params
    handleUrlChange();
    
    // Populate body if present
    if (parsed.body) {
      requestBodyInput.value = parsed.body;
      currentBodyType = parsed.bodyType;
      
      // Update body type tabs
      document.querySelectorAll('.body-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.type === parsed.bodyType) {
          tab.classList.add('active');
        }
      });
      
      updateBodyPlaceholder();
    }
    
    // Close modal
    closeCurlModalHandler();
    
  } catch (error) {
    showCurlError(error.message);
  }
}

// Show Curl Error
function showCurlError(message) {
  curlError.textContent = message;
  curlError.style.display = 'block';
}

// ==================== PHASE 3: REQUEST HISTORY ====================

// Load History from Storage
async function loadHistory() {
  try {
    const result = await chrome.storage.local.get(['requestHistory']);
    requestHistory = result.requestHistory || [];
    renderHistory();
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

// Save History to Storage
async function saveHistory() {
  try {
    await chrome.storage.local.set({ requestHistory });
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

// Add Request to History
function addToHistory(method, url, name = null) {
  // Check if same URL + method already exists
  const existingIndex = requestHistory.findIndex(
    item => item.url === url && item.method === method
  );
  
  // If exists, remove it (we'll add the updated version at the top)
  if (existingIndex !== -1) {
    requestHistory.splice(existingIndex, 1);
  }
  
  const timestamp = Date.now();
  const historyItem = {
    id: timestamp,
    method,
    url,
    name: name || generateRequestName(method, url),
    timestamp,
    headers: [...customHeaders],
    params: [...queryParams],
    body: requestBodyInput.value.trim() || null,
    bodyType: currentBodyType
  };
  
  // Add to beginning of array
  requestHistory.unshift(historyItem);
  
  // Keep only last 20 items
  if (requestHistory.length > 20) {
    requestHistory = requestHistory.slice(0, 20);
  }
  
  saveHistory();
  renderHistory();
}

// Generate Request Name
function generateRequestName(method, url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname || '/';
    return `${method} ${path}`;
  } catch (e) {
    return `${method} ${url.substring(0, 30)}`;
  }
}

// Render History List
function renderHistory() {
  historyList.innerHTML = '';
  
  if (requestHistory.length === 0) {
    historyList.innerHTML = '<div class="empty-history">No history yet</div>';
    return;
  }
  
  requestHistory.forEach(item => {
    const historyItem = createHistoryItem(item);
    historyList.appendChild(historyItem);
  });
}

// Create History Item Element
function createHistoryItem(item) {
  const div = document.createElement('div');
  div.className = 'history-item';
  
  const methodBadge = document.createElement('span');
  methodBadge.className = `method-badge method-${item.method.toLowerCase()}`;
  methodBadge.textContent = item.method;
  
  const details = document.createElement('div');
  details.className = 'history-details';
  
  const name = document.createElement('div');
  name.className = 'history-name';
  name.textContent = item.name;
  name.title = item.url;
  
  const time = document.createElement('div');
  time.className = 'history-time';
  time.textContent = getRelativeTime(item.timestamp);
  
  details.appendChild(name);
  details.appendChild(time);
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-history-btn';
  deleteBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  deleteBtn.title = 'Delete';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteHistoryItem(item.id);
  });
  
  div.appendChild(methodBadge);
  div.appendChild(details);
  div.appendChild(deleteBtn);
  
  div.addEventListener('click', () => loadRequestFromHistory(item));
  
  return div;
}

// Get Relative Time
function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Load Request from History
function loadRequestFromHistory(item) {
  // Set method
  methodSelect.value = item.method;
  handleMethodChange();
  
  // Set URL
  urlInput.value = item.url;
  
  // Set headers
  customHeaders = [...item.headers];
  renderHeaders();
  
  // Set params
  queryParams = [...item.params];
  renderParams();
  updateUrlFromParams();
  
  // Set body
  if (item.body) {
    requestBodyInput.value = item.body;
    currentBodyType = item.bodyType;
    
    // Update body type tabs
    document.querySelectorAll('.body-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.type === item.bodyType) {
        tab.classList.add('active');
      }
    });
    
    updateBodyPlaceholder();
  } else {
    requestBodyInput.value = '';
  }
}

// Delete History Item
function deleteHistoryItem(id) {
  // Convert string id to number for comparison
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  requestHistory = requestHistory.filter(item => item.id !== numericId);
  saveHistory();
  renderHistory();
}

// Clear All History
async function clearAllHistory() {
  if (confirm('Are you sure you want to clear all history?')) {
    requestHistory = [];
    await saveHistory();
    renderHistory();
  }
}

// ============= PHASE 4: COLLECTIONS & ADVANCED FEATURES =============

// Tab Switching
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  historyTab.classList.toggle('active', tab === 'history');
  collectionsTab.classList.toggle('active', tab === 'collections');
  
  // Update views
  historyView.classList.toggle('active', tab === 'history');
  collectionsView.classList.toggle('active', tab === 'collections');
  
  // Save tab state
  chrome.storage.local.set({ currentTab: tab });
  
  // Apply current search
  handleSearch();
}

async function loadTab() {
  const data = await chrome.storage.local.get(['currentTab']);
  if (data.currentTab) {
    switchTab(data.currentTab);
  }
}

// Load Collections
async function loadCollections() {
  const data = await chrome.storage.local.get(['collections']);
  collections = data.collections || [];
  renderCollections();
  updateCollectionSelect();
}

// Save Collections
async function saveCollections() {
  await chrome.storage.local.set({ collections });
}

// Render Collections
function renderCollections() {
  if (collections.length === 0) {
    collectionsList.innerHTML = `
      <div class="empty-state-sidebar">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>No collections yet</p>
        <p class="empty-hint">Click "+ New Collection" to create one</p>
      </div>
    `;
    return;
  }
  
  const filteredCollections = searchQuery 
    ? collections.filter(col => 
        col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.requests.some(req => 
          req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.method.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : collections;
  
  collectionsList.innerHTML = filteredCollections.map(collection => {
    const filteredRequests = searchQuery
      ? collection.requests.filter(req =>
          req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.method.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : collection.requests;
    
    return `
      <div class="collection-item ${collection.expanded ? 'expanded' : ''}" data-id="${collection.id}">
        <div class="collection-header">
          <div class="collection-title">
            <button class="collection-toggle" data-collection-id="${collection.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="folder-icon">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <input 
              type="text" 
              class="collection-name-input" 
              value="${escapeHtml(collection.name)}"
              data-collection-id="${collection.id}"
            >
            <span class="request-count">(${collection.requests.length})</span>
          </div>
          <div class="collection-actions">
            <button class="icon-btn-small export-collection-btn" data-collection-id="${collection.id}" title="Export collection">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button class="icon-btn-small delete-btn delete-collection-btn" data-collection-id="${collection.id}" title="Delete collection">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="collection-requests">
          ${filteredRequests.map(request => `
            <div class="collection-request-item" data-collection-id="${collection.id}" data-request-id="${request.id}">
              <div class="request-info">
                <span class="method-badge method-${request.method.toLowerCase()}">${request.method}</span>
                <span class="request-name">${escapeHtml(request.name)}</span>
              </div>
              <div class="request-url">${escapeHtml(request.url)}</div>
              <button class="icon-btn-small delete-btn delete-request-btn" data-collection-id="${collection.id}" data-request-id="${request.id}" title="Delete request">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Toggle Collection Expand/Collapse
window.toggleCollection = function(collectionId) {
  const collection = collections.find(c => c.id === collectionId);
  if (collection) {
    collection.expanded = !collection.expanded;
    saveCollections();
    renderCollections();
  }
};

// Rename Collection
window.renameCollection = async function(collectionId, newName) {
  const trimmedName = newName.trim();
  if (!trimmedName) return;
  
  const collection = collections.find(c => c.id === collectionId);
  if (collection && collection.name !== trimmedName) {
    collection.name = trimmedName;
    await saveCollections();
    updateCollectionSelect();
  }
};

// Delete Collection
window.deleteCollection = async function(collectionId) {
  if (confirm('Are you sure you want to delete this collection?')) {
    collections = collections.filter(c => c.id !== collectionId);
    await saveCollections();
    renderCollections();
    updateCollectionSelect();
  }
};

// Export Collection
window.exportCollection = function(collectionId) {
  const collection = collections.find(c => c.id === collectionId);
  if (!collection) return;
  
  const dataStr = JSON.stringify(collection, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${collection.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// Import Collection
async function importCollection(jsonData) {
  try {
    const collection = JSON.parse(jsonData);
    
    // Validate structure
    if (!collection.name || !Array.isArray(collection.requests)) {
      throw new Error('Invalid collection format');
    }
    
    // Check for name conflicts
    const existingCollection = collections.find(c => c.name === collection.name);
    if (existingCollection) {
      const overwrite = confirm(`Collection "${collection.name}" already exists. Overwrite?`);
      if (overwrite) {
        collections = collections.filter(c => c.id !== existingCollection.id);
      } else {
        return;
      }
    }
    
    // Check collection limit
    if (collections.length >= 20) {
      alert('Maximum 20 collections allowed. Please delete some collections first.');
      return;
    }
    
    // Assign new ID
    collection.id = Date.now().toString();
    collection.expanded = false;
    
    // Assign new IDs to requests
    collection.requests = collection.requests.map(req => ({
      ...req,
      id: Date.now().toString() + Math.random()
    }));
    
    collections.unshift(collection);
    await saveCollections();
    renderCollections();
    updateCollectionSelect();
    
    alert('Collection imported successfully!');
  } catch (error) {
    alert('Failed to import collection: ' + error.message);
  }
}

// Handle Import Collection File
function handleImportCollectionFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    importCollection(e.target.result);
    // Reset file input
    importCollectionFile.value = '';
  };
  reader.readAsText(file);
}

// Load Saved Request
window.loadSavedRequest = function(collectionId, requestId) {
  const collection = collections.find(c => c.id === collectionId);
  if (!collection) return;
  
  const request = collection.requests.find(r => r.id === requestId);
  if (!request) return;
  
  // Store reference for updating
  currentEditingRequest = { collectionId, requestId };
  
  // Load request data
  methodSelect.value = request.method;
  handleMethodChange();
  urlInput.value = request.url;
  
  customHeaders = [...request.headers];
  renderHeaders();
  
  queryParams = [...request.params];
  renderParams();
  updateUrlFromParams();
  
  if (request.body) {
    requestBodyInput.value = request.body;
    currentBodyType = request.bodyType;
    
    document.querySelectorAll('.body-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.type === request.bodyType) {
        tab.classList.add('active');
      }
    });
    
    updateBodyPlaceholder();
  } else {
    requestBodyInput.value = '';
  }
  
  // Visual feedback
  saveBtn.textContent = 'Update';
  saveBtn.classList.add('update-mode');
};

// Delete Request from Collection
window.deleteRequestFromCollection = async function(collectionId, requestId) {
  const collection = collections.find(c => c.id === collectionId);
  if (!collection) return;
  
  collection.requests = collection.requests.filter(r => r.id !== requestId);
  await saveCollections();
  renderCollections();
  
  // Clear editing mode if this request was being edited
  if (currentEditingRequest && currentEditingRequest.requestId === requestId) {
    currentEditingRequest = null;
    saveBtn.textContent = 'Save';
    saveBtn.classList.remove('update-mode');
  }
};

// Update Collection Select
function updateCollectionSelect() {
  if (!collectionSelect) return;
  
  const currentValue = collectionSelect.value;
  collectionSelect.innerHTML = '<option value="">Select a collection...</option>';
  
  collections.forEach(collection => {
    const option = document.createElement('option');
    option.value = collection.id;
    option.textContent = collection.name;
    collectionSelect.appendChild(option);
  });
  
  // Restore selection if still valid
  if (currentValue && collections.find(c => c.id === currentValue)) {
    collectionSelect.value = currentValue;
  }
}

// Open Collection Picker Modal
function openCollectionPicker() {
  if (collections.length === 0) {
    alert('Please create a collection first.');
    openNewCollectionModal();
    return;
  }
  
  // Auto-generate request name from URL
  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a URL first.');
    return;
  }
  
  const defaultName = generateRequestName(url);
  requestNameInput.value = defaultName;
  
  updateCollectionSelect();
  collectionPickerError.textContent = '';
  collectionPickerModal.classList.add('active');
  
  // Focus on request name input
  setTimeout(() => requestNameInput.focus(), 100);
}

function closeCollectionPickerHandler() {
  collectionPickerModal.classList.remove('active');
  requestNameInput.value = '';
  collectionSelect.value = '';
  collectionPickerError.textContent = '';
}

// Add keyboard support for Collection Picker Modal
requestNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSaveToCollection();
  }
});

collectionSelect.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSaveToCollection();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (collectionPickerModal.classList.contains('active')) {
      closeCollectionPickerHandler();
    }
    if (newCollectionModal.classList.contains('active')) {
      closeNewCollectionHandler();
    }
    if (curlModal.classList.contains('active')) {
      closeCurlModalHandler();
    }
  }
});

// Generate Request Name from URL
function generateRequestName(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').filter(Boolean).pop() || 'request';
    return path.charAt(0).toUpperCase() + path.slice(1);
  } catch {
    return 'New Request';
  }
}

// Handle Save to Collection
async function handleSaveToCollection() {
  const requestName = requestNameInput.value.trim();
  const collectionId = collectionSelect.value;
  
  if (!requestName) {
    collectionPickerError.textContent = 'Please enter a request name';
    return;
  }
  
  if (!collectionId) {
    collectionPickerError.textContent = 'Please select a collection';
    return;
  }
  
  const collection = collections.find(c => c.id === collectionId);
  if (!collection) return;
  
  // Check if updating existing request
  if (currentEditingRequest && currentEditingRequest.collectionId === collectionId) {
    const request = collection.requests.find(r => r.id === currentEditingRequest.requestId);
    if (request) {
      // Update existing request
      request.name = requestName;
      request.method = methodSelect.value;
      request.url = urlInput.value.trim();
      request.headers = [...customHeaders];
      request.params = [...queryParams];
      request.body = requestBodyInput.value.trim();
      request.bodyType = currentBodyType;
      
      await saveCollections();
      renderCollections();
      closeCollectionPickerHandler();
      
      currentEditingRequest = null;
      saveBtn.textContent = 'Save';
      saveBtn.classList.remove('update-mode');
      
      alert('Request updated successfully!');
      return;
    }
  }
  
  // Create new request
  const newRequest = {
    id: Date.now().toString() + Math.random(),
    name: requestName,
    method: methodSelect.value,
    url: urlInput.value.trim(),
    headers: [...customHeaders],
    params: [...queryParams],
    body: requestBodyInput.value.trim(),
    bodyType: currentBodyType,
    timestamp: Date.now()
  };
  
  collection.requests.unshift(newRequest);
  await saveCollections();
  renderCollections();
  closeCollectionPickerHandler();
  
  alert('Request saved successfully!');
}

// Open New Collection Modal
function openNewCollectionModal() {
  collectionNameInput.value = '';
  newCollectionError.textContent = '';
  newCollectionModal.classList.add('active');
  
  // Focus on collection name input
  setTimeout(() => collectionNameInput.focus(), 100);
}

function closeNewCollectionHandler() {
  newCollectionModal.classList.remove('active');
  collectionNameInput.value = '';
  newCollectionError.textContent = '';
}

// Add keyboard support for New Collection Modal
collectionNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleCreateCollection();
  }
});

// Handle Create Collection
async function handleCreateCollection() {
  const collectionName = collectionNameInput.value.trim();
  
  if (!collectionName) {
    newCollectionError.textContent = 'Please enter a collection name';
    return;
  }
  
  // Check for duplicate names
  if (collections.find(c => c.name === collectionName)) {
    newCollectionError.textContent = 'A collection with this name already exists';
    return;
  }
  
  // Check collection limit
  if (collections.length >= 20) {
    newCollectionError.textContent = 'Maximum 20 collections allowed';
    return;
  }
  
  const newCollection = {
    id: Date.now().toString(),
    name: collectionName,
    requests: [],
    expanded: true,
    createdAt: Date.now()
  };
  
  collections.unshift(newCollection);
  await saveCollections();
  renderCollections();
  updateCollectionSelect();
  closeNewCollectionHandler();
  
  switchTab('collections');
}

// Handle Search
function handleSearch() {
  searchQuery = sidebarSearch.value.toLowerCase().trim();
  
  if (currentTab === 'history') {
    renderHistory();
  } else {
    renderCollections();
  }
}

// Update renderHistory to support search
const originalRenderHistory = renderHistory;
renderHistory = function() {
  if (requestHistory.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state-sidebar">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p>No history yet</p>
        <p class="empty-hint">Send a request to get started</p>
      </div>
    `;
    return;
  }
  
  const filteredHistory = searchQuery
    ? requestHistory.filter(item =>
        item.url.toLowerCase().includes(searchQuery) ||
        item.method.toLowerCase().includes(searchQuery)
      )
    : requestHistory;
  
  historyList.innerHTML = filteredHistory.map(item => `
    <div class="history-item" data-history-item='${JSON.stringify(item)}'>
      <div class="history-header">
        <span class="method-badge method-${item.method.toLowerCase()}">${item.method}</span>
        <span class="history-time">${getRelativeTime(item.timestamp)}</span>
      </div>
      <div class="history-url">${escapeHtml(item.url)}</div>
      <button class="delete-history-btn" data-history-id="${item.id}" title="Delete">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
};

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event delegation handler for collections list
function handleCollectionsClick(e) {
  const target = e.target.closest('button, .collection-request-item');
  if (!target) return;
  
  // Toggle collection
  if (target.classList.contains('collection-toggle')) {
    const collectionId = target.dataset.collectionId;
    if (collectionId) toggleCollection(collectionId);
    return;
  }
  
  // Export collection
  if (target.classList.contains('export-collection-btn')) {
    const collectionId = target.dataset.collectionId;
    if (collectionId) exportCollection(collectionId);
    return;
  }
  
  // Delete collection
  if (target.classList.contains('delete-collection-btn')) {
    const collectionId = target.dataset.collectionId;
    if (collectionId) deleteCollection(collectionId);
    return;
  }
  
  // Delete request from collection
  if (target.classList.contains('delete-request-btn')) {
    e.stopPropagation();
    const collectionId = target.dataset.collectionId;
    const requestId = target.dataset.requestId;
    if (collectionId && requestId) deleteRequestFromCollection(collectionId, requestId);
    return;
  }
  
  // Load saved request
  if (target.classList.contains('collection-request-item')) {
    const collectionId = target.dataset.collectionId;
    const requestId = target.dataset.requestId;
    if (collectionId && requestId) loadSavedRequest(collectionId, requestId);
    return;
  }
}

// Event delegation handler for history list
function handleHistoryClick(e) {
  const target = e.target.closest('button, .history-item');
  if (!target) return;
  
  // Delete history item
  if (target.classList.contains('delete-history-btn')) {
    e.stopPropagation();
    const historyId = target.dataset.historyId;
    if (historyId) deleteHistoryItem(historyId);
    return;
  }
  
  // Load history item
  if (target.classList.contains('history-item')) {
    const itemData = target.dataset.historyItem;
    if (itemData) {
      try {
        const item = JSON.parse(itemData);
        loadRequestFromHistory(item);
      } catch (e) {
        console.error('Failed to parse history item:', e);
      }
    }
    return;
  }
}

// Event delegation handler for collection name blur
function handleCollectionNameBlur(e) {
  if (e.target.classList.contains('collection-name-input')) {
    const collectionId = e.target.dataset.collectionId;
    const newName = e.target.value;
    if (collectionId) renameCollection(collectionId, newName);
  }
}

// Event delegation handler for collection name keypress
function handleCollectionNameKeypress(e) {
  if (e.target.classList.contains('collection-name-input') && e.key === 'Enter') {
    e.target.blur();
  }
}

// Add import collection button to header (optional enhancement)
// This can be triggered via a menu or button - for now, kept simple
