<script setup lang="ts">
import { ref, computed } from 'vue'
import { Product } from '@/domain/entities/Product'
import { formatRupiah } from '@/core/utils/currency'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { useToast } from '@/presentation/composables/useToast'
import { IconClose, IconCheck, IconCopy, IconArrowRight } from '@/presentation/components/icons'

interface Props {
  product: Product | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

useBodyScrollLock(() => !!props.product)

const { showToast } = useToast()
const isCopied = ref(false)

// Clean share URL using universally supported query parameter format
const shareUrl = computed(() => {
  if (!props.product) return ''
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://f-ecommerce.punyasewa.com'
  return `${origin}/katalog?produk=${props.product.id}`
})

const shareMessage = computed(() => {
  if (!props.product) return ''
  return `Sewa ${props.product.name} (${formatRupiah(props.product.dailyRate.amount)}/hari) di e-punyasewa. Bebas Deposit Rp 0 Member KYC & Garansi QC 100%!`
})

const canNativeShare = computed(() => {
  return typeof navigator !== 'undefined' && !!navigator.share
})

// Detect if running as installed PWA (standalone mode)
const isStandaloneMode = computed(() => {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
})

// iOS standalone PWA cannot use window.open — it opens a broken blank Safari VC.
// Use location.href to navigate directly, or native share as primary on mobile.
function openExternalUrl(url: string) {
  if (isStandaloneMode.value) {
    // In PWA standalone: location.href navigates in-place (app leaves, user comes back)
    window.location.href = url
  } else {
    window.open(url, '_blank', 'noopener')
  }
}

async function handleCopyLink() {
  if (!shareUrl.value) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
    } else {
      // Fallback
      const input = document.createElement('input')
      input.value = shareUrl.value
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }

    isCopied.value = true
    showToast({
      type: 'success',
      title: 'Tautan Disalin!',
      message: 'Link produk berhasil disalin ke papan klip.',
    })

    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    showToast({
      type: 'info',
      title: 'Tautan Produk',
      message: shareUrl.value,
    })
  }
}

function shareToWhatsApp() {
  const text = `${shareMessage.value}\n\n${shareUrl.value}`
  openExternalUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`)
}

function shareToTelegram() {
  openExternalUrl(`https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareMessage.value)}`)
}

function shareToTwitter() {
  openExternalUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage.value)}&url=${encodeURIComponent(shareUrl.value)}`)
}

function shareToFacebook() {
  openExternalUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`)
}

function shareToEmail() {
  const subject = `Rekomendasi Sewa: ${props.product?.name} — e-punyasewa`
  const body = `${shareMessage.value}\n\nLihat spesifikasi dan sewa online di: ${shareUrl.value}`
  openExternalUrl(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
}

async function triggerNativeShare() {
  if (!props.product) return
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${props.product.name} — e-punyasewa`,
        text: shareMessage.value,
        url: shareUrl.value,
      })
    } catch {
      // User cancelled
    }
  } else {
    handleCopyLink()
  }
}
</script>

<template>
  <div v-if="product" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Card (YouTube Style Share Dialog) -->
    <div class="relative bg-theme-card text-theme-primary rounded-3xl max-w-md w-full shadow-2xl border border-theme-border z-10 animate-fade-up p-5 sm:p-6 space-y-5">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div>
          <h3 class="font-extrabold text-base text-theme-primary">Bagikan Unit Sewa</h3>
          <p class="text-xs text-stone-500">Pilih aplikasi tujuan atau salin tautan langsung</p>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-theme-primary flex items-center justify-center transition cursor-pointer"
          title="Tutup dialog"
        >
          <IconClose :size="14" />
        </button>
      </div>

      <!-- Mini Product Preview Card -->
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border">
        <div class="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-theme-border/60">
          <img
            :src="product.images?.[0] || product.primaryImage"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-extrabold text-xs sm:text-sm text-theme-primary line-clamp-1">
            {{ product.name }}
          </h4>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs font-mono font-black text-forest dark:text-forest-glow">
              {{ formatRupiah(product.dailyRate.amount) }}<span class="text-[10px] font-normal text-stone-500">/hari</span>
            </span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
              Bebas Deposit
            </span>
          </div>
        </div>
      </div>

      <!-- Direct Share Apps Grid (YouTube / TikTok Style) -->
      <div>
        <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
          Bagikan Langsung Ke:
        </span>

        <div class="grid grid-cols-4 sm:grid-cols-5 gap-3 text-center">
          <!-- WhatsApp -->
          <button
            type="button"
            @click="shareToWhatsApp"
            class="group flex flex-col items-center gap-1.5 cursor-pointer"
            title="Bagikan ke WhatsApp"
          >
            <div class="w-12 h-12 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <span class="text-[10px] font-bold text-stone-600 dark:text-stone-300 group-hover:text-theme-primary">WhatsApp</span>
          </button>

          <!-- Telegram -->
          <button
            type="button"
            @click="shareToTelegram"
            class="group flex flex-col items-center gap-1.5 cursor-pointer"
            title="Bagikan ke Telegram"
          >
            <div class="w-12 h-12 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9] text-[#229ED9] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z"/>
              </svg>
            </div>
            <span class="text-[10px] font-bold text-stone-600 dark:text-stone-300 group-hover:text-theme-primary">Telegram</span>
          </button>

          <!-- Twitter / X -->
          <button
            type="button"
            @click="shareToTwitter"
            class="group flex flex-col items-center gap-1.5 cursor-pointer"
            title="Bagikan ke X / Twitter"
          >
            <div class="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 hover:bg-black dark:hover:bg-white text-stone-900 dark:text-stone-100 hover:text-white dark:hover:text-black flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span class="text-[10px] font-bold text-stone-600 dark:text-stone-300 group-hover:text-theme-primary">X (Twitter)</span>
          </button>

          <!-- Facebook -->
          <button
            type="button"
            @click="shareToFacebook"
            class="group flex flex-col items-center gap-1.5 cursor-pointer"
            title="Bagikan ke Facebook"
          >
            <div class="w-12 h-12 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span class="text-[10px] font-bold text-stone-600 dark:text-stone-300 group-hover:text-theme-primary">Facebook</span>
          </button>

          <!-- Native Device Share / More -->
          <button
            v-if="canNativeShare"
            type="button"
            @click="triggerNativeShare"
            class="group flex flex-col items-center gap-1.5 cursor-pointer"
            title="Opsi Berbagi Lainnya"
          >
            <div class="w-12 h-12 rounded-2xl bg-[#244E33]/15 dark:bg-emerald-500/20 hover:bg-[#244E33] dark:hover:bg-emerald-500 text-forest dark:text-emerald-300 hover:text-white dark:hover:text-stone-950 flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105">
              <svg class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span class="text-[10px] font-bold text-stone-600 dark:text-stone-300 group-hover:text-theme-primary">Lainnya</span>
          </button>
        </div>
      </div>

      <!-- YouTube Style Copy Link Input Box -->
      <div class="space-y-1.5 pt-2">
        <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
          Salin Tautan Produk:
        </span>
        <div class="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-theme-border">
          <input
            type="text"
            readonly
            :value="shareUrl"
            class="flex-1 bg-transparent text-xs font-mono text-theme-primary outline-none select-all truncate"
          />
          <button
            type="button"
            @click="handleCopyLink"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs',
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950'
            ]"
          >
            <IconCheck v-if="isCopied" :size="13" class="stroke-[3]" />
            <IconCopy v-else :size="13" />
            <span>{{ isCopied ? 'Tersalin!' : 'Salin' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
