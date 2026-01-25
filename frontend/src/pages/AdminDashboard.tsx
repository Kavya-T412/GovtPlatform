import React from 'react';
import { FileText, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import RequestCard from '@/components/RequestCard';
import { useRequests } from '@/contexts/RequestsContext';
import { useWallet } from '@/contexts/WalletContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { wallet } = useWallet();
  const { getAllRequests, getAllCallRequests, getStats, updateRequestStatus, updateCallRequestStatus, acceptRequest } = useRequests();

  const stats = getStats();
  const allReqs = [...getAllRequests(), ...getAllCallRequests()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentRequests = allReqs.slice(0, 5);

  const handleProcess = async (requestId: string) => {
    // Both REQ and CALL need to be 'accepted' first to assign the department
    await acceptRequest(requestId);
  };

  const handleComplete = async (requestId: string) => {
    if (requestId.startsWith('REQ-')) {
      await updateRequestStatus(requestId, 'completed', wallet.address || undefined);
    } else if (requestId.startsWith('CALL-')) {
      await updateCallRequestStatus(requestId, 'completed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all service requests
          </p>
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
            subtitle="Needs attention"
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

        {/* Recent Requests */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Requests</h2>
            <Link to="/admin/requests">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  showAdminActions
                  onProcess={() => handleProcess(request.id)}
                  onComplete={() => handleComplete(request.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
