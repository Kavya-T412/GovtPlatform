import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Wallet, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Service, UploadedFile, RequestFormFields, CallRequestFormFields } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { useRequests } from '@/contexts/RequestsContext';
import WalletConnectModal from './WalletConnectModal';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'overview' | 'apply-online' | 'request-call';

export default function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  const { wallet } = useWallet();
  const { addRequest, addCallRequest } = useRequests();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<RequestFormFields>({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [callFormData, setCallFormData] = useState<CallRequestFormFields>({
    fullName: '',
    phone: '',
    email: '',
    preferredTime: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  if (!service) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCallInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCallFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOnlineItemClick = (item: string) => {
    setSelectedItem(item);
    setViewMode('apply-online');
  };

  const handleOfflineItemClick = (item: string) => {
    setSelectedItem(item);
    setViewMode('request-call');
  };

  const handleSubmitApplication = async () => {
    if (!wallet.isConnected) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const id = await addRequest({
        walletAddress: wallet.address!,
        role: 'user',
        serviceId: service.id,
        serviceName: service.name,
        categoryName: service.categoryName,
        uploadedFiles,
        formFields: formData,
        requestType: 'online',
        selectedItem,
      });

      setRequestId(id);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      // Transaction failed - don't show success screen
      console.error('Failed to submit request:', error);
      setIsSubmitting(false);
      // Error toast is already shown by RequestsContext
    }
  };

  const handleSubmitCallRequest = async () => {
    if (!wallet.isConnected) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const id = addCallRequest({
      walletAddress: wallet.address!,
      serviceId: service.id,
      serviceName: service.name,
      categoryName: service.categoryName,
      selectedItem,
      formFields: callFormData,
    });

    setRequestId(id);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setFormData({ fullName: '', phone: '', address: '', notes: '' });
    setCallFormData({ fullName: '', phone: '', email: '', preferredTime: '', notes: '' });
    setIsSubmitted(false);
    setRequestId(null);
    setViewMode('overview');
    setSelectedItem('');
    onClose();
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedItem('');
    setUploadedFiles([]);
    setFormData({ fullName: '', phone: '', address: '', notes: '' });
    setCallFormData({ fullName: '', phone: '', email: '', preferredTime: '', notes: '' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isFormValid = formData.fullName && formData.phone && formData.address;
  const isCallFormValid = callFormData.fullName && callFormData.phone && callFormData.preferredTime;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {viewMode === 'apply-online' ? 'Application Submitted Successfully!' : 'Call Request Submitted Successfully!'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {viewMode === 'apply-online'
                  ? 'Your application has been submitted and is pending review.'
                  : 'We will contact you at your preferred time to assist with this service.'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Request ID:</span>
                <span className="font-mono font-semibold text-primary">{requestId}</span>
              </div>
              <Button onClick={handleClose} className="mt-6 w-full">
                Close
              </Button>
            </div>
          ) : viewMode === 'overview' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{service.name}</DialogTitle>
                <Badge variant="secondary" className="w-fit mt-2">
                  {service.categoryName}
                </Badge>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                <p className="text-muted-foreground">{service.description}</p>

                {/* What can be done online */}
                <div className="space-y-3">
                  <h4 className="font-medium text-secondary-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    What can be done online
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {service.onlinePossibleItems.map((item, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:border-success hover:bg-success/5 transition-all"
                        onClick={() => handleOnlineItemClick(item)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-success" />
                            <span className="text-sm font-medium text-foreground">{item}</span>
                          </div>
                          <Button size="sm" variant="outline" className="border-success text-success hover:bg-success hover:text-white">
                            Apply Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* What cannot be done online */}
                {service.offlineRequiredItems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-warning-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      What cannot be done online
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {service.offlineRequiredItems.map((item, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer hover:border-warning hover:bg-warning/5 transition-all"
                          onClick={() => handleOfflineItemClick(item)}
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="h-2 w-2 rounded-full bg-warning" />
                              <span className="text-sm font-medium text-foreground">{item}</span>
                            </div>
                            <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning hover:text-white">
                              <Phone className="h-3 w-3 mr-1" />
                              Request Call
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Documents */}
                <div className="p-4 rounded-xl bg-pastel-lavender border border-primary/20">
                  <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Required Documents
                  </h4>
                  <ul className="space-y-2">
                    {service.requiredDocuments.map((doc, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : viewMode === 'apply-online' ? (
            <>
              <DialogHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToOverview}
                  className="w-fit mb-2"
                >
                  ← Back to Service Details
                </Button>
                <DialogTitle className="text-xl">Apply for: {selectedItem}</DialogTitle>
                <Badge variant="secondary" className="w-fit mt-2">
                  {service.categoryName}
                </Badge>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Upload Documents */}
                <div>
                  <Label className="text-base font-medium">Upload Documents</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload the required documents (PDF, JPG, PNG)
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 border-dashed border-2 hover:border-primary/50"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload files</span>
                    </div>
                  </Button>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Your Details</Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitApplication}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : !wallet.isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet & Submit Application
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToOverview}
                  className="w-fit mb-2"
                >
                  ← Back to Service Details
                </Button>
                <DialogTitle className="text-xl">Request Call for: {selectedItem}</DialogTitle>
                <Badge variant="secondary" className="w-fit mt-2">
                  {service.categoryName}
                </Badge>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="p-4 rounded-xl bg-pastel-peach border border-warning/30">
                  <p className="text-sm text-muted-foreground">
                    This service requires offline assistance. Please provide your details and we'll call you at your preferred time to help you with this process.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Your Contact Details</Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="callFullName">Full Name *</Label>
                      <Input
                        id="callFullName"
                        name="fullName"
                        value={callFormData.fullName}
                        onChange={handleCallInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="callPhone">Phone Number *</Label>
                      <Input
                        id="callPhone"
                        name="phone"
                        value={callFormData.phone}
                        onChange={handleCallInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={callFormData.email}
                      onChange={handleCallInputChange}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Time to Call *</Label>
                    <Input
                      id="preferredTime"
                      name="preferredTime"
                      type="datetime-local"
                      value={callFormData.preferredTime}
                      onChange={handleCallInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="callNotes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="callNotes"
                      name="notes"
                      value={callFormData.notes}
                      onChange={handleCallInputChange}
                      placeholder="Any specific requirements or questions..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitCallRequest}
                  disabled={!isCallFormValid || isSubmitting}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : !wallet.isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet & Submit Request
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Submit Call Request
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
