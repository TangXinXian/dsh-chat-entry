# dsh-chat-entry

左侧侧边栏底部的两个入口，一次点击就用系统默认浏览器打开对应网页。

| 入口 | 目标 | 图标 |
|---|---|---|
| 和 DeepSeek 对话 | <https://chat.deepseek.com> | DeepSeek 蓝 `#4D6BFE` |
| DeepSeek 开放平台 | <https://platform.deepseek.com/> | 深色（深色主题下自动转白） |

## 为什么不用右侧面板的浏览器

右侧面板的 Browser 在桌面端是 Electron `<webview>`，其分区不保留登录态（宿主文档：
*Cookies and Web storage do not survive application restart*；本机实测该分区的
`Network/Cookies` 里没有任何域名记录）。于是每次重启 DSH 都要重新登录——这比多开一个
浏览器标签更糟。入口因此交给系统浏览器，登录态由浏览器自己持久化。

## 实现

- **槽位**：注册一个条目到左侧栏的 `sidebar.footer.action`（设置按钮上方）。宿主的
  `.footerActions` 是横向 flex，所以两个按钮在同一个条目内部按列排布，避免被并排挤压。
- **尺寸**：宽栏每行 42px 高、占满整行；56px 轨道里是两个 36×36 方块，只有图标。
- **对齐**：样式取自同栏设置行的 `.trigger`（`ui-settings-general` 的
  `SettingsRoot.module.css`）。宿主把设置位渲染成账号行，其内容比 `.trigger` 左 4px，
  因此横向 padding 额外减 4px；图标固定在 **24×24** 方框内（`xMidYMid meet`），使文字
  左边缘与账号行一致。
- **配色**：`--dsw-alias-label-primary`（文字）、`--dsw-alias-interactive-bg-hover`（悬停）、
  `--dsw-alias-state-warn-primary`（打开失败 4 秒的提示）。
- **打开链路**：先 `POST /dsh-chat-entry/open/<chat|platform>`（宿主路由，主进程用
  `cmd /c start` / `open` / `xdg-open` 调系统默认浏览器），失败才回退 `window.open`。
  两条都失败时按钮文字临时变成「打开失败，点此重试」。
- **图标来源**：`deepseek.svg` 既是插件图标，也是路径数据的唯一来源。浏览器 bundle 不能
  import 包内文件，所以 `scripts/gen-icon.mjs` 把 SVG 的 `path d` 注入 `client.js` 的
  `ICON-DATA` 块；换图标 = 替换 SVG 后重跑该脚本。

## 文件

| 文件 | 作用 |
|---|---|
| `package.json` | 包清单：`dsh.bundle.patch` + `dsh.client`（web，immediately），插件图标指向 `deepseek.svg` |
| `cordis.patch.yml` | 插入 `id: dsh-chat-entry` 一行 |
| `index.js` | 宿主半边：两条 `POST /dsh-chat-entry/open/<target>` 路由（URL 为服务端常量、只收 POST、不读请求体、过 `ctx.connection.requestRejection` 信任栅栏） |
| `client.js` | 客户端半边：注册 `sidebar.footer.action`，渲染两个入口；`ICON-DATA` 块由脚本生成 |
| `deepseek.svg` | DeepSeek 标志（唯一一份素材） |
| `locale/zh.json`、`locale/en.json` | 插件页显示用的标题与描述 |
| `scripts/gen-icon.mjs` | 从 `deepseek.svg` 生成 `ICON-DATA` 块 |
| `scripts/preflight.mjs` | 自检：槽位契约、两个入口、图标尺寸、两条打开链路 |
| `scripts/publish.ps1` | 一键建仓并推送（需先 `gh auth login`） |
| `LICENSE` | MIT |
| `.gitignore` | 忽略 `node_modules`、日志、`*.tgz` 等 |

## 安装

### 从 GitHub 安装（分享给其他人）

```sh
# 网页版 / 任意命令行 dsh
dsh plugin --profile web add github:<owner>/dsh-chat-entry

# DSH Desktop：profile 名为 desktop
dsh plugin --profile desktop add github:<owner>/dsh-chat-entry
```

桌面端也可以走「设置 → 插件 → 安装」，把 `github:<owner>/dsh-chat-entry` 填进安装框。
装完硬刷新页面（Ctrl+Shift+R）。

> 本包没有构建步骤、没有运行时依赖，`github:` 源码安装即可直接用；不需要 `pnpm approve-builds`。

### 本机开发目录安装

用 `plugin_manager` 的 `install_bundle`，target 传本目录绝对路径。安装后硬刷新页面。

持久化记录在 `~/.dsh/profiles/<profile>/package.json` 的 `dependencies` 与
`dsh.profile.bundles` 里。本地目录安装写的是指向本目录的链接，**目录不能移动或删除**；
要搬家就重新安装，或先 `pnpm pack` 打成 tgz 再装。

## 发布到 GitHub

仓库根目录就是包根目录，直接推上去即可被别人 `github:` 安装。

```sh
gh auth login                       # 只需一次
pwsh -File scripts/publish.ps1      # 建仓（默认 public）+ 首次提交 + push
```

脚本会打印安装地址与 `dsh plugin add github:<owner>/dsh-chat-entry` 命令。
已有仓库时它会复用并 push；要私有仓库加 `-Private`。
手动操作等价于：`git init && git add -A && git commit`，然后
`gh repo create dsh-chat-entry --public --source . --push`。

## 迭代与自检

| 改动 | 生效方式 |
|---|---|
| `client.js` | 页面硬刷新（HMR 会重新发布 bundle） |
| `index.js` | 重启宿主 |
| 包名 / 版本 | 同名已装会报 `already-installed`，先 `remove_bundle` 再装 |

```sh
node scripts/gen-icon.mjs deepseek.svg client.js   # 换了 SVG 之后
node scripts/preflight.mjs client.js               # 改完先跑
```

## 卸载

`plugin_manager` → `remove_bundle`（target `dsh-chat-entry`）→ 硬刷新页面。

## 边界

- 首选路径是宿主路由，确定性最高；`window.open` 只是宿主不承载页面 fetch 时的回退。
- 两条路都失败时按钮会短暂显示「打开失败，点此重试」，不会静默失败。
- 深色主题下 `--dsw-alias-label-primary` 变浅，黑色标志因此自动转白；若想在任何主题下
  都保持纯黑，把 `client.js` 的 `MONO_FILL` 改回 `'#000000'`。
