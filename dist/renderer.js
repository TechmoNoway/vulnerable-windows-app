"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// DOM Elements
const serverStatus = document.getElementById("server-status");
const ipAddressList = document.getElementById("ip-address-list");
const logOutput = document.getElementById("log-output");
// Request local IP addresses
electron_1.ipcRenderer.send("get-local-ip");
// Receive local IP addresses
electron_1.ipcRenderer.on("local-ip", (event, ipAddresses) => {
    ipAddressList.innerHTML = "";
    if (ipAddresses.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No network interfaces found";
        ipAddressList.appendChild(li);
    }
    else {
        ipAddresses.forEach((ip) => {
            const li = document.createElement("li");
            li.textContent = `http://${ip}:3000`;
            ipAddressList.appendChild(li);
        });
    }
});
// Receive log messages
electron_1.ipcRenderer.on("log-message", (event, message) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(logOutput.textContent);
    console.log(`[${timestamp}] ${message}`);
    logOutput.textContent += `[${timestamp}] ${message}\n\n`;
    // Auto-scroll to bottom
    logOutput.scrollTop = logOutput.scrollHeight;
});
// Check server status
function checkServerStatus() {
    fetch("http://localhost:3000/api/status")
        .then((response) => response.json())
        .then((data) => {
        serverStatus.textContent = "Running";
        serverStatus.className = "status-running";
    })
        .catch((error) => {
        serverStatus.textContent = "Not Running";
        serverStatus.className = "status-stopped";
    });
}
// Check status when page loads
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(checkServerStatus, 1000); // Give server time to start
});
// Clear logs button
document.getElementById("clear-logs")?.addEventListener("click", () => {
    logOutput.textContent = "";
});
//# sourceMappingURL=renderer.js.map