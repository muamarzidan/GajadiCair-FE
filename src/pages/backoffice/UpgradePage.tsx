import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { subscriptionApi } from "@/services/subscription";
import { getErrorMessage } from "@/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const UpgradePage = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<number | null>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [canDowngrade, setCanDowngrade] = useState(true);
  const [downgradeMessage, setDowngradeMessage] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    type: 'confirm' | 'success' | 'error' | 'warning';
    onConfirm?: () => void;
  }>({ title: '', description: '', type: 'success' });

  const currentPlan = (user?.role === 'company' ? user.level_plan : 0) || 0;
  const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

  useEffect(() => {
    loadMidtransSnap(MIDTRANS_CLIENT_KEY)
      .then(() => setSnapReady(true))
      .catch((err) => console.error('Failed to load Midtrans:', err));
    
    // Check downgrade eligibility
    checkDowngradeEligibility();
    
    // Handle Midtrans redirect callback
    handleMidtransCallback();
  }, []);
  
  const handleMidtransCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionStatus = urlParams.get('transaction_status');
    const orderId = urlParams.get('order_id');
    
    if (transactionStatus && orderId) {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show appropriate dialog based on transaction status
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        setDialogConfig({
          title: 'Pembayaran Berhasil!',
          description: 'Pembayaran Anda telah berhasil diproses. Halaman akan dimuat ulang.',
          type: 'success',
          onConfirm: () => window.location.reload()
        });
        setDialogOpen(true);
      } else if (transactionStatus === 'pending') {
        setDialogConfig({
          title: 'Pembayaran Menunggu',
          description: 'Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran Anda.',
          type: 'warning'
        });
        setDialogOpen(true);
      } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
        setDialogConfig({
          title: 'Pembayaran Gagal',
          description: 'Pembayaran tidak dapat diproses. Silakan coba lagi.',
          type: 'error'
        });
        setDialogOpen(true);
      }
    }
  };

  const checkDowngradeEligibility = async () => {
    try {
      const response = await subscriptionApi.checkDowngrade();
      if (response.statusCode === 200) {
        setCanDowngrade(response.data.can_downgrade);
        setDowngradeMessage(response.data.message);
      }
    } catch (err) {
      console.error('Failed to check downgrade:', err);
    }
  };

  const handleUpgrade = async (levelPlan: number) => {
    // Check if it's a downgrade
    const isDowngrade = levelPlan < currentPlan;
    
    if (isDowngrade) {
      if (!canDowngrade) {
        setDialogConfig({
          title: 'Tidak Dapat Downgrade',
          description: downgradeMessage || 'Tidak dapat downgrade saat ini',
          type: 'warning'
        });
        setDialogOpen(true);
        return;
      }
      
      // Confirm downgrade
      setDialogConfig({
        title: 'Konfirmasi Downgrade',
        description: `Apakah Anda yakin ingin downgrade ke ${PLAN_CONFIGS[levelPlan].name}? Perubahan akan berlaku segera.`,
        type: 'confirm',
        onConfirm: () => executeUpgrade(levelPlan)
      });
      setDialogOpen(true);
      return;
    }
    
    // Execute upgrade directly for non-downgrade
    executeUpgrade(levelPlan);
  };
  
  const executeUpgrade = async (levelPlan: number) => {
    
    // Free plan (level 0) - downgrade without payment
    if (levelPlan === 0) {
      setIsProcessing(true);
      setProcessingPlan(levelPlan);
      
      try {
        const response = await subscriptionApi.createSubscription({ 
          level_plan: levelPlan,
          finish_redirect_url: window.location.origin + window.location.pathname
        });
        if (response.statusCode === 201) {
          setDialogConfig({
            title: 'Downgrade Berhasil!',
            description: 'Downgrade ke FREE plan berhasil! Halaman akan dimuat ulang.',
            type: 'success',
            onConfirm: () => window.location.reload()
          });
          setDialogOpen(true);
        }
      } catch (error) {
        setDialogConfig({
          title: 'Downgrade Gagal',
          description: getErrorMessage(error, 'Gagal downgrade subscription'),
          type: 'error'
        });
        setDialogOpen(true);
      } finally {
        setIsProcessing(false);
        setProcessingPlan(null);
      }
      return;
    }
    
    // Paid plans - require payment for upgrades
    if (!snapReady) {
      setDialogConfig({
        title: 'Sistem Pembayaran Memuat',
        description: 'Sistem pembayaran sedang dimuat. Silakan tunggu sebentar...',
        type: 'warning'
      });
      setDialogOpen(true);
      return;
    }

    setIsProcessing(true);
    setProcessingPlan(levelPlan);

    try {
      // Create subscription snap token with finish redirect URL
      const response = await subscriptionApi.createSubscription({ 
        level_plan: levelPlan,
        finish_redirect_url: window.location.origin + window.location.pathname
      });

      if (response.statusCode === 201 && response.data.token) {
        // Open Midtrans Snap - will redirect to finish_redirect_url after payment
        // Don't use callbacks as they won't be called when using finish_redirect_url
        openMidtransSnap(response.data.token);
      } else {
        throw new Error(response.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setDialogConfig({
        title: 'Gagal Membuat Subscription',
        description: getErrorMessage(error, 'Gagal membuat subscription'),
        type: 'error'
      });
      setDialogOpen(true);
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  const pricingTiers = Object.values(PLAN_CONFIGS).map((plan) => ({
    level: plan.level,
    name: plan.name,
    price: plan.priceLabel,
    period: plan.level > 0 ? '/bulan' : '',
    description:
      plan.level === 0
        ? 'For small startups'
        : plan.level === 1
        ? 'For growing companies'
        : 'For large enterprises',
    features: plan.features.map((feature) => ({ text: feature, included: true })),
    cta:
      plan.level === currentPlan
        ? 'Current Plan'
        : plan.level < currentPlan
        ? 'Downgrade'
        : plan.level === 1
        ? 'Choose BASIC'
        : plan.level === 2
        ? 'Choose PRO'
        : 'Start Now',
    isCurrentPlan: plan.level === currentPlan,
    isDowngrade: plan.level < currentPlan,
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
                  <BreadcrumbPage>Upgrade</BreadcrumbPage>
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
                    variant={tier.isCurrentPlan ? "outline" : tier.isDowngrade ? "secondary" : "default"}
                    size="lg"
                    className="w-full !py-6"
                    disabled={
                      tier.isCurrentPlan || 
                      isProcessing || 
                      (tier.isDowngrade && !canDowngrade)
                    }
                    onClick={() => handleUpgrade(tier.level)}
                    title={tier.isDowngrade && !canDowngrade ? downgradeMessage : undefined}
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
        
        {/* Dialog for all notifications */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogConfig.title}</DialogTitle>
              <DialogDescription>{dialogConfig.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {dialogConfig.type === 'confirm' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      dialogConfig.onConfirm?.();
                    }}
                  >
                    Ya, Lanjutkan
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    dialogConfig.onConfirm?.();
                  }}
                >
                  OK
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default UpgradePage;