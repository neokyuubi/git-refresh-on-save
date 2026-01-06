# Git Refresh on Save

Automatically refreshes Git status whenever a file is saved. This is particularly useful when working with remote/SSH sessions where Git status updates might be delayed, and supports multi-project workspaces with multiple Git repositories.

## Features

- **Smart Git repository detection** - identifies when files are saved in Git repositories
- **Multi-project support** - works with workspaces containing multiple Git repositories
- **Symlink support** - handles symlinked folders and cross-filesystem scenarios (WSL ↔ Windows)
- **Detailed logging** - shows exactly which files trigger Git repository detection
- **No intrusive refreshes** - relies on VS Code's automatic Git status updates
- Works seamlessly with both local and remote repositories
- **Graceful filtering** - automatically ignores temporary files, logs, and non-Git files

## Installation

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X` on Mac)
3. Search for "Git Refresh on Save"
4. Click Install

## Usage

The extension works automatically after installation. When you save a file:

- **In a Git repository**: Automatically refreshes the Git status
- **Outside a Git repository**: Does nothing (no errors or unnecessary operations)

The extension intelligently detects whether you're working in a Git repository before attempting to refresh Git status, ensuring optimal performance and user experience.

## Requirements

- VS Code version 1.75.0 or higher
- Git installed on your system (for Git repositories)

## Extension Settings

This extension provides the following settings:

- `gitRefreshOnSave.enabled`: Enable/disable automatic Git refresh on file save (default: `true`)
- `gitRefreshOnSave.ignoredFilePatterns`: Array of file patterns to ignore (default includes common patterns like `node_modules`, log files, temporary files, etc.)

You can configure these settings in VS Code/Cursor settings under "Extensions > Git Refresh on Save".

## Known Issues

No known issues at this time.

## Release Notes

### 0.0.7

- **Fixed intrusive behavior**: Removed git.refresh calls that caused repository picker dropdowns
- **Non-intrusive operation**: Relies on VS Code's automatic Git status updates instead of forced refreshes

### 0.0.6

- **Multi-project support**: Extension now works with workspaces containing multiple Git repositories in subfolders
- **Symlink support**: Handles symlinked folders and cross-filesystem scenarios (WSL ↔ Windows)
- **Improved path resolution**: Better Git repository detection with symlink-aware directory traversal
- **Enhanced logging**: More detailed output for debugging repository detection
- **Configuration options**: Added settings to enable/disable extension and configure ignored file patterns
- **Better filtering**: Automatically skips temporary files, backups, and configurable ignored patterns

### 0.0.4

- Added intelligent Git repository detection
- Improved performance by avoiding unnecessary Git operations in non-Git directories
- Enhanced error handling and logging
- Better user experience with no error dialogs for non-Git folders

### 0.0.3

Initial release of Git Refresh on Save
