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
  IconChevronDown,
  IconStar,
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
            <span class="absolute right-4 text-stone-400 text-xs font-bold">🔍</span>
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
          class="bg-theme-card rounded-2xl border border-theme-border overflow-hidden transition shadow-xs"
        >
          <button
            @click="toggleFaq(faq.id)"
            class="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-theme-primary flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition"
          >
            <div class="space-y-0.5 min-w-0">
              <span class="text-[10px] font-extrabold uppercase text-forest dark:text-forest-glow tracking-wider block">
                {{ faq.categoryLabel }}
              </span>
              <span class="block text-theme-primary font-bold">{{ faq.question }}</span>
            </div>
            <IconChevronDown
              :size="16"
              :class="['text-stone-400 transition-transform duration-200 shrink-0', openFaqIds.includes(faq.id) && 'rotate-180 text-forest']"
            />
          </button>

          <div
            v-if="openFaqIds.includes(faq.id)"
            class="px-4 sm:px-5 pb-5 pt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-theme-border/60 bg-stone-50/30 dark:bg-stone-900/30 animate-fade-in"
          >
            {{ faq.answer }}
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
