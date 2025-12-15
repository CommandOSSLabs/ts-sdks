# File Manager

A cross-platform file system abstraction for the CommandOSS ts-sdks, providing unified file operations in both Node.js and browser environments using [zenfs](https://github.com/zen-fs/core).

## Features

- 🌐 **Universal**: Works in Node.js and browser environments seamlessly
- 📁 **Virtual FileSystem**: ZenFS-based in-memory file system
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive interfaces
- 🚀 **Efficient**: Lazy-loaded, memory-efficient file operations
- 🎯 **Abstracted**: Simple interface for common file operations

## Installation

```bash
npm install @cmdoss/file-manager
```

## Quick Start

```typescript
import { ZenFsFileManager } from '@cmdoss/file-manager'

const fileManager = new ZenFsFileManager()

// Read a file
const content = await fileManager.readFile('/path/to/file.txt')

// Write a file
await fileManager.writeFile('/path/to/output.txt', 'content')

// List directory contents
const files = await fileManager.listDirectory('/path/to/dir')

// Check if file exists
const exists = await fileManager.fileExists('/path/to/file.txt')

// Get file metadata
const stat = await fileManager.stat('/path/to/file.txt')
```

## API

### IFileManager Interface

All operations are defined by the `IFileManager` interface:

- `readFile(path: string): Promise<Buffer>` - Read file contents
- `writeFile(path: string, content: Buffer | string): Promise<void>` - Write file contents
- `listDirectory(path: string): Promise<string[]>` - List directory contents
- `fileExists(path: string): Promise<boolean>` - Check if file exists
- `stat(path: string): Promise<Stats>` - Get file metadata
- `mkdir(path: string): Promise<void>` - Create directory
- `rm(path: string): Promise<void>` - Delete file or directory
- `getWorkspacePath(): string` - Get current workspace directory

## Workspace Concept

The file manager tracks a workspace directory boundary within the virtual filesystem. This is useful for:

- Organizing site resources in a contained directory
- Computing relative paths for deployment
- Isolating operations to a specific project folder

```typescript
const fileManager = new ZenFsFileManager('/workspace')

// Operations are relative to workspace
await fileManager.writeFile('index.html', '<html>...</html>')
// Actually written to /workspace/index.html
```

## Architecture

- **ZenFsFileManager**: Concrete implementation using zenfs virtual filesystem
- **IFileManager**: Interface for cross-platform file operations
- Supports both Node.js `fs` module and browser File API backends

## Usage with Site Builder

The file manager is typically used with the site-builder SDK:

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder'
import { ZenFsFileManager } from '@cmdoss/file-manager'

const fileManager = new ZenFsFileManager('/my-site')
const sdk = new WalrusSiteBuilderSdk({
  fileManager,
  // ... other options
})

// SDK uses file manager for reading/writing site resources
await sdk.publishSite()
```

## Browser vs Node.js

The file manager automatically adapts to the environment:

- **Node.js**: Uses native `fs` module for actual file operations
- **Browser**: Uses in-memory virtual filesystem with zenfs

This allows the same code to work in both environments without modification.

## Contributing

1. Implement the `IFileManager` interface for new backends
2. Add tests for cross-platform compatibility
3. Ensure all operations work in both Node.js and browser
4. Submit a pull request

## License

MIT

## See Also

- [Site Builder SDK](../site-builder/) - Main SDK using this file manager
- [zenfs](https://github.com/zen-fs/core) - Virtual filesystem library
- [AGENTS.md](../../AGENTS.md) - Detailed project architecture
