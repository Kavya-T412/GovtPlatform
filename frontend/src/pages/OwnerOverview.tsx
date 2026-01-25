import React from 'react';
import { FileText, Users, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import { useRequests } from '@/contexts/RequestsContext';
import servicesData from '@/data/umang-services.json';

export default function OwnerOverview() {
  const { getStats, getUniqueWallets, getAdminWallets } = useRequests();
  const stats = getStats();
  const users = getUniqueWallets();
  const admins = getAdminWallets();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground">Complete system overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Total Services" value={servicesData.services.length} icon={FileText} variant="primary" />
          <StatsCard title="Unique Users" value={users.length} icon={Users} variant="info" />
          <StatsCard title="Active Admins" value={admins.length} icon={Shield} variant="success" />
          <StatsCard title="Total Requests" value={stats.total} icon={FileText} variant="default" />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} variant="warning" />
          <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} variant="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {users.slice(0, 5).map((user, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-mono text-sm">{user.address.slice(0, 10)}...{user.address.slice(-6)}</span>
                  <span className="text-sm text-muted-foreground">{user.requestCount} requests</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Active Admins</h2>
            <div className="space-y-3">
              {admins.length > 0 ? admins.map((admin, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-mono text-sm">{admin.address.slice(0, 10)}...{admin.address.slice(-6)}</span>
                  <span className="text-sm text-muted-foreground">{admin.processedCount} processed</span>
                </div>
              )) : <p className="text-muted-foreground text-center py-4">No admin activity yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
