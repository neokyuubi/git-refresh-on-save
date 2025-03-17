// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-refresh-on-save" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        // Execute the Git refresh command.
        // This command forces VS Code to re-run "git status" and update the Source Control panel.
		console.log('File saved, refreshing Git status...');
		console.log('Document: ' + document.fileName);
        vscode.commands.executeCommand('git.refresh');
    });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
