import React from 'react';
import { Clock, CheckCircle, AlertCircle, FileText, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceRequest } from '@/types';

interface RequestCardProps {
  request: ServiceRequest;
  onClick?: () => void;
  showAdminActions?: boolean;
  onProcess?: () => void;
  onComplete?: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'status-pending',
  },
  processing: {
    label: 'Processing',
    icon: AlertCircle,
    className: 'status-processing',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'status-completed',
  },
};

export default function RequestCard({
  request,
  onClick,
  showAdminActions,
  onProcess,
  onComplete,
}: RequestCardProps) {
  const status = statusConfig[request.status];
  const StatusIcon = status.icon;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${status.className} text-xs`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {request.id}
              </span>
            </div>

            <h4 className="font-semibold text-foreground mb-1 truncate">
              {request.serviceName}
            </h4>

            <p className="text-sm text-muted-foreground mb-2">
              {request.categoryName}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-mono">{formatAddress(request.walletAddress)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(request.createdAt)}
              </span>
              {request.uploadedFiles.length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {request.uploadedFiles.length} file(s)
                </span>
              )}
            </div>

            {request.adminRemarks && (
              <div className="mt-3 p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Admin remarks:</span> {request.adminRemarks}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {showAdminActions && request.status !== 'completed' && (
              <>
                {request.status === 'pending' && onProcess && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProcess();
                    }}
                    className="text-info border-info/30 hover:bg-info/10"
                  >
                    Accept
                  </Button>
                )}
                {request.status === 'processing' && onComplete && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete();
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Process
                  </Button>
                )}
              </>
            )}
            {onClick && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onClick}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
