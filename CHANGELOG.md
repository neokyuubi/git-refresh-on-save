# Change Log

All notable changes to the "git-refresh-on-save" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.6] - 2026-01-06

### Added
- **Multi-project support**: Extension now works with workspaces containing multiple Git repositories in subfolders
- **Symlink support**: Handles symlinked folders and cross-filesystem scenarios (WSL ↔ Windows)
- **Improved path resolution**: Better Git repository detection with symlink-aware directory traversal
- **Enhanced logging**: More detailed output for debugging repository detection
- **Configuration options**: Added settings to enable/disable extension and configure ignored file patterns
- **Better filtering**: Automatically skips temporary files, backups, and configurable ignored patterns

### Changed
- Modified Git repository detection to walk up directory tree instead of only checking workspace folder
- Relaxed VS Code Git API dependency checks for better symlink compatibility

## [0.0.4] - 2024-XX-XX

- Added intelligent Git repository detection
- Improved performance by avoiding unnecessary Git operations in non-Git directories
- Enhanced error handling and logging
- Better user experience with no error dialogs for non-Git folders

## [0.0.3] - 2024-XX-XX

- Initial release of Git Refresh on Save