/**
 * e-punyasewa — Build-Time Open Graph & Social Media Prerenderer
 * 
 * Fetches products directly from Live Backend API
 * so that social media crawlers (WhatsApp, Facebook, Twitter/X, Telegram, LinkedIn)
 * always receive the exact product image, title, and rental rate.
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

const distDir = path.resolve(rootDir, "dist")
const templatePath = path.resolve(distDir, "index.html")

async function runPrerender() {
  if (!fs.existsSync(templatePath)) {
    console.warn("[Prerender-OG] dist/index.html not found. Run vite build first.")
    return
  }

  let productList = []
  try {
    const apiRes = await fetch("http://localhost:3000/api/v1/products")
    if (apiRes.ok) {
      const json = await apiRes.json()
      productList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : [])
    }
  } catch (e) {
    console.log("[Prerender-OG] Backend API not reachable during build, skipping product static prerender.")
    return
  }

  if (productList.length === 0) {
    console.log("[Prerender-OG] No products retrieved from API.")
    return
  }

  const baseHtml = fs.readFileSync(templatePath, "utf-8")
  const siteOrigin = "https://f-ecommerce.punyasewa.com"
  let count = 0

  for (const product of productList) {
    if (!product || !product.id) continue

    const pageTitle = `Sewa ${product.name} (Rp ${Number(product.dailyRate).toLocaleString("id-ID")}/hari) — e-punyasewa`
    const pageDesc = `Sewa ${product.name} tarif Rp ${Number(product.dailyRate).toLocaleString("id-ID")}/hari di e-punyasewa. ${(product.description || "").slice(0, 120)}... Reservasi unit mudah, cepat & transaksi transparan.`
    const imageUrl = product.images?.[0] || product.primaryImage || "/og-image.png"
    const fullImageUrl = imageUrl.startsWith("http") ? imageUrl : `${siteOrigin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    const productUrl = `${siteOrigin}/produk/${product.id}`

    // Inject exact product tags
    let productHtml = baseHtml
    productHtml = productHtml.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`)
    productHtml = productHtml.replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${pageTitle}" />`)
    productHtml = productHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${pageDesc}" />`)
    productHtml = productHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${pageTitle}" />`)
    productHtml = productHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${pageDesc}" />`)
    productHtml = productHtml.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${fullImageUrl}" />`)
    productHtml = productHtml.replace(/<meta property="og:image:secure_url" content=".*?" \/>/i, `<meta property="og:image:secure_url" content="${fullImageUrl}" />`)
    productHtml = productHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${productUrl}" />`)
    productHtml = productHtml.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="product" />`)
    productHtml = productHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${pageTitle}" />`)
    productHtml = productHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${pageDesc}" />`)
    productHtml = productHtml.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${fullImageUrl}" />`)

    // 1. Output directory: dist/produk/{id}/index.html
    const targetDirId = path.resolve(distDir, "produk", product.id)
    fs.mkdirSync(targetDirId, { recursive: true })
    fs.writeFileSync(path.resolve(targetDirId, "index.html"), productHtml, "utf-8")

    // 2. Output directory: dist/produk/{slug}/index.html
    const slug = (product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    if (slug && slug !== product.id) {
      const targetDirSlug = path.resolve(distDir, "produk", slug)
      fs.mkdirSync(targetDirSlug, { recursive: true })
      fs.writeFileSync(path.resolve(targetDirSlug, "index.html"), productHtml, "utf-8")
    }

    count++
  }

  console.log(`[Prerender-OG] Successfully generated ${count} product Open Graph HTML pages from Live API.`)
}

runPrerender()
