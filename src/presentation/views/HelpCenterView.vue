<script setup lang="ts">
import { APP_CONFIG } from '@/core/config/app.config'
import { useFaq } from '@/presentation/composables/useFaq'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import {
  IconShieldCheck,
  IconCheck,
  IconLocation,
  IconDeliveryTruck,
  IconBoxPackage,
  IconCalendarDate,
  IconArrowRight,
  IconChevronDown,
  IconStar,
  IconSearch,
} from '@/presentation/components/icons'

const {
  isLoading,
  errorMessage,
  searchQuery,
  selectedCategory,
  openFaqIds,
  loadFaqs,
  toggleFaq,
  filteredFaqs,
} = useFaq()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      
      <!-- Hero Header -->
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-[11px] font-extrabold uppercase tracking-widest text-forest dark:text-forest-glow">
          Pusat Bantuan & Panduan
        </span>
        <h1 class="font-display text-3xl sm:text-4xl font-black text-theme-primary tracking-tight">
          Ada yang Bisa Kami Bantu?
        </h1>
        <p class="text-xs sm:text-sm text-stone-500 leading-relaxed">
          Temukan jawaban seputar tata cara sewa, garansi pengembalian deposit 100%, klaim proteksi asuransi, hingga lokasi hub penyerahan unit.
        </p>

        <!-- Search Bar -->
        <div class="pt-2 max-w-lg mx-auto">
          <div class="relative flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari pertanyaan (contoh: deposit, perpanjangan, asuransi)..."
              class="w-full bg-theme-card border border-theme-border rounded-full pl-5 pr-12 py-3 text-xs font-medium text-theme-primary shadow-md focus:outline-none focus:ring-2 focus:ring-forest"
            />
            <IconSearch :size="16" class="absolute right-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <!-- Quick Category Filters -->
      <div class="flex items-center justify-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          @click="selectedCategory = 'ALL'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'ALL'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Semua Topik
        </button>

        <button
          @click="selectedCategory = 'PROSEDUR'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'PROSEDUR'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Alur & Prosedur
        </button>

        <button
          @click="selectedCategory = 'DEPOSIT'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'DEPOSIT'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Deposit & Refund
        </button>

        <button
          @click="selectedCategory = 'ASURANSI'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'ASURANSI'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Asuransi Proteksi
        </button>

        <button
          @click="selectedCategory = 'PENGANTARAN'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'PENGANTARAN'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Kurir & Titik Hub
        </button>
      </div>

      <!-- FAQ Accordion List -->
      <div class="space-y-3 max-w-3xl mx-auto">
        <!-- Loading State Skeleton -->
        <div v-if="isLoading" class="space-y-3">
          <div
            v-for="n in 4"
            :key="n"
            class="bg-theme-card rounded-2xl border border-theme-border p-5 animate-pulse space-y-2"
          >
            <div class="h-3 w-28 bg-stone-200 dark:bg-stone-800 rounded"></div>
            <div class="h-4 w-3/4 bg-stone-200 dark:bg-stone-800 rounded"></div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="errorMessage"
          class="text-center py-12 bg-theme-card rounded-3xl border border-rose-500/30 p-8 space-y-3"
        >
          <p class="font-bold text-rose-600 dark:text-rose-400 text-sm">{{ errorMessage }}</p>
          <button
            @click="loadFaqs"
            class="px-5 py-2 bg-forest text-white rounded-full text-xs font-bold cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredFaqs.length === 0"
          class="text-center py-12 bg-theme-card rounded-3xl border border-theme-border p-8"
        >
          <p class="font-bold text-theme-primary text-sm">Tidak ada pertanyaan yang cocok</p>
          <p class="text-xs text-stone-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>

        <!-- FAQ Items -->
        <div
          v-else
          v-for="faq in filteredFaqs"
          :key="faq.id"
          class="bg-theme-card rounded-3xl border border-theme-border overflow-hidden transition-all duration-200 shadow-sm hover:border-forest/40"
        >
          <button
            @click="toggleFaq(faq.id)"
            class="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition group"
          >
            <div class="space-y-2 min-w-0 pr-2">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-forest-glow border border-forest/20">
                  {{ faq.categoryLabel }}
                </span>
                <span v-if="faq.isPopular" class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <IconStar :size="10" class="fill-current" />
                  <span>Populer</span>
                </span>
              </div>
              <h3 class="font-display font-extrabold text-sm sm:text-base md:text-lg text-theme-primary leading-snug tracking-tight">
                {{ faq.question }}
              </h3>
            </div>
            
            <div
              :class="[
                'w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-theme-border flex items-center justify-center shrink-0 transition-all duration-300',
                openFaqIds.includes(faq.id)
                  ? 'bg-forest text-white border-forest rotate-180 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:border-forest/40 group-hover:text-forest'
              ]"
            >
              <IconChevronDown :size="16" />
            </div>
          </button>

          <!-- Expanded Answer Section -->
          <div
            v-if="openFaqIds.includes(faq.id)"
            class="px-5 sm:px-8 py-6 sm:py-7 border-t border-theme-border/70 bg-stone-50/70 dark:bg-stone-900/60 space-y-4 animate-fade-in text-theme-primary"
          >
            <!-- Main Answer Text -->
            <p class="text-xs sm:text-sm md:text-[15px] leading-relaxed text-stone-700 dark:text-stone-300 font-normal">
              {{ faq.answer }}
            </p>

            <!-- Step by Step List (If available) -->
            <div v-if="faq.steps && faq.steps.length > 0" class="space-y-2.5 pt-1">
              <div
                v-for="(step, idx) in faq.steps"
                :key="idx"
                class="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300"
              >
                <span class="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-xs">
                  {{ idx + 1 }}
                </span>
                <span class="pt-0.5">{{ step }}</span>
              </div>
            </div>

            <!-- Key Points Bullet List (If available) -->
            <div v-if="faq.keyPoints && faq.keyPoints.length > 0" class="space-y-2 pt-1">
              <div
                v-for="(point, idx) in faq.keyPoints"
                :key="idx"
                class="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300"
              >
                <IconCheck :size="16" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
                <span>{{ point }}</span>
              </div>
            </div>

            <!-- Helpful Callout Tip Box (If available) -->
            <div
              v-if="faq.tip"
              class="mt-3 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5"
            >
              <IconShieldCheck :size="18" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
              <div class="leading-relaxed font-medium">
                <strong class="font-extrabold block text-forest dark:text-emerald-300 mb-0.5">Catatan Penting:</strong>
                {{ faq.tip }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support Banner -->
      <div class="bg-gradient-to-br from-stone-900 to-[#14261B] text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="space-y-1 text-center sm:text-left">
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Butuh Bantuan Langsung?
          </span>
          <h3 class="font-display text-lg sm:text-xl font-extrabold text-white">
            Konsultasikan dengan Tim Support Kami
          </h3>
          <p class="text-xs text-stone-400">
            Layanan Customer Care siap menjawab pertanyaan seputar ketersediaan unit dan jadwal syuting Anda.
          </p>
        </div>

        <a
          :href="`https://wa.me/${APP_CONFIG.SUPPORT_PHONE.replace(/[^0-9]/g, '')}?text=Halo%20CS%20e-punyasewa,%20saya%20ingin%20bertanya%20seputar%20sewa%20unit`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 font-black text-xs rounded-full shadow-md transition shrink-0 cursor-pointer"
        >
          <span>Chat WhatsApp Resmi</span>
          <IconArrowRight :size="14" />
        </a>
      </div>

    </main>

    <AppFooter />
  </div>
</template>
