// Main script to open site, dismiss cookies, click add ad, and select category using Puppeteer

const puppeteer = require('puppeteer');
const dismissCookies = require('./dismiss-cookies');
const clickAddAd = require('./click-add-ad');
const selectCategory = require('./select-category');
const checkPhoneRegistration = require('./check-phone-registration');
const fs = require('fs');
const path = require('path');

async function main(configPath) {
    // Load config
    let config = {};
    const resolvedPath = configPath ? path.resolve(configPath) : path.resolve(__dirname, 'config.json');
    try {
        config = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    } catch (e) {
        console.error(`Failed to read config file at ${resolvedPath}:`, e);
        process.exit(1);
    }
    const url = config.url;
    const advertDataFile = config.advertDataFile;
    const phoneRegistrationPhrase = config.phoneRegistrationPhrase || 'Pre pokračovanie je potrebné overiť telefónne číslo';
    if (!phoneRegistrationPhrase) {
        console.error('No PhoneRegPhrase specified in config.');
        process.exit(1);
    }
    if (!url) {
        console.error('No URL specified in config.');
        process.exit(1);
    }
    if (!advertDataFile) {
        console.error('No advertDataFile specified in config.');
        process.exit(1);
    }
    // Load advert data
    let advertData = {};
    try {
        advertData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../', advertDataFile), 'utf8'));
    } catch (e) {
        console.error(`Failed to read advert data file at ${advertDataFile}:`, e);
        process.exit(1);
    }
    const category = advertData.kategoria;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await dismissCookies(page);
    const [response] = await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        clickAddAd(page)
    ]);
    if (category) {
        await selectCategory(page, category);
    }
    // Check if phone registration is required
    const requires_phone_registration = await checkPhoneRegistration(page, phoneRegistrationPhrase);
    console.log(`Requires phone registration: ${requires_phone_registration}`);
    // Keep browser open for manual inspection
}

// Usage: node main.js [configPath]
const configPath = process.argv[2];
main(configPath);
