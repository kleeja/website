<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { t, locale } = useI18n()
const { collection, formatDate } = useBlog()

useSeo({
  title: () => t('blog.seo.title'),
  description: () => t('blog.seo.description'),
  type: 'website',
})

useSeoMeta({
  ogTitle: () => t('blog.seo.ogTitle'),
  ogDescription: () => t('blog.seo.description'),
})

// Unlike the store and contributors lists, posts ship with the site, so they
// are read at build time and prerendered into the page.
const { data: posts } = await useAsyncData(
  () => `blog-${locale.value}`,
  () => queryCollection(collection.value)
    .select('path', 'title', 'description', 'date', 'image')
    .order('date', 'DESC')
    .all(),
)
</script>

<template>
  <UContainer class="py-12 sm:py-16">
    <div class="text-center max-w-2xl mx-auto">
      <UBadge
        color="primary"
        variant="subtle"
        icon="i-lucide-newspaper"
        size="lg"
      >
        {{ t('blog.badge') }}
      </UBadge>

      <h1 class="mt-4 text-4xl sm:text-5xl font-bold text-highlighted text-balance">
        {{ t('blog.title') }}
      </h1>

      <p class="mt-4 text-lg text-muted text-balance">
        {{ t('blog.intro') }}
      </p>
    </div>

    <UBlogPosts
      v-if="posts?.length"
      class="mt-12"
    >
      <!-- The title sits right under the image, so the image is left out of
           the accessible name instead of repeating it. -->
      <UBlogPost
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        :title="post.title"
        :description="post.description"
        :date="post.date"
        :image="post.image ? { src: post.image, alt: '' } : undefined"
      >
        <template #date>
          {{ formatDate(post.date) }}
        </template>
      </UBlogPost>
    </UBlogPosts>

    <div
      v-else
      class="mt-12 text-center text-muted"
    >
      {{ t('blog.empty') }}
    </div>
  </UContainer>
</template>
