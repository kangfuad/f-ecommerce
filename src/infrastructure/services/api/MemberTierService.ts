import type { ApiResponse } from './ApiResponse'

export interface MemberTierPerk {
  title: string
  desc: string
}

export interface MemberTierDto {
  id: 'STARTER' | 'VERIFIED_GOLD' | 'PRO_STUDIO'
  name: string
  tagline: string
  badge: string
  badgeTheme: 'stone' | 'emerald' | 'purple'
  qualification: string
  depositRequirement: string
  isPopular?: boolean
  perks: MemberTierPerk[]
  howToUpgrade: string
}

export interface MemberTiersData {
  data: MemberTierDto[]
  disclaimer: string
}

export class MemberTierService {
  public static async getMemberTiers(): Promise<ApiResponse<MemberTiersData>> {
    return {
      status: 'success',
      data: {
        data: [
          {
            id: 'STARTER',
            name: 'Starter Member',
            tagline: 'Penyewa Pemula & Komunitas Hobi',
            badge: 'Tier Pemula',
            badgeTheme: 'stone',
            qualification: 'Pendaftaran akun baru & verifikasi nomor WhatsApp.',
            depositRequirement: 'Deposit Jaminan Standar (100% dari nilai unit)',
            perks: [
              { title: 'Sewa Harian Bebas Ribet', desc: 'Akses sewa seluruh unit katalog standar.' },
              { title: 'Jadwal Temu Langsung', desc: 'Serah terima di Hub mitra terdekat.' },
            ],
            howToUpgrade: 'Lakukan verifikasi identitas e-KTP dan selesaikan 1 transaksi sewa.',
          },
          {
            id: 'VERIFIED_GOLD',
            name: 'Verified Gold Member',
            tagline: 'Kreator Terverifikasi & Profesional Lepas',
            badge: 'Terverifikasi Gold',
            badgeTheme: 'emerald',
            isPopular: true,
            qualification: 'Verifikasi KYC Identitas Resmi (KTP/SIM) & Profil Instagram/Portofolio aktif.',
            depositRequirement: 'Potongan Deposit Jaminan hingga 70%',
            perks: [
              { title: 'Prioritas Booking Unit', desc: 'Penyetujuan booking lebih cepat oleh mitra penyedia.' },
              { title: 'Diskon Deposit 70%', desc: 'Uang jaminan jauh lebih ringan.' },
              { title: 'Perpanjangan Mandiri', desc: 'Bisa ajukan tambah hari sewa langsung di aplikasi.' },
            ],
            howToUpgrade: 'Lengkapi data identitas resmi di menu Profil Akun.',
          },
          {
            id: 'PRO_STUDIO',
            name: 'Pro Studio & Corporate',
            tagline: 'Rumah Produksi, Agensi & Perusahaan',
            badge: 'Pro Studio VIP',
            badgeTheme: 'purple',
            qualification: 'Akun legalitas perusahaan / studio resmi dengan track record sewa konsisten.',
            depositRequirement: 'Bebas Deposit / Jaminan PO Resmi Perusahaan',
            perks: [
              { title: 'Zero Deposit (Bebas Jaminan)', desc: 'Cukup gunakan PO resmi perusahaan.' },
              { title: 'Dedicated Account Support', desc: 'Dukungan staf operasional khusus.' },
              { title: 'Invoice Pembayaran Termin', desc: 'Faktur tagihan resmi perpajakan.' },
            ],
            howToUpgrade: 'Hubungi tim operasional kami untuk verifikasi dokumen perusahaan.',
          },
        ],
        disclaimer: 'Tingkatan member dihitung otomatis berdasarkan verifikasi identitas dan reputasi transaksi penyewaan.',
      },
      message: 'Informasi tingkatan keanggotaan berhasil dimuat.',
    }
  }
}
