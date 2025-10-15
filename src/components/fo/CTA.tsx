import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl gradient-hero p-12 lg:p-20 text-center overflow-hidden shadow-large">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 animate-fade-up bg-black p-12 rounded-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Siap Transformasi Manajemen SDM Anda?
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan perusahaan yang telah merasakan kemudahan mengelola SDM dan payroll dengan Gajadicair
            </p>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white hover:bg-black"
            >
              Hubungi Sales
            </Button>
            
            <p className="mt-6 text-sm text-white/80">
              Tidak perlu kartu kredit • Setup dalam 5 menit • Dukungan 24/7
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};