// Injects the DeepSeek mark from deepseek-copy.svg into client.js.
//
//   node scripts/gen-icon.mjs deepseek-copy.svg client.js
//
// The browser bundle cannot import package-local files (only registered modules
// resolve), so the path data is embedded into the ICON-DATA block instead.
import fs from 'node:fs'

const [svgPath, clientPath] = process.argv.slice(2)
if (!svgPath || !clientPath) {
  throw new Error('usage: node scripts/gen-icon.mjs <icon.svg> <client.js>')
}

const svg = fs.readFileSync(svgPath, 'utf8')
const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
const fill = /fill="([^"]+)"/.exec(svg)?.[1] ?? 'currentColor'
const path = /<path[^>]*\sd="([^"]+)"/.exec(svg)?.[1]

if (!viewBox) throw new Error('svg has no viewBox')
if (!path) throw new Error('svg has no <path d="...">')
if (/['\\]/.test(path)) throw new Error('path data contains a quote or backslash')

const block = [
  '    /* ICON-DATA-START */',
  '    const ICON = {',
  `      viewBox: '${viewBox}',`,
  `      fill: '${fill}',`,
  `      d: '${path}',`,
  '    }',
  '    /* ICON-DATA-END */',
].join('\n')

const source = fs.readFileSync(clientPath, 'utf8')
const markers = /[ \t]*\/\* ICON-DATA-START \*\/[\s\S]*?\/\* ICON-DATA-END \*\//
if (!markers.test(source)) throw new Error('ICON-DATA markers not found in client.js')

fs.writeFileSync(clientPath, source.replace(markers, block))
console.log(`icon injected: viewBox="${viewBox}" fill="${fill}" path=${path.length} chars`)
