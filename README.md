# fbi-blocker-extension
Firefox & Chrome extension to block pornography, gambling and illegal websites with the FBI domain seizure notice screen.

## Organization

fbi-blocker-extension/
├── manifest.json
├── README.md
├── LICENSE
├── scripts/
│   └── generate_rules.py
├── rules/
│   ├── rules_porn.json
│   ├── rules_gambling.json
│   └── rules_fakenews.json
├── background/
│   └── service_worker.js
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js
├── fbi/
│   ├── fbi.html
│   ├── fbi.css
│   └── fbi_background.jpg
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
