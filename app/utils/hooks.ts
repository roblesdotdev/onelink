import copy from 'copy-to-clipboard'
import { useState } from 'react'

type IsCopied = boolean
type CopyFn = (text: string) => void

function useCopyToClipboard(): [IsCopied, CopyFn] {
  const [isCopied, setIsCopied] = useState<IsCopied>(false)

  const copyToClipboard = (text: string) => {
    copy(text)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  return [isCopied, copyToClipboard]
}

export default useCopyToClipboard
