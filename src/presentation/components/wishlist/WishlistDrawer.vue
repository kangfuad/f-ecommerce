<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlist } from '@/presentation/composables/useWishlist'
import { useCart } from '@/presentation/composables/useCart'
import { useAuth } from '@/presentation/composables/useAuth'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { useImageLightbox } from '@/presentation/composables/useImageLightbox'
import { Product } from '@/domain/entities/Product'
import {
  IconHeartWishlist,
  IconClose,
  IconCartBag,
  IconCheck,
  IconTrash,
  IconStar,
  IconLocation,
  IconArrowRight,
} from '@/presentation/components/icons'

const router = useRouter()
const {
  wishlistProducts,
  isWishlistOpen,
  closeWishlist,
  removeWishlist,
  clearWishlist,
} = useWishlist()

const { quickAddToCart, openCart } = useCart()
const { isLoggedIn, openLoginModal } = useAuth()
const { openLightbox } = useImageLightbox()

// Lock background scroll when drawer is open
useBodyScrollLock(isWishlistOpen)

const addedProductId = ref<string | null>(null)

async function handleAddToCart(product: Product) {
  if (!isLoggedIn.value) {
    openLoginModal()
    return
  }
  try {
    closeWishlist()
    await quickAddToCart(product)
    openCart()
  } catch (e) {
    console.error('Failed to add wishlist item to cart:', e)
  }
}

function handleExploreCatalog() {
  closeWishlist()
  router.push('/katalog')
}

function handleOpenImage(images: string[], title: string, index: number = 0) {
  openLightbox(images, title, index)
}
</script>

<template>
  <div>
    <!-- Backdrop -->
    <div
      v-if="isWishlistOpen"
      @click="closeWishlist"
      class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity"
    ></div>

    <!-- Drawer Panel -->
    <div
      :class="[
        'fixed inset-y-0 right-0 max-w-md w-full bg-theme-card z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-theme-border text-theme-primary',
        isWishlistOpen ? 'translate-x-0' : 'translate-x-full',
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-theme-border">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-terracotta/15 flex items-center justify-center text-terracotta">
            <IconHeartWishlist :size="18" :filled="true" />
          </div>
          <div>
            <h2 class="font-bold text-base text-theme-primary">Daftar Favorit</h2>
            <p class="text-xs text-stone-500">{{ wishlistProducts.length }} unit tersimpan</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="wishlistProducts.length > 0"
            @click="clearWishlist"
            class="text-[11px] font-bold text-stone-400 hover:text-red-500 hover:underline px-2 py-1 transition cursor-pointer"
            title="Hapus semua barang favorit"
          >
            Kosongkan
          </button>
          <button
            @click="closeWishlist"
            class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-theme-primary hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
            aria-label="Tutup Wishlist"
          >
            <IconClose :size="16" />
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
        <!-- Empty State -->
        <div
          v-if="wishlistProducts.length === 0"
          class="h-full flex flex-col items-center justify-center text-center py-12 space-y-4 text-theme-primary animate-fade-up"
        >
          <div class="w-16 h-16 rounded-full bg-terracotta/10 border-2 border-dashed border-terracotta/30 flex items-center justify-center text-terracotta">
            <IconHeartWishlist :size="28" :filled="false" />
          </div>
          <div class="space-y-1 max-w-xs">
            <h3 class="font-extrabold text-base text-theme-primary">Belum Ada Unit Favorit</h3>
            <p class="text-xs text-stone-500 leading-relaxed">
              Tandai unit yang Anda minati dengan menekan tombol hati untuk membandingkan atau menyewa di waktu mendatang.
            </p>
          </div>
          <button
            @click="handleExploreCatalog"
            class="inline-flex items-center gap-2 bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black px-5 py-2.5 rounded-full shadow-sm transition cursor-pointer"
          >
            <span>Jelajahi Katalog Unit</span>
            <IconArrowRight :size="13" />
          </button>
        </div>

        <!-- Wishlist Items List -->
        <div v-else class="space-y-3">
          <div
            v-for="product in wishlistProducts"
            :key="product.id"
            class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border flex gap-3.5 items-start group relative transition-all hover:border-forest/40"
          >
            <!-- Thumbnail Image -->
            <div
              @click="handleOpenImage(product.images, product.name, 0)"
              class="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-theme-border cursor-zoom-in"
              title="Klik untuk perbesar gambar"
            >
              <img
                :src="product.primaryImage"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <!-- Product Details -->
            <div class="flex-1 min-w-0 space-y-1.5">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-1 text-[10px] text-amber-500 font-bold mb-0.5">
                    <IconStar :size="11" />
                    <span>{{ product.rating }}</span>
                    <span class="text-stone-400 font-normal">({{ product.reviewCount }})</span>
                  </div>
                  <h4 class="font-bold text-xs sm:text-sm text-theme-primary truncate max-w-[180px] sm:max-w-[210px]">
                    {{ product.name }}
                  </h4>
                </div>

                <!-- Remove Button -->
                <button
                  @click="removeWishlist(product.id)"
                  class="text-stone-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                  title="Hapus dari favorit"
                >
                  <IconTrash :size="14" />
                </button>
              </div>

              <!-- Price & Actions -->
              <div class="flex items-center justify-between pt-1">
                <div>
                  <span class="text-[10px] text-stone-400 uppercase font-bold block">Tarif Sewa</span>
                  <p class="font-black text-xs sm:text-sm text-forest dark:text-forest-glow">
                    {{ product.dailyRate.format() }}<span class="text-[10px] font-normal text-stone-500">/hari</span>
                  </p>
                </div>

                <!-- Add to Cart Button -->
                <button
                  @click="handleAddToCart(product)"
                  :class="[
                    'inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs transition-all duration-300 cursor-pointer',
                    addedProductId === product.id
                      ? 'bg-emerald-600 text-white scale-105 shadow-sm'
                      : 'bg-[#244E33] hover:bg-[#1B3B26] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-stone-950'
                  ]"
                >
                  <IconCheck v-if="addedProductId === product.id" :size="12" class="animate-bounce" />
                  <IconCartBag v-else :size="12" />
                  <span>{{ addedProductId === product.id ? 'Masuk' : '+ Keranjang' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div v-if="wishlistProducts.length > 0" class="p-4 border-t border-theme-border bg-stone-50 dark:bg-stone-900/50">
        <button
          @click="handleExploreCatalog"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer"
        >
          <span>Eksplorasi Seluruh Unit di Katalog</span>
          <IconArrowRight :size="13" />
        </button>
      </div>
    </div>
  </div>
</template>
