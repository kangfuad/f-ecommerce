<script setup lang="ts">
import { formatRupiah } from '@/core/utils/currency'
import { IconClose, IconCheck, IconShieldCheck, IconLogo } from '@/presentation/components/icons'

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
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto print:static print:p-0">
    <!-- Backdrop (hidden on print) -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity print-hide"></div>

    <!-- Modal Card Container -->
    <div id="printable-invoice-modal-card" class="relative bg-theme-card text-theme-primary rounded-3xl max-w-3xl w-full max-h-[92vh] my-auto overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 print:bg-white print:text-stone-950 print:border-none print:shadow-none print:p-0">
      
      <!-- Top Action Bar (hidden on print) -->
      <div class="flex flex-wrap items-center justify-between gap-2.5 border-b border-theme-border pb-3 sm:pb-4 print-hide">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] sm:text-[10px] font-black border border-emerald-500/30 uppercase tracking-wide">
            Form Perjanjian Sewa Resmi
          </span>
          <span class="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-mono">#{{ order.id }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handlePrint"
            class="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak / PDF</span>
          </button>

          <button
            type="button"
            @click="emit('close')"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <IconClose :size="13" />
          </button>
        </div>
      </div>

      <!-- Printable Agreement Document Area -->
      <div id="printable-invoice" class="space-y-4 sm:space-y-5 text-xs text-theme-primary print:text-stone-800 leading-relaxed min-w-0">
        
        <!-- Header: Logo & Title -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b border-theme-border print:border-stone-200 pb-3 sm:pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 sm:gap-2.5">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#244E33] text-white flex items-center justify-center shadow-xs shrink-0 print:bg-[#244E33] print:text-white">
                <IconLogo :size="16" />
              </div>
              <h2 class="font-display text-base sm:text-lg font-black text-theme-primary print:text-stone-950">e-punyasewa</h2>
            </div>
            <p class="text-stone-500 dark:text-stone-400 print:text-stone-500 text-[9px] sm:text-[10px] leading-tight">
              Platform Sewa & Rental Perlengkapan Modern Terlengkap<br />
              PT Punya Sewa Indonesia • support@e-punyasewa.id
            </p>
          </div>

          <div class="text-left sm:text-right space-y-0.5 pt-1 sm:pt-0">
            <h3 class="font-black text-xs sm:text-sm text-theme-primary print:text-stone-950 uppercase tracking-wide">
              SURAT PERJANJIAN SEWA & SERAH TERIMA
            </h3>
            <p class="font-mono font-bold text-forest dark:text-forest-glow print:text-emerald-700 text-xs">NO. DOKUMEN: SP-EPS-{{ order.id }}</p>
            <p class="text-stone-500 dark:text-stone-400 print:text-stone-500 text-[9.5px] sm:text-[10px]">
              Tanggal Booking: {{ order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-' }}
            </p>
          </div>
        </div>

        <!-- Identity Section: Pihak Pertama (Penyedia) & Pihak Kedua (Penyewa) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border print:bg-stone-50 print:border-stone-200">
          <!-- Pihak Pertama -->
          <div class="space-y-1">
            <span class="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 uppercase font-black tracking-wider block">
              PIHAK PERTAMA (PENYEDIA SEWA):
            </span>
            <p class="font-extrabold text-theme-primary print:text-stone-900 text-xs">{{ order.provider?.name || 'Mitra Penyedia Sewa' }}</p>
            <p class="text-stone-600 dark:text-stone-300 print:text-stone-600 text-[10.5px] sm:text-[11px]">{{ order.provider?.address || 'Lokasi Hub Resmi Penyedia' }}</p>
            <p class="text-stone-500 text-[10.5px] sm:text-[11px]">Kontak / WA: {{ order.provider?.phone || '-' }}</p>
          </div>

          <!-- Pihak Kedua -->
          <div class="space-y-1 sm:border-l sm:border-theme-border sm:pl-3 print:border-stone-200 pt-2 sm:pt-0 border-t sm:border-t-0">
            <span class="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 uppercase font-black tracking-wider block">
              PIHAK KEDUA (PENYEWA / TENANT):
            </span>
            <p class="font-extrabold text-theme-primary print:text-stone-900 text-xs">{{ order.customer?.fullName || '-' }}</p>
            <p class="text-stone-600 dark:text-stone-300 print:text-stone-600 text-[10.5px] sm:text-[11px]">{{ order.customer?.deliveryAddress || 'Sesuai Data Domisili Terverifikasi' }}</p>
            <p class="text-stone-500 text-[10.5px] sm:text-[11px]">WA: {{ order.customer?.phone || '-' }} • Email: {{ order.customer?.email || '-' }}</p>
          </div>
        </div>

        <!-- Meetup & Transaction Schedule Info -->
        <div class="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 print:bg-stone-50 print:border-stone-200 space-y-1.5">
          <span class="text-[9px] sm:text-[10px] font-black text-emerald-800 dark:text-emerald-300 print:text-stone-800 uppercase tracking-wider block">
            JADWAL & TEMPAT SERAH TERIMA TRANSAKSI:
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] sm:text-[11px]">
            <div>
              <span class="text-stone-500 block text-[9.5px]">Waktu Temu:</span>
              <strong class="text-theme-primary print:text-stone-900">{{ order.meetup?.scheduleDate || '-' }} • {{ order.meetup?.scheduleTime || '-' }}</strong>
            </div>
            <div class="sm:col-span-2">
              <span class="text-stone-500 block text-[9.5px]">Lokasi Serah Terima:</span>
              <strong class="text-theme-primary print:text-stone-900">{{ order.meetup?.locationName || '-' }}</strong>
              <p class="text-[9.5px] sm:text-[10px] text-stone-500">{{ order.meetup?.locationAddress || '' }}</p>
            </div>
          </div>
        </div>

        <!-- Items Table / Responsive Item Cards on Mobile -->
        <div>
          <span class="text-[9px] sm:text-[10px] font-black text-stone-500 uppercase tracking-wider block mb-1.5">
            RINCIAN UNIT PERLENGKAPAN SEWA:
          </span>
          
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[420px] sm:min-w-full">
              <thead>
                <tr class="border-b border-theme-border print:border-stone-200 text-stone-400 dark:text-stone-400 text-[9.5px] sm:text-[10px] uppercase font-bold">
                  <th class="py-1.5">Item Perlengkapan</th>
                  <th class="py-1.5 text-center">Qty</th>
                  <th class="py-1.5 text-center">Durasi</th>
                  <th class="py-1.5 text-right">Tarif / Hari</th>
                  <th class="py-1.5 text-right">Total Estimasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-theme-border print:divide-stone-200 text-[10.5px] sm:text-[11px]">
                <tr v-for="(item, idx) in order.items" :key="idx" class="print:text-stone-900">
                  <td class="py-2 pr-2">
                    <p class="font-extrabold text-theme-primary print:text-stone-950">{{ item.productName }}</p>
                    <p class="text-[9.5px] sm:text-[10px] text-stone-500">Periode: {{ item.startDate }} s/d {{ item.endDate }}</p>
                  </td>
                  <td class="py-2 text-center font-mono">{{ item.quantity }}</td>
                  <td class="py-2 text-center font-mono">{{ item.rentalDays }} Hari</td>
                  <td class="py-2 text-right font-mono">{{ formatRupiah(item.dailyRate) }}</td>
                  <td class="py-2 text-right font-mono font-bold text-forest dark:text-forest-glow print:text-stone-950">
                    {{ formatRupiah(item.totalAmount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Price Summary & Settlement Notice -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 pt-2 border-t border-theme-border print:border-stone-200">
          <div class="text-[9.5px] sm:text-[10px] text-stone-500 space-y-0.5 max-w-sm">
            <p class="font-bold text-theme-primary print:text-stone-900">Keterangan Pembayaran:</p>
            <p>Biaya sewa dibayarkan langsung secara tunai/transfer saat serah terima unit di lokasi.</p>
          </div>
          <div class="w-full sm:w-64 space-y-1 text-right pt-1 sm:pt-0">
            <div class="flex justify-between text-theme-primary print:text-stone-950 font-black text-xs sm:text-sm pt-1 border-t border-theme-border print:border-stone-300">
              <span>Total Biaya Sewa:</span>
              <span class="font-mono text-forest dark:text-forest-glow print:text-emerald-700 font-black">
                {{ formatRupiah(order.pricing?.grandTotal || order.pricing?.subtotalRental || 0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 5 Clauses T&C -->
        <div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-theme-border print:bg-stone-50 print:border-stone-200 space-y-1 text-[9px] sm:text-[9.5px] leading-relaxed text-stone-600 dark:text-stone-300 print:text-stone-600">
          <p class="font-bold text-theme-primary print:text-stone-900 uppercase text-[9.5px]">KLAUSUL SYARAT & KETENTUAN (T&C) SEWA RESMI:</p>
          <ol class="list-decimal pl-4 space-y-0.5">
            <li>Unit diserahkan dalam kondisi fisik dan fungsi normal setelah dilakukan uji fungsi (QC) bersama di lokasi.</li>
            <li>Penyewa wajib menjaga keutuhan, kebersihan, dan keselamatan unit selama seluruh masa sewa berlangsung.</li>
            <li>Kerusakan akibat kelalaian operasional menjadi tanggung jawab penyewa sesuai biaya servis / perbaikan resmi.</li>
            <li>Pengembalian unit wajib tepat waktu sesuai jadwal. Keterlambatan tanpa konfirmasi dikenakan tarif prorata harian normal.</li>
            <li>Surat perjanjian ini sah dan mengikat secara hukum bagi kedua belah pihak sejak ditandatangani saat serah terima.</li>
          </ol>
        </div>

        <!-- Signature Boxes (Compact on Mobile, A4 aligned on Print) -->
        <div class="grid grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-3 text-center text-xs">
          <!-- Pihak Pertama Signature -->
          <div class="space-y-6 sm:space-y-8">
            <p class="text-[9px] sm:text-[10px] text-stone-500 font-bold uppercase">PIHAK PERTAMA (PENYEDIA)</p>
            <div class="h-10 sm:h-14 flex items-center justify-center">
              <span v-if="order.signedAgreementUrl" class="text-[9.5px] sm:text-[10px] text-emerald-600 font-bold italic">[Tertanda Tangan Resmi]</span>
              <span v-else class="text-[9.5px] sm:text-[10px] text-stone-400 italic">(Tanda Tangan / Cap)</span>
            </div>
            <div class="border-t border-stone-400 dark:border-stone-600 pt-1">
              <p class="font-extrabold text-[11px] sm:text-xs text-theme-primary print:text-stone-900 truncate">{{ order.provider?.name || 'Mitra Penyedia Sewa' }}</p>
            </div>
          </div>

          <!-- Pihak Kedua Signature -->
          <div class="space-y-6 sm:space-y-8">
            <p class="text-[9px] sm:text-[10px] text-stone-500 font-bold uppercase">PIHAK KEDUA (PENYEWA)</p>
            <div class="h-10 sm:h-14 flex items-center justify-center">
              <span v-if="order.signedAgreementUrl" class="text-[9.5px] sm:text-[10px] text-emerald-600 font-bold italic">[Tertanda Tangan Resmi]</span>
              <span v-else class="text-[9.5px] sm:text-[10px] text-stone-400 italic">(Tanda Tangan / Paraf)</span>
            </div>
            <div class="border-t border-stone-400 dark:border-stone-600 pt-1">
              <p class="font-extrabold text-[11px] sm:text-xs text-theme-primary print:text-stone-900 truncate">{{ order.customer?.fullName || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Footer Notice -->
        <div class="border-t border-theme-border print:border-stone-200 pt-2.5 text-[8.5px] sm:text-[9px] text-stone-400 text-center leading-relaxed">
          <p>Dokumen bukti sewa dan kesepakatan resmi diterbitkan secara elektronik oleh platform e-punyasewa.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden !important;
  }
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
    margin: 0 !important;
    padding: 15px !important;
    background: #ffffff !important;
    color: #1c1917 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
  }
  .print-hide {
    display: none !important;
  }
}
</style>
