import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


const pricingTiers = [
  {
    name: "FREE",
    price: "Gratis",
    description: "Untuk startup dan tim kecil",
    features: [
      { text: "Maksimal 5 Karyawan", included: true },
      { text: "Manajemen Karyawan Dasar", included: true },
      { text: "Login Karyawan (ESS)", included: true },
      { text: "Absensi Validasi Standar", included: true },
    ],
    cta: "Start Now",
    popular: false,
  },
  {
    name: "BASIC",
    price: "Rp 299.000",
    period: "/bulan",
    description: "Untuk perusahaan berkembang",
    features: [
      { text: "Semua fitur FREE", included: true },
      { text: "Maksimal 10 Karyawan", included: true },
      { text: "Absensi Validasi Menengah", included: true },
      { text: "Cronjob Gaji Otomatis", included: true },
    ],
    cta: "Choose BASIC",
    popular: true,
  },
  {
    name: "PRO",
    price: "Rp 799.000",
    period: "/bulan",
    description: "Untuk enterprise dan skala besar",
    features: [
      { text: "Karyawan Tidak Terbatas", included: true },
      { text: "Absensi Validasi Lanjut", included: true },
      { text: "Potongan Gaji Otomatis", included: true },
      { text: "Export Laporan Absensi", included: true },
      // { text: "Fitur Lembur (3x Validasi)", included: true },
      { text: "Dukungan Prioritas 24/7", included: true },
    ],
    cta: "Choose PRO",
    popular: false,
  },
];

export const Pricing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate('/login');
  };

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Choose a Package
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free and upgrade anytime as your company grows.
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
                  <span className="bg-gray-800 text-primary-foreground px-4 py-1 rounded-full text-xl font-bold shadow-medium">
                    Most Populer
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
                  className="w-full !py-6"
                  onClick={handleSelectPlan}
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