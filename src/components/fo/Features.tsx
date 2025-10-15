import { Card, CardContent } from "@/components/ui/card";
import { Scan, Users, Coins, Clock, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Absensi Biometrik Cerdas",
    description: "Validasi wajah, mimik, dan gerakan tangan untuk mencegah kecurangan. Dilengkapi geolokasi untuk kontrol area kerja.",
  },
  {
    icon: Users,
    title: "Manajemen Karyawan",
    description: "CRUD lengkap data karyawan dengan portal self-service untuk akses informasi pribadi dan riwayat absensi.",
  },
  {
    icon: Coins,
    title: "Payroll Otomatis",
    description: "Cronjob bulanan menghitung gaji, tunjangan, potongan, dan lembur secara otomatis. Slip gaji digital tersedia untuk karyawan.",
  },
  {
    icon: Clock,
    title: "Lembur Tervalidasi",
    description: "Sistem lembur dengan 3x validasi gambar biometrik. Perhitungan jam lembur otomatis terintegrasi dengan gaji.",
  },
  {
    icon: Shield,
    title: "Keamanan Tingkat Tinggi",
    description: "Akses multi-level dengan enkripsi data. Admin dan karyawan memiliki portal terpisah sesuai hak akses.",
  },
  {
    icon: Zap,
    title: "Notifikasi Real-time",
    description: "Email otomatis untuk admin saat proses gaji selesai dan potongan terjadi. Karyawan dapat notifikasi slip gaji.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Fitur Lengkap untuk <span className="text-gradient">Manajemen SDM</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola karyawan dan penggajian dalam satu platform terintegrasi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
