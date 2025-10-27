import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const pricingTiers = [
  {
    name: "FREE",
    price: "Gratis",
    description: "Untuk startup dan tim kecil",
    features: [
      { text: "Maksimal 10 Karyawan", included: true },
      { text: "1 Akun Admin", included: true },
      { text: "Manajemen Karyawan Dasar", included: true },
      { text: "Login Karyawan (ESS)", included: true },
      { text: "Absensi Validasi Standar", included: true },
      { text: "Potongan Gaji Manual", included: true },
      { text: "Cronjob Gaji Otomatis", included: false },
      { text: "Fitur Lembur", included: false },
      { text: "Notifikasi Email", included: false },
      { text: "Slip Gaji Digital", included: false },
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "PRO",
    price: "Rp 299.000",
    period: "/bulan",
    description: "Untuk perusahaan berkembang",
    features: [
      { text: "Maksimal 100 Karyawan", included: true },
      { text: "5 Akun Admin", included: true },
      { text: "Manajemen Karyawan Lengkap", included: true },
      { text: "Login Karyawan (ESS)", included: true },
      { text: "Absensi Validasi Tingkat Lanjut", included: true },
      { text: "Potongan Gaji Otomatis", included: true },
      { text: "Cronjob Gaji Otomatis", included: true },
      { text: "Fitur Lembur (3x Validasi)", included: true },
      { text: "Notifikasi Email Admin", included: true },
      { text: "Slip Gaji Digital (6 Bulan)", included: true },
      { text: "Laporan Absensi Dasar", included: true },
    ],
    cta: "Pilih PRO",
    popular: true,
  },
  {
    name: "ULTRA",
    price: "Rp 799.000",
    period: "/bulan",
    description: "Untuk enterprise dan skala besar",
    features: [
      { text: "Karyawan Tidak Terbatas", included: true },
      { text: "Admin Tidak Terbatas", included: true },
      { text: "Impor/Ekspor Massal", included: true },
      { text: "Login Karyawan (ESS)", included: true },
      { text: "Geofencing Custom", included: true },
      { text: "Aturan Potongan Kustom", included: true },
      { text: "Cronjob Gaji Otomatis", included: true },
      { text: "Fitur Lembur (3x Validasi)", included: true },
      { text: "Notifikasi Email Premium", included: true },
      { text: "Slip Gaji Unlimited", included: true },
      { text: "Dashboard Analitik Lanjut", included: true },
      { text: "Integrasi API", included: true },
      { text: "Dukungan Prioritas 24/7", included: true },
    ],
    cta: "Pilih ULTRA",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Pilih Paket yang <span className="text-gradient">Sesuai Kebutuhan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mulai gratis dan upgrade kapan saja sesuai pertumbuhan perusahaan Anda
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index}
              className={`relative bg-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in ${
                tier.popular ? "ring-2 ring-primary lg:scale-105" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gray-800 text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-medium">
                    Paling Populer
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                <CardDescription className="text-base">{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
              </CardHeader>
              
              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant={tier.popular ? "default" : "default"} 
                  size="lg" 
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
