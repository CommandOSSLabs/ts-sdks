import type { FileChangedCallback, IFileManager } from '@cmdoss/site-builder'
import { Iso, Zip } from '@zenfs/archives'
import { configure, fs } from '@zenfs/core'
import * as path from '@zenfs/core/path'
import { IndexedDB } from '@zenfs/dom'
import debug from 'debug'

const log = debug('file-manager')

export class ZenFsFileManager implements IFileManager {
  private changeListeners = new Set<FileChangedCallback>()

  constructor(
    private workspaceDir = '/workspace',
    private backend: 'indexeddb' | 'zip' | 'iso' = 'indexeddb'
  ) {}

  async mount(data?: ArrayBuffer, force = false): Promise<void> {
    log(
      '⚡️ Mounting workspace at',
      this.workspaceDir,
      'with backend',
      this.backend
    )
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
      log('⚠️ Workspace directory is already mounted')
      if (!force) throw new Error('Workspace directory is already mounted')
      this.unmount() // Unmount existing instance
    }
    log('🔧 Configuring filesystem...')
    await configure({ mounts: { [this.workspaceDir]: { backend, data } } })
    log('✅ Filesystem configured')
  }

  async writeFile(
    filePath: string,
    content: string | Uint8Array
  ): Promise<void> {
    log('✍️ Writing file to', filePath)
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    const dir = path.dirname(workspaceFilePath)
    await fs.promises.mkdir(dir, { recursive: true })
    const contentBytes =
      typeof content === 'string' ? new TextEncoder().encode(content) : content
    await fs.promises.writeFile(workspaceFilePath, contentBytes)
    log('✅ File written to', filePath, '(', contentBytes.byteLength, 'bytes )')
    this.notifyChange({ type: 'updated', path: filePath })
  }

  async removeFile(filePath: string): Promise<void> {
    log('🗑️ Removing file at', filePath)
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    await fs.promises.rm(workspaceFilePath)
    log('✅ File removed at', filePath)
    this.notifyChange({ type: 'removed', path: filePath })
  }

  async readFile(filePath: string): Promise<Uint8Array> {
    log('📂 Reading file from', filePath)
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    const content = await fs.promises.readFile(workspaceFilePath)
    log('✅ File read from', filePath, '(', content.byteLength, 'bytes )')
    return content
  }

  async listFiles(): Promise<string[]> {
    log('📄 Listing files in workspace')
    const files = await fs.promises.readdir(this.workspaceDir, {
      withFileTypes: true,
      recursive: true
    })
    const result = files
      .filter(f => f.isFile())
      .map(f => path.resolve(f.parentPath, f.name))
      .map(ensureLeadingSlash)
    log('✅ Files currently in workspace', result)
    return result
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
    log('🧹 Clearing workspace directory (', this.workspaceDir, ')')
    const files = await fs.promises.readdir(this.workspaceDir, {
      withFileTypes: true
    })
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name)
      await fs.promises.rm(filePath, { recursive: true, force: true })
    }
    log('✅ Workspace directory cleared, removed', files.length, 'items')
  }

  unmount(): void {
    log('🚪 Unmounting workspace directory (', this.workspaceDir, ')')
    this.changeListeners.clear()
    fs.umount(this.workspaceDir)
  }
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}
