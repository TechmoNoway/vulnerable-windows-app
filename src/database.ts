import * as sqlite3 from "sqlite3";
import * as path from "path";
import * as fs from "fs";

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create and initialize the database
const db = new sqlite3.Database(path.join(dbDir, "vulnerable.db"));

// Initialize the database with some tables and data
export function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    // Drop tables if they exist
    db.run("DROP TABLE IF EXISTS users", (err) => {
      if (err) {
        console.error("Error dropping users table:", err);
        reject(err);
        return;
      }

      // Create users table
      db.run(
        `
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          role TEXT
        )
      `,
        (err) => {
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
          const stmt = db.prepare(
            "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)"
          );
          users.forEach((user) => {
            stmt.run([user.username, user.password, user.email, user.role]);
          });
          stmt.finalize();

          console.log("Database initialized with sample data");
          resolve();
        }
      );
    });
  });
}

// VULNERABLE: This function is deliberately vulnerable to SQL injection
export function loginUser(username: string, password: string): Promise<any> {
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

// VULNERABLE: This function is deliberately vulnerable to SQL injection
export function searchUsers(searchTerm: string): Promise<any[]> {
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

// Close the database connection
export function closeDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
