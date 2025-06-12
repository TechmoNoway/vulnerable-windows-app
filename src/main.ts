import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as http from "http";
import { exec } from "child_process";
import * as url from "url";
import * as windowsVulns from "./windows-vulns";
import * as database from "./database";

// Global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Port for the vulnerable HTTP server
const PORT = 3000;

// Create a vulnerable HTTP server that listens for remote connections
// VULNERABILITY: This server has multiple security issues
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "", true);
  const pathname = parsedUrl.pathname || "";
  const query = parsedUrl.query;

  // Set CORS headers to allow requests from anywhere
  // VULNERABILITY: Overly permissive CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle different endpoints
  if (pathname === "/api/execute") {
    // VULNERABILITY: Remote command execution
    const command = query.command as string;
    if (command) {
      exec(command, (error, stdout, stderr) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error?.message, stdout, stderr }));

        // Log to the main window
        if (mainWindow) {
          mainWindow.webContents.send(
            "log-message",
            `Remote command executed: ${command}\nOutput: ${stdout}`
          );
        }
      });
    }
  } else if (pathname === "/api/read-file") {
    // VULNERABILITY: Remote file reading without validation
    const filePath = query.path as string;
    if (filePath) {
      fs.readFile(filePath, "utf8", (err, data) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err?.message, data }));

        // Log to the main window
        if (mainWindow) {
          mainWindow.webContents.send(
            "log-message",
            `Remote file read: ${filePath}\nContent length: ${data?.length || 0} bytes`
          );
        }
      });
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No file path provided" }));
    }
  } else if (pathname === "/api/write-file") {
    // VULNERABILITY: Remote file writing without validation
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { path: filePath, content } = JSON.parse(body);
        if (filePath && content !== undefined) {
          fs.writeFile(filePath, content, (err) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: !err, error: err?.message }));

            // Log to the main window
            if (mainWindow) {
              mainWindow.webContents.send(
                "log-message",
                `Remote file write: ${filePath}\nContent length: ${content.length} bytes`
              );
            }
          });
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing path or content" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (pathname === "/api/status") {
    // Simple status endpoint to check if server is running
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "running",
        app: "Vulnerable Windows App",
        version: app.getVersion(),
        platform: process.platform,
      })
    );
  } else if (pathname === "/api/windows/dll-hijack") {
    // DLL Hijacking vulnerability
    const dllPath = query.path as string;
    if (dllPath) {
      const result = windowsVulns.simulateDllLoading(dllPath);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No DLL path provided" }));
    }
  } else if (pathname === "/api/windows/insecure-file") {
    // Insecure file permissions vulnerability
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { path: filePath, content } = JSON.parse(body);
        if (filePath && content !== undefined) {
          const result = windowsVulns.createFileWithInsecurePermissions(
            filePath,
            content
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing path or content" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (pathname === "/api/windows/unquoted-service") {
    // Unquoted Service Path vulnerability
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { name, displayName, binPath } = JSON.parse(body);
        if (name && displayName && binPath) {
          const result = windowsVulns.createServiceWithUnquotedPath(
            name,
            displayName,
            binPath
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required parameters" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (pathname === "/api/windows/registry") {
    // Registry Modification vulnerability
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { key, valueName, data } = JSON.parse(body);
        if (key && valueName && data !== undefined) {
          const result = windowsVulns.writeToRegistry(key, valueName, data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required parameters" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (pathname === "/api/windows/alt-stream") {
    // Windows Alternate Data Stream vulnerability
    const filePath = query.path as string;
    if (filePath) {
      const result = windowsVulns.accessWindowsSpecificPath(filePath);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No file path provided" }));
    }
  } else if (pathname === "/api/login") {
    // VULNERABILITY: SQL injection in login
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { username, password } = JSON.parse(body);

        if (mainWindow) {
          mainWindow.webContents.send(
            "log-message",
            `Login attempt: username=${username}`
          );
        }

        // Attempt login with vulnerable function
        database
          .loginUser(username, password)
          .then((user) => {
            if (user) {
              res.writeHead(200, { "Content-Type": "application/json" });
              // Avoid sending password in response
              const { password, ...userWithoutPassword } = user;
              res.end(
                JSON.stringify({
                  success: true,
                  user: userWithoutPassword,
                  message: "Login successful",
                })
              );

              if (mainWindow) {
                mainWindow.webContents.send(
                  "log-message",
                  `Login successful: ${username} (${user.role})`
                );
              }
            } else {
              res.writeHead(401, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Invalid username or password",
                })
              );

              if (mainWindow) {
                mainWindow.webContents.send("log-message", `Login failed: ${username}`);
              }
            }
          })
          .catch((error) => {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                message: "Error during login",
                error: error.message,
              })
            );

            if (mainWindow) {
              mainWindow.webContents.send("log-message", `Login error: ${error.message}`);
            }
          });
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (pathname === "/api/search-users") {
    // VULNERABILITY: SQL injection in search
    const searchTerm = (query.term as string) || "";

    if (mainWindow) {
      mainWindow.webContents.send("log-message", `User search: term=${searchTerm}`);
    }

    database
      .searchUsers(searchTerm)
      .then((users) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            users,
          })
        );
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Error searching users",
            error: error.message,
          })
        );

        if (mainWindow) {
          mainWindow.webContents.send("log-message", `Search error: ${error.message}`);
        }
      });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

// Set up the log callback for Windows vulnerabilities
windowsVulns.setLogCallback((message) => {
  if (mainWindow) {
    mainWindow.webContents.send("log-message", message);
  }
});

// Initialize the database
database.initializeDatabase().catch((err) => {
  console.error("Failed to initialize database:", err);
});

// Start the server when the app is ready
app.on("ready", () => {
  server.listen(PORT, () => {
    console.log(`Vulnerable server running on http://localhost:${PORT}`);
    if (mainWindow) {
      mainWindow.webContents.send(
        "log-message",
        `Vulnerable server started on port ${PORT}`
      );
    }
  });
});

// Clean up the server when the app is closed
app.on("will-quit", () => {
  server.close();
});

// IPC handlers for the renderer process
ipcMain.on("get-local-ip", (event) => {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        results.push(net.address);
      }
    }
  }

  event.reply("local-ip", results);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
