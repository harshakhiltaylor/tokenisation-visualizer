'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const sys   = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(saved === 'dark' || (!saved && sys))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        relative flex items-center justify-center w-9 h-9 rounded-xl
        bg-slate-100 dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        text-slate-500 dark:text-slate-400
        hover:bg-slate-200 dark:hover:bg-slate-700
        hover:text-slate-700 dark:hover:text-slate-200
        transition-all duration-200
      "
    >
      <span className="absolute transition-all duration-300"
        style={{ opacity: dark ? 1 : 0, transform: dark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)' }}>
        <Sun size={15} className="text-amber-400" />
      </span>
      <span className="absolute transition-all duration-300"
        style={{ opacity: dark ? 0 : 1, transform: dark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}>
        <Moon size={15} className="text-indigo-500" />
      </span>
    </button>
  )
}
