import React from 'react';
import Header from '@/components/Header';
import { useRequests } from '@/contexts/RequestsContext';

export default function OwnerUsers() {
  const { getUniqueWallets } = useRequests();
  const users = getUniqueWallets();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">All Users</h1>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Wallet Address</th>
                <th className="text-right p-4 font-medium">Requests</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-4 font-mono text-sm">{user.address}</td>
                  <td className="p-4 text-right">{user.requestCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
