import * as fs from "fs";
import { exec, execSync } from "child_process";
import * as path from "path";

// Logging helper
let logCallback: ((message: string) => void) | null = null;

export function setLogCallback(callback: (message: string) => void) {
  logCallback = callback;
}

function log(message: string) {
  if (logCallback) {
    logCallback(message);
  }
  console.log(message);
}

// 1. DLL Hijacking Vulnerability
export function simulateDllLoading(dllPath: string): {
  success: boolean;
  message: string;
} {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message };
  }
}

// 2. Insecure File Permissions
export function createFileWithInsecurePermissions(
  filePath: string,
  content: string
): { success: boolean; message: string } {
  try {
    // Create file with content
    fs.writeFileSync(filePath, content);

    // Set "Everyone" full control permissions (insecure)
    execSync(`icacls "${filePath}" /grant Everyone:F`);

    log(`[VULNERABILITY] Created file with insecure permissions: ${filePath}`);
    return {
      success: true,
      message: `File created with insecure permissions at: ${filePath}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message };
  }
}

// 3. Unquoted Service Path Vulnerability
export function createServiceWithUnquotedPath(
  serviceName: string,
  displayName: string,
  binPath: string
): { success: boolean; message: string } {
  try {
    // Ensure the path is not quoted for vulnerability demonstration
    if (binPath.startsWith('"') || !binPath.includes(" ")) {
      return {
        success: false,
        message:
          "Path must contain spaces and must not be quoted to demonstrate the vulnerability",
      };
    }

    // Create a Windows service with unquoted path
    const command = `cmd.exe /c sc create "${serviceName}" binPath= ${binPath} DisplayName= "${displayName}" start= demand`;
    execSync(command);

    log(`[VULNERABILITY] Created service with unquoted path: ${serviceName}`);
    return {
      success: true,
      message: `Service '${serviceName}' created with unquoted path: ${binPath}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message };
  }
}

// 4. Registry Manipulation (Vulnerable)
export function writeToRegistry(
  key: string,
  valueName: string,
  data: string
): { success: boolean; message: string } {
  try {
    // Dangerous registry modification without validation
    const command = `reg add "${key}" /v "${valueName}" /d "${data}" /f`;
    execSync(command);

    log(`[VULNERABILITY] Modified registry without validation: ${key}\\${valueName}`);
    return {
      success: true,
      message: `Registry modified: ${key}\\${valueName} = ${data}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message };
  }
}

// 5. Path Traversal with Windows-specific handling
export function accessWindowsSpecificPath(filePath: string): {
  success: boolean;
  message: string;
  data?: string;
} {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message };
  }
}
