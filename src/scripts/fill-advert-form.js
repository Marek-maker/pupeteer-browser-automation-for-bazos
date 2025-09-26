// Script to fill out the advertisement form on bazos.sk
// Usage: require and call fillAdvertForm(page, advertData)

/**
 * Fill out the advertisement submission form
 * @param {import('puppeteer').Page} page - Puppeteer page object
 * @param {Object} advertData - Advertisement data from JSON
 */
async function fillAdvertForm(page, advertData) {
    console.log('---[fillAdvertForm]---');
    console.log('Filling out advertisement form with data:', advertData);

    try {
        // Fill out the title field (Nadpis)
        await fillFieldIfNeeded(
            'input[name="nadpis"]',
            advertData.nazov_inzeratu,
            'Title'
        );

        // Handle category dropdown (Kategória)
        const categorySelector = 'select[name="category"]';
        await page.waitForSelector(categorySelector);
        
        // Get current category
        const currentCategory = await page.$eval(categorySelector, el => {
            const selectedOption = el.options[el.selectedIndex];
            return selectedOption ? selectedOption.text.trim() : '';
        });

        if (currentCategory.toLowerCase() !== advertData.podkategoria.toLowerCase()) {
            // Get all available options and find the matching one
            const categoryMatch = await page.evaluate((podkategoria) => {
                const select = document.querySelector('select[name="category"]');
                const options = Array.from(select.options);
                const matchingOption = options.find(option => 
                    option.text.trim().toLowerCase() === podkategoria.toLowerCase()
                );
                return matchingOption ? matchingOption.value : null;
            }, advertData.podkategoria);

            if (categoryMatch) {
                await page.select(categorySelector, categoryMatch);
                console.log('Category updated to:', advertData.podkategoria);
            } else {
                console.error('Could not find matching category:', advertData.podkategoria);
                throw new Error(`Category "${advertData.podkategoria}" not found in dropdown options`);
            }
        } else {
            console.log('Category already set correctly');
        }

        // Helper function to handle form field filling
        async function fillFieldIfNeeded(selector, value, fieldName) {
            await page.waitForSelector(selector);
            const currentValue = await page.$eval(selector, el => el.value);
            
            if (value && currentValue !== value) {
                // Clear the field first
                await page.$eval(selector, el => el.value = '');
                // Type the new value
                await page.type(selector, value);
                console.log(`${fieldName} field updated to:`, value);
            } else {
                console.log(`${fieldName} field already contains correct value or no new value provided`);
            }
        }

        // Fill out contact details
        // Handle email field
        await fillFieldIfNeeded(
            'input[name="maili"]',
            advertData.kontaktne_udaje.email,
            'Email'
        );

        // Handle phone number field
        await fillFieldIfNeeded(
            'input[name="telefoni"]',
            advertData.kontaktne_udaje.telefon,
            'Phone'
        );

        // Handle name field
        await fillFieldIfNeeded(
            'input[name="jmeno"]',
            advertData.kontaktne_udaje.meno,
            'Name'
        );

        // Handle password field
        await fillFieldIfNeeded(
            'input[name="heslobazar"]',
            advertData.heslobazar,
            'Password'
        );

        // Fill out the description field (Text)
        const descriptionSelector = 'textarea[name="popis"]';
        await page.waitForSelector(descriptionSelector);
        const currentDescription = await page.$eval(descriptionSelector, el => el.value);
        
        if (currentDescription !== advertData.popis) {
            await page.$eval(descriptionSelector, el => el.value = '');
            await page.type(descriptionSelector, advertData.popis);
            console.log('Description field updated');
            
            // Verify the description was entered correctly
            const newDescription = await page.$eval(descriptionSelector, el => el.value);
            if (newDescription !== advertData.popis) {
                console.warn('Description verification failed - text might be truncated or modified');
            }
        } else {
            console.log('Description field already contains correct value');
        }

        // Fill out the price field (Cena)
        await fillFieldIfNeeded(
            'input[name="cena"]',
            advertData.cena.toString(),
            'Price'
        );

        // Fill out the location field (PSČ and mesto)
        await fillFieldIfNeeded(
            'input[name="lokalita"]',
            advertData.lokalita.PSC,
            'Location'
        );

        // Handle image upload if images are specified
        if (advertData.obrazky && advertData.obrazky.length > 0) {
            const handleImageUpload = require('./handle-image-upload');
            await handleImageUpload(page, advertData.obrazky);
        }
        
        // Add a small delay after filling all fields
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error('Error filling out advertisement form:', error);
        throw error;
    }
}

module.exports = fillAdvertForm;
