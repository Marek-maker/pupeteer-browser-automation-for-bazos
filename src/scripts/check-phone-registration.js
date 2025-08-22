// Script to check if phone registration is required on bazos.sk
// Usage: require and call checkPhoneRegistration(page)

async function checkPhoneRegistration(page, phrase) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const requires_phone_registration = bodyText.includes(phrase);
    console.log(`requires_phone_registration: ${requires_phone_registration}`);
    return requires_phone_registration;
}

module.exports = checkPhoneRegistration;
