import type { FileChangedCallback, IFileManager } from '@cmdoss/site-builder'
import { Zip } from '@zenfs/archives'
import { configure, fs } from '@zenfs/core'
import * as path from '@zenfs/core/path'
import { IndexedDB } from '@zenfs/dom'
import debug from 'debug'

const log = debug('file-manager')

export class ZenFsFileManager implements IFileManager {
  protected changeListeners: Set<FileChangedCallback> = new Set()
  constructor(
    /** The directory of the workspace. Any files within this directory are considered part of the workspace. */
    public readonly workspaceDir = '/workspace',
    /** The directory where the workspace is mounted in the virtual filesystem. */
    public readonly mountDir?: string
  ) {
    if (!this.mountDir) {
      this.mountDir = this.workspaceDir
    }
    if (this.mountDir !== this.workspaceDir) {
      // Ensure workspaceDir is a subdirectory of mountDir
      const normalizedWorkspace = path.normalize(this.workspaceDir)
      const normalizedMount = path.normalize(this.mountDir)
      if (
        !normalizedWorkspace.startsWith(normalizedMount + '/') &&
        normalizedWorkspace !== normalizedMount
      ) {
        throw new Error(
          `workspaceDir (${this.workspaceDir}) must be a subdirectory of mountDir (${this.mountDir})`
        )
      }
    }
  }

  async initialize(): Promise<void> {
    log('🔧 Configuring filesystem...')
    log(`📁 Mounting workspace at ${this.mountDir}`)
    await configure({
      mounts: {
        [this.mountDir ?? this.workspaceDir]: {
          backend: IndexedDB,
          storeName: this.mountDir ?? this.workspaceDir
        }
      }
    })
    log('✅ Filesystem configured')
  }

  async writeZipArchive(zipData: ArrayBuffer): Promise<void> {
    const tmpDir = `/tmp/zip-write-${crypto.randomUUID()}`
    log('📦 Mounting ZIP archive to temporary directory...')
    await configure({
      mounts: {
        [tmpDir]: {
          backend: Zip,
          data: zipData,
          lazy: false // Extract all files immediately
        }
      }
    })
    log('📂 Copying files from ZIP archive to workspace...')
    await fs.promises.cp(tmpDir, this.workspaceDir, { recursive: true })
    log('📦 Unmounting temporary ZIP directory...')
    fs.umount(tmpDir)
    log('✅ Files copied to workspace from ZIP archive')
  }

  async readFile(filePath: string): Promise<Uint8Array> {
    log(`📂 Reading file ${filePath}...`)
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    const content = await fs.promises.readFile(workspaceFilePath)
    log(`✅ File ${filePath} read (${content.byteLength} bytes)`)
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
      .map(f => path.join(f.parentPath, f.name))
      .map(ensureLeadingSlash)
    log('✅ Files currently in workspace:', result)
    return result
  }

  async getSize(): Promise<number> {
    log('📏 Calculating total size of files in workspace')
    let totalSize = 0
    const files = await fs.promises.readdir(this.workspaceDir, {
      withFileTypes: true,
      recursive: true
    })
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(
          this.workspaceDir,
          file.parentPath,
          file.name
        )
        const stats = await fs.promises.stat(filePath)
        totalSize += stats.size
      }
    }
    log('✅ Total size of files in workspace:', totalSize, 'bytes')
    return totalSize
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

  async deleteFile(filePath: string): Promise<void> {
    log('🗑️ Deleting file at', filePath)
    filePath = ensureLeadingSlash(filePath)
    const workspaceFilePath = path.join(this.workspaceDir, filePath)
    await fs.promises.rm(workspaceFilePath)
    log('✅ File deleted at', filePath)
    this.notifyChange({ type: 'removed', path: filePath })
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

  unmount(): void {
    log('🚪 Unmounting workspace directory (', this.workspaceDir, ')')
    this.changeListeners.clear()
    if (this.mountDir === this.workspaceDir) {
      // Unmount only if mountDir and workspaceDir are the same
      fs.umount(this.mountDir)
    } else {
      log('⚠️ Skipping unmount: mountDir and workspaceDir are different')
    }
  }
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}
