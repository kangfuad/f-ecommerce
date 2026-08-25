/**
 * e-punyasewa — Social Media Crawler Open Graph & Meta Prerender Middleware
 * 
 * Purpose:
 * When links like `https://f-ecommerce.punyasewa.com/katalog?produk=eps_cam_01` are shared on
 * WhatsApp, Facebook, Twitter/X, Telegram, or LinkedIn, crawler bots do not execute JavaScript.
 * This middleware intercepts requests from social media bots and injects the product's 
 * dynamic Open Graph tags (Title, Description, Image, Price) into the initial HTML response.
 *
 * Supported Crawlers:
 * - WhatsApp (WhatsApp/2.x)
 * - Facebook / Meta (facebookexternalhit/1.1)
 * - Twitter / X (Twitterbot/1.0)
 * - Telegram (TelegramBot)
 * - LinkedIn (LinkedInBot)
 * - Discord (Discordbot)
 * - Pinterest, Slack, Skype
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'WhatsApp',
  'Twitterbot',
  'TelegramBot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'Pinterest',
  'SkypeUriPreview',
  'Google-Structured-Data-Testing-Tool',
]

export function isSocialBot(userAgent = '') {
  return CRAWLER_USER_AGENTS.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()))
}

export function handleSocialMetaMiddleware(req, res, next) {
  const userAgent = req.headers['user-agent'] || ''
  const url = new URL(req.url, `http://${req.headers.host}`)
  const productId = url.searchParams.get('produk') || url.searchParams.get('item') || url.searchParams.get('product')

  // If request is from a normal browser, continue to SPA Vite handler
  if (!isSocialBot(userAgent) || !productId) {
    return next()
  }

  try {
    // 1. Read products JSON database
    const productsFilePath = path.resolve(__dirname, 'public/data/products.json')
    const productsRaw = fs.readFileSync(productsFilePath, 'utf-8')
    const productsData = JSON.parse(productsRaw)
    const productList = productsData.data || []

    const product = productList.find(
      (p) => p.id === productId || p.name.toLowerCase().replace(/\s+/g, '-').includes(productId.toLowerCase())
    )

    if (!product) {
      return next()
    }

    // 2. Read template index.html
    const indexPath = path.resolve(__dirname, 'dist/index.html')
    let html = fs.readFileSync(fs.existsSync(indexPath) ? indexPath : path.resolve(__dirname, 'index.html'), 'utf-8')

    const siteOrigin = `https://${req.headers.host || 'f-ecommerce.punyasewa.com'}`
    const productUrl = `${siteOrigin}/katalog?produk=${product.id}`
    const imageUrl = product.images?.[0] || product.primaryImage || '/og-image.png'
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteOrigin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`

    const pageTitle = `Sewa ${product.name} (Rp ${product.dailyRate.toLocaleString('id-ID')}/hari) — e-punyasewa`
    const pageDesc = `${product.name} — ${product.description.slice(0, 150)}... Fasilitas Bebas Deposit Rp 0 Member KYC di e-punyasewa.`

    // 3. Inject Dynamic Open Graph & Twitter Meta Tags for Social Crawler
    html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`)
    html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${pageTitle}" />`)
    html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${pageDesc}" />`)
    html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${fullImageUrl}" />`)
    html = html.replace(/<meta property="og:image:secure_url" content=".*?" \/>/i, `<meta property="og:image:secure_url" content="${fullImageUrl}" />`)
    html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${productUrl}" />`)
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${pageTitle}" />`)
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${pageDesc}" />`)
    html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${fullImageUrl}" />`)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.end(html)
  } catch (error) {
    console.error('Error handling social bot meta prerender:', error)
    return next()
  }
}

export default handleSocialMetaMiddleware
