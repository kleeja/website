// Public origin of the deployed site. GitHub Pages serves it from the custom
// domain in `public/CNAME`, at the root, so the default `baseURL` of `/` is
// correct and only the origin needs configuring.
const siteUrl = 'https://kleeja.net'

const defaultLocale = 'en'

// Docus resolves the origin from the environment only (`utils/meta.ts` ->
// `inferSiteURL`), so it never sees `site.url` below and would otherwise build
// relative links into `llms.txt`. Export it here to keep one source of truth
// for both. (`server/routes/sitemap.xml.ts` reads `site.url` directly.)
process.env.NUXT_SITE_URL ||= siteUrl

export default defineNuxtConfig({
  extends: ['docus'],

  modules: [
    // Docus forces `strategy: 'prefix'` from its own `config` module, which
    // buries the default locale under `/en` and turns `/` into a redirect.
    // Layer modules are installed before the ones listed here, so this runs
    // after Docus has written the option and before `@nuxtjs/i18n` reads it.
    // `content.config.ts` mirrors the change by publishing the English pages
    // at the root of the `docs_en`/`landing_en` collections.
    (_options, nuxt) => {
      const options = nuxt.options as typeof nuxt.options & { i18n?: { strategy?: string } }
      if (options.i18n) {
        options.i18n.strategy = 'prefix_except_default'
      }
    },
    '@nuxtjs/i18n',
  ],

  // A locale is only registered when `content/<code>/` exists, and the Docus
  // layer merges its own UI translations in on top of these files.
  i18n: {
    defaultLocale,
    // `@nuxtjs/i18n` enables this by default with `redirectOn: 'root'` and a
    // `i18n_redirected` cookie, so picking Arabic once pins `/` to `/ar` on
    // every later visit. The locale is chosen from the URL alone instead.
    detectBrowserLanguage: false,
    locales: [
      { code: 'en', name: 'English', language: 'en-US', dir: 'ltr', file: 'en.json' },
      { code: 'ar', name: 'العربية', language: 'ar', dir: 'rtl', file: 'ar.json' },
    ],
  },

  // Plausible is self-hosted, so the script is served from `hiomx.com` while
  // stats are attributed to `data-domain`. The stub keeps `window.plausible()`
  // callable before the deferred script has loaded, queueing the calls in
  // `.q` for it to flush.
  app: {
    head: {
      script: [
        {
          src: 'https://plausible.hiomx.com/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js',
          defer: true,
          'data-domain': 'kleeja.net',
        },
        {
          innerHTML: 'window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }',
        },
      ],
    },
  },

  // Shiki only bundles the grammars it is told to load. The Docus layer's list
  // has `bash` and `html` but not `php` or `ini`, so those blocks were falling
  // back to unstyled plain text. Layer arrays are concatenated, so these are
  // added to the Docus set rather than replacing it.
  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['php', 'ini'],
        },
      },
    },
  },

  site: {
    url: siteUrl,
    name: 'Kleeja',
  },

  robots: {
    autoI18n: false,
  },

  // GitHub Pages only serves static files, so Nitro must emit a fully
  // prerendered site instead of a Node server. The preset also writes the
  // `.nojekyll` marker that stops Pages from dropping `_nuxt/`.
  nitro: {
    preset: 'github_pages',
    // No page links to the JSON feed, so the crawler would never find it.
    prerender: {
      routes: ['/blog-json'],
    },
  },

  hooks: {
    // Docus seeds the prerender queue with `/<code>` for every locale. The
    // default locale has no prefix any more, so `/en` would 404 and `/` — the
    // entry point the rest of the crawl starts from — would never be visited.
    'nitro:config'(nitroConfig) {
      const routes = nitroConfig.prerender?.routes
      if (!routes) {
        return
      }

      const prefixed = routes.indexOf(`/${defaultLocale}`)
      if (prefixed !== -1) {
        routes.splice(prefixed, 1)
      }
      if (!routes.includes('/')) {
        routes.push('/')
      }
    },

    // `content.config.ts` drops the `en/` segment from the default locale's
    // document ids so that `path` matches the unprefixed routes — but `stem`
    // is derived from the same id, and the "Edit this page" link is built from
    // it. Put the segment back on `stem` only, so the link keeps resolving to
    // `content/en/...` in the repository. Navigation builds its tree from
    // `path` and only sorts on `stem`, which a uniform prefix leaves alone.
    'content:file:afterParse'(ctx) {
      if (ctx.collection.name.endsWith(`_${defaultLocale}`) && typeof ctx.content.stem === 'string') {
        ctx.content.stem = `${defaultLocale}/${ctx.content.stem}`
      }
    },

    // Docus registers a route middleware that sends `/` to `/<cookie locale>`.
    // That is a 404 now that English is served from the root, so drop the
    // plugin; it does nothing else while i18n is enabled.
    'app:resolve'(app) {
      app.plugins = app.plugins.filter(plugin => !/docus[\\/]app[\\/]plugins[\\/]i18n\./.test(plugin.src))
    },
  },
})
