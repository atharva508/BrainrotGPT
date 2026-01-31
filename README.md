# BrainrotGPT

A VS Code extension that displays advertisements and "brainrot" content (gaming gameplay) while GPT is "thinking", providing entertainment during AI response wait times.

![VS Code Version](https://img.shields.io/badge/VS%20Code-^1.85.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Chat Interface**: Clean chat panel integrated into VS Code
- **Brainrot Content**: Displays entertaining gaming content while waiting for responses
- **Ad Integration**: Shows promotional banners during "thinking" time
- **Simulated GPT**: Mock GPT service with 3-8 second response delays

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press `F5` to launch the Extension Development Host

## Usage

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run "GPT Brainrot: Open Chat Panel"
3. Type a message and press Send
4. Watch brainrot content while GPT "thinks"
5. Receive your response!

## Project Structure

```
BrainrotGPT/
├── .github/                    # GitHub configuration
│   └── ISSUE_TEMPLATE/         # Issue templates
├── .vscode/                    # VS Code settings
├── src/                        # Source code
│   ├── extension.ts            # Extension entry point
│   ├── panels/                 # Webview panels
│   │   └── ChatPanel.ts        # Chat panel implementation
│   └── services/               # Services
│       └── MockGptService.ts   # Mock GPT API service
├── out/                        # Compiled output
├── package.json                # Extension manifest
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Run linter
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the trend of "brainrot" content consumption
- Built with VS Code Extension API
