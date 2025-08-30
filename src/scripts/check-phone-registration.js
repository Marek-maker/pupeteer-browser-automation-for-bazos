// Script to check if phone registration is required on bazos.sk
// Usage: require and call checkPhoneRegistration(page)



function normalizeText(text) {
    const norm = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
    return norm;
}

async function checkPhoneRegistration(page, phrase) {
    console.log('---[checkPhoneRegistration]---');
    console.log('Phrase to search:', phrase);

    // Get all visible text using different approaches
    const result = await page.evaluate((searchPhrase) => {
        function normalizeText(text) {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        const normalizedPhrase = normalizeText(searchPhrase);
        let found = false;
        let foundMethod = '';

        // Method 1: Check using querySelector with XPath-like search
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            if (element.offsetParent !== null) { // Check if element is visible
                const text = normalizeText(element.textContent);
                if (text.includes(normalizedPhrase)) {
                    found = true;
                    foundMethod = 'querySelector';
                    break;
                }
            }
        }

        // Method 2: Use native browser find if available
        if (!found && window.find && typeof window.find === 'function') {
            try {
                found = window.find(searchPhrase, false, false, true, false, false, false);
                if (found) foundMethod = 'window.find';
            } catch (e) {
                console.error('window.find failed:', e);
            }
        }

        // Method 3: Direct text node search
        if (!found) {
            const walk = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        return node.parentElement.offsetParent !== null
                            ? NodeFilter.FILTER_ACCEPT
                            : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            while (walk.nextNode()) {
                const text = normalizeText(walk.currentNode.textContent);
                if (text.includes(normalizedPhrase)) {
                    found = true;
                    foundMethod = 'TreeWalker';
                    break;
                }
            }
        }

        return { found, method: foundMethod };
    }, phrase);

    console.log('Search result:', result);
    console.log(`requires_phone_registration: ${result.found}`);
    if (result.found) {
        console.log('Phrase found using method:', result.method);
    } else {
        console.log('Phrase not found using any method');
    }

    return result.found;
    console.log(`requires_phone_registration: ${found}`);
    if (found) {
        console.log('Phrase found in:', foundWhere);
    } else {
        console.log('Phrase not found in any approach.');
    }
    return found;
}

module.exports = checkPhoneRegistration;
