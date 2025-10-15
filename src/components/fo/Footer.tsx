import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Gajadicair</h3>
            <p className="text-background/80 mb-4">
              Solusi SaaS manajemen SDM dan penggajian yang mengotomatisasi proses HRD Anda.
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="#features" className="hover:text-background transition-colors">Fitur</a></li>
                <li><a href="#pricing" className="hover:text-background transition-colors">Harga</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Kontak</a></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <ul className="space-y-3 text-background/80">
                <li className="flex items-start gap-2">
                  <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>support@gajadicair.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>+62 812-3456-7890</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-background/20 pt-8 text-center text-background/80">
          <p>&copy; {new Date().getFullYear()} GajadiCair. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
