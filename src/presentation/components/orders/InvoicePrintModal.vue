<script setup lang="ts">
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import { formatRupiah } from '@/core/utils/currency'
import { IconClose, IconCheck, IconShieldCheck } from '@/presentation/components/icons'

interface Props {
  order: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handlePrint() {
  if (typeof window !== 'undefined') {
    window.print()
  }
}
</script>

<template>
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:p-0">
    <!-- Backdrop (hidden on print) -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity print-hide"></div>

    <!-- Modal Card Container -->
    <div id="printable-invoice-modal-card" class="relative bg-white text-stone-900 rounded-3xl max-w-2xl w-full max-h-[92vh] my-auto overflow-y-auto custom-scrollbar shadow-2xl border border-stone-200 z-10 animate-fade-up p-6 sm:p-8 space-y-6">
      
      <!-- Top Action Bar (hidden on print) -->
      <div class="flex items-center justify-between border-b border-stone-200 pb-4 print-hide">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
            INVOICE RESMI
          </span>
          <span class="text-xs text-stone-500 font-mono">#{{ order.id }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handlePrint"
            class="px-4 py-2 rounded-full bg-[#244E33] hover:bg-[#1B3B26] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak / Unduh PDF</span>
          </button>

          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
          >
            <IconClose :size="14" />
          </button>
        </div>
      </div>

      <!-- Printable Invoice Area -->
      <div id="printable-invoice" class="space-y-6 text-xs text-stone-800">
        
        <!-- Company & Invoice Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-5">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-[#244E33] text-white flex items-center justify-center font-bold text-sm">
                EPS
              </div>
              <h2 class="font-display text-xl font-black text-stone-950">e-punyasewa</h2>
            </div>
            <p class="text-stone-500 text-[11px] leading-relaxed">
              PT Punya Sewa Sinema Indonesia<br />
              Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan<br />
              support@e-punyasewa.id • +62 812-3456-7890
            </p>
          </div>

          <div class="text-left sm:text-right space-y-1">
            <h3 class="font-mono font-black text-base text-stone-950">INVOICE SEWA</h3>
            <p class="font-mono font-bold text-emerald-700">INV-EPS-{{ order.id }}</p>
            <p class="text-stone-500 text-[11px]">Tanggal: {{ order.createdAt }}</p>
            <span
              :class="[
                'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mt-1',
                order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              ]"
            >
              {{ order.paymentStatus === 'PAID' ? 'LUNAS (TERVERIFIKASI)' : 'MENUNGGU PEMBAYARAN' }}
            </span>
          </div>
        </div>

        <!-- Renter & Shipping Information -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div class="space-y-1">
            <span class="text-stone-400 font-bold uppercase text-[10px] block">Informasi Penyewa:</span>
            <p class="font-black text-stone-950 text-sm">{{ order.customer?.fullName }}</p>
            <p class="text-stone-600">{{ order.customer?.phone }}</p>
            <p class="text-stone-500 text-[11px]">{{ order.customer?.email }}</p>
          </div>

          <div class="space-y-1">
            <span class="text-stone-400 font-bold uppercase text-[10px] block">Jadwal & Metode Pengiriman:</span>
            <p class="font-bold text-stone-950">
              {{ order.items[0]?.startDate }} s/d {{ order.items[0]?.endDate }} ({{ order.items[0]?.rentalDays || 1 }} Hari)
            </p>
            <p class="text-stone-600 font-medium">
              {{ order.customer?.deliveryMethod === 'DELIVERY' ? 'Kurir Dedicated e-punyasewa' : 'Ambil Sendiri di Hub Rental' }}
            </p>
            <p class="text-stone-500 text-[11px] line-clamp-1">
              {{ order.customer?.deliveryAddress || order.customer?.pickupHub || 'Hub Rental Jakarta' }}
            </p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-stone-200 text-stone-400 uppercase text-[10px] font-black">
                <th class="py-2.5 px-2">No</th>
                <th class="py-2.5 px-2">Perlengkapan Sewa</th>
                <th class="py-2.5 px-2 text-center">Jml</th>
                <th class="py-2.5 px-2 text-center">Durasi</th>
                <th class="py-2.5 px-2 text-right">Tarif / Hari</th>
                <th class="py-2.5 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="(item, idx) in order.items" :key="idx" class="text-stone-800">
                <td class="py-3 px-2 font-mono text-stone-400">{{ Number(idx) + 1 }}</td>
                <td class="py-3 px-2">
                  <strong class="font-bold block text-stone-950">{{ item.productName }}</strong>
                  <span class="text-[10px] text-stone-500 font-normal">Kondisi: Siap Pakai (QC Tested 100%)</span>
                </td>
                <td class="py-3 px-2 text-center font-bold">{{ item.quantity }}x</td>
                <td class="py-3 px-2 text-center text-stone-600">{{ item.rentalDays }} Hari</td>
                <td class="py-3 px-2 text-right font-mono">{{ formatRupiah(item.dailyRate) }}</td>
                <td class="py-3 px-2 text-right font-mono font-bold text-stone-950">
                  {{ formatRupiah(item.totalAmount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Financial Summary Breakdown -->
        <div class="border-t-2 border-stone-200 pt-4 flex flex-col sm:flex-row justify-between gap-4">
          <div class="space-y-1.5 max-w-xs">
            <div class="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <IconCheck :size="12" class="stroke-[3] text-emerald-600" />
              <span>Bebas Deposit Rp 0 (Member KYC)</span>
            </div>
            <p class="text-[10px] text-stone-400">
              Metode Pembayaran: <strong class="text-stone-700 uppercase">{{ order.paymentMethod || 'QRIS Instant' }}</strong>
            </p>
          </div>

          <div class="space-y-1.5 sm:w-64">
            <div class="flex justify-between text-stone-600">
              <span>Subtotal Sewa Unit:</span>
              <span class="font-mono font-medium">{{ formatRupiah(order.pricing?.subtotalRental || 0) }}</span>
            </div>
            <div v-if="order.pricing?.deliveryFee" class="flex justify-between text-stone-600">
              <span>Biaya Pengantaran:</span>
              <span class="font-mono font-medium">{{ formatRupiah(order.pricing.deliveryFee) }}</span>
            </div>
            <div class="flex justify-between text-emerald-700 font-semibold">
              <span>Jaminan Deposit:</span>
              <span class="font-mono">Rp 0</span>
            </div>
            <div class="flex justify-between text-stone-950 font-black text-sm border-t border-stone-200 pt-2">
              <span>Total Pembayaran:</span>
              <span class="font-mono text-emerald-700">{{ formatRupiah(order.pricing?.grandTotal || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Notes & Legal Verification -->
        <div class="border-t border-stone-200 pt-4 text-[10px] text-stone-400 text-center leading-relaxed">
          <p>Dokumen ini adalah bukti transaksi dan sewa resmi yang diterbitkan secara elektronik oleh sistem e-punyasewa.</p>
          <p>Terima kasih atas kepercayaan Anda menyewa perlengkapan sinematografi bersama e-punyasewa.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 15mm;
  }

  /* Hide entire background app & all elements by default */
  html, body {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #1c1917 !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden !important;
  }

  /* Hide app header, footer, floating buttons, toasts, pwa banners */
  header,
  footer,
  nav,
  aside,
  .floating-theme-toggle,
  .pwa-install-prompt,
  .pwa-offline-banner,
  .toast-container,
  .print-hide {
    display: none !important;
    visibility: hidden !important;
  }

  /* Make ONLY the printable invoice modal and its children visible */
  #printable-invoice-modal-card,
  #printable-invoice-modal-card * {
    visibility: visible !important;
  }

  #printable-invoice-modal-card {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: #ffffff !important;
    color: #1c1917 !important;
    z-index: 999999 !important;
    overflow: visible !important;
  }
}
</style>
