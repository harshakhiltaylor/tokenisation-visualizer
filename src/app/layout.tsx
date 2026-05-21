import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tokenizer Visualizer',
  description: 'Visualize real tiktoken tokenization — cl100k_base, o200k_base, gpt-3.5-turbo, gpt-4, CodeLlama.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Inline theme script — prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (t === 'dark' || (!t && d)) document.documentElement.classList.add('dark');
            } catch(e){}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
