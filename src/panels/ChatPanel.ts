import * as vscode from 'vscode';
import { MockGptService } from '../services/MockGptService';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _gptService: MockGptService;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._gptService = new MockGptService();

        this._panel.webview.html = this._getHtmlContent();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this._handleUserMessage(message.text);
                        break;
                }
            },
            null,
            this._disposables
        );
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
        // Notify webview that thinking started
        this._panel.webview.postMessage({ command: 'thinkingStarted' });

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
            text-align: center;
            color: white;
        }

        .ad-banner h3 {
            margin-bottom: 8px;
            font-size: 18px;
        }

        .ad-banner .promo-code {
            background-color: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-weight: bold;
            display: inline-block;
            margin-top: 8px;
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
        <div class="ad-banner">
            <h3>🚀 SPECIAL OFFER!</h3>
            <p>Get 50% off your next brain cell purchase!</p>
            <div class="promo-code">Use code: BRAINROT</div>
        </div>

        <div class="video-section">
            <h4>🎮 While you wait... enjoy some Subway Surfers!</h4>
            <div class="video-container">
                <img
                    id="brainrotGif"
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWJxbXVmOHBzMXVvMjN1YXpxbmRyMDRhYXNmNnFiamhpczV0cXhkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPCcdNniyf0ArS/giphy.gif"
                    alt="Subway Surfers Gameplay"
                    style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"
                >
            </div>
            <p style="text-align: center; margin-top: 8px; color: var(--vscode-descriptionForeground); font-size: 12px;">
                🏃 Run, jump, dodge! 🚇
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

        let isFirstMessage = true;

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
