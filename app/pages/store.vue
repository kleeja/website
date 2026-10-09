<script setup lang="ts">
interface LocalizedText {
  en?: string
  ar?: string
  [locale: string]: string | undefined
}

interface CatalogEntry {
  type: 'plugin' | 'style'
  name: string
  icon: string
  title: LocalizedText
  description: LocalizedText
  developer: string
  website?: string
  kleeja_version: { min: string, max: string }
  depend_on?: string
  plugins_required?: string
  file: { version: string, url: string }
}

// github.com/kleeja/store-catalog — the same catalogue the "Store"
// page inside the Kleeja control panel reads, so this page can never drift
// from what an admin actually sees offered there.
const CATALOG_URL = 'https://raw.githubusercontent.com/kleeja/store-catalog/refs/heads/main/catalog.json'
const CATALOG_REPO = 'https://github.com/kleeja/store-catalog'

definePageMeta({
  layout: 'default',
})

const { t, te, locale } = useI18n()
const localePath = useLocalePath()

useSeo({
  title: () => t('store.seo.title'),
  description: () => t('store.seo.description'),
  type: 'website',
})

useSeoMeta({
  ogTitle: () => t('store.seo.ogTitle'),
  ogDescription: () => t('store.seo.description'),
})

// Fetched in the browser, like the contributors list: the catalogue gains
// entries between deploys of this site, and a static build must not pin it to
// whatever GitHub happened to serve at build time.
const { data, status, error, refresh } = useFetch<CatalogEntry[]>(CATALOG_URL, {
  key: 'kleeja-store-catalog',
  server: false,
  lazy: true,
  default: () => [],
  // raw.githubusercontent serves `catalog.json` as `text/plain`, which ofetch
  // hands back unparsed. Without this the body arrives as a string and every
  // consumer below silently sees a list of characters instead of entries.
  responseType: 'json',
})

// A few descriptions in the catalogue carry raw HTML. Rendering it would mean
// trusting third-party markup on the page, so the tags are dropped and only
// their text is kept.
const plainText = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

// The catalogue carries `en` and `ar` for every entry, but a newly submitted
// one may only fill in the language its author speaks.
const localized = (text: LocalizedText | undefined) =>
  plainText(text?.[locale.value] || text?.en || Object.values(text || {}).find(Boolean) || '')

const entries = computed(() =>
  (Array.isArray(data.value) ? [...data.value] : []).sort((a, b) =>
    localized(a.title).localeCompare(localized(b.title), locale.value),
  ),
)

const counts = computed(() => ({
  all: entries.value.length,
  plugin: entries.value.filter(entry => entry.type === 'plugin').length,
  style: entries.value.filter(entry => entry.type === 'style').length,
}))

type Filter = 'all' | 'plugin' | 'style'

const activeFilter = ref<Filter>('all')
const query = ref('')

const filters = computed(() => ([
  { value: 'all' as Filter, label: t('store.filters.all'), icon: 'i-lucide-layout-grid', count: counts.value.all },
  { value: 'plugin' as Filter, label: t('store.filters.plugin'), icon: 'i-lucide-puzzle', count: counts.value.plugin },
  { value: 'style' as Filter, label: t('store.filters.style'), icon: 'i-lucide-palette', count: counts.value.style },
]))

// Both languages are searched whichever one the page is being read in, so an
// Arabic reader who knows a plugin by its English name still finds it.
const haystack = (entry: CatalogEntry) => [
  entry.name,
  entry.developer,
  ...Object.values(entry.title),
  ...Object.values(entry.description),
].join(' ').toLowerCase()

const results = computed(() => {
  const search = query.value.trim().toLowerCase()

  return entries.value.filter((entry) => {
    if (activeFilter.value !== 'all' && entry.type !== activeFilter.value) {
      return false
    }
    return !search || haystack(entry).includes(search)
  })
})

// Icons are hot-linked from each extension's own repository, so a moved or
// missing file falls back to a themed glyph instead of a broken image.
const brokenIcons = ref(new Set<string>())

const typeMeta = {
  plugin: { icon: 'i-lucide-puzzle', color: 'primary' as const },
  style: { icon: 'i-lucide-palette', color: 'info' as const },
}

// The catalogue is free to grow a third `type`; fall back rather than render
// `undefined.icon` and take the whole page down with it.
const metaFor = (type: string) =>
  typeMeta[type as keyof typeof typeMeta] || { icon: 'i-lucide-package', color: 'neutral' as const }

const stats = computed(() => [
  { label: t('store.stats.plugins'), value: counts.value.plugin, icon: 'i-lucide-puzzle' },
  { label: t('store.stats.styles'), value: counts.value.style, icon: 'i-lucide-palette' },
  { label: t('store.stats.free'), value: '100%', icon: 'i-lucide-badge-check' },
])
</script>

<template>
  <UContainer class="py-12 sm:py-16">
    <div class="text-center max-w-2xl mx-auto">
      <UBadge
        color="primary"
        variant="subtle"
        icon="i-lucide-store"
        size="lg"
      >
        {{ t('store.badge') }}
      </UBadge>

      <h1 class="mt-4 text-4xl sm:text-5xl font-bold text-highlighted text-balance">
        {{ t('store.title') }}
      </h1>

      <p class="mt-4 text-lg text-muted text-balance">
        {{ t('store.intro') }}
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <UButton
          :to="localePath('/guides/install-plugins')"
          icon="i-lucide-book-open"
          size="lg"
        >
          {{ t('store.installGuide') }}
        </UButton>

        <UButton
          :to="CATALOG_REPO"
          target="_blank"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-github"
          size="lg"
        >
          {{ t('store.submit') }}
        </UButton>
      </div>
    </div>

    <!-- Stats -->
    <div
      v-if="status === 'success' && entries.length"
      class="mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto"
    >
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-default bg-elevated/40 px-3 py-4 text-center"
      >
        <UIcon
          :name="stat.icon"
          class="size-5 text-primary mx-auto"
        />
        <div class="mt-2 text-2xl font-semibold text-highlighted tabular-nums">
          {{ stat.value }}
        </div>
        <div class="text-xs text-muted uppercase tracking-wide">
          {{ stat.label }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="status === 'pending' || status === 'idle'"
      class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="rounded-lg border border-default p-5"
      >
        <div class="flex items-start gap-4">
          <USkeleton class="size-12 rounded-md shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-20" />
          </div>
        </div>
        <USkeleton class="mt-4 h-3 w-full" />
        <USkeleton class="mt-2 h-3 w-2/3" />
        <USkeleton class="mt-5 h-8 w-full" />
      </div>
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      class="mt-12"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="t('store.error.title')"
      :description="t('store.error.description', { code: error.statusCode ? ` (${error.statusCode})` : '' })"
      :actions="[{ label: t('store.error.retry'), color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <template v-else-if="entries.length">
      <!-- Toolbar -->
      <div class="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            v-for="filter in filters"
            :key="filter.value"
            :icon="filter.icon"
            :color="activeFilter === filter.value ? 'primary' : 'neutral'"
            :variant="activeFilter === filter.value ? 'solid' : 'outline'"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <UBadge
              :color="activeFilter === filter.value ? 'neutral' : 'neutral'"
              variant="subtle"
              size="sm"
              class="tabular-nums"
            >
              {{ filter.count }}
            </UBadge>
          </UButton>
        </div>

        <UInput
          v-model="query"
          icon="i-lucide-search"
          :placeholder="t('store.search')"
          class="sm:w-64"
          :ui="{ trailing: 'pe-1' }"
        >
          <template
            v-if="query"
            #trailing
          >
            <UButton
              color="neutral"
              variant="link"
              icon="i-lucide-x"
              :aria-label="t('store.clear')"
              @click="query = ''"
            />
          </template>
        </UInput>
      </div>

      <!-- No search results -->
      <div
        v-if="!results.length"
        class="mt-12 text-center"
      >
        <UIcon
          name="i-lucide-search-x"
          class="size-8 text-dimmed mx-auto"
        />
        <p class="mt-3 text-muted">
          {{ t('store.empty') }}
        </p>
        <UButton
          class="mt-4"
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-ccw"
          @click="query = ''; activeFilter = 'all'"
        >
          {{ t('store.reset') }}
        </UButton>
      </div>

      <!-- Catalogue -->
      <div
        v-else
        class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="entry in results"
          :key="entry.name"
          class="group relative flex flex-col rounded-lg border border-default bg-default p-5 transition hover:border-primary hover:bg-primary/5"
        >
          <div class="flex items-start gap-4">
            <div class="size-12 shrink-0 rounded-md ring-1 ring-default bg-elevated overflow-hidden flex items-center justify-center">
              <img
                v-if="entry.icon && !brokenIcons.has(entry.name)"
                :src="entry.icon"
                :alt="localized(entry.title)"
                loading="lazy"
                class="size-full"
                :class="entry.type === 'style' ? 'object-cover' : 'object-contain p-1'"
                @error="brokenIcons.add(entry.name)"
              >
              <UIcon
                v-else
                :name="metaFor(entry.type).icon"
                class="size-6 text-dimmed"
              />
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-highlighted leading-tight">
                {{ localized(entry.title) }}
              </h3>
              <p class="mt-1 text-xs text-muted truncate">
                {{ t('store.by', { developer: entry.developer }) }}
              </p>
            </div>

            <UBadge
              :color="metaFor(entry.type).color"
              variant="subtle"
              size="sm"
              class="shrink-0"
            >
              {{ te(`store.type.${entry.type}`) ? t(`store.type.${entry.type}`) : entry.type }}
            </UBadge>
          </div>

          <p class="mt-3 flex-1 text-sm text-muted">
            {{ localized(entry.description) }}
          </p>

          <!-- Metadata -->
          <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-dimmed">
            <span class="inline-flex items-center gap-1">
              <UIcon
                name="i-lucide-tag"
                class="size-3.5"
              />
              <span
                dir="ltr"
                class="tabular-nums"
              >v{{ entry.file.version }}</span>
            </span>

            <span class="inline-flex items-center gap-1">
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-3.5"
              />
              <span>{{ t('store.compat') }}</span>
              <span
                dir="ltr"
                class="tabular-nums"
              >{{ entry.kleeja_version.min }} – {{ entry.kleeja_version.max }}</span>
            </span>

            <span
              v-if="entry.depend_on"
              class="inline-flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-layers"
                class="size-3.5"
              />
              {{ t('store.dependsOn', { style: entry.depend_on }) }}
            </span>

            <span
              v-if="entry.plugins_required"
              class="inline-flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-link-2"
                class="size-3.5"
              />
              {{ t('store.requiresPlugins', { plugins: entry.plugins_required }) }}
            </span>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <UButton
              :to="entry.file.url"
              target="_blank"
              rel="noopener"
              icon="i-lucide-download"
              size="sm"
              class="flex-1 justify-center"
            >
              {{ t('store.download') }}
            </UButton>

            <UButton
              v-if="entry.website"
              :to="entry.website"
              target="_blank"
              rel="noopener"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-external-link"
              :aria-label="t('store.website')"
            />
          </div>
        </div>
      </div>

      <!-- Install help -->
      <div class="mt-12 rounded-lg border border-dashed border-default p-8 text-center">
        <UIcon
          name="i-lucide-package-plus"
          class="size-8 text-primary mx-auto"
        />
        <h2 class="mt-3 text-xl font-semibold text-highlighted">
          {{ t('store.cta.title') }}
        </h2>
        <p class="mt-2 text-muted max-w-lg mx-auto">
          {{ t('store.cta.description') }}
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
          <UButton
            :to="localePath('/guides/install-plugins')"
            color="neutral"
            variant="outline"
            icon="i-lucide-puzzle"
          >
            {{ t('store.cta.plugins') }}
          </UButton>
          <UButton
            :to="localePath('/guides/install-styles')"
            color="neutral"
            variant="outline"
            icon="i-lucide-palette"
          >
            {{ t('store.cta.styles') }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- Empty catalogue -->
    <div
      v-else
      class="mt-12 text-center text-muted"
    >
      {{ t('store.none') }}
    </div>
  </UContainer>
</template>
