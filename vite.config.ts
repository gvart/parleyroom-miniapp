import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Stamps the build's brand into index.html (title, favicon). Parsing mirrors src/lib/brand.ts. */
function brandHtml(env: Record<string, string>): Plugin {
  const name = (env.VITE_BRAND_NAME || 'Parley|room').replace('|', '')
  const logo = env.VITE_BRAND_LOGO_URL
  return {
    name: 'brand-html',
    transformIndexHtml: (html) => {
      html = html.replace(/<title>.*<\/title>/, `<title>${name}</title>`)
      return logo ? html.replace('</head>', `  <link rel="icon" href="${logo}" />\n  </head>`) : html
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), brandHtml(loadEnv(mode, process.cwd(), ''))],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5174 },
  preview: { port: 5174 },
}))
