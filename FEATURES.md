# GPT Brainrot Extension - Feature Summary

A VS Code extension that enhances the GPT chat experience by displaying advertisements and entertaining "brainrot" content (Subway Surfers gameplay) while waiting for GPT responses.

## Core Features

### 1. Interactive Chat Panel
- **Webview-based Chat Interface**: Clean, modern chat UI integrated into VS Code
- **Message History**: Displays full conversation with distinct styling for user and GPT messages
- **Welcome Message**: Friendly greeting for first-time users
- **Theme-Aware Styling**: Uses VS Code CSS variables for seamless integration with any theme
- **Input Controls**: Text input with Enter key support and Send button
- **Input Lock During Processing**: Input disabled while GPT is "thinking" to prevent duplicate requests

### 2. Mock GPT Service
- **Simulated AI Responses**: Returns realistic, pre-written responses
- **Random Response Delay**: 3-8 second delay simulating real API latency
- **10 Canned Responses**: Variety of generic, helpful AI-style responses
- **Extensible Design**: Easy to replace mock with real GPT API integration

### 3. Brainrot Content Display
- **Subway Surfers Gameplay GIF**: Entertaining visual content shown during wait time
- **Smooth Animations**: Fade-in effect when content appears
- **Engaging Text**: "Run, jump, dodge!" caption to enhance the experience
- **Auto Show/Hide**: Automatically displays when thinking, hides when response received

### 4. Advertisement System
- **10 Pre-configured Mock Ads** across 5 categories:
  - **Software**: GameDev Pro Suite, AI Assistant Plus
  - **Hardware**: MechKeys Ultra, UltraWide Monitor X
  - **Learning**: CodeMaster Academy, DevOps Bootcamp
  - **Gaming**: RGB Everything Pro, Gaming Chair Deluxe
  - **Services**: CloudStack Pro, API Gateway Max

- **Ad Features**:
  - Unique promotional codes per ad (e.g., "BRAINROT50", "LEARN2CODE")
  - Category-based gradient color schemes
  - Clickable banners with hover effects
  - Ad click tracking with statistics
  - Smart rotation (prevents showing same ad consecutively)

- **Extensible Provider System**: `IAdProvider` interface for plugging in real ad networks

### 5. Configuration Options
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `brainrotGpt.enableAds` | boolean | `true` | Enable or disable advertisement banners |
| `brainrotGpt.adRefreshInterval` | number | `0` | Interval in ms between ad refreshes (0 = new ad per thinking phase) |

### 6. VS Code Integration
- **Command**: `gpt-brainrot.openChat` - Opens the chat panel
- **Command Palette**: "GPT Brainrot: Open Chat Panel"
- **Single Instance Control**: Only one chat panel active at a time
- **Panel Reveal**: Shows existing panel instead of creating duplicates
- **Context Retention**: Panel retains state when hidden
- **Configuration Listeners**: Real-time response to settings changes

## Technical Architecture

```
src/
├── extension.ts              # Extension entry point
├── panels/
│   └── ChatPanel.ts         # Webview panel with embedded HTML/CSS/JS
└── services/
    ├── MockGptService.ts    # Mock GPT response service
    └── AdService.ts         # Advertisement management (singleton)
```

### Design Patterns Used
- **Singleton Pattern**: AdService maintains single instance
- **Factory Pattern**: AdService.getInstance() for controlled instantiation
- **Strategy Pattern**: IAdProvider interface for swappable ad providers
- **Observer Pattern**: VS Code configuration change listeners

## Ad Categories & Styling

| Category | Gradient Colors | Example Ads |
|----------|-----------------|-------------|
| Software | Purple (#667eea → #764ba2) | GameDev Pro Suite, AI Assistant Plus |
| Hardware | Blue (#00b4db → #0083b0) | MechKeys Ultra, UltraWide Monitor X |
| Learning | Orange (#fc4a1a → #f7b733) | CodeMaster Academy, DevOps Bootcamp |
| Gaming | Purple (#8e2de2 → #4a00e0) | RGB Everything Pro, Gaming Chair Deluxe |
| Services | Green (#11998e → #38ef7d) | CloudStack Pro, API Gateway Max |

## Security

- **Content Security Policy**: Restricts resources to HTTPS images and inline styles/scripts
- **No External Scripts**: All JavaScript is inline within the webview

## Requirements

- VS Code version 1.85.0 or higher
- Node.js 20.x for development

## Usage

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "GPT Brainrot: Open Chat Panel"
3. Press Enter to open the chat
4. Type a message and press Enter or click Send
5. Watch Subway Surfers while GPT "thinks"!

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run linter
npm run lint

# Run tests
npm test
```

## Version

**Current Version**: 0.0.1 (Initial Release)
