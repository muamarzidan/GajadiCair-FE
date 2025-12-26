import { useState, useEffect } from 'react';
import { Calendar, Receipt, TrendingUp, TrendingDown, Plus, Filter } from 'lucide-react';

import { subscriptionApi } from '@/services/subscription';
import { getErrorMessage, formatCurrency, formatDate } from '@/utils';
import type { SubscriptionTransaction } from '@/types/subscription';
import { PLAN_CONFIGS } from '@/types/subscription';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


const SubscriptionHistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<SubscriptionTransaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [startDate, endDate, typeFilter, transactions]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await subscriptionApi.getHistory();
      if (response.statusCode === 200) {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat riwayat subscription'));
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.created_at);
        const filterDate = new Date(startDate);
        return txDate >= filterDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.created_at);
        const filterDate = new Date(endDate);
        // Set time to end of day for inclusive comparison
        filterDate.setHours(23, 59, 59, 999);
        return txDate <= filterDate;
      });
    }

    // Filter by type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((tx) => tx.change_type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'NEW':
        return <Plus className="h-4 w-4" />;
      case 'UPGRADE':
        return <TrendingUp className="h-4 w-4" />;
      case 'UPGRADE_RENEW':
        return <TrendingUp className="h-4 w-4" />;
        case 'DOWNGRADE':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      NEW: 'default',
      UPGRADE: 'default',
      UPGRADE_RENEW: 'default',
      DOWNGRADE: 'secondary',
    };
    return (
      <Badge variant={variants[type] || 'outline'} className="flex items-center gap-1">
        {getChangeTypeIcon(type)}
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">-</Badge>;
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      settlement: 'default',
      expire: 'destructive',
      cancel: 'secondary',
    };
    
    const labels: Record<string, string> = {
      pending: 'Pending',
      settlement: 'Success',
      expire: 'Expired',
      cancel: 'Cancelled',
      downgraded_no_charge: 'Downgraded (No Charge)',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPlanName = (level: number): string => {
    return PLAN_CONFIGS[level]?.name || 'Unknown';
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading history...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                  <BreadcrumbPage>Subscription History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Receipt className="h-8 w-8" />
                Subscription History
              </h1>
              <p className="text-muted-foreground">
                Your transaction history and subscription changes
              </p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[160px]"
                  placeholder="Start date"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[160px]"
                  placeholder="End date"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="UPGRADE">Upgrade</SelectItem>
                  <SelectItem value="UPGRADE_RENEW">Upgrade Renew</SelectItem>
                  <SelectItem value="DOWNGRADE">Downgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
          {/* Transactions Table */}
          <Card className="!shadow-none">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All subscription transactions ever made
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {startDate || endDate || typeFilter !== 'ALL'
                      ? 'No transactions found matching your filters'
                      : 'Belum ada riwayat transaksi'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.company_subscription_id}>
                          <TableCell className="font-medium">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                          <TableCell>
                            {getChangeTypeBadge(transaction.change_type)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {transaction.from_level_plan !== null && (
                                <span className="text-xs text-muted-foreground">
                                  {getPlanName(transaction.from_level_plan)} →{' '}
                                </span>
                              )}
                              <span className="font-semibold">
                                {getPlanName(transaction.level_plan)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaction.period_start && transaction.period_end ? (
                              <div className="text-xs">
                                <div>{formatDate(transaction.period_start)}</div>
                                <div className="text-muted-foreground">
                                  to {formatDate(transaction.period_end)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(transaction.gross_amount)}
                          </TableCell>
                          <TableCell>
                            {transaction.midtrans_payment_method || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.midtrans_status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {filteredTransactions.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SubscriptionHistoryPage;