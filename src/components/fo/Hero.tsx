import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import heroImage from "@/assets/images/hero.jpg";


export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Platform SaaS Manajemen SDM Terpercaya
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              Kelola <span className="text-gradient">SDM & Payroll</span> Lebih Mudah
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
              Gajadicair adalah solusi terintegrasi untuk absensi biometrik, manajemen karyawan, 
              dan penggajian otomatis. Hemat waktu administrasi HRD hingga 80%.
            </p>
            <div className="flex flex-col sm:flex-row">
              <Button variant="default" size="xl" className="group">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform -rotate-45" />
              </Button>
            </div>
          </div>
          {/* Right side */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 gradient-primary opacity-20 rounded-3xl blur-3xl" />
            <img 
              src={heroImage} 
              alt="Tim profesional menggunakan Gajadicair untuk manajemen SDM"
              className="relative rounded-3xl shadow-large w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};