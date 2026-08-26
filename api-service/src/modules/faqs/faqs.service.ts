import { Injectable } from '@nestjs/common';

export interface FaqItem {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answer: string;
  steps?: string[];
}

@Injectable()
export class FaqsService {
  private readonly faqs: FaqItem[] = [
    {
      id: 'faq-01',
      category: 'PROSEDUR',
      categoryLabel: 'Alur & Prosedur Rental',
      question: 'Bagaimana alur dan prosedur booking sewa di e-punyasewa?',
      answer:
        'Proses penyewaan unit di platform e-punyasewa dirancang serba cepat, aman, dan transparan melalui serangkaian tahapan praktis:',
      steps: [
        'Pilih unit perlengkapan di katalog produk.',
        'Tentukan jadwal mulai dan selesai sewa sesuai durasi proyek.',
        'Pilih lokasi serah terima transaksi (Hub Mitra atau titik temu yang disepakati).',
        'Ajukan booking ke mitra penyedia sewa.',
        'Serah terima unit di lokasi, uji QC bersama, tanda tangan formulir sewa SP-EPS, dan selesaikan pembayaran langsung.',
      ],
    },
    {
      id: 'faq-02',
      category: 'VERIFIKASI',
      categoryLabel: 'Persyaratan & Verifikasi Akun',
      question: 'Dokumen apa saja yang diperlukan untuk verifikasi akun penyewa?',
      answer:
        'Penyewa wajib melengkapi profil dengan data identitas sah (e-KTP/SIM/Paspor), nomor WhatsApp aktif, kontak darurat, serta akun sosial media / portofolio profesional untuk mempercepat persetujuan booking oleh mitra penyedia.',
    },
    {
      id: 'faq-03',
      category: 'PEMBAYARAN_DEPOSIT',
      categoryLabel: 'Pembayaran & Uang Jaminan (Deposit)',
      question: 'Bagaimana sistem pembayaran dan deposit unit rental?',
      answer:
        'Pembayaran sewa dan deposit keamanan (bila ada) diselesaikan langsung saat proses serah terima dan inspeksi QC unit di lokasi. Bukti kuitansi resmi (bill) akan diunggah oleh mitra penyedia langsung ke sistem aplikasi.',
    },
    {
      id: 'faq-04',
      category: 'PERPANJANGAN',
      categoryLabel: 'Perpanjangan Durasi Sewa',
      question: 'Apakah durasi sewa dapat diperpanjang di tengah masa sewa?',
      answer:
        'Ya, penyewa dapat mengajukan perpanjangan durasi sewa (+N hari) secara mandiri melalui menu Riwayat Pesanan pada unit yang berstatus aktif, sebelum masa sewa berakhir.',
    },
  ];

  findAll(): FaqItem[] {
    return this.faqs;
  }
}
