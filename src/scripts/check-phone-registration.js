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

    // Wait for page content to be fully loaded
    await page.waitForSelector('body');

    // First check: Look for verification form or specific elements
    const formCheck = await page.evaluate(() => {
        // Common form elements for phone verification
        const verificationElements = [
            'input[type="tel"]',  // Phone input field
            'form input[placeholder*="telef"]',  // Phone input with telefon in placeholder
            '.overenie',  // Classes containing verification
            '#overenie'   // IDs containing verification
        ];
        
        // Check if any verification elements exist and are visible
        for (const selector of verificationElements) {
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null) {
                return {
                    found: true,
                    method: 'form-element',
                    element: selector
                };
            }
        }
        return { found: false };
    });

    // Log form check results
    if (formCheck.found) {
        console.log('Found verification form element:', formCheck.element);
    }

    // Second check: Look for verification text
    const textCheck = await page.evaluate((searchPhrase) => {
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
        let foundText = '';

        // Method 1: Direct element search with visibility check
        const visibleElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return el.offsetParent !== null && 
                   style.display !== 'none' && 
                   style.visibility !== 'hidden' &&
                   el.textContent.trim() !== '';
        });

        for (const element of visibleElements) {
            const text = normalizeText(element.textContent);
            if (text.includes(normalizedPhrase)) {
                found = true;
                foundMethod = 'direct-search';
                foundText = element.textContent.trim();
                break;
            }
        }

        // Method 2: TreeWalker for text nodes
        if (!found) {
            const walk = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        const parent = node.parentElement;
                        if (!parent || !parent.offsetParent) return NodeFilter.FILTER_REJECT;
                        const style = window.getComputedStyle(parent);
                        return (style.display !== 'none' && style.visibility !== 'hidden')
                            ? NodeFilter.FILTER_ACCEPT
                            : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            while (walk.nextNode()) {
                const text = normalizeText(walk.currentNode.textContent);
                if (text.includes(normalizedPhrase)) {
                    found = true;
                    foundMethod = 'tree-walker';
                    foundText = walk.currentNode.textContent.trim();
                    break;
                }
            }
        }

        return { found, method: foundMethod, text: foundText };
    }, phrase);

    // Debug logging
    console.log('Text search results:', textCheck);
    console.log('Form check results:', formCheck);

    // Determine if verification is required based on both checks
    const verificationRequired = formCheck.found || textCheck.found;

    console.log('Final verification check result:', {
        required: verificationRequired,
        foundByForm: formCheck.found,
        foundByText: textCheck.found,
        textFound: textCheck.text
    });

    return verificationRequired;
    console.log(`requires_phone_registration: ${found}`);
    if (found) {
        console.log('Phrase found in:', foundWhere);
    } else {
        console.log('Phrase not found in any approach.');
    }
    return found;
}

module.exports = checkPhoneRegistration;
