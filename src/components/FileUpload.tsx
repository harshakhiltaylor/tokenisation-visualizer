'use client'
import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  onText: (text: string) => void
}

const ACCEPTED = ['.txt', '.py', '.md', '.json', '.ts', '.tsx', '.js', '.jsx', '.csv', '.yaml', '.yml', '.xml', '.html']

export default function FileUpload({ onText }: Props) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    setError(null)
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported file type. Accepted: ${ACCEPTED.join(', ')}`)
      return
    }
    if (file.size > 500_000) {
      setError('File too large. Max 500 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      onText(text.slice(0, 20000))
    }
    reader.readAsText(file)
  }, [onText])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }, [readFile])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }, [readFile])

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
          border-2 border-dashed transition-all duration-150 cursor-pointer
          ${dragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
      >
        <Upload size={13} className="flex-shrink-0" />
        <span>
          {dragging ? 'Drop file here…' : 'Upload file (.txt .py .md .json …)'}
        </span>
      </button>
      {error && (
        <p className="text-[11px] text-rose-500 dark:text-rose-400 px-1">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED.join(',')}
        onChange={onFileChange}
      />
    </div>
  )
}
