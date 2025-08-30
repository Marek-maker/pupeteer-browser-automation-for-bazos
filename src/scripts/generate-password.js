// Script to generate a password for Bazos.sk advertisements
// Usage: require and call generatePassword()

/**
 * Generates an 8-character password suitable for Bazos.sk
 * Contains a mix of lowercase letters and numbers for better memorability
 * @returns {string} 8-character password
 */
function generatePassword() {
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // excluding l and o to avoid confusion
    const numbers = '23456789'; // excluding 0 and 1 to avoid confusion
    let password = '';

    // Ensure at least 2 numbers and 6 letters for good memorability
    // Add 2 numbers at random positions
    const positions = [];
    while (positions.length < 2) {
        const pos = Math.floor(Math.random() * 8);
        if (!positions.includes(pos)) {
            positions.push(pos);
        }
    }

    // Fill all 8 positions
    for (let i = 0; i < 8; i++) {
        if (positions.includes(i)) {
            // Add a number at this position
            password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        } else {
            // Add a letter at this position
            password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        }
    }

    return password;
}

module.exports = generatePassword;
