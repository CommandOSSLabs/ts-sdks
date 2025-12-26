import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin'
import { defineConfig } from 'tsdown'

export default defineConfig({
  ignoreWatch: ['.turbo'],
  platform: 'neutral',
  plugins: [vanillaExtractPlugin({ extract: { name: 'index.css' } })],
  outputOptions: { assetFileNames: '[name][extname]' }
})
