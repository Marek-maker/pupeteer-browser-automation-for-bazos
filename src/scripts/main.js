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
    const allowContinueText = config.allowContinueText || '';
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
    // Build direct URL to add advert page for the category
    const addAdvertUrl = `https://${category}.bazos.sk/pridat-inzerat.php`;

    // Launch Puppeteer and perform actions
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(addAdvertUrl);
    console.log(`Navigated directly to add advert page: ${addAdvertUrl}`);
    await delay(delayMs);
    await dismissCookies(page);
    console.log('Dismissed cookies (if present).');
    await delay(delayMs);
    // Check if phone registration is required
    const requires_phone_registration = await checkPhoneRegistration(page, phoneRegistrationPhrase);
    console.log(`Requires phone registration: ${requires_phone_registration}`);

    if (requires_phone_registration && allowContinueText) {
        console.log('Phone registration required. Please complete verification manually.');
        let found = false;
        let attempts = 0;
        while (!found && attempts < 60) { // Wait up to 60 attempts (about 1.5 min)
            await delay(delayMs);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (pageText.includes(allowContinueText)) {
                found = true;
                console.log('Phone verification complete. Continue automation.');
            } else {
                console.log(`Waiting for confirmation text: '${allowContinueText}' (attempt ${attempts+1})`);
            }
            attempts++;
        }
        if (!found) {
            console.log('Confirmation text not found. Automation will not continue.');
            return;
        }
    }
    // Continue with next steps here...
}

// Usage: node main.js [configPath]
const configPath = process.argv[2];
main(configPath);
