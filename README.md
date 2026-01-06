# Git Refresh on Save

Automatically refreshes Git status whenever a file is saved. This is particularly useful when working with remote/SSH sessions where Git status updates might be delayed, and supports multi-project workspaces with multiple Git repositories.

## Features

- Automatically runs `git.refresh` command on file save
- **Smart Git repository detection** - only runs in actual Git repositories
- **Multi-project support** - works with workspaces containing multiple Git repositories
- **Symlink support** - handles symlinked folders and cross-filesystem scenarios (WSL ↔ Windows)
- Updates the Source Control panel status immediately after saving
- Works seamlessly with both local and remote repositories
- **Graceful handling** of non-Git directories - no errors or unnecessary operations

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

This extension currently doesn't provide any configurable settings.

## Known Issues

No known issues at this time.

## Release Notes

### 0.0.5

- **Multi-project support**: Extension now works with workspaces containing multiple Git repositories in subfolders
- **Symlink support**: Handles symlinked folders and cross-filesystem scenarios (WSL ↔ Windows)
- **Improved path resolution**: Better Git repository detection with symlink-aware directory traversal
- **Enhanced logging**: More detailed output for debugging repository detection

### 0.0.4

- Added intelligent Git repository detection
- Improved performance by avoiding unnecessary Git operations in non-Git directories
- Enhanced error handling and logging
- Better user experience with no error dialogs for non-Git folders

### 0.0.3

Initial release of Git Refresh on Save
