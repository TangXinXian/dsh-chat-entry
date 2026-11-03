// Pre-flight harness: load client.js in a stubbed browser/module environment and
// assert the left-sidebar action contract plus the system-browser open paths.
import fs from 'node:fs'
import vm from 'node:vm'

const src = fs.readFileSync(process.argv[2], 'utf8')
let loaded = null

const React = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useState: (v) => [v, () => {}],
  useEffect: () => {},
}

const opened = []
const hostCalls = []
let hostOpenOk = false

const sandbox = {
  console,
  setTimeout,
  fetch: async (url, options) => {
    hostCalls.push({ url, method: options && options.method })
    return { ok: hostOpenOk, json: async () => ({ ok: hostOpenOk }) }
  },
  window: {
    __ModuleLoader__: { load: (entry) => { loaded = entry } },
    addEventListener: () => {},
    removeEventListener: () => {},
    open: (url, target) => {
      opened.push({ url, target })
      return { opener: null }
    },
  },
}
sandbox.globalThis = sandbox
sandbox.window.window = sandbox.window

vm.createContext(sandbox)
vm.runInContext(src, sandbox, { filename: 'client.js' })

if (!loaded) throw new Error('client.js never called __ModuleLoader__.load')
if (loaded.id !== 'dsh-chat-entry') throw new Error(`loader id mismatch: ${loaded.id}`)

const mod = loaded.factory((name) => {
  if (name === 'react') return React
  throw new Error(`unexpected require: ${name}`)
})

if (!Array.isArray(mod.inject) || !mod.inject.includes('slots')) {
  throw new Error(`bad inject list: ${JSON.stringify(mod.inject)}`)
}
if (mod.inject.includes('betterSidebar')) throw new Error('client must not depend on betterSidebar')
if (typeof mod.apply !== 'function') throw new Error('apply is not a function')

let registration = null
let Component = null

const ctx = {
  effect: (fn) => {
    const d = fn()
    return () => { if (typeof d === 'function') d() }
  },
  get: () => undefined,
  locale: {
    register: () => () => {},
    bind: () => (key) => key,
  },
  slots: {
    inject: (name, callback) => callback(),
    register: (options, component) => {
      registration = options
      Component = component
      return () => {}
    },
  },
}

mod.apply(ctx)

if (!registration) throw new Error('slots.register was never called')
if (registration.name !== 'sidebar.footer.action') {
  throw new Error(`slot name = ${registration.name}, want sidebar.footer.action`)
}
if (registration.id !== 'dsh-chat-entry') throw new Error(`slot id = ${registration.id}`)
if (typeof registration.label() !== 'string') throw new Error('slot label must be a string or thunk')

const render = (wide) => {
  const group = Component({ wide })
  const entries = group.children.filter(Boolean)
  if (entries.length !== 2) throw new Error(`expected 2 entries, got ${entries.length}`)
  return entries.map((el) => el.type(el.props))
}

const wideButtons = render(true)
const railButtons = render(false)

for (const [index, button] of wideButtons.entries()) {
  if (!button || button.type !== 'button') throw new Error(`entry ${index} is not a <button>`)
  if (!button.props['aria-label']) throw new Error(`entry ${index} has no accessible name`)
  const icon = button.children.filter(Boolean)[0]
  if (!icon || icon.type !== 'svg') throw new Error(`entry ${index} has no icon`)
  if (icon.props.width !== 24 || icon.props.height !== 24) {
    throw new Error(`entry ${index} icon box = ${icon.props.width}x${icon.props.height}, want 24x24`)
  }
  if (icon.props.preserveAspectRatio !== 'xMidYMid meet') {
    throw new Error(`entry ${index} must keep the glyph ratio inside the box`)
  }
  const fill = String((icon.props.style && icon.props.style.fill) || '')
  if (fill === '') throw new Error(`entry ${index} icon has no fill`)
  // Chat keeps the brand blue; the platform mark rides the theme label token so
  // it turns light on a dark column.
  if (index === 1 && !fill.includes('--dsw-alias-label-primary')) {
    throw new Error(`platform icon fill = ${fill}, want the label-primary token`)
  }
}
if (wideButtons[0].children.filter(Boolean).length !== 2) throw new Error('wide entry needs a label')
if (railButtons[0].children.filter(Boolean).length !== 1) throw new Error('rail entry must be icon only')
if (wideButtons[0].props.title === wideButtons[1].props.title) {
  throw new Error('the two entries must have distinct labels')
}

// Host route down -> window.open fallback, one route per target.
wideButtons[0].props.onClick()
await new Promise((resolve) => setTimeout(resolve, 30))
if (hostCalls.at(-1)?.url !== './dsh-chat-entry/open/chat') {
  throw new Error(`host route = ${hostCalls.at(-1)?.url}, want ./dsh-chat-entry/open/chat`)
}
if (opened.at(-1)?.url !== 'https://chat.deepseek.com') {
  throw new Error(`window.open fallback = ${opened.at(-1)?.url}, want chat.deepseek.com`)
}

wideButtons[1].props.onClick()
await new Promise((resolve) => setTimeout(resolve, 30))
if (hostCalls.at(-1)?.url !== './dsh-chat-entry/open/platform') {
  throw new Error(`host route = ${hostCalls.at(-1)?.url}, want ./dsh-chat-entry/open/platform`)
}
if (opened.at(-1)?.url !== 'https://platform.deepseek.com/') {
  throw new Error(`window.open fallback = ${opened.at(-1)?.url}, want platform.deepseek.com`)
}
if (hostCalls.every((call) => call.method === 'POST') === false) {
  throw new Error('every host route call must be a POST')
}

// Host route up -> no window.open at all.
const openedBefore = opened.length
hostOpenOk = true
wideButtons[0].props.onClick()
await new Promise((resolve) => setTimeout(resolve, 30))
if (opened.length !== openedBefore) {
  throw new Error(`window.open used despite the host route (${opened.length - openedBefore} extra)`)
}

console.log('OK  slot=%s  id=%s  order=%s  entries=%d', registration.name, registration.id, registration.order, wideButtons.length)
console.log('OK  routes: %s -> %s | %s -> %s', hostCalls[0].url, opened[0].url, hostCalls[1].url, opened[1].url)
