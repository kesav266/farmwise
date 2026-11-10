const API_BASE_URL = window.API_BASE_URL || (
    window.location.protocol === "file:" ||
    window.location.port === "5500"
        ? "http://127.0.0.1:8001"
        : ""
);

function getAuthToken() {
    return sessionStorage.getItem("access_token");
}

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        Accept: "application/json",
        ...(options.body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = "Bearer " + token;
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
    } catch (error) {
        const networkError = new Error(
            "Cannot connect to the backend. Please try again."
        );
        networkError.endpoint = endpoint;
        networkError.cause = error;
        throw networkError;
    }

    const responseText = await response.text();
    let data = null;
    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }
    }

    if (!response.ok) {
        const detail = data && typeof data === "object" ? data.detail : null;
        const message = Array.isArray(detail)
            ? detail.map(item => item.msg || JSON.stringify(item)).join(", ")
            : typeof detail === "string"
                ? detail
                : data && typeof data.message === "string"
                    ? data.message
                    : `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.endpoint = endpoint;
        error.detail = detail;
        throw error;
    }

    return data;
}

async function apiGet(endpoint) {
    return apiRequest(endpoint, { method: "GET" });
}

async function apiPost(endpoint, body) {
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

async function apiPut(endpoint, body) {
    return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}

function isAuthenticationError(error) {
    return error?.status === 401 || error?.status === 403;
}

function showAuthenticationMessage() {
    const message = document.getElementById("dashboard-message");
    if (!message) return;
    message.textContent =
        "Your session may have expired or you may not have permission. Please sign in again.";
    message.classList.remove("hidden");
    message.setAttribute("role", "alert");
}

function getErrorMessage(error, fallback = "Something went wrong.") {
    return error?.message || fallback;
}

function hideMessage(target) {
    const element = typeof target === "string"
        ? document.getElementById(target)
        : target;
    if (element) element.classList.add("hidden");
}

function showMessage(target, message, type = "error") {
    const element = typeof target === "string"
        ? document.getElementById(target)
        : target;
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden", "error", "success", "warning", "info");
    element.classList.add(type);
    element.setAttribute("role", "alert");
}

function setButtonLoading(button, isLoading, normalText, loadingText = "Loading...") {
    if (!button) return;
    if (isLoading) {
        if (button.dataset.originalText === undefined) {
            button.dataset.originalText = button.textContent.trim() || normalText || "";
        }
        button.disabled = true;
        button.textContent = loadingText;
        return;
    }
    button.disabled = false;
    button.textContent = button.dataset.originalText ?? normalText ?? "";
    delete button.dataset.originalText;
}

function renderEmptyTable(tbody, columnCount, message) {
    if (!tbody) return;
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = columnCount;
    cell.className = "table-message";
    cell.textContent = message;
    row.appendChild(cell);
    tbody.replaceChildren(row);
}

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";
    return cell;
}
