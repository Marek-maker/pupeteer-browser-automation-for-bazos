// Script to dismiss cookies popup using Puppeteer
// Usage: require and call dismissCookies(page)

async function dismissCookies(page) {
    console.log('---[dismissCookies]---');
    
    try {
        // Wait for the cookies element to be present
        await page.waitForSelector('div#cookies', { timeout: 5000 }).catch(() => {
            console.log('No cookie popup found (div#cookies not present)');
            return false;
        });

        // Specifically target the Bazos cookie element and its link
        const cookieElement = await page.$('div#cookies');
        if (!cookieElement) {
            console.log('Cookie element not found');
            return false;
        }

        // Get the specific cookie accept link
        const acceptLink = await cookieElement.$('a');
        if (!acceptLink) {
            console.log('Accept link not found in cookie element');
            return false;
        }

        // Verify the element before clicking
        const isVisible = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return el.offsetParent !== null && 
                   style.display !== 'none' && 
                   style.visibility !== 'hidden';
        }, acceptLink);

        if (!isVisible) {
            console.log('Cookie accept link is not visible');
            return false;
        }

        // Click the accept link
        await acceptLink.click();
        console.log('Successfully dismissed cookie popup');
        
        // Verify the cookie notice is gone
        await page.waitForFunction(() => {
            const cookieDiv = document.querySelector('div#cookies');
            return !cookieDiv || cookieDiv.offsetParent === null;
        }, { timeout: 5000 });

        return true;
    } catch (error) {
        console.error('Error in dismissCookies:', error.message);
        return false;
    }
}

module.exports = dismissCookies;
