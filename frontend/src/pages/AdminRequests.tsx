import React, { useState, useMemo } from 'react';
import { Search, Filter, X, FileText, User, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import RequestCard from '@/components/RequestCard';
import { useRequests } from '@/contexts/RequestsContext';
import { useWallet } from '@/contexts/WalletContext';
import { useSearchParams } from 'react-router-dom';
import servicesData from '@/data/umang-services.json';
import { ServiceRequest, Service } from '@/types';

const services = servicesData.services as Service[];

export default function AdminRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceFilter = searchParams.get('service');

  const { wallet } = useWallet();
  const { getAllRequests, updateRequestStatus, acceptRequest, getStats } = useRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');

  const allRequests = getAllRequests();
  const stats = getStats();

  const selectedService = serviceFilter
    ? services.find(s => s.id === serviceFilter)
    : null;

  const filteredRequests = useMemo(() => {
    return allRequests.filter((request) => {
      const matchesSearch =
        request.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = activeTab === 'all' || request.status === activeTab;
      const matchesService = !serviceFilter || request.serviceId === serviceFilter;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [allRequests, searchQuery, activeTab, serviceFilter]);

  const handleAccept = (request: ServiceRequest) => {
    acceptRequest(request.id);
  };

  const handleProcess = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const confirmComplete = () => {
    if (selectedRequest) {
      updateRequestStatus(
        selectedRequest.id,
        'completed',
        wallet.address || undefined,
        adminRemarks
      );
      setIsDetailOpen(false);
      setAdminRemarks('');
      setSelectedRequest(null);
    }
  };

  const clearServiceFilter = () => {
    searchParams.delete('service');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* ... existing header ... */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Requests Management</h1>
              <p className="text-muted-foreground">
                Process and manage service requests
              </p>
            </div>
          </div>

          {selectedService && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtered by service:</span>
              <Badge variant="secondary" className="gap-1">
                {selectedService.name}
                <button onClick={clearServiceFilter} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by wallet, service, or request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({allRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  showAdminActions
                  onProcess={() => handleAccept(request)}
                  onComplete={() => handleProcess(request)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No requests found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Request Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Request Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Request ID</p>
                    <p className="font-mono font-medium">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Service</p>
                    <p className="font-medium">{selectedRequest.serviceName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Wallet</p>
                    <p className="font-mono text-xs">{selectedRequest.walletAddress}</p>
                  </div>
                </div>

                <Separator className="my-4 h-[1px] bg-border" />

                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Submitted User Data</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {Object.entries(selectedRequest.formFields).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.uploadedFiles.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Uploaded Documents</Label>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="remarks">Admin Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Add any notes or remarks for the applicant..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmComplete} className="flex-1 bg-success hover:bg-success/90">
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
