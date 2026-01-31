import * as vscode from 'vscode';
import { ChatPanel } from './panels/ChatPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('GPT Brainrot Extension is now active!');

    const disposable = vscode.commands.registerCommand('gpt-brainrot.openChat', () => {
        ChatPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
