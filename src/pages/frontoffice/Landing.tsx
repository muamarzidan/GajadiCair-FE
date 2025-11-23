// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

import { Navbar } from "@/components/frontoffice/layout/Navbar";
import { Hero } from "@/components/frontoffice/Hero";
import { Features } from "@/components/frontoffice/Features";
import { Benefits } from "@/components/frontoffice/Benefit";
import { Pricing } from "@/components/frontoffice/Pricing";
import { CTA } from "@/components/frontoffice/CTA";
import { Footer } from "@/components/frontoffice/layout/Footer";
// import { useAuth } from "@/contexts/AuthContext";


const HomePage = () => {
    // const { isAuthenticated, isLoading } = useAuth();
    // const navigate = useNavigate();

    // useEffect(() => {
    //     if (!isLoading && isAuthenticated) {
    //         navigate('/dashboard', { replace: true });
    //     };
    // }, [isAuthenticated, isLoading, navigate]);

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-gray-950"></div>
    //         </div>
    //     );
    // };

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