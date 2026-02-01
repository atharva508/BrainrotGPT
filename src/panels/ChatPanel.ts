import * as vscode from 'vscode';
import { MockGptService } from '../services/MockGptService';
import { AdService, Ad } from '../services/AdService';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _gptService: MockGptService;
    private readonly _adService: AdService;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._gptService = new MockGptService();
        this._adService = AdService.getInstance();

        // Apply configuration
        this._applyConfiguration();

        this._panel.webview.html = this._getHtmlContent();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this._handleUserMessage(message.text);
                        break;
                    case 'adClicked':
                        this._handleAdClick(message.adId);
                        break;
                }
            },
            null,
            this._disposables
        );

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('brainrotGpt')) {
                this._applyConfiguration();
            }
        }, null, this._disposables);
    }

    private _applyConfiguration(): void {
        const config = vscode.workspace.getConfiguration('brainrotGpt');
        const enableAds = config.get<boolean>('enableAds', true);
        this._adService.setEnabled(enableAds);
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'gptBrainrotChat',
            'GPT Brainrot Chat',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
    }

    private async _handleUserMessage(userMessage: string) {
        // Get a new ad for this thinking phase
        const ad = await this._adService.getRandomAd();

        // Notify webview that thinking started, include ad data
        this._panel.webview.postMessage({
            command: 'thinkingStarted',
            ad: ad
        });

        try {
            const response = await this._gptService.getResponse(userMessage);
            this._panel.webview.postMessage({
                command: 'responseReceived',
                text: response
            });
        } catch (error) {
            this._panel.webview.postMessage({
                command: 'responseReceived',
                text: 'Sorry, an error occurred while processing your request.'
            });
        }
    }

    private _handleAdClick(adId: string): void {
        this._adService.trackAdClick(adId);
        vscode.window.showInformationMessage(`Thanks for checking out our sponsor! (Ad: ${adId})`);
    }

    public dispose() {
        ChatPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _getHtmlContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src https: data:;">
    <title>GPT Brainrot Chat</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 16px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .chat-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background-color: var(--vscode-input-background);
        }

        .message {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 8px;
            max-width: 85%;
        }

        .user-message {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: auto;
        }

        .gpt-message {
            background-color: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-panel-border);
        }

        .welcome-message {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        .brainrot-section {
            display: none;
            margin-bottom: 16px;
            animation: fadeIn 0.3s ease-in;
        }

        .brainrot-section.visible {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .ad-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            color: white;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
        }

        .ad-banner:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .ad-label {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: rgba(0, 0, 0, 0.3);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .ad-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .ad-image {
            width: 120px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
            background-color: rgba(255, 255, 255, 0.1);
        }

        .ad-text {
            flex: 1;
        }

        .ad-banner h3 {
            margin-bottom: 4px;
            font-size: 16px;
        }

        .ad-banner p {
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 8px;
        }

        .ad-banner .promo-code {
            background-color: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-weight: bold;
            display: inline-block;
            font-size: 12px;
        }

        .video-section {
            background-color: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }

        .video-section h4 {
            margin-bottom: 10px;
            color: var(--vscode-descriptionForeground);
        }

        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 4px;
        }

        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

        .thinking-indicator {
            display: none;
            align-items: center;
            justify-content: center;
            padding: 12px;
            margin-bottom: 16px;
            background-color: var(--vscode-editorWidget-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }

        .thinking-indicator.visible {
            display: flex;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--vscode-descriptionForeground);
            border-top-color: var(--vscode-button-background);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .input-area {
            display: flex;
            gap: 8px;
        }

        .input-area input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 14px;
        }

        .input-area input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .input-area input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .input-area button {
            padding: 10px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .input-area button:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
        }

        .input-area button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="chat-container" id="chatContainer">
        <div class="message welcome-message">
            Welcome to GPT Brainrot! Type a message below to start chatting.
        </div>
    </div>

    <div class="brainrot-section" id="brainrotSection">
        <div class="ad-banner" id="adBanner" onclick="handleAdClick()">
            <span class="ad-label">Ad</span>
            <div class="ad-content">
                <img class="ad-image" id="adImage" src="" alt="Advertisement">
                <div class="ad-text">
                    <h3 id="adTitle">SPECIAL OFFER!</h3>
                    <p id="adDescription">Get 50% off your next brain cell purchase!</p>
                    <div class="promo-code" id="adPromoCode">Use code: BRAINROT</div>
                </div>
            </div>
        </div>

        <div class="video-section">
            <h4>While you wait... enjoy some Subway Surfers!</h4>
            <div class="video-container">
                <img
                    id="brainrotGif"
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWJxbXVmOHBzMXVvMjN1YXpxbmRyMDRhYXNmNnFiamhpczV0cXhkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPCcdNniyf0ArS/giphy.gif"
                    alt="Subway Surfers Gameplay"
                    style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"
                >
            </div>
            <p style="text-align: center; margin-top: 8px; color: var(--vscode-descriptionForeground); font-size: 12px;">
                Run, jump, dodge!
            </p>
        </div>
    </div>

    <div class="thinking-indicator" id="thinkingIndicator">
        <div class="spinner"></div>
        <span>GPT is thinking...</span>
    </div>

    <div class="input-area">
        <input
            type="text"
            id="messageInput"
            placeholder="Type your message..."
            onkeypress="handleKeyPress(event)"
        >
        <button id="sendButton" onclick="sendMessage()">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const brainrotSection = document.getElementById('brainrotSection');
        const thinkingIndicator = document.getElementById('thinkingIndicator');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        // Ad elements
        const adBanner = document.getElementById('adBanner');
        const adImage = document.getElementById('adImage');
        const adTitle = document.getElementById('adTitle');
        const adDescription = document.getElementById('adDescription');
        const adPromoCode = document.getElementById('adPromoCode');

        let isFirstMessage = true;
        let currentAd = null;

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            if (isFirstMessage) {
                chatContainer.innerHTML = '';
                isFirstMessage = false;
            }

            addMessage(text, 'user');
            messageInput.value = '';

            vscode.postMessage({
                command: 'sendMessage',
                text: text
            });
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + (sender === 'user' ? 'user-message' : 'gpt-message');
            messageDiv.textContent = (sender === 'user' ? 'You: ' : 'GPT: ') + text;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function setInputEnabled(enabled) {
            messageInput.disabled = !enabled;
            sendButton.disabled = !enabled;
        }

        function updateAdBanner(ad) {
            if (!ad) {
                adBanner.style.display = 'none';
                return;
            }

            currentAd = ad;
            adBanner.style.display = 'block';
            adImage.src = ad.imageUrl;
            adImage.alt = ad.title;
            adTitle.textContent = ad.title;
            adDescription.textContent = ad.description;

            if (ad.promoCode) {
                adPromoCode.textContent = 'Use code: ' + ad.promoCode;
                adPromoCode.style.display = 'inline-block';
            } else {
                adPromoCode.style.display = 'none';
            }

            // Update gradient based on category
            const gradients = {
                software: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                hardware: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
                learning: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
                gaming: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
                services: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            };
            adBanner.style.background = gradients[ad.category] || gradients.software;
        }

        function handleAdClick() {
            if (currentAd) {
                vscode.postMessage({
                    command: 'adClicked',
                    adId: currentAd.id
                });
            }
        }

        function showBrainrot() {
            brainrotSection.classList.add('visible');
            thinkingIndicator.classList.add('visible');
        }

        function hideBrainrot() {
            brainrotSection.classList.remove('visible');
            thinkingIndicator.classList.remove('visible');
        }

        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.command) {
                case 'thinkingStarted':
                    setInputEnabled(false);
                    updateAdBanner(message.ad);
                    showBrainrot();
                    break;

                case 'responseReceived':
                    hideBrainrot();
                    addMessage(message.text, 'gpt');
                    setInputEnabled(true);
                    messageInput.focus();
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
