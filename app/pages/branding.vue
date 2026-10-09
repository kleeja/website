<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const SITE_URL = 'https://kleeja.net'
const REPO_URL = 'https://github.com/kleeja/kleeja'

// Pasted verbatim by whoever credits Kleeja, so both snippets are built from
// `SITE_URL` rather than repeating the domain in the locale files.
const POWERED_BY_HTML = `<a href="${SITE_URL}" target="_blank" rel="noopener">Powered by Kleeja</a>`
const BADGE_MARKDOWN = `[![Powered by Kleeja](https://img.shields.io/badge/Powered%20by-Kleeja-F45B69?style=flat-square)](${SITE_URL})`

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()

useSeo({
  title: () => t('branding.seo.title'),
  description: () => t('branding.seo.description'),
  type: 'website',
})

useSeoMeta({
  ogTitle: () => t('branding.seo.ogTitle'),
  ogDescription: () => t('branding.seo.description'),
})

// The page is ordered the way someone arrives at it: the files first, then the
// three places they are allowed to put them, then the set those permissions
// cover, then the name.
const sections = computed(() => [
  { id: 'logos', label: t('branding.nav.logos'), icon: 'i-lucide-image' },
  { id: 'misuse', label: t('branding.nav.misuse'), icon: 'i-lucide-circle-slash' },
  { id: 'website', label: t('branding.nav.website'), icon: 'i-lucide-globe' },
  { id: 'articles', label: t('branding.nav.articles'), icon: 'i-lucide-newspaper' },
  { id: 'slides', label: t('branding.nav.slides'), icon: 'i-lucide-presentation' },
  { id: 'asset-set', label: t('branding.nav.assetSet'), icon: 'i-lucide-package-check' },
  { id: 'colors', label: t('branding.nav.colors'), icon: 'i-lucide-palette' },
])

// One shared clipboard with a per-target flag: a single `copied` boolean from
// `useClipboard` would light up every button on the page at once.
const { copy, isSupported: canCopy } = useClipboard()
const copiedKey = ref<string | null>(null)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copyValue(key: string, value: string) {
  await copy(value)
  copiedKey.value = key
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => (copiedKey.value = null), 1500)
}

onBeforeUnmount(() => clearTimeout(resetTimer))

// `frame` is the background each variant is drawn for; the preview sits on it
// so the reverse mark is never shown on a surface it isn't meant for.
const logoVariants = computed(() => [
  {
    id: 'primary',
    title: t('branding.logos.primary.title'),
    description: t('branding.logos.primary.description'),
    svg: '/images/logo.svg',
    png: '/images/logo.png',
    frame: 'bg-white',
  },
  {
    id: 'reverse',
    title: t('branding.logos.reverse.title'),
    description: t('branding.logos.reverse.description'),
    svg: '/images/logo-light.svg',
    png: '/images/logo-light.png',
    frame: 'bg-[#0B1F3A]',
  },
])

// Each rule is shown as the mistake itself: `frame`/`imgClass` deliberately
// break the mark the way the caption says not to.
const misuseDemos = [
  { id: 'recolor', frame: 'bg-white', imgClass: 'hue-rotate-[150deg] saturate-200' },
  { id: 'stretch', frame: 'bg-white', imgClass: 'scale-x-[1.6]' },
  { id: 'rotate', frame: 'bg-white', imgClass: 'rotate-[18deg]' },
  { id: 'effects', frame: 'bg-white', imgClass: 'drop-shadow-[4px_5px_0_rgba(244,91,105,0.7)] blur-[0.4px]' },
  { id: 'contrast', frame: 'bg-[#0B1F3A]', imgClass: '' },
  { id: 'crop', frame: 'bg-white overflow-hidden', imgClass: 'scale-[1.9] translate-x-3' },
]

const misuse = computed(() => misuseDemos.map(demo => ({
  ...demo,
  title: t(`branding.misuse.${demo.id}.title`),
  description: t(`branding.misuse.${demo.id}.description`),
})))

const assetSet = computed(() => ['primary', 'reverse', 'screenshots'].map(id => ({
  id,
  text: t(`branding.assetSet.${id}`),
})))

const snippets = computed(() => [
  {
    id: 'poweredBy',
    title: t('branding.website.poweredBy.title'),
    description: t('branding.website.poweredBy.description'),
    code: POWERED_BY_HTML,
  },
  {
    id: 'badge',
    title: t('branding.website.badge.title'),
    description: t('branding.website.badge.description'),
    code: BADGE_MARKDOWN,
  },
])

const boilerplate = computed(() => [
  { id: 'oneLine', label: t('branding.articles.describe.oneLine'), text: t('branding.articles.describe.oneLineText') },
  { id: 'short', label: t('branding.articles.describe.short'), text: t('branding.articles.describe.shortText') },
  { id: 'long', label: t('branding.articles.describe.long'), text: t('branding.articles.describe.longText') },
])

const coreColors = computed(() => [
  {
    id: 'coral',
    name: t('branding.colors.coral.name'),
    role: t('branding.colors.coral.role'),
    hex: '#F45B69',
    rgb: 'rgb(244 91 105)',
    swatch: 'bg-[#F45B69]',
    ink: 'text-white',
  },
  {
    id: 'navy',
    name: t('branding.colors.navy.name'),
    role: t('branding.colors.navy.role'),
    hex: '#0B1F3A',
    rgb: 'rgb(11 31 58)',
    swatch: 'bg-[#0B1F3A]',
    ink: 'text-white',
  },
  {
    id: 'white',
    name: t('branding.colors.white.name'),
    role: t('branding.colors.white.role'),
    hex: '#FFFFFF',
    rgb: 'rgb(255 255 255)',
    swatch: 'bg-white ring-1 ring-inset ring-zinc-200',
    ink: 'text-[#0B1F3A]',
  },
])
</script>

<template>
  <UContainer class="py-12 sm:py-16">
    <div class="text-center max-w-2xl mx-auto">
      <UBadge
        color="primary"
        variant="subtle"
        icon="i-lucide-sparkles"
        size="lg"
      >
        {{ t('branding.badge') }}
      </UBadge>

      <h1 class="mt-4 text-4xl sm:text-5xl font-bold text-highlighted text-balance">
        {{ t('branding.title') }}
      </h1>

      <p class="mt-4 text-lg text-muted text-balance">
        {{ t('branding.intro') }}
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <UButton
          to="#logos"
          icon="i-lucide-download"
          size="lg"
        >
          {{ t('branding.downloads') }}
        </UButton>

        <UButton
          :to="`${REPO_URL}/issues/new`"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="outline"
          icon="i-lucide-message-circle-question"
          size="lg"
        >
          {{ t('branding.ask') }}
        </UButton>
      </div>
    </div>

    <!-- Section index -->
    <nav class="mt-10 flex flex-wrap items-center justify-center gap-2">
      <ULink
        v-for="section in sections"
        :key="section.id"
        :to="`#${section.id}`"
        class="inline-flex items-center gap-1.5 rounded-full border border-default px-3 py-1.5 text-sm text-muted transition hover:border-primary hover:text-primary"
      >
        <UIcon
          :name="section.icon"
          class="size-4"
        />
        {{ section.label }}
      </ULink>
    </nav>

    <!-- The logos -->
    <section
      id="logos"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.logos.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.logos.intro') }}
      </p>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="variant in logoVariants"
          :key="variant.id"
          class="rounded-lg border border-default bg-default overflow-hidden"
        >
          <div
            class="flex items-center justify-center py-12"
            :class="variant.frame"
          >
            <img
              :src="variant.svg"
              :alt="variant.title"
              class="size-24"
            >
          </div>

          <div class="p-5 border-t border-default">
            <h3 class="font-semibold text-highlighted">
              {{ variant.title }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ variant.description }}
            </p>

            <div class="mt-4 flex items-center gap-2">
              <UButton
                :to="variant.svg"
                external
                download
                size="sm"
                icon="i-lucide-download"
                class="flex-1 justify-center"
              >
                {{ t('branding.logos.svg') }}
              </UButton>
              <UButton
                :to="variant.png"
                external
                download
                size="sm"
                color="neutral"
                variant="outline"
                icon="i-lucide-download"
                class="flex-1 justify-center"
              >
                {{ t('branding.logos.png') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <p class="mt-3 text-sm text-dimmed">
        {{ t('branding.logos.formatHint') }}
      </p>

      <UAlert
        class="mt-4"
        color="neutral"
        variant="subtle"
        icon="i-lucide-printer"
        :description="t('branding.logos.printNote')"
      />

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Clear space: the dashed margin is 20px around an 80px mark, i.e.
             exactly the quarter of its height the caption asks for. -->
        <div class="rounded-lg border border-default bg-default p-5">
          <h3 class="font-semibold text-highlighted">
            {{ t('branding.logos.clearSpace.title') }}
          </h3>
          <p class="mt-1 text-sm text-muted">
            {{ t('branding.logos.clearSpace.description') }}
          </p>
          <div class="mt-4 flex items-center justify-center rounded-md bg-white py-8">
            <div class="border-2 border-dashed border-[#F45B69]/60 p-5">
              <img
                src="/images/logo.svg"
                alt=""
                class="size-20"
              >
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-5">
          <h3 class="font-semibold text-highlighted">
            {{ t('branding.logos.minSize.title') }}
          </h3>
          <p class="mt-1 text-sm text-muted">
            {{ t('branding.logos.minSize.description') }}
          </p>
          <div class="mt-4 flex items-end justify-center gap-6 rounded-md bg-white py-8">
            <div class="flex flex-col items-center gap-2">
              <img
                src="/images/logo.svg"
                alt=""
                class="size-6"
              >
              <span
                dir="ltr"
                class="text-xs text-[#0B1F3A]/60 tabular-nums"
              >24px</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <img
                src="/images/logo.svg"
                alt=""
                class="size-12"
              >
              <span
                dir="ltr"
                class="text-xs text-[#0B1F3A]/60 tabular-nums"
              >48px</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <img
                src="/images/logo.svg"
                alt=""
                class="size-20"
              >
              <span
                dir="ltr"
                class="text-xs text-[#0B1F3A]/60 tabular-nums"
              >80px</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What not to do -->
    <section
      id="misuse"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.misuse.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.misuse.intro') }}
      </p>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="rule in misuse"
          :key="rule.title"
          class="rounded-lg border border-default bg-default overflow-hidden"
        >
          <div
            class="relative flex items-center justify-center py-10"
            :class="rule.frame"
          >
            <img
              src="/images/logo.svg"
              alt=""
              class="size-16"
              :class="rule.imgClass"
            >
            <span class="absolute top-2 end-2 inline-flex items-center justify-center size-6 rounded-full bg-error text-inverted">
              <UIcon
                name="i-lucide-x"
                class="size-4"
              />
            </span>
          </div>

          <div class="p-4 border-t border-default">
            <h3 class="text-sm font-semibold text-highlighted">
              {{ rule.title }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ rule.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- On a site that runs Kleeja -->
    <section
      id="website"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.website.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.website.description') }}
      </p>

      <div class="mt-6 space-y-4">
        <div
          v-for="snippet in snippets"
          :key="snippet.id"
          class="rounded-lg border border-default bg-default p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-semibold text-highlighted">
                {{ snippet.title }}
              </h3>
              <p class="mt-1 text-sm text-muted">
                {{ snippet.description }}
              </p>
            </div>

            <UButton
              v-if="canCopy"
              size="xs"
              color="neutral"
              variant="ghost"
              class="shrink-0"
              :icon="copiedKey === snippet.id ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copyValue(snippet.id, snippet.code)"
            >
              {{ copiedKey === snippet.id ? t('branding.copied') : t('branding.copy') }}
            </UButton>
          </div>

          <pre
            dir="ltr"
            class="mt-3 overflow-x-auto rounded-md bg-elevated/60 p-3 text-xs"
          ><code>{{ snippet.code }}</code></pre>
        </div>
      </div>
    </section>

    <!-- Blog posts and articles -->
    <section
      id="articles"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.articles.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.articles.description') }}
      </p>

      <div class="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-semibold text-highlighted">
              {{ t('branding.articles.credit.title') }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ t('branding.articles.credit.description') }}
            </p>
          </div>

          <UButton
            v-if="canCopy"
            size="xs"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            :icon="copiedKey === 'creditLine' ? 'i-lucide-check' : 'i-lucide-copy'"
            @click="copyValue('creditLine', t('branding.creditLine'))"
          >
            {{ copiedKey === 'creditLine' ? t('branding.copied') : t('branding.copy') }}
          </UButton>
        </div>

        <p class="mt-3 border-s-2 border-primary ps-4 text-highlighted">
          {{ t('branding.creditLine') }}
        </p>
      </div>

      <div class="mt-4 rounded-lg border border-default bg-elevated/40 p-5">
        <h3 class="font-semibold text-highlighted">
          {{ t('branding.articles.screenshots.title') }}
        </h3>
        <p class="mt-1 text-sm text-muted">
          {{ t('branding.articles.screenshots.description') }}
        </p>
      </div>

      <h3 class="mt-8 text-xl font-semibold text-highlighted">
        {{ t('branding.articles.describe.title') }}
      </h3>
      <p class="mt-1 text-muted max-w-2xl">
        {{ t('branding.articles.describe.intro') }}
      </p>

      <div class="mt-4 space-y-3">
        <div
          v-for="entry in boilerplate"
          :key="entry.id"
          class="rounded-lg border border-default bg-default p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ entry.label }}
            </UBadge>

            <UButton
              v-if="canCopy"
              size="xs"
              color="neutral"
              variant="ghost"
              :icon="copiedKey === entry.id ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copyValue(entry.id, entry.text)"
            >
              {{ copiedKey === entry.id ? t('branding.copied') : t('branding.copy') }}
            </UButton>
          </div>

          <p class="mt-3 text-highlighted">
            {{ entry.text }}
          </p>
        </div>
      </div>
    </section>

    <!-- Presentation slides -->
    <section
      id="slides"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.slides.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.slides.description') }}
      </p>
    </section>

    <!-- The standard asset set -->
    <section
      id="asset-set"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.assetSet.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.assetSet.description') }}
      </p>

      <ul class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <li
          v-for="item in assetSet"
          :key="item.id"
          class="flex items-start gap-3 rounded-lg border border-default bg-default p-4"
        >
          <UIcon
            name="i-lucide-package-check"
            class="size-5 shrink-0 text-primary"
          />
          <span class="text-sm text-muted">{{ item.text }}</span>
        </li>
      </ul>
    </section>

    <!-- Colours -->
    <section
      id="colors"
      class="mt-16 scroll-mt-24"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('branding.colors.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl">
        {{ t('branding.colors.intro') }}
      </p>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="color in coreColors"
          :key="color.id"
          class="rounded-lg border border-default bg-default overflow-hidden"
        >
          <div
            class="flex items-end p-4 h-28"
            :class="[color.swatch, color.ink]"
          >
            <span
              dir="ltr"
              class="font-mono text-sm"
            >{{ color.hex }}</span>
          </div>

          <div class="p-4 border-t border-default">
            <h3 class="font-semibold text-highlighted">
              {{ color.name }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ color.role }}
            </p>

            <div class="mt-3 flex items-center gap-2">
              <UButton
                v-if="canCopy"
                size="xs"
                color="neutral"
                variant="outline"
                :icon="copiedKey === `${color.id}-hex` ? 'i-lucide-check' : 'i-lucide-copy'"
                @click="copyValue(`${color.id}-hex`, color.hex)"
              >
                HEX
              </UButton>
              <UButton
                v-if="canCopy"
                size="xs"
                color="neutral"
                variant="outline"
                :icon="copiedKey === `${color.id}-rgb` ? 'i-lucide-check' : 'i-lucide-copy'"
                @click="copyValue(`${color.id}-rgb`, color.rgb)"
              >
                RGB
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <UAlert
        class="mt-4"
        color="neutral"
        variant="subtle"
        icon="i-lucide-contrast"
        :description="t('branding.colors.note')"
      />
    </section>

    <!-- Licence -->
    <section class="mt-16 rounded-lg border border-dashed border-default p-8 text-center">
      <UIcon
        name="i-lucide-scale"
        class="size-8 text-primary mx-auto"
      />
      <h2 class="mt-3 text-xl font-semibold text-highlighted">
        {{ t('branding.license.title') }}
      </h2>
      <p class="mt-2 text-muted max-w-2xl mx-auto">
        {{ t('branding.license.description') }}
      </p>
      <UButton
        class="mt-4"
        :to="`${REPO_URL}/issues/new`"
        target="_blank"
        rel="noopener"
        color="neutral"
        variant="outline"
        icon="i-lucide-message-circle-question"
      >
        {{ t('branding.license.action') }}
      </UButton>
    </section>
  </UContainer>
</template>
