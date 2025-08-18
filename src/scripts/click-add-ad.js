// Script to click the "Pridať inzerát" button/link using Puppeteer
// Usage: require and call clickAddAd(page)

async function clickAddAd(page) {
    // Try Slovak and bazos.sk specific selectors and text
    const keywords = [
        'Pridať inzerát', // Slovak: Add ad
        'Pridat inzerat', // Without diacritics
    ];
    const selectors = [
        'a',
        'button',
        '[role="button"]',
    ];
    for (const selector of selectors) {
        const elements = await page.$$(selector);
        for (const el of elements) {
            const text = await page.evaluate(el => el.innerText || el.value || '', el);
            if (text) {
                for (const kw of keywords) {
                    if (text.trim().toLowerCase().includes(kw.toLowerCase())) {
                        try {
                            await el.click();
                            console.log(`Clicked "Pridať inzerát" with text: ${text}`);
                            return true;
                        } catch (e) {
                            // Ignore click errors
                        }
                    }
                }
            }
        }
    }
    // Try bazos.sk specific selector
    try {
        const bazosAddBtn = await page.$('a[href*="pridat-inzerat"]');
        if (bazosAddBtn) {
            await bazosAddBtn.click();
            console.log('Clicked "Pridať inzerát" using bazos.sk selector.');
            return true;
        }
    } catch (e) {
        // Ignore errors
    }
    console.log('No "Pridať inzerát" button/link found.');
    return false;
}

module.exports = clickAddAd;
