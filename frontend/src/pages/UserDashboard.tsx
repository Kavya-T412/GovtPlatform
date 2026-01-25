import React, { useMemo, useState } from 'react';
import { Wallet, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import RequestCard from '@/components/RequestCard';
import WalletConnectModal from '@/components/WalletConnectModal';
import { useWallet } from '@/contexts/WalletContext';
import { useRequests } from '@/contexts/RequestsContext';

export default function UserDashboard() {
  const { wallet } = useWallet();
  const { getRequestsByWallet, getCallRequestsByWallet } = useRequests();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const userRequests = useMemo(() => {
    if (!wallet.address) return [];
    const regular = getRequestsByWallet(wallet.address);
    const calls = getCallRequestsByWallet(wallet.address);
    // Combine and sort by date
    return [...regular, ...calls].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [wallet.address, getRequestsByWallet, getCallRequestsByWallet]);

  const stats = useMemo(() => {
    return {
      total: userRequests.length,
      pending: userRequests.filter(r => r.status === 'pending').length,
      processing: userRequests.filter(r => r.status === 'processing' || r.status === 'contacted').length,
      completed: userRequests.filter(r => r.status === 'completed').length,
    };
  }, [userRequests]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return userRequests;
    if (activeTab === 'processing') {
      return userRequests.filter(r => r.status === 'processing' || r.status === 'contacted');
    }
    return userRequests.filter(r => r.status === activeTab);
  }, [userRequests, activeTab]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="h-20 w-20 rounded-full bg-pastel-lavender flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your dashboard and track your service requests.
            </p>
            <Button
              onClick={() => setIsWalletModalOpen(true)}
              className="bg-gradient-primary hover:opacity-90"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
        <WalletConnectModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Connected as:</span>
            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
              {formatAddress(wallet.address!)}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Requests"
            value={stats.total}
            icon={FileText}
            variant="primary"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Processing"
            value={stats.processing}
            icon={AlertCircle}
            variant="info"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            variant="success"
          />
        </div>

        {/* Requests Section */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">My Requests</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({userRequests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No requests found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
