# Implementation notes

## 1.1.0

- Translated the extension interface, background messages, list generator output, and documentation to English.
- Restored the full-screen Silk Road image on the block page and added a small translucent extension disclaimer.
- Added an explicit non-affiliation disclaimer to both the toolbar settings popup and blocked page. The shared copy lives in `disclaimer.js`.
- Updated the manifest description and version.

## Earlier changes

The extension is currently configured for Firefox. It provides five independent filters: core protection, adult content, gambling, misinformation, and social media. Lists are generated from StevenBlack/hosts; category lists remove domains already found in the base source, allowing every filter to be toggled independently.
