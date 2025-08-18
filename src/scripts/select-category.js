// Script to select a category by name using Puppeteer
// Usage: require and call selectCategory(page, categoryName)

async function selectCategory(page, categoryName) {
    if (!categoryName) {
        console.error('No category name provided.');
        return false;
    }
    // Focus on the category dropdown in the advert form
    const formSection = await page.$('div#form, form, div.form');
    if (formSection) {
        try {
            const selectHandle = await formSection.$('select[name="kat"]');
            if (selectHandle) {
                // Get all options and find one matching the visible text
                const options = await selectHandle.$$('option');
                for (const option of options) {
                    const optionText = await page.evaluate(el => el.innerText || el.textContent || '', option);
                    if (optionText.trim().toLowerCase().includes(categoryName.trim().toLowerCase())) {
                        const optionValue = await page.evaluate(el => el.value, option);
                        await page.select('select[name="kat"]', optionValue);
                        console.log(`Selected category from dropdown: ${optionText}`);
                        return true;
                    }
                }
            }
        } catch (e) {
            // Ignore errors
        }
    }
    console.log(`Category '${categoryName}' not found in dropdown.`);
    return false;
}

module.exports = selectCategory;
