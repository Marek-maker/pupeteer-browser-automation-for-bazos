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

    // Approach 1: document.body.innerText
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Approach 1 - innerText (first 500 chars):', bodyText.slice(0, 500));

    // Approach 2: document.body.innerHTML (strip tags)
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const htmlStripped = bodyHTML.replace(/<[^>]*>/g, ' ');
    console.log('Approach 2 - HTML stripped (first 500 chars):', htmlStripped.slice(0, 500));

    // Approach 3: All visible text nodes
    const allTextNodes = await page.evaluate(() => {
        function getTextNodes(node) {
            let text = '';
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                text += node.textContent + ' ';
            }
            for (let child of node.childNodes) {
                text += getTextNodes(child);
            }
            return text;
        }
        return getTextNodes(document.body);
    });
    console.log('Approach 3 - All text nodes (first 500 chars):', allTextNodes.slice(0, 500));

    // Normalize and search in all approaches
    const normPhrase = normalizeText(phrase);
    const normBody = normalizeText(bodyText);
    const normHTML = normalizeText(htmlStripped);
    const normAllText = normalizeText(allTextNodes);

    let found = false;
    let foundWhere = '';
    if (normBody.includes(normPhrase)) {
        found = true;
        foundWhere = 'innerText';
    } else if (normHTML.includes(normPhrase)) {
        found = true;
        foundWhere = 'HTML stripped';
    } else if (normAllText.includes(normPhrase)) {
        found = true;
        foundWhere = 'All text nodes';
    }

    console.log('Normalized phrase:', normPhrase);
    console.log(`requires_phone_registration: ${found}`);
    if (found) {
        console.log('Phrase found in:', foundWhere);
    } else {
        console.log('Phrase not found in any approach.');
    }
    return found;
}

module.exports = checkPhoneRegistration;
