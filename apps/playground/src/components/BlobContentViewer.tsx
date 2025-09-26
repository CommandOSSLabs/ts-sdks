import { useMemo } from 'react'

export function BlobContentViewer({
  content
}: {
  content: string | Uint8Array
}) {
  const txt = useMemo(() => {
    try {
      return typeof content === 'string'
        ? content
        : new TextDecoder().decode(content)
    } catch {
      return '<binary data>'
    }
  }, [content])

  return <code className="whitespace-pre-wrap">{txt}</code>
}
