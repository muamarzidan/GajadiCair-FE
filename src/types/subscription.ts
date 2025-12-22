export interface SubscriptionTransaction {
  company_subscription_id: string;
  company_id: string;
  midtrans_transaction_id: string | null;
  gross_amount: number;
  level_plan: number;
  plan_duration_months: number;
  midtrans_admin_fee: number | null;
  midtrans_status: 'pending' | 'settlement' | 'expire' | 'cancel' | null;
  midtrans_payment_method: string | null;
  midtrans_transaction_token: string;
  midtrans_redirect_url: string;
  midtrans_paid_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateSubscriptionRequest {
  level_plan: number;
}

export interface CreateSubscriptionResponse {
  token: string;
  redirect_url: string;
}

export interface PlanInfo {
  level: number;
  name: string;
  price: number;
  priceLabel: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<number, PlanInfo> = {
  1: {
    level: 1,
    name: 'FREE',
    price: 0,
    priceLabel: 'Gratis',
    features: [
      'Maksimal 5 Karyawan',
      'Manajemen Karyawan Dasar',
      'Login Karyawan (ESS)',
      'Absensi Validasi Standar',
    ],
  },
  2: {
    level: 2,
    name: 'BASIC',
    price: 299000,
    priceLabel: 'Rp 299.000',
    features: [
      'Semua fitur FREE',
      'Maksimal 10 Karyawan',
      'Absensi Validasi Menengah',
      'Cronjob Gaji Otomatis',
    ],
  },
  3: {
    level: 3,
    name: 'PRO',
    price: 799000,
    priceLabel: 'Rp 799.000',
    features: [
      'Semua fitur BASIC',
      'Maksimal 50 Karyawan',
      'Absensi Validasi Lanjut',
      'Potongan Gaji Otomatis',
      'Export Laporan Absensi',
    ],
  }
};
