import { onUnmounted } from 'vue'

export interface MetaTagsOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
}

const DEFAULT_META: MetaTagsOptions = {
  title: 'e-punyasewa — Platform Sewa & Rental Perlengkapan Modern',
  description:
    'Sewa kamera sinema, drone DJI, laptop/gadget, perlengkapan outdoor camping, dan audio sound system dengan mudah, bebas deposit member KYC, dan garansi unit QC 100% di e-punyasewa.',
  image: '/og-image.png',
  type: 'website',
}

/**
 * Dynamic Meta Tags Manager for SEO, Open Graph (Facebook / WhatsApp / Telegram) & Twitter Cards
 */
export function useMetaTags() {
  function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
    if (typeof document === 'undefined') return
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`)
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attrName, attrValue)
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', content)
  }

  function updateMetaTags(options: MetaTagsOptions) {
    if (typeof document === 'undefined') return

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://f-ecommerce.punyasewa.com'

    // 1. Title
    const title = options.title || DEFAULT_META.title!
    document.title = title.includes('e-punyasewa') ? title : `${title} — e-punyasewa`
    setMetaTag('name', 'title', document.title)
    setMetaTag('property', 'og:title', document.title)
    setMetaTag('name', 'twitter:title', document.title)

    // 2. Description
    const description = options.description || DEFAULT_META.description!
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:description', description)
    setMetaTag('name', 'twitter:description', description)

    // 3. Image
    let rawImage = options.image || DEFAULT_META.image!
    const fullImageUrl = rawImage.startsWith('http')
      ? rawImage
      : `${origin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`

    setMetaTag('property', 'og:image', fullImageUrl)
    setMetaTag('property', 'og:image:secure_url', fullImageUrl)
    setMetaTag('name', 'twitter:image', fullImageUrl)
    setMetaTag('name', 'twitter:card', 'summary_large_image')

    // 4. URL
    if (options.url) {
      const fullUrl = options.url.startsWith('http')
        ? options.url
        : `${origin}${options.url.startsWith('/') ? '' : '/'}${options.url}`

      setMetaTag('property', 'og:url', fullUrl)
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', fullUrl)
    }

    // 5. Open Graph Type
    setMetaTag('property', 'og:type', options.type || 'website')
  }

  function resetMetaTags() {
    updateMetaTags({
      ...DEFAULT_META,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    })
  }

  return {
    updateMetaTags,
    resetMetaTags,
  }
}
