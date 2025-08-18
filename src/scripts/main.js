// Main script to open site, dismiss cookies, click add ad, and select category using Puppeteer
const puppeteer = require('puppeteer');
const dismissCookies = require('./dismiss-cookies');
const clickAddAd = require('./click-add-ad');
const selectCategory = require('./select-category');

async function main(url, category) {
    if (!url) {
        console.error('Please provide a URL as a parameter.');
        process.exit(1);
    }
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await dismissCookies(page);
    // Click 'Pridať inzerát' and wait for navigation
    const [response] = await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        clickAddAd(page)
    ]);
    if (category) {
        await selectCategory(page, category);
    }
    // Keep browser open for manual inspection
}

const url = process.argv[2];
const category = process.argv[3]; // Optional category param
main(url, category);
