import { Navbar } from "@/components/fo/Navbar";
import { Hero } from "@/components/fo/Hero";
import { Features } from "@/components/fo/Features";
import { Benefits } from "@/components/fo/Benefit";
import { Pricing } from "@/components/fo/Pricing";
import { CTA } from "@/components/fo/CTA";
import { Footer } from "@/components/fo/Footer";

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