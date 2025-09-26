import { SyntaxHighlighter } from './syntax-highlighter'

interface Props {
  path: string
  code: string
}

export function FileContent({ path, code }: Props) {
  return <SyntaxHighlighter path={path} code={code} />
}
