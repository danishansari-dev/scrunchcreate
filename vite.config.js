import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Plugin to copy product images to public folder during build
function copyProductsPlugin() {
  return {
    name: 'copy-products',
    buildStart() {
      const srcDir = join(__dirname, 'src', 'assets', 'products')
      const destDir = join(__dirname, 'public', 'assets', 'products')
      
      function copyRecursive(src, dest) {
        if (!existsSync(src)) return
        
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true })
        }
        
        const entries = readdirSync(src, { withFileTypes: true })
        
        for (const entry of entries) {
          const srcPath = join(src, entry.name)
          const destPath = join(dest, entry.name)
          
          // Skip certain folders
          const skipFolders = ['product measurements', 'paraandi', 'earring']
          if (skipFolders.includes(entry.name.toLowerCase())) {
            continue
          }
          
          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath)
          } else if (entry.isFile()) {
            const ext = entry.name.toLowerCase().split('.').pop()
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
              copyFileSync(srcPath, destPath)
            }
          }
        }
      }
      
      if (existsSync(srcDir)) {
        copyRecursive(srcDir, destDir)
        console.log('✓ Copied product images to public/assets/products')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyProductsPlugin()],
})
