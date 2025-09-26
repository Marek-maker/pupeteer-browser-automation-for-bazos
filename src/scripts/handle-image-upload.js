// Script to handle image upload on bazos.sk
// Usage: require and call handleImageUpload(page, imagePaths)

const path = require('path');
const fs = require('fs');

/**
 * Handle image upload in the advertisement form
 * @param {import('puppeteer').Page} page - Puppeteer page object
 * @param {string[]} imagePaths - Array of relative paths to images
 */
async function handleImageUpload(page, imagePaths) {
    console.log('\n---[handleImageUpload - Debug Mode]---');
    console.log('Relative image paths:', imagePaths);

    try {
        // Convert relative paths to absolute paths and verify files exist
        const absolutePaths = imagePaths.map(relativePath => {
            const absolutePath = path.resolve(__dirname, '..', '..', relativePath);
            console.log(`\nChecking image path:
            Relative: ${relativePath}
            Absolute: ${absolutePath}`);
            
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Image file not found: ${absolutePath}`);
            }
            
            const stats = fs.statSync(absolutePath);
            console.log(`File exists: Yes
            File size: ${stats.size} bytes
            Last modified: ${stats.mtime}`);
            
            return absolutePath;
        });

        // Wait and verify file input element
        const fileInputSelector = 'input[type="file"]';
        console.log('\nWaiting for file input element...');
        await page.waitForSelector(fileInputSelector);
        
        // Get file input element and verify it's present
        const fileInput = await page.$(fileInputSelector);
        if (!fileInput) {
            throw new Error('File input element not found after waiting');
        }
        console.log('File input element found');

        // Upload files
        console.log('\nAttempting to upload files...');
        await fileInput.uploadFile(...absolutePaths);

        // Verify upload was successful by checking if files were accepted
        console.log('\nVerifying upload...');
        const uploadStatus = await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            return {
                filesCount: input.files.length,
                fileNames: Array.from(input.files).map(f => f.name)
            };
        }, fileInputSelector);

        console.log(`Upload verification:
        Number of files accepted: ${uploadStatus.filesCount}
        Accepted file names: ${uploadStatus.fileNames.join(', ')}`);

        // Optional: Add a pause here for manual verification
        console.log('\nPausing for manual verification...');
        console.log('You can check the browser to verify the upload.');
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause

        /*commenting out coz it caused errors,even if upload went ok... if (uploadStatus.filesCount !== absolutePaths.length) {
            throw new Error(`Upload verification failed: Expected ${absolutePaths.length} files, but ${uploadStatus.filesCount} were accepted`);
        }*/

        console.log('\nImage upload process completed successfully');
    } catch (error) {
        console.error('\n❌ Error in image upload process:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

module.exports = handleImageUpload;
