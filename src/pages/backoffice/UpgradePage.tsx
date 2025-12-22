import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { subscriptionApi } from "@/services/subscription";
import { PLAN_CONFIGS } from "@/types/subscription";
import { loadMidtransSnap, openMidtransSnap } from "@/lib/midtrans";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


const UpgradePage = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<number | null>(null);
  const [snapReady, setSnapReady] = useState(false);

  const currentPlan = (user?.role === 'company' ? user.level_plan : 1) || 1;
  const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

  useEffect(() => {
    loadMidtransSnap(MIDTRANS_CLIENT_KEY)
      .then(() => setSnapReady(true))
      .catch((err) => console.error('Failed to load Midtrans:', err));
  }, []);

  const handleUpgrade = async (levelPlan: number) => {
    if (!snapReady) {
      alert('Payment system is loading. Please wait...');
      return;
    }

    setIsProcessing(true);
    setProcessingPlan(levelPlan);

    try {
      // Create subscription snap token
      const response = await subscriptionApi.createSubscription({ level_plan: levelPlan });

      if (response.statusCode === 201 && response.data.token) {
        openMidtransSnap(response.data.token, {
          onSuccess: (result) => {
            console.log('Payment success:', result);
            alert('Payment berhasil! Silakan refresh halaman.');
            setIsProcessing(false);
            setProcessingPlan(null);
            window.location.reload();
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            alert('Pembayaran menunggu. Silakan selesaikan pembayaran Anda.');
            setIsProcessing(false);
            setProcessingPlan(null);
          },
          onError: (result) => {
            console.error('Payment error:', result);
            alert('Pembayaran gagal. Silakan coba lagi.');
            setIsProcessing(false);
            setProcessingPlan(null);
          },
          onClose: () => {
            console.log('Payment popup closed');
            setIsProcessing(false);
            setProcessingPlan(null);
          },
        });
      } else {
        throw new Error(response.message || 'Failed to create subscription');
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert(error.response?.data?.message || error.message || 'Gagal membuat subscription');
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  const pricingTiers = Object.values(PLAN_CONFIGS).map((plan) => ({
    level: plan.level,
    name: plan.name,
    price: plan.priceLabel,
    period: plan.level > 1 ? '/bulan' : '',
    description:
      plan.level === 1
        ? 'Untuk startup dan tim kecil'
        : plan.level === 2
        ? 'Untuk perusahaan berkembang'
        : 'Untuk perusahaan besar',
    features: plan.features.map((feature) => ({ text: feature, included: true })),
    cta:
      plan.level === currentPlan
        ? 'Current Plan'
        : plan.level < currentPlan
        ? 'Downgrade'
        : plan.level === 2
        ? 'Choose BASIC'
        : plan.level === 3
        ? 'Choose PRO'
        : 'Start Now',
    isCurrentPlan: plan.level === currentPlan,
  }));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Employees</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-16 p-6">
          {/* Header */}
          <div className="flex items-center flex-col gap-1 justify-start">
            <h1 className="text-3xl font-bold tracking-tight">
              Choose a Package
            </h1>
            <p className="text-muted-foreground">
              Start for free and upgrade anytime as your company grows
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative flex flex-col justify-between bg-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  tier.isCurrentPlan ? "ring-2 ring-green-500 lg:scale-105" : ""
                }`}
              >
                {tier.isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Your Plan
                    </span>
                  </div>
                )}
                <CardHeader className="py-4">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-base">
                    {tier.description}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">
                        {tier.period}
                      </span>
                    )}
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
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={tier.isCurrentPlan ? "outline" : "default"}
                    size="lg"
                    className="w-full !py-6"
                    disabled={tier.isCurrentPlan || isProcessing}
                    onClick={() => handleUpgrade(tier.level)}
                  >
                    {processingPlan === tier.level ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      tier.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default UpgradePage;