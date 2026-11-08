<script setup lang="ts">
// Mirrors the Docus layer's `error.vue`. The only change: its `onMounted`
// redirect is gone. It sends any path whose first segment is not a locale code
// to `switchLocalePath(defaultLocale)`, which assumes the `prefix` strategy.
// `nuxt.config.ts` switches to `prefix_except_default`, so for an English
// path such as `/404` that target is the current URL. Nuxt clears the error
// after any navigation that is not aborted, a duplicated one included, so the
// page re-renders, throws its 404 again and remounts this component. In the
// prerendered `404.html`, which renders client-side, that cycle never settles
// and freezes the tab.
import type { NuxtError } from '#app'
import type { ContentNavigationItem, PageCollections } from '@nuxt/content'
import * as nuxtUiLocales from '@nuxt/ui/locale'

const props = defineProps<{
  error: NuxtError
}>()

const { locale, isEnabled, t } = useDocusI18n()

const nuxtUiLocale = computed(() => nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales] || nuxtUiLocales.en)
const lang = computed(() => nuxtUiLocale.value.code)
const dir = computed(() => nuxtUiLocale.value.dir)

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
})

const localizedError = computed(() => {
  return {
    ...props.error,
    statusMessage: t('common.error.title'),
    message: t('common.error.description'),
  }
})

useSeoMeta({
  title: () => t('common.error.title'),
  description: () => t('common.error.description'),
})

const collectionName = computed(() => isEnabled.value ? `docs_${locale.value}` : 'docs')

const { data: navigation } = await useAsyncData(`navigation_${collectionName.value}`, () => queryCollectionNavigation(collectionName.value as keyof PageCollections), {
  transform: (data: ContentNavigationItem[]) => transformNavigation(data, isEnabled.value, locale.value),
  watch: [locale],
})

provide('navigation', navigation)
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <AppHeader />

    <UError :error="localizedError" />

    <AppFooter />

    <ClientOnly>
      <AppSearch :navigation="navigation" />
    </ClientOnly>
  </UApp>
</template>
