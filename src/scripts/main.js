// Main script to open site, dismiss cookies, click add ad, and select category using Puppeteer

const puppeteer = require('puppeteer');
const dismissCookies = require('./dismiss-cookies');
const clickAddAd = require('./click-add-ad');
const selectCategory = require('./select-category');
const checkPhoneRegistration = require('./check-phone-registration');
const fillAdvertForm = require('./fill-advert-form');
const generatePassword = require('./generate-password');
const submitAndVerify = require('./submit-and-verify');
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
        // Generate password if not present
        if (!advertData.heslobazar) {
            advertData.heslobazar = generatePassword();
            // Save the generated password back to the file
            fs.writeFileSync(
                path.resolve(__dirname, '../../', advertDataFile),
                JSON.stringify(advertData, null, 2),
                'utf8'
            );
            console.log('Generated and saved new password:', advertData.heslobazar);
        }
    } catch (e) {
        console.error(`Failed to read or update advert data file at ${advertDataFile}:`, e);
        process.exit(1);
    }
    const category = advertData.kategoria;
    // Build direct URL to add advert page for the category
    const addAdvertUrl = `https://${category}.bazos.sk/pridat-inzerat.php`;

    // Configure browser launch options
    const browserConfig = config.browser || {};
    let launchOptions = { 
        headless: false
    };

    // Set up persistent profile if configured
    if (browserConfig.usePersistentProfile) {
        const userDataDir = path.join(__dirname, '../../', browserConfig.userDataDir || 'user_data');
        console.log('Using persistent profile at:', userDataDir);
        if (!fs.existsSync(userDataDir)){
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        launchOptions.userDataDir = userDataDir;
    } else {
        console.log('Using temporary browser profile');
    }

    const browser = await puppeteer.launch(launchOptions);
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
        while (!found && attempts < 120) { // Wait up to 120 attempts (about 3 min)
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
    // Fill out the advertisement form
    await fillAdvertForm(page, advertData);
    console.log('Form filled with advertisement data.');

    // Submit the form and verify success
    const submissionSuccess = await submitAndVerify(page);
    if (submissionSuccess) {
        console.log('Advertisement successfully submitted and verified.');
    } else {
        console.error('Advertisement submission failed or could not be verified.');
        process.exit(1);
    }
}

// Usage: node main.js [configPath]
const configPath = process.argv[2];
main(configPath);
