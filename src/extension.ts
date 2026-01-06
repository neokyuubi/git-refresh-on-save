// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Checks if a directory contains a Git repository
 * @param folderPath - The path to check for .git directory
 * @returns true if it's a Git repository, false otherwise
 */
function isGitRepository(folderPath: string): boolean {
	try {
		const gitPath = path.join(folderPath, '.git');
		return fs.existsSync(gitPath);
	} catch (error) {
		console.error('Error checking Git repository:', error);
		return false;
	}
}

/**
 * Finds the Git repository root for a given file path by walking up the directory tree
 * Handles symlinks and cross-filesystem scenarios (WSL <-> Windows)
 * @param filePath - The file path to start searching from
 * @returns the Git repository root path, or null if not found
 */
function findGitRepositoryRoot(filePath: string): string | null {
	try {
		let currentDir = path.dirname(filePath);
		let visitedPaths = new Set<string>();

		// Walk up the directory tree looking for .git
		while (currentDir !== path.dirname(currentDir) && !visitedPaths.has(currentDir)) { // Stop at root directory or cycles
			visitedPaths.add(currentDir);

			// Check if current directory is a git repository
			if (isGitRepository(currentDir)) {
				return currentDir;
			}

			// Also check if this is a symlink and the target is a git repository
			try {
				const stat = fs.lstatSync(currentDir);
				if (stat.isSymbolicLink()) {
					const realPath = fs.realpathSync(currentDir);
					if (isGitRepository(realPath)) {
						return realPath;
					}
				}
			} catch (error) {
				// Ignore symlink resolution errors
				console.log('Could not resolve symlink for:', currentDir);
			}

			currentDir = path.dirname(currentDir);
		}

		return null;
	} catch (error) {
		console.error('Error finding Git repository root:', error);
		return null;
	}
}

/**
 * Checks if VS Code's Git extension has detected any repositories
 * @returns true if Git repositories are available, false otherwise
 */
function hasGitRepositories(): boolean {
	try {
		const gitExtension = vscode.extensions.getExtension('vscode.git');
		if (!gitExtension?.isActive) {
			return false;
		}
		
		const git = gitExtension.exports.getAPI(1);
		return git.repositories.length > 0;
	} catch (error) {
		console.error('Error checking Git extension:', error);
		return false;
	}
}

/**
 * Checks if the saved file is within any Git repository (supports multi-project workspaces)
 * @param document - The document that was saved
 * @returns true if the file is in a Git repository, false otherwise
 */
function isFileInGitRepository(document: vscode.TextDocument): boolean {
	const filePath = document.uri.fsPath;
	return findGitRepositoryRoot(filePath) !== null;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	if (!vscode.workspace.workspaceFolders) {
		return;
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"git-refresh-on-save" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (!vscode.workspace.workspaceFolders?.some(folder => 
			document.uri.fsPath.startsWith(folder.uri.fsPath)
		)) {
			return;
		}
		
		// Check if we're in a Git repository before attempting to refresh
		const gitRoot = findGitRepositoryRoot(document.uri.fsPath);
		if (!gitRoot) {
			console.log('File saved outside Git repository, skipping Git refresh:', document.fileName);
			return;
		}
		console.log('Found Git repository at:', gitRoot, 'for file:', document.fileName);
		
		// Note: We skip the VS Code Git API check for better symlink support
		// The filesystem-based check should be sufficient
		
		// Execute the Git refresh command.
		// This command forces VS Code to re-run "git status" and update the Source Control panel.
		console.log('File saved in Git repository, refreshing Git status...');
		console.log('Document: ' + document.fileName);
		vscode.commands.executeCommand('git.refresh')
			.then(() => {
				console.log('Git status refreshed successfully');
			}, (err: Error) => {
				console.error('Error refreshing Git status:', err);
			});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
