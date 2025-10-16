'use client'

import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  File,
  FolderIcon
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { buildFileTree, type FileNode } from './build-file-tree'
import { SyntaxHighlighter } from './syntax-highlighter'

interface AssetItem {
  path: string
  content: string | Uint8Array
}

interface Props {
  className: string
  disabled?: boolean
  assets: AssetItem[]
}

export function FileExplorer({ className, disabled, assets }: Props) {
  const paths = useMemo(() => assets.map(a => a.path), [assets])
  const contentMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const { path, content } of assets) {
      try {
        map.set(
          `/${path.replace(/^\//, '')}`,
          typeof content === 'string'
            ? content
            : new TextDecoder().decode(content)
        )
      } catch {
        map.set(`/${path.replace(/^\//, '')}`, '<binary data>')
      }
    }
    return map
  }, [assets])
  const fileTree = useMemo(() => buildFileTree(paths), [paths])
  const [selected, setSelected] = useState<FileNode | null>(null)
  const [fs, setFs] = useState<FileNode[]>(fileTree)

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is a one-time initialization
  useEffect(() => {
    setFs(fileTree)
  }, [fileTree, paths])

  const toggleFolder = (path: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          return { ...node, expanded: !node.expanded }
        } else if (node.children) {
          return { ...node, children: updateNode(node.children) }
        } else {
          return node
        }
      })
    setFs(updateNode(fs))
  }

  const selectFile = (node: FileNode) => {
    if (node.type === 'file') {
      setSelected(node)
    }
  }

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        <div
          className={cn(
            `flex items-center py-0.5 px-1 hover:bg-white/10 cursor-pointer`,
            { 'bg-white/10': selected?.path === node.path }
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path)
            } else {
              selectFile(node)
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {node.expanded ? (
                <ChevronDownIcon className="w-4 mr-1" />
              ) : (
                <ChevronRightIcon className="w-4 mr-1" />
              )}
              <FolderIcon className="w-4 mr-2" />
            </>
          ) : (
            <>
              <div className="w-4 mr-1" />
              <File className="w-4 mr-2" />
            </>
          )}
          <span className="">{node.name}</span>
        </div>

        {node.type === 'folder' && node.expanded && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ))
  }

  const copyFileContent = useCallback(async () => {
    if (!selected) return
    try {
      const content = contentMap.get(selected.path) ?? ''
      await navigator.clipboard.writeText(content)
      toast.success('File content copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Failed to copy file content')
    }
  }, [selected, contentMap])

  const downloadFile = useCallback(async () => {
    if (!selected) return
    try {
      const content = contentMap.get(selected.path) ?? ''
      const filename = selected.name
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('File downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
    }
  }, [selected, contentMap])

  return (
    <div className={className}>
      <div className="flex text-sm h-full w-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="max-w-md md:min-w-full h-full"
        >
          <ResizablePanel
            minSize={20}
            defaultSize={25}
            className="flex flex-col"
          >
            <div>{renderFileTree(fs)}</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={20} defaultSize={75}>
            <div className="bg-primary/5">
              <div className="flex justify-between items-center px-2 py-1 h-full">
                <span className="text-foreground">
                  {selected && !disabled && <>{selected.path}</>}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyFileContent}
                    disabled={!selected || disabled}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={downloadFile}
                    disabled={!selected || disabled}
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea>
                {selected && !disabled && (
                  <SyntaxHighlighter
                    path={selected.path.substring(1)}
                    code={contentMap.get(selected.path) ?? ''}
                  />
                )}
                <ScrollBar />
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
