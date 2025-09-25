import { configure, fs } from '@zenfs/core'
import * as path from '@zenfs/core/path'
import { IndexedDB } from '@zenfs/dom'

interface FileUpdatedArg {
  type: 'updated'
  path: string
  content: Uint8Array
}
interface FileRemovedArg {
  type: 'removed'
  path: string
}
type FileChangedArg = FileUpdatedArg | FileRemovedArg
export type FileChangeCallback = (arg: FileChangedArg) => void

export interface IFileManager {
  /** Promise that resolves when the file manager is ready */
  ready: Promise<void>
  /** Mount and initialize the file manager */
  mount(): Promise<void>
  /** Write a file to the workspace */
  writeFile(path: string, content: Uint8Array): Promise<void>
  /** Remove a file from the workspace */
  removeFile(path: string): Promise<void>
  /** Read a file from the workspace */
  readFile(path: string): Promise<Uint8Array>
  /** List all files in the workspace recursively */
  listFiles(): Promise<string[]>
  /**
   * Register a callback to be invoked when a file is changed (added, updated, or removed)
   * Returns an unsubscribe function to remove the listener
   */
  onFileChange(callback: (arg: FileChangedArg) => void): () => void
  /**
   * Clear all files in the workspace
   *
   * Note: **WILL NOT** trigger onFileChange callbacks
   */
  clear(): Promise<void>
  /** Unmount the file manager and release resources */
  unmount(): void
}

export class ZenFsFileManager implements IFileManager {
  private changeListeners: Set<FileChangeCallback> = new Set()
  public ready: Promise<void>

  constructor(private workspaceDir = '/workspace') {
    this.ready = mountIndexedDbWithLock(this.workspaceDir)
  }

  async mount(): Promise<void> {
    this.ready = mountIndexedDbWithLock(this.workspaceDir)
    await this.ready
  }

  async writeFile(
    filePath: string,
    content: string | Uint8Array
  ): Promise<void> {
    await this.ready
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    const dir = path.dirname(workspaceFilePath)
    await fs.promises.mkdir(dir, { recursive: true })
    const contentBytes =
      typeof content === 'string' ? new TextEncoder().encode(content) : content
    await fs.promises.writeFile(workspaceFilePath, contentBytes)
    this.notifyChange({
      type: 'updated',
      path: filePath,
      content: contentBytes
    })
  }

  async removeFile(filePath: string): Promise<void> {
    await this.ready
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    await fs.promises.rm(workspaceFilePath)
    this.notifyChange({ type: 'removed', path: filePath })
  }

  async readFile(filePath: string): Promise<Uint8Array> {
    await this.ready
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    return await fs.promises.readFile(workspaceFilePath)
  }

  async listFiles(): Promise<string[]> {
    await this.ready
    const files = await fs.promises.readdir(this.workspaceDir, {
      withFileTypes: true,
      recursive: true
    })
    return files
      .filter(f => f.isFile())
      .map(f => path.join(f.parentPath, f.name))
      .map(f => path.relative(this.workspaceDir, f))
      .map(ensureLeadingSlash)
  }

  onFileChange(callback: (arg: FileChangedArg) => void): () => void {
    this.changeListeners.add(callback)
    return () => {
      this.changeListeners.delete(callback)
    }
  }

  private notifyChange(arg: FileChangedArg) {
    for (const listener of this.changeListeners) {
      listener(arg)
    }
  }

  async clear(): Promise<void> {
    await this.ready

    const files = await fs.promises.readdir(this.workspaceDir, {
      withFileTypes: true
    })
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name)
      await fs.promises.rm(filePath, { recursive: true, force: true })
    }
  }

  unmount(): void {
    this.changeListeners.clear()
    fs.umount(this.workspaceDir)
  }
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

// Track initialization promises per workspace directory
const mountLocks: Record<string, Promise<void> | undefined> = {}

// Ensure only one initialization per workspace directory at a time
async function mountIndexedDbWithLock(workspaceDir: string) {
  // If initialization is already in progress, return the existing promise
  if (mountLocks[workspaceDir]) return mountLocks[workspaceDir]

  // Create and store the initialization promise
  mountLocks[workspaceDir] = performMountIndexedDB(workspaceDir)

  try {
    await mountLocks[workspaceDir]
  } finally {
    // Clear the lock once initialization is complete (success or failure)
    delete mountLocks[workspaceDir]
  }
}

async function performMountIndexedDB(workspaceDir: string) {
  if (typeof window === 'undefined') {
    throw new Error('ZenFsFileManager can only be used in the browser')
  }

  // Check if mount point is already mounted by trying to access it
  try {
    await fs.promises.access(workspaceDir)
    // If we can access it, it's already mounted
    return
  } catch {
    // Mount point doesn't exist or isn't accessible, proceed with mounting
  }

  await configure({ mounts: { [workspaceDir]: { backend: IndexedDB } } })
}
