import type { PageCollections } from '@nuxt/content'
import { queryCollection } from '@nuxt/content/server'
import { joinURL, withoutTrailingSlash } from 'ufo'

// The latest posts of every locale as JSON, for other sites and apps to show
// Kleeja news without scraping `/blog`. It is prerendered with the rest of the
// site (`nuxt.config.ts`), so each deploy rebuilds it from `content/*/blog/`
// and a new post needs nothing more than its markdown file. Only what a post
// card needs is exposed; the body stays on the post page.

const LIMIT = 10

type BlogCollection = Extract<keyof PageCollections, `blog_${string}`>

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = withoutTrailingSlash(getSiteConfig(event).url)

  const posts: Record<string, unknown[]> = {}

  for (const code of getAvailableLocales(config.public as Record<string, unknown>)) {
    // Newest first by the `date` in each post's front matter, as on `/blog`.
    const entries = await queryCollection(event, `blog_${code}` as BlogCollection)
      .select('path', 'title', 'description', 'date', 'image', 'author')
      .order('date', 'DESC')
      .limit(LIMIT)
      .all()

    // Links are absolute, since whoever reads this is not on kleeja.net.
    posts[code] = entries.map(post => ({
      title: post.title,
      description: post.description,
      date: post.date,
      url: joinURL(siteUrl, post.path),
      image: post.image ? joinURL(siteUrl, post.image) : null,
      author: {
        name: post.author.name,
        github: post.author.github,
        url: `https://github.com/${post.author.github}`,
        avatar: `https://github.com/${post.author.github}.png?size=96`,
      },
    }))
  }

  return posts
})
