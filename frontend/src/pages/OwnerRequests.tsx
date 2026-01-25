import React from 'react';
import Header from '@/components/Header';
import RequestCard from '@/components/RequestCard';
import { useRequests } from '@/contexts/RequestsContext';

export default function OwnerRequests() {
  const { getAllRequests } = useRequests();
  const requests = getAllRequests();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">All Requests</h1>
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </div>
  );
}
