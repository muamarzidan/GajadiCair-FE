import { Navbar } from "@/components/frontoffice/layout/Navbar";
import { Features } from "@/components/frontoffice/Features";
import { Benefits } from "@/components/frontoffice/Benefit";
import { Pricing } from "@/components/frontoffice/Pricing";
import { CTA } from "@/components/frontoffice/CTA";
import { Footer } from "@/components/frontoffice/layout/Footer";
import HeroBackground from "@/components/frontoffice/Hero";


const HomePage = () => {
    return (
        <>
            <Navbar />
            <div className="relative h-screen w-full bg-gray-950">
                <HeroBackground 
                    animationType="rotate"
                    timeScale={0.2}
                    height={2}
                    baseWidth={3}
                    scale={3}
                    hueShift={0.01}
                    colorFrequency={3}
                    noise={0}
                    glow={1}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center container mx-auto px-40">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-xl">
                        Gajadicair — Smart and Automated HR Management and Payroll Solution
                    </h1>
                    {/* Button actions */}
                    <div className="flex space-x-4 mt-6">
                        <a
                            href="#features"
                            className="font-semibold px-4 py-3 bg-gray-950 text-white rounded-lg shadow-md transition-all hover:scale-105 duration-300"
                        >
                            Explore features                   
                        </a>
                        <a
                            href="/login"
                            className="font-medium px-4 py-3 bg-white text-gray-900 rounded-lg transition-all duration-300 hover:scale-105"
                        >
                            Try for Free Now
                        </a>
                    </div>
                </div>
            </div>
            <Features />
            <Benefits />
            <Pricing />
            <CTA />
            <Footer />
        </>
    );
};

export default HomePage;