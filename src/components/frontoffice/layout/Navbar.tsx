import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";


export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center max-w-32 h-full">
            <Link to="/">
              <img
                src="/icons/logo-gajadicair-white.svg"
                alt="Logo"
                className="object-contain h-10"
              />
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-gray-50">
            <a href="#features" className="hover:text-gray-500 transition-colors duration-300">
              Feature
            </a>
            <a href="#pricing" className="hover:text-gray-500 transition-colors duration-300">
              Pricing
            </a>
            <a href="#contact" className="hover:text-gray-500 transition-colors duration-300">
              Contact
            </a>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="default">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Fitur
              </a>
              <a 
                href="#pricing" 
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Harga
              </a>
              <a 
                href="#" 
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Tentang
              </a>
              <a 
                href="#" 
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Kontak
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full">Masuk</Button>
                <Button variant="default" className="w-full">Coba Gratis</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
