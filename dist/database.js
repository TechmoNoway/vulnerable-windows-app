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
exports.closeDatabase = exports.searchUsers = exports.loginUser = exports.initializeDatabase = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
// Create and initialize the database
const db = new sqlite3.Database(path.join(dbDir, "vulnerable.db"));
// Initialize the database with some tables and data
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Drop tables if they exist
        db.run("DROP TABLE IF EXISTS users", (err) => {
            if (err) {
                console.error("Error dropping users table:", err);
                reject(err);
                return;
            }
            // Create users table
            db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          role TEXT
        )
      `, (err) => {
                if (err) {
                    console.error("Error creating users table:", err);
                    reject(err);
                    return;
                }
                // Insert some sample data
                const users = [
                    {
                        username: "admin",
                        password: "admin123",
                        email: "admin@example.com",
                        role: "admin",
                    },
                    {
                        username: "user1",
                        password: "pass123",
                        email: "user1@example.com",
                        role: "user",
                    },
                    {
                        username: "user2",
                        password: "pass456",
                        email: "user2@example.com",
                        role: "user",
                    },
                    {
                        username: "support",
                        password: "support789",
                        email: "support@example.com",
                        role: "support",
                    },
                ];
                // Insert users
                const stmt = db.prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
                users.forEach((user) => {
                    stmt.run([user.username, user.password, user.email, user.role]);
                });
                stmt.finalize();
                console.log("Database initialized with sample data");
                resolve();
            });
        });
    });
}
exports.initializeDatabase = initializeDatabase;
// VULNERABLE: This function is deliberately vulnerable to SQL injection
function loginUser(username, password) {
    return new Promise((resolve, reject) => {
        // VULNERABILITY: Direct string concatenation in SQL query
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        console.log(`[VULNERABLE QUERY] ${query}`);
        db.get(query, [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}
exports.loginUser = loginUser;
// VULNERABLE: This function is deliberately vulnerable to SQL injection
function searchUsers(searchTerm) {
    return new Promise((resolve, reject) => {
        // VULNERABILITY: Direct string concatenation in SQL query
        const query = `SELECT id, username, email, role FROM users WHERE username LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;
        console.log(`[VULNERABLE QUERY] ${query}`);
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.searchUsers = searchUsers;
// Close the database connection
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=database.js.map