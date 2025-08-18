# Setup Guide: Node.js & Puppeteer

## 1. Install Node.js
- Download Node.js from [nodejs.org](https://nodejs.org/)
- Run the installer and follow the instructions
- Verify installation:
  ```powershell
  node -v
  npm -v
  ```

## 2. Initialize Project
- Open a terminal in your project directory
- Run:
  ```powershell
  npm init -y
  ```

## 3. Install Puppeteer
- Run:
  ```powershell
  npm install puppeteer
  ```

## 4. Run the Automation Script
- Usage:
  ```powershell
  node src/scripts/open-site.js "https://example.com"
  ```

## 5. Other Requirements
- Ensure internet access for Puppeteer to download Chromium
- If using Git, initialize with:
  ```powershell
  git init
  ```

## 6. Troubleshooting
- If Puppeteer fails to launch, check for missing dependencies or proxy/firewall issues.
- For Windows, ensure PowerShell is updated if you encounter shell errors.

---
For more details, see the official docs:
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Puppeteer Documentation](https://pptr.dev/)
