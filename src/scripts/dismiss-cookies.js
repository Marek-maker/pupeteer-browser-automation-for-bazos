// Script to dismiss cookies popup using Puppeteer
// Usage: require and call dismissCookies(page)

async function dismissCookies(page) {
    // Slovak and site-independent selectors and keywords
    const keywords = [
        'Súhlasím', // Slovak: I agree
        'Prijať',   // Slovak: Accept
        'Rozumiem', // Slovak: I understand
        'Accept',
        'Agree',
        'OK',
        'Got it',
        'Zavrieť',  // Slovak: Close
        'Potvrdiť', // Slovak: Confirm
    ];
    // Try common button selectors
    const buttonSelectors = [
        'button',
        'input[type="button"]',
        'input[type="submit"]',
        'a',
        '[role="button"]',
    ];
    // Try to find and click cookie buttons by text
    for (const selector of buttonSelectors) {
        const elements = await page.$$(selector);
        for (const el of elements) {
            const text = await page.evaluate(el => el.innerText || el.value || '', el);
            if (text) {
                for (const kw of keywords) {
                    if (text.trim().toLowerCase().includes(kw.toLowerCase())) {
                        try {
                            await el.click();
                            console.log(`Dismissed cookies with text: ${text}`);
                            return true;
                        } catch (e) {
                            // Ignore click errors
                        }
                    }
                }
            }
        }
    }
    // Try bazos.sk specific selectors
    try {
        const bazosBtn = await page.$('div#cookies a');
        if (bazosBtn) {
            await bazosBtn.click();
            console.log('Dismissed cookies using bazos.sk selector.');
            return true;
        }
    } catch (e) {
        // Ignore errors
    }
    console.log('No cookie popup found or dismissed.');
    return false;
}

module.exports = dismissCookies;
