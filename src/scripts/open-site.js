// Script to open a site using Puppeteer
// Usage: node open-site.js <url>

const puppeteer = require('puppeteer');

async function openSite(url) {
    if (!url) {
        console.error('Please provide a URL as a parameter.');
        process.exit(1);
    }
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    // Keep browser open for manual inspection
}

const url = process.argv[2];
openSite(url);
