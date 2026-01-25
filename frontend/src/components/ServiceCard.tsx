import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  tax: 'bg-pastel-lavender text-primary',
  education: 'bg-pastel-mint text-secondary-foreground',
  health: 'bg-pastel-peach text-orange-700',
  finance: 'bg-pastel-blue text-accent-foreground',
  transport: 'bg-pastel-yellow text-amber-700',
  utilities: 'bg-pastel-pink text-pink-700',
  employment: 'bg-pastel-lavender text-primary',
  identity: 'bg-pastel-mint text-secondary-foreground',
  property: 'bg-pastel-peach text-orange-700',
  agriculture: 'bg-pastel-mint text-secondary-foreground',
  social: 'bg-pastel-blue text-accent-foreground',
  legal: 'bg-pastel-lavender text-primary',
  business: 'bg-pastel-yellow text-amber-700',
  pension: 'bg-pastel-peach text-orange-700',
  insurance: 'bg-pastel-blue text-accent-foreground',
};

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const colorClass = categoryColors[service.categoryId] || 'bg-muted text-muted-foreground';

  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer hover-lift border-border/50 bg-gradient-card overflow-hidden"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className={`${colorClass} border-0`}>
            {service.categoryName}
          </Badge>
          <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
          </div>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {service.name}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {service.onlinePossibleItems.length} online
          </span>
          {service.offlineRequiredItems.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              {service.offlineRequiredItems.length} offline
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
