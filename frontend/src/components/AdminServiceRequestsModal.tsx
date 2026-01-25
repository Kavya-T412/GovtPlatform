import React, { useState, useMemo } from 'react';
import { X, FileText, Download, Phone, Mail, Clock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Service, ServiceRequest, CallRequest } from '@/types';
import { useRequests } from '@/contexts/RequestsContext';
import { useWallet } from '@/contexts/WalletContext';

interface AdminServiceRequestsModalProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminServiceRequestsModal({ service, isOpen, onClose }: AdminServiceRequestsModalProps) {
    const { wallet } = useWallet();
    const {
        getRequestsByService,
        getAllCallRequests,
        updateRequestStatus,
        acceptRequest,
        updateCallRequestStatus
    } = useRequests();

    const [activeTab, setActiveTab] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [selectedCallRequest, setSelectedCallRequest] = useState<CallRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [adminRemarks, setAdminRemarks] = useState('');

    const allCallRequests = getAllCallRequests();

    // Only compute these if service exists
    const onlineRequests = service ? getRequestsByService(service.id) : [];
    const callRequests = service ? allCallRequests.filter(req => req.serviceId === service.id) : [];

    const stats = useMemo(() => {
        const onlinePending = onlineRequests.filter(r => r.status === 'pending').length;
        const onlineProcessing = onlineRequests.filter(r => r.status === 'processing').length;
        const onlineCompleted = onlineRequests.filter(r => r.status === 'completed').length;

        const callPending = callRequests.filter(r => r.status === 'pending').length;
        const callContacted = callRequests.filter(r => r.status === 'contacted').length;
        const callCompleted = callRequests.filter(r => r.status === 'completed').length;

        return {
            total: onlineRequests.length + callRequests.length,
            pending: onlinePending + callPending,
            processing: onlineProcessing + callContacted,
            completed: onlineCompleted + callCompleted,
            onlineTotal: onlineRequests.length,
            callTotal: callRequests.length,
        };
    }, [onlineRequests, callRequests]);

    const filteredRequests = useMemo(() => {
        let filtered = onlineRequests;
        if (activeTab === 'pending') filtered = onlineRequests.filter(r => r.status === 'pending');
        if (activeTab === 'processing') filtered = onlineRequests.filter(r => r.status === 'processing');
        if (activeTab === 'completed') filtered = onlineRequests.filter(r => r.status === 'completed');
        return filtered;
    }, [onlineRequests, activeTab]);

    const filteredCallRequests = useMemo(() => {
        let filtered = callRequests;
        if (activeTab === 'pending') filtered = callRequests.filter(r => r.status === 'pending');
        if (activeTab === 'processing') filtered = callRequests.filter(r => r.status === 'contacted');
        if (activeTab === 'completed') filtered = callRequests.filter(r => r.status === 'completed');
        return filtered;
    }, [callRequests, activeTab]);

    const handleAcceptOnline = async (request: ServiceRequest) => {
        try {
            await acceptRequest(request.id);
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const handleProcessDetails = (request: ServiceRequest) => {
        setSelectedRequest(request);
        setSelectedCallRequest(null);
        setIsDetailOpen(true);
    };

    const handleContactCall = async (request: CallRequest) => {
        try {
            await acceptRequest(request.id);
        } catch (error) {
            console.error('Failed to contact call:', error);
        }
    };

    const handleCompleteCall = (request: CallRequest) => {
        setSelectedCallRequest(request);
        setSelectedRequest(null);
        setIsDetailOpen(true);
    };

    const confirmComplete = async () => {
        try {
            if (selectedRequest) {
                await updateRequestStatus(
                    selectedRequest.id,
                    'completed',
                    wallet.address || undefined,
                    adminRemarks
                );
            } else if (selectedCallRequest) {
                await updateCallRequestStatus(selectedCallRequest.id, 'completed');
            }
            setIsDetailOpen(false);
            setAdminRemarks('');
            setSelectedRequest(null);
            setSelectedCallRequest(null);
        } catch (error) {
            console.error('Failed to complete request:', error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Early return after all hooks
    if (!service) return null;

    return (
        <>{/* ... existing JSX ... */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {/* ... existing header and stats ... */}
                    <DialogHeader>
                        <DialogTitle className="text-xl">{service.name}</DialogTitle>
                        <Badge variant="secondary" className="w-fit mt-2">
                            {service.categoryName}
                        </Badge>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Statistics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-muted">
                                <p className="text-xs text-muted-foreground">Total Requests</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.onlineTotal} online, {stats.callTotal} calls
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-warning/10">
                                <p className="text-xs text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-primary/10">
                                <p className="text-xs text-muted-foreground">Processing</p>
                                <p className="text-2xl font-bold text-primary">{stats.processing}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-success/10">
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-success">{stats.completed}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                                <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="space-y-3 mt-4">
                                {/* Online Requests */}
                                {filteredRequests.map((request) => (
                                    <Card key={request.id} className="border-l-4 border-l-success">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {request.id}
                                                        </Badge>
                                                        <Badge className={`status-${request.status}`}>
                                                            {request.status}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs">
                                                            Online Application
                                                        </Badge>
                                                    </div>

                                                    <h4 className="font-semibold text-foreground mb-1">
                                                        {request.selectedItem}
                                                    </h4>

                                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                        <div>
                                                            <span className="font-medium">Applicant:</span> {request.formFields.fullName}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Phone:</span> {request.formFields.phone}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="font-medium">Wallet:</span>{' '}
                                                            <span className="font-mono text-xs">{request.walletAddress}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="font-medium">Submitted:</span> {formatDate(request.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 ml-4">
                                                    {request.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAcceptOnline(request)}
                                                            className="bg-primary"
                                                        >
                                                            Accept
                                                        </Button>
                                                    )}
                                                    {request.status === 'processing' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleProcessDetails(request)}
                                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                                        >
                                                            Process
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Call Requests */}
                                {filteredCallRequests.map((request) => (
                                    <Card key={request.id} className="border-l-4 border-l-warning">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {request.id}
                                                        </Badge>
                                                        <Badge className={`status-${request.status}`}>
                                                            {request.status}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs bg-warning/20 text-warning-foreground">
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            Call Request
                                                        </Badge>
                                                    </div>

                                                    <h4 className="font-semibold text-foreground mb-1">
                                                        {request.selectedItem}
                                                    </h4>

                                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                        <div>
                                                            <span className="font-medium">Name:</span> {request.formFields.fullName}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Phone:</span> {request.formFields.phone}
                                                        </div>
                                                        {request.formFields.email && (
                                                            <div className="col-span-2">
                                                                <span className="font-medium">Email:</span> {request.formFields.email}
                                                            </div>
                                                        )}
                                                        <div className="col-span-2">
                                                            <span className="font-medium">Preferred Time:</span>{' '}
                                                            {new Date(request.formFields.preferredTime).toLocaleString('en-IN')}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="font-medium">Wallet:</span>{' '}
                                                            <span className="font-mono text-xs">{request.walletAddress}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="font-medium">Requested:</span> {formatDate(request.createdAt)}
                                                        </div>
                                                    </div>

                                                    {request.formFields.notes && (
                                                        <div className="mt-2 p-2 rounded bg-muted">
                                                            <p className="text-xs text-muted-foreground">Notes:</p>
                                                            <p className="text-sm">{request.formFields.notes}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 ml-4">
                                                    {request.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleContactCall(request)}
                                                            className="bg-primary"
                                                        >
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            Mark Contacted
                                                        </Button>
                                                    )}
                                                    {request.status === 'contacted' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCompleteCall(request)}
                                                            className="bg-success"
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredRequests.length === 0 && filteredCallRequests.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No requests found</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Complete Request Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Complete Request</DialogTitle>
                    </DialogHeader>

                    {(selectedRequest || selectedCallRequest) && (
                        <div className="space-y-6 mt-4">
                            <div className="p-4 rounded-lg bg-muted">
                                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Request Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Request ID</p>
                                        <p className="font-mono font-medium">
                                            {selectedRequest?.id || selectedCallRequest?.id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-medium">
                                            {selectedRequest ? 'Online Application' : 'Call Request'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Item</p>
                                        <p className="font-medium">
                                            {selectedRequest?.selectedItem || selectedCallRequest?.selectedItem}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Submitted User Data</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    {Object.entries((selectedRequest || selectedCallRequest)?.formFields || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            <p className="font-medium">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedRequest && selectedRequest.uploadedFiles.length > 0 && (
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

                            {selectedRequest && (
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
                            )}

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
        </>
    );
}
