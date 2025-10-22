import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BASIC = Buffer.from('mo:mo').toString('base64')

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/zulu': {
        target: 'http://zs.zulugis.ru:6473',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/zulu/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', `Basic ${BASIC}`)
          })
        },
      },
      '/ws': {
        target: 'http://zs.zulugis.ru:6473',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', `Basic ${BASIC}`)
          })
        },
      },
    },
  },
})


