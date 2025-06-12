"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessWindowsSpecificPath = exports.writeToRegistry = exports.createServiceWithUnquotedPath = exports.createFileWithInsecurePermissions = exports.simulateDllLoading = exports.setLogCallback = void 0;
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
// Logging helper
let logCallback = null;
function setLogCallback(callback) {
    logCallback = callback;
}
exports.setLogCallback = setLogCallback;
function log(message) {
    if (logCallback) {
        logCallback(message);
    }
    console.log(message);
}
// 1. DLL Hijacking Vulnerability
function simulateDllLoading(dllPath) {
    try {
        log(`[VULNERABILITY] Simulating DLL loading from: ${dllPath}`);
        if (!fs.existsSync(dllPath)) {
            return { success: false, message: `DLL not found at ${dllPath}` };
        }
        // This is a simulation - in a real app, we'd actually load the DLL
        // We're just checking if the file exists and pretending to load it
        return {
            success: true,
            message: `DLL at ${dllPath} would be loaded (simulation)`,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, message };
    }
}
exports.simulateDllLoading = simulateDllLoading;
// 2. Insecure File Permissions
function createFileWithInsecurePermissions(filePath, content) {
    try {
        // Create file with content
        fs.writeFileSync(filePath, content);
        // Set "Everyone" full control permissions (insecure)
        (0, child_process_1.execSync)(`icacls "${filePath}" /grant Everyone:F`);
        log(`[VULNERABILITY] Created file with insecure permissions: ${filePath}`);
        return {
            success: true,
            message: `File created with insecure permissions at: ${filePath}`,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, message };
    }
}
exports.createFileWithInsecurePermissions = createFileWithInsecurePermissions;
// 3. Unquoted Service Path Vulnerability
function createServiceWithUnquotedPath(serviceName, displayName, binPath) {
    try {
        // Ensure the path is not quoted for vulnerability demonstration
        if (binPath.startsWith('"') || !binPath.includes(" ")) {
            return {
                success: false,
                message: "Path must contain spaces and must not be quoted to demonstrate the vulnerability",
            };
        }
        // Create a Windows service with unquoted path
        const command = `cmd.exe /c sc create "${serviceName}" binPath= ${binPath} DisplayName= "${displayName}" start= demand`;
        (0, child_process_1.execSync)(command);
        log(`[VULNERABILITY] Created service with unquoted path: ${serviceName}`);
        return {
            success: true,
            message: `Service '${serviceName}' created with unquoted path: ${binPath}`,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, message };
    }
}
exports.createServiceWithUnquotedPath = createServiceWithUnquotedPath;
// 4. Registry Manipulation (Vulnerable)
function writeToRegistry(key, valueName, data) {
    try {
        // Dangerous registry modification without validation
        const command = `reg add "${key}" /v "${valueName}" /d "${data}" /f`;
        (0, child_process_1.execSync)(command);
        log(`[VULNERABILITY] Modified registry without validation: ${key}\\${valueName}`);
        return {
            success: true,
            message: `Registry modified: ${key}\\${valueName} = ${data}`,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, message };
    }
}
exports.writeToRegistry = writeToRegistry;
// 5. Path Traversal with Windows-specific handling
function accessWindowsSpecificPath(filePath) {
    try {
        // Demonstrate Windows-specific path handling issues
        // This handles things like alternate data streams, etc.
        // For demonstration, we'll just check if the file exists and read it
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                message: `File not found: ${filePath}`,
            };
        }
        const data = fs.readFileSync(filePath, "utf8");
        log(`[VULNERABILITY] Read from Windows-specific path: ${filePath}`);
        return {
            success: true,
            message: `Read ${data.length} bytes from ${filePath}`,
            data,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, message };
    }
}
exports.accessWindowsSpecificPath = accessWindowsSpecificPath;
//# sourceMappingURL=windows-vulns.js.map