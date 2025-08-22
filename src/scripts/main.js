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
    let url = config.url;
    const advertDataFile = config.advertDataFile;
    const phoneRegistrationPhrase = config.phoneRegistrationPhrase || 'Pre pokračovanie je potrebné overiť telefónne číslo';
    const delayMs = config.delayMs || 1000;
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
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
    url = config.url.substring(0, 8) + category +"."+ config.url.substring(8);//edit the url to nav to the category page

    // Launch Puppeteer and perform actions
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`Navigated to URL: ${url}`);
    await delay(delayMs);
    await dismissCookies(page);
    console.log('Dismissed cookies (if present).');
    await delay(delayMs);
    const [response] = await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        clickAddAd(page)
    ]);
    console.log('Clicked "Pridať inzerát" and waited for navigation.');
    await delay(delayMs);
    // Check if phone registration is required
    const requires_phone_registration = await checkPhoneRegistration(page, phoneRegistrationPhrase);
    console.log(`Requires phone registration: ${requires_phone_registration}`);
    // Keep browser open for manual inspection
}

// Usage: node main.js [configPath]
const configPath = process.argv[2];
main(configPath);
