// Script to submit the advertisement form and verify success
// Usage: require and call submitAndVerify(page)

/**
 * Submit the advertisement form and verify success
 * @param {import('puppeteer').Page} page - Puppeteer page object
 * @returns {Promise<boolean>} - True if submission was successful
 */
async function submitAndVerify(page) {
    console.log('---[submitAndVerify]---');
    console.log('Submitting advertisement form...');

    try {
        // Find and click the submit button (try both Slovak and English text)
        const submitButtonSelector = 'input[type="submit"]';
        await page.waitForSelector(submitButtonSelector);
        
        // Before submitting, ensure all fields are properly filled
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get all submit buttons and click the right one
        const submitButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('input[type="submit"]'));
            const button = buttons.find(b => 
                b.value === 'Odoslať' || 
                b.value === 'Submit' || 
                b.value === 'Poslat' || 
                b.value === 'Poslať'
            );
            
            // Check for any visible error messages before submitting
            const errors = document.querySelectorAll('.error, .chyba, #error');
            if (errors.length > 0) {
                const errorTexts = Array.from(errors).map(e => e.textContent.trim());
                throw new Error(`Form has errors: ${errorTexts.join(', ')}`);
            }
            
            return button ? button.value : null;
        });

        if (!submitButton) {
            throw new Error('Submit button not found');
        }

        console.log(`Found submit button with value: ${submitButton}`);

        // Click submit and wait for navigation
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
            page.click(`input[type="submit"][value="${submitButton}"]`)
        ]);
        
        console.log('Clicked submit button, waiting for success message...');
        
        // Wait a moment for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for success message or any variations of it
        const successTexts = [
            'Inzerát bol vložený',
            'Inzerát bol zmenený',
            'Inzerát bol vložený/zmenený',
            'Inzerát byl vložen',
            'Váš inzerát bol pridaný'
        ];
        
        const pageText = await page.evaluate(() => document.body.innerText);
        const foundSuccess = successTexts.some(text => pageText.includes(text));
        
        if (!foundSuccess) {
            // Check for common error messages
            if (pageText.includes('Chyba')) {
                const errorSection = await page.evaluate(() => {
                    const errorElement = document.querySelector('.chyba') || 
                                      document.querySelector('div[style*="color: red"]');
                    return errorElement ? errorElement.innerText : '';
                });
                throw new Error(`Form submission error: ${errorSection || 'Unknown error'}`);
            }
            throw new Error('Success message not found on page after submission');
        }

        console.log('Success! Advertisement was submitted successfully');
        return true;

    } catch (error) {
        console.error('Error during form submission or verification:', error.message);
        return false;
    }
}

module.exports = submitAndVerify;
