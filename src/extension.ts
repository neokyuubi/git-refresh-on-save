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
		// Check if extension is enabled
		const config = vscode.workspace.getConfiguration('gitRefreshOnSave');
		const enabled = config.get<boolean>('enabled', true);
		if (!enabled) {
			console.log('Extension disabled, skipping Git refresh for:', document.fileName);
			return;
		}

		// Skip if not a regular file (might be settings, config, etc.)
		if (document.uri.scheme !== 'file') {
			console.log('Skipping non-file URI:', document.uri.scheme, document.fileName);
			return;
		}

		// Skip temporary files, backups, and common non-source files
		const fileName = path.basename(document.fileName).toLowerCase();
		if (fileName.startsWith('.') ||
		    fileName.includes('~') ||
		    fileName.endsWith('.tmp') ||
		    fileName.endsWith('.bak') ||
		    fileName.endsWith('.swp') ||
		    fileName.endsWith('.lock') ||
		    fileName.endsWith('.log')) {
			console.log('Skipping temporary/backup/log file:', document.fileName);
			return;
		}

		// Check if file is in workspace
		if (!vscode.workspace.workspaceFolders?.some(folder =>
			document.uri.fsPath.startsWith(folder.uri.fsPath)
		)) {
			console.log('File outside workspace, skipping:', document.fileName);
			return;
		}

		// Check ignored file patterns (simple string matching)
		const ignoredPatterns = config.get<string[]>('ignoredFilePatterns', []);
		const filePath = document.uri.fsPath;
		const shouldIgnore = ignoredPatterns.some(pattern => {
			// Simple pattern matching for common cases
			if (pattern.includes('**')) {
				// For glob patterns, check if path contains the pattern
				const simplePattern = pattern.replace('**/', '').replace('/**', '').replace('**', '');
				return filePath.includes(simplePattern);
			}
			return filePath.includes(pattern);
		});

		if (shouldIgnore) {
			console.log('File matches ignored pattern, skipping:', document.fileName);
			return;
		}

		// CRITICAL: Check if we're in a Git repository before attempting to refresh
		const gitRoot = findGitRepositoryRoot(document.uri.fsPath);
		if (!gitRoot) {
			console.log('❌ File saved outside Git repository, skipping Git refresh:', document.fileName);
			return;
		}

		// Double-check that the .git directory actually exists and is accessible
		if (!isGitRepository(gitRoot)) {
			console.log('❌ Git repository not accessible, skipping Git refresh:', document.fileName);
			return;
		}

		console.log('✅ Found valid Git repository at:', gitRoot, 'for file:', document.fileName);
		
		// Final safety check: ensure VS Code's Git extension can see this repository
		try {
			const gitExtension = vscode.extensions.getExtension('vscode.git');
			if (!gitExtension?.isActive) {
				console.log('❌ VS Code Git extension not active, skipping refresh');
				return;
			}

			const git = gitExtension.exports.getAPI(1);
			const hasMatchingRepo = git.repositories.some((repo: any) => {
				return repo.rootUri.fsPath === gitRoot;
			});

			if (!hasMatchingRepo) {
				console.log('❌ Git repository not recognized by VS Code Git extension, skipping refresh');
				return;
			}
		} catch (error) {
			console.log('⚠️ Could not verify with Git extension, proceeding anyway');
		}

		// Refresh the specific Git repository without showing repository picker
		console.log('📁 File saved in Git repository:', gitRoot);
		console.log('📄 File:', document.fileName);

		try {
			const gitExtension = vscode.extensions.getExtension('vscode.git');
			if (gitExtension?.isActive) {
				const git = gitExtension.exports.getAPI(1);
				const repo = git.repositories.find((r: any) => r.rootUri.fsPath === gitRoot);
				if (repo) {
					// Refresh just this specific repository's status
					repo.status();
					console.log('✅ Git repository status refreshed for:', gitRoot);
					return;
				}
			}
		} catch (error) {
			console.log('⚠️ Could not refresh specific repository:', error);
		}

		// Fallback: try to refresh without showing picker by being more specific
		console.log('🔄 Using fallback refresh method');
		vscode.commands.executeCommand('git.refresh')
			.then(() => {
				console.log('✅ Git status refreshed (fallback)');
			}, (err: Error) => {
				console.error('❌ Error refreshing Git status:', err);
			});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
