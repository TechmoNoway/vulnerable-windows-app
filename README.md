# Vulnerable Windows App - Remote Attack Vector

This is an educational project that demonstrates common security vulnerabilities in Electron applications that can be exploited remotely. This application is **intentionally vulnerable** and should never be used in production environments or exposed to untrusted networks.

## Security Vulnerabilities Demonstrated

1. **Remote Command Execution**: Allows arbitrary command execution from remote machines
2. **Unvalidated File System Operations**: Reads and writes files without proper path validation
3. **Insecure Network Communication**: No authentication or encryption for API endpoints
4. **Overly Permissive CORS**: Allows requests from any origin

## Installation

\`\`\`
# Clone the repository
git clone https://github.com/TechmoNoway/vulnerable-windows-app.git

# Navigate to the project directory
cd vulnerable-windows-app

# Install dependencies
npm install

# Build and start the application
npm start
\`\`\`

## Usage

1. Start the application
2. Note the server URLs displayed (these are the addresses other computers can use to access the vulnerable API)
3. Use the attack tool or a web browser from another computer to demonstrate the vulnerabilities

## Educational Purpose

This application is designed for educational purposes only, to help students and developers understand common security vulnerabilities in desktop applications. Understanding these vulnerabilities is the first step in learning how to prevent them.

## WARNING

**DO NOT** run this application on public networks or production environments. It contains serious security vulnerabilities that could be exploited by attackers.

## License

MIT
