/**
 * Browser half of dsh-chat-entry.
 *
 * Two actions in the LEFT sidebar's foot (beside Settings), stacked:
 *   - 和 DeepSeek 对话      → https://chat.deepseek.com      (DeepSeek blue mark)
 *   - DeepSeek 开放平台      → https://platform.deepseek.com/ (black mark)
 * The host route spawns the OS default browser; `window.open` is the fallback.
 *
 * The in-panel Browser is deliberately not used — its Electron partition drops
 * the sign-in cookie on every restart, so it would ask for a login each time.
 */
window.__ModuleLoader__.load({
  id: 'dsh-chat-entry',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const TARGETS = {
      chat: 'https://chat.deepseek.com',
      platform: 'https://platform.deepseek.com/',
    }
    const NS = 'dsh-chat-entry'
    const SLOT = 'sidebar.footer.action'
    // Light theme: near-black. Dark theme: label-primary flips to light, so the
    // "black" mark stays visible instead of disappearing into the column.
    const MONO_FILL = 'var(--dsw-alias-label-primary, #000000)'

    /* ICON-DATA-START */
    const ICON = {
      viewBox: '0 0 1391 1024',
      fill: '#4D6BFE',
      d: 'M1382.12555807 63.45623157c-14.73053987-7.36694577-21.0903122 6.67482826-29.69569586 13.81050954-2.93270133 2.3025895-5.43639037 5.2956207-7.94007938 8.05738747-21.52435201 23.478369-46.67184703 38.90270222-79.56167359 37.06096578-48.0527304-2.76176674-89.0854117 12.66089063-125.34197943 50.18270947-7.71049077-46.26964801-33.3205147-73.89234293-72.3086842-91.61758983-20.43003543-9.20700638-41.0326813-18.41568859-55.33420887-38.44352498-9.95442626-14.27136261-12.66089063-30.15487307-17.66659288-45.80711909-3.16564161-9.43827083-6.33128325-19.10613027-16.97615117-20.71827809-11.59673901-1.84173644-16.11477489 8.05738745-20.66129987 16.34436353-18.12744594 33.83834596-25.17765995 71.1305762-24.45872917 108.88198365 1.55516963 84.94276158 36.71742076 152.6194535 106.52409176 200.73083796 7.94175522 5.52353348 9.98459118 11.04874282 7.48090216 19.10445442-4.74762451 16.57395213-10.44544426 32.68872704-15.42265737 49.2626792-3.16731744 10.58956558-7.91326613 12.89047925-19.04915208 8.28697605-38.29940365-16.34436352-71.39032974-40.51485003-100.65366161-69.74801697-49.63471329-49.03309056-94.5234779-103.12886155-150.48947443-145.4837722a661.8118183 661.8118183 0 0 0-39.90987567-27.85395942c-57.11729129-56.62794912 7.48090217-103.12718572 22.44438231-108.65239505 15.62375691-5.75479794 5.4380662-25.5513699-45.11835322-25.32178128s-96.79757829 17.49565827-155.72811695 40.51485003c-8.63052108 3.45220843-17.69675779 5.98438656-26.96074236 8.05738749-53.52096153-10.35997695-109.05459409-12.66089063-167.09359148-5.9860624-109.2556936 12.43130203-196.52953378 65.14618963-260.69536329 155.15163164-77.05798457 108.19154197-95.21559542 231.11697547-72.97231263 359.33467803 23.30743442 135.12547108 90.89698322 247.00048593 194.71628647 334.47374981 107.67371071 90.69588368 231.66329585 135.12547108 373.11837431 126.60890637 85.91977008-5.06603207 181.56605365-16.80521659 289.46935296-110.03495422 27.22049591 13.8121854 55.79338609 19.33739472 103.15735067 23.48004484 36.51464541 3.45220843 71.64840745-1.84173644 98.84041425-7.59653439 42.6146642-9.20700638 39.6501221-49.4922678 24.25595382-56.85753775-124.90961545-59.39139169-97.48802001-35.22090515-122.40592638-54.78621268 63.47538778-76.65578551 159.12167135-156.30460223 196.52953378-414.35215512 2.96286625-20.48701364 0.45917725-33.37749289 0-49.95144506-0.23126445-10.12871251 2.01267102-14.04344985 13.37982144-15.19306875 31.27767874-3.68347287 61.66381626-12.43130203 89.54626476-28.08354804 80.91239203-45.11835324 113.57095414-119.24196063 121.28312075-208.0977837 1.15129475-13.58092095-0.22958861-27.62269495-14.30152755-34.75837626M676.89467748 863.15361188c-121.02504304-97.14279917-179.75448214-129.13940867-204.01043596-127.75852533-22.67397092 1.38088338-18.588299 27.85395941-13.61108589 45.11835324 5.20847758 17.03480522 12.02742715 28.77398972 21.55116528 43.73746986 6.56254768 9.89912389 11.10907268 24.63133958-6.58768512 35.68008242-38.98984534 24.63133958-106.75368041-8.28697606-109.9176462-9.89744807-78.89972099-47.42094273-144.88047363-110.03495424-191.35122116-195.66648169-44.88708879-82.41058346-70.92780085-170.80555349-75.24473718-265.18491008-1.15129475-22.78960315 5.4380662-30.84699058 27.62437077-34.99131655a267.60145597 267.60145597 0 0 1 88.65304773-2.30091365c123.55889699 18.41736442 228.75740777 74.81404907 316.92111337 164.13072521 50.32683081 50.87147534 88.39497004 111.64375041 127.64289309 171.0351421 41.69463388 63.07151293 86.58339852 123.15334628 143.70068976 172.41434965 20.17028189 17.26439385 36.25489187 30.38613755 51.67754928 40.05399698-46.4707475 5.2956207-124.01639839 6.44523963-177.04801777-36.37052409m58.03732158-380.97298644c0-10.12871251 7.94343105-18.18609998 17.92634639-18.18609998q3.39523024 0.05865402 6.10001881 1.15129477a18.04197865 18.04197865 0 0 1 11.56824991 17.03480521 17.95483551 17.95483551 0 0 1-17.89785732 18.18609997 17.753736 17.753736 0 0 1-17.69675779-18.18609997m180.21533522 94.3793566c-11.53976081 4.83476764-23.10633489 8.97909357-34.24222086 9.43827083-17.20741563 0.92170613-36.02530325-6.21397518-46.21099397-14.96180432-15.88351045-13.58259677-27.22217175-21.17913115-31.96979625-44.88876463-2.04283596-10.12871251-0.92170613-25.78095852 0.89321705-34.75837629 4.08567191-19.33739472-0.46085308-31.7670209-13.8121854-43.04702813-10.87613241-9.20868221-24.71848271-11.74086034-39.90987566-11.74086036-5.66933063 0-10.87613241-2.5305023-14.73221569-4.60350318a15.10592564 15.10592564 0 0 1-6.56087184-21.17745534c1.5819829-3.22261982 9.29414949-11.05041866 11.10739683-12.43130199 20.62945915-11.97044896 44.42623571-8.05571162 66.40976495 0.92170611 20.40154635 8.51656469 35.79571462 24.17048652 58.03899743 46.269648 22.67397092 26.70266465 26.75964283 34.06961042 39.6501221 54.09577099 10.21585563 15.65224602 19.51000513 31.7670209 25.84128837 50.18103364 3.88289657 11.51127171-1.12280565 20.9478667-14.50262706 26.70266467',
    }
    /* ICON-DATA-END */

    const DICT = {
      zh: {
        title: '和 DeepSeek 对话',
        platform: 'DeepSeek 开放平台',
        desc: '在系统默认浏览器中打开 DeepSeek 网页',
        failed: '打开失败，点此重试',
      },
      en: {
        title: 'Chat with DeepSeek',
        platform: 'DeepSeek Platform',
        desc: 'Open DeepSeek pages in the system default browser',
        failed: 'Open failed, click to retry',
      },
    }

    /**
     * The DeepSeek mark in a square box: the glyph keeps its 1391:1024 ratio
     * inside a `size` square, so a 24px box puts the label at the same x as the
     * sidebar's account row (16 + 24 + 8).
     *
     * The colour rides the SVG `style` rather than the `fill` attribute: the
     * platform mark uses a theme token, and CSS `var()` is only reliable in a
     * declaration.
     */
    function DeepSeekIcon(size, fill) {
      const s = typeof size === 'number' && size > 0 ? size : 24
      return h(
        'svg',
        {
          viewBox: ICON.viewBox,
          width: s,
          height: s,
          preserveAspectRatio: 'xMidYMid meet',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none', fill: fill || ICON.fill || 'currentColor' },
        },
        h('path', { d: ICON.d }),
      )
    }

    /** Ask the host to open one of the allow-listed targets. */
    async function requestHostOpen(target) {
      try {
        const res = await fetch('./dsh-chat-entry/open/' + target, { method: 'POST' })
        if (!res.ok) return false
        const body = await res.json()
        return Boolean(body && body.ok === true)
      } catch {
        return false
      }
    }

    /** Host route first, `window.open` as the fallback. */
    async function openBrowser(target) {
      if (await requestHostOpen(target)) return true
      try {
        const win = window.open(TARGETS[target], '_blank')
        if (win) {
          try {
            win.opener = null
          } catch {
            /* cross-origin window: nothing to detach */
          }
          return true
        }
      } catch {
        /* fall through */
      }
      return false
    }

    const ACCENT = 'var(--dsw-alias-state-business-primary, #4d6bfe)'
    const WARN = 'var(--dsw-alias-state-warn-primary, #d97706)'
    const PRIMARY = 'var(--dsw-alias-label-primary, inherit)'

    /**
     * Row geometry copied from the sidebar Settings trigger
     * (ui-settings-general SettingsRoot.module.css `.trigger`): 42px row,
     * rad-md, paint-inset border, hover token. The shipped foot renders its
     * settings seat as the account row, whose content starts 4px left of a
     * plain `.trigger`; the -4px keeps this icon on that row's left edge.
     */
    function rowStyle(wide, hover, failed) {
      const color = failed ? WARN : PRIMARY
      if (!wide) {
        return {
          flex: 'none',
          width: 36,
          height: 36,
          margin: '8px 0',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          boxSizing: 'border-box',
          border: 'none',
          borderRadius: 'var(--dsw-radius-md, 8px)',
          backgroundClip: 'border-box',
          background: hover ? 'var(--dsw-alias-interactive-bg-hover, transparent)' : 'transparent',
          color,
          fontFamily: 'inherit',
          fontSize: 14,
          lineHeight: '22px',
          cursor: 'pointer',
        }
      }
      return {
        flex: '1 1 auto',
        minWidth: 0,
        width: '100%',
        height: 42,
        margin: '4px 0',
        padding: '0 calc(var(--dsh-sidebar-row-padding, 8px) - var(--dsh-sidebar-paint-inset, 0px) - 4px)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--dsh-sidebar-label-gap, 8px)',
        boxSizing: 'border-box',
        border: 'none',
        borderInline: 'var(--dsh-sidebar-paint-inset, 0px) solid transparent',
        borderRadius: 'var(--dsw-radius-md, 8px)',
        backgroundClip: 'padding-box',
        background: hover ? 'var(--dsw-alias-interactive-bg-hover, transparent)' : 'transparent',
        color,
        fontFamily: 'inherit',
        fontSize: 14,
        lineHeight: '22px',
        cursor: 'pointer',
        overflow: 'hidden',
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICT.zh), 'dsh-chat-entry: zh dictionary')
        ctx.effect(() => ctx.locale.register(NS, 'en', DICT.en), 'dsh-chat-entry: en dictionary')
        const t = ctx.locale.bind(NS)

        function EntryButton(props) {
          const { wide, target, fill, label } = props
          const [failed, setFailed] = React.useState(false)
          const [hover, setHover] = React.useState(false)

          const run = () => {
            setFailed(false)
            openBrowser(target).then((ok) => {
              if (ok) return
              setFailed(true)
              setTimeout(() => setFailed(false), 4000)
            })
          }

          return h(
            'button',
            {
              type: 'button',
              title: label,
              'aria-label': label,
              onClick: run,
              onMouseEnter: () => setHover(true),
              onMouseLeave: () => setHover(false),
              style: rowStyle(wide, hover, failed),
            },
            DeepSeekIcon(wide ? 24 : 24, fill),
            wide
              ? h(
                  'span',
                  { style: { overflow: 'hidden', whiteSpace: 'nowrap' } },
                  failed ? t('failed') : label,
                )
              : null,
          )
        }

        function Action(props) {
          const wide = Boolean(props && props.wide)
          return h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: wide ? 'stretch' : 'center',
                width: wide ? '100%' : 'auto',
                minWidth: 0,
              },
            },
            h(EntryButton, { key: 'chat', wide, target: 'chat', fill: ACCENT, label: t('title') }),
            h(EntryButton, { key: 'platform', wide, target: 'platform', fill: MONO_FILL, label: t('platform') }),
          )
        }

        ctx.effect(
          () =>
            ctx.slots.inject(SLOT, () =>
              ctx.slots.register(
                {
                  name: SLOT,
                  id: 'dsh-chat-entry',
                  order: 10,
                  label: () => t('title'),
                },
                Action,
              ),
            ),
          'dsh-chat-entry: sidebar foot action',
        )
      },
    }
  },
})
