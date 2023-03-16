import { useState } from 'react'

type IsCopied = boolean
type CopyFn = (text: string) => void

function useCopyToClipboard(): [IsCopied, CopyFn] {
  const [isCopied, setIsCopied] = useState<IsCopied>(false)

  async function copyToClipboard(text: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      return document.execCommand('copy', true, text)
    }
  }

  const copy = (text: string) => {
    copyToClipboard(text).then(() => {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 1000)
    })
  }

  return [isCopied, copy]
}

export default useCopyToClipboard
