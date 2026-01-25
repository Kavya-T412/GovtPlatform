import React from 'react';
import Header from '@/components/Header';
import RequestCard from '@/components/RequestCard';
import { useRequests } from '@/contexts/RequestsContext';

export default function OwnerRequests() {
  const { getAllRequests, getAllCallRequests } = useRequests();
  const requests = getAllRequests();
  const callRequests = getAllCallRequests();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">System Requests Overview</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Online Service Requests ({requests.length})
            </h2>
            <div className="space-y-4">
              {requests.length > 0 ? requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              )) : <p className="text-muted-foreground italic">No online requests found.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" />
              Call Requests ({callRequests.length})
            </h2>
            <div className="space-y-4">
              {callRequests.length > 0 ? callRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              )) : <p className="text-muted-foreground italic">No call requests found.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
