import { Navbar } from "@/components/frontoffice/layout/Navbar";
import { Hero } from "@/components/frontoffice/Hero";
import { Features } from "@/components/frontoffice/Features";
import { Benefits } from "@/components/frontoffice/Benefit";
import { Pricing } from "@/components/frontoffice/Pricing";
import { CTA } from "@/components/frontoffice/CTA";
import { Footer } from "@/components/frontoffice/layout/Footer";

const HomePage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <Benefits />
            <Pricing />
            <CTA />
            <Footer />
        </>
    );
};

export default HomePage;