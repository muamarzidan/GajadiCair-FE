import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section id="contact" className="pt-30 pb-60">
      <div className="container mx-auto px-4 text-center">
        <div className="relative z-10 animate-fade-up bg-gray-950 p-20 rounded-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2">
            Ready to Transform Your HR Management?
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that have experienced the ease of managing HR and payroll with Gajadicair
          </p>
          <Link to="https://wa.me/+6282334326639" target="_blank" rel="noopener noreferrer">
            <Button 
              variant="secondary" 
              size="lg"
              className="!py-6 font-semibold text-lg"
            >
              Contact Our Sales Team
            </Button>
          </Link>
          <p className="mt-4 text-sm text-white/80">
            No credit card required • Setup in 5 minutes • 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};