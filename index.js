/**
 * Host half of dsh-chat-entry.
 *
 * Exposes one POST route per allow-listed target; each opens a fixed URL in the
 * OS default browser. The page tries the route first and only falls back to
 * `window.open` when it is unreachable (for example a shell that carries page
 * fetches over IPC instead of HTTP). The URL is a server-side constant keyed by
 * the path segment: the request body is never read, so the route cannot be
 * turned into an open redirect.
 */
import { spawn } from 'node:child_process'

const TARGETS = {
  chat: 'https://chat.deepseek.com',
  platform: 'https://platform.deepseek.com/',
}

function openInSystemBrowser(url) {
  const options = { detached: true, stdio: 'ignore', windowsHide: true }
  if (process.platform === 'win32') {
    // `start "" <url>` hands the address to the default protocol handler; the
    // empty first argument is the window title `start` would otherwise take.
    spawn('cmd.exe', ['/c', 'start', '', url], options).unref()
    return
  }
  if (process.platform === 'darwin') {
    spawn('open', [url], options).unref()
    return
  }
  spawn('xdg-open', [url], options).unref()
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

export const inject = ['webServer']

export function apply(ctx) {
  for (const [key, url] of Object.entries(TARGETS)) {
    ctx.effect(
      () =>
        ctx.webServer.register({
          kind: 'exact',
          path: `/dsh-chat-entry/open/${key}`,
          handler: (req, res) => {
            if (req.method !== 'POST') {
              res.writeHead(405, { allow: 'POST' })
              res.end()
              return
            }

            const connection = ctx.get('connection')
            if (connection && typeof connection.requestRejection === 'function') {
              try {
                const rejection = connection.requestRejection(req)
                if (rejection) {
                  send(res, 403, { ok: false })
                  return
                }
              } catch {
                send(res, 403, { ok: false })
                return
              }
            }

            try {
              openInSystemBrowser(url)
              send(res, 200, { ok: true })
            } catch (error) {
              send(res, 500, { ok: false, error: String((error && error.message) || error) })
            }
          },
        }),
      `dsh-chat-entry: open route (${key})`,
    )
  }
}
