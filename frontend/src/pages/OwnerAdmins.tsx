import React from 'react';
import Header from '@/components/Header';
import { useRequests } from '@/contexts/RequestsContext';

export default function OwnerAdmins() {
  const { getAdminWallets } = useRequests();
  const admins = getAdminWallets();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">All Admins</h1>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {admins.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Wallet Address</th>
                  <th className="text-right p-4 font-medium">Processed</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-4 font-mono text-sm">{admin.address}</td>
                    <td className="p-4 text-right">{admin.processedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No admin activity recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
