import type { FileChangedCallback, IFileManager } from '@cmdoss/site-builder'
import { Iso, Zip } from '@zenfs/archives'
import { configure, fs } from '@zenfs/core'
import * as path from '@zenfs/core/path'
import { IndexedDB } from '@zenfs/dom'

export class ZenFsFileManager implements IFileManager {
  private changeListeners = new Set<FileChangedCallback>()

  constructor(
    private workspaceDir = '/workspace',
    private backend: 'indexeddb' | 'zip' | 'iso' = 'indexeddb'
  ) {}

  async mount(data?: ArrayBuffer, force = false): Promise<void> {
    const backend =
      this.backend === 'indexeddb'
        ? IndexedDB
        : this.backend === 'zip'
          ? Zip
          : this.backend === 'iso'
            ? Iso
            : null
    if (!backend) throw new Error('Invalid backend specified')
    const isAccessible = await fs.promises
      .access(this.workspaceDir)
      .then(() => true)
      .catch(() => false)
    if (isAccessible) {
      if (!force) throw new Error('Workspace directory is already mounted')
      this.unmount() // Unmount existing instance
    }
    await configure({ mounts: { [this.workspaceDir]: { backend, data } } })
  }

  async writeFile(
    filePath: string,
    content: string | Uint8Array
  ): Promise<void> {
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    const dir = path.dirname(workspaceFilePath)
    await fs.promises.mkdir(dir, { recursive: true })
    const contentBytes =
      typeof content === 'string' ? new TextEncoder().encode(content) : content
    await fs.promises.writeFile(workspaceFilePath, contentBytes)
    this.notifyChange({
      type: 'updated',
      path: filePath
    })
  }

  async removeFile(filePath: string): Promise<void> {
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    await fs.promises.rm(workspaceFilePath)
    this.notifyChange({ type: 'removed', path: filePath })
  }

  async readFile(filePath: string): Promise<Uint8Array> {
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    console.log('Reading file from path:', workspaceFilePath)
    return await fs.promises.readFile(workspaceFilePath)
  }

  async listFiles(): Promise<string[]> {
    const files = await fs.promises.readdir(this.workspaceDir, {
      withFileTypes: true,
      recursive: true
    })
    console.log('Files in workspace:', files)
    return files
      .filter(f => f.isFile())
      .map(f => path.resolve(f.parentPath, f.name))
      .map(ensureLeadingSlash)
  }

  onFileChange(callback: FileChangedCallback): () => void {
    this.changeListeners.add(callback)
    return () => {
      this.changeListeners.delete(callback)
    }
  }

  private notifyChange(arg: Parameters<FileChangedCallback>[0]): void {
    for (const listener of this.changeListeners) {
      listener(arg)
    }
  }

  async clear(): Promise<void> {
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
