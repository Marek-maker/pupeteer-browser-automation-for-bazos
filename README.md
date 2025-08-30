# Bazos.sk Browser Automation

A Puppeteer-based automation script for interacting with Bazos.sk. This project provides automated functionality for common tasks on the Bazos.sk platform.

## Features

- **Automated Navigation**: Handles site navigation and cookie dismissal
- **Phone Registration Detection**: Robust text detection system that uses multiple methods to reliably check if phone registration is required:
  - Visual element search with visibility verification
  - Native browser find functionality
  - Direct text node traversal
  - Handles special characters and different text formats
- **Category Selection**: Automated category navigation
- **Advertisement Posting**: Supports automated ad creation

## Configuration

The script uses a JSON configuration file (`config.json`) with the following parameters:

```json
{
  "url": "https://bazos.sk",
  "advertDataFile": "assets/adverts/demo-advert.json",
  "phoneRegistrationPhrase": "Pred pridaním inzerátu je nutné overenie mobilného telefónu",
  "delayMs": 1500,
  "allowContinueText": "Prosím pravdivo vyplňte tento formulár. Vybraním správnej kategórie zvýšite efektívnosť vášho inzerátu."
}
```

## Usage

1. Install dependencies:
```bash
npm install
```

2. Run the script:
```bash
node src/scripts/main.js src/scripts/config.json
```

## Requirements

- Node.js
- Puppeteer
- Valid configuration file

For detailed setup instructions, see [setup-node-puppeteer.md](docs/setup-node-puppeteer.md)
