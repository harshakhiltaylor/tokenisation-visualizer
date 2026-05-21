export const TOKEN_COLORS = [
  { light: 'bg-rose-200 text-rose-900',       dark: 'dark:bg-rose-900/50 dark:text-rose-200' },
  { light: 'bg-orange-200 text-orange-900',   dark: 'dark:bg-orange-900/50 dark:text-orange-200' },
  { light: 'bg-amber-200 text-amber-900',     dark: 'dark:bg-amber-900/50 dark:text-amber-200' },
  { light: 'bg-yellow-200 text-yellow-900',   dark: 'dark:bg-yellow-900/50 dark:text-yellow-200' },
  { light: 'bg-lime-200 text-lime-900',       dark: 'dark:bg-lime-900/50 dark:text-lime-200' },
  { light: 'bg-green-200 text-green-900',     dark: 'dark:bg-green-900/50 dark:text-green-200' },
  { light: 'bg-emerald-200 text-emerald-900', dark: 'dark:bg-emerald-900/50 dark:text-emerald-200' },
  { light: 'bg-teal-200 text-teal-900',       dark: 'dark:bg-teal-900/50 dark:text-teal-200' },
  { light: 'bg-cyan-200 text-cyan-900',       dark: 'dark:bg-cyan-900/50 dark:text-cyan-200' },
  { light: 'bg-sky-200 text-sky-900',         dark: 'dark:bg-sky-900/50 dark:text-sky-200' },
  { light: 'bg-blue-200 text-blue-900',       dark: 'dark:bg-blue-900/50 dark:text-blue-200' },
  { light: 'bg-indigo-200 text-indigo-900',   dark: 'dark:bg-indigo-900/50 dark:text-indigo-200' },
  { light: 'bg-violet-200 text-violet-900',   dark: 'dark:bg-violet-900/50 dark:text-violet-200' },
  { light: 'bg-purple-200 text-purple-900',   dark: 'dark:bg-purple-900/50 dark:text-purple-200' },
  { light: 'bg-fuchsia-200 text-fuchsia-900', dark: 'dark:bg-fuchsia-900/50 dark:text-fuchsia-200' },
  { light: 'bg-pink-200 text-pink-900',       dark: 'dark:bg-pink-900/50 dark:text-pink-200' },
  { light: 'bg-red-200 text-red-900',         dark: 'dark:bg-red-900/50 dark:text-red-200' },
  { light: 'bg-stone-200 text-stone-900',     dark: 'dark:bg-stone-700/70 dark:text-stone-200' },
  { light: 'bg-zinc-200 text-zinc-900',       dark: 'dark:bg-zinc-700/70 dark:text-zinc-200' },
  { light: 'bg-slate-200 text-slate-900',     dark: 'dark:bg-slate-600/70 dark:text-slate-100' },
]

export function getColorClass(index: number): string {
  const c = TOKEN_COLORS[index % TOKEN_COLORS.length]
  return `${c.light} ${c.dark}`
}
