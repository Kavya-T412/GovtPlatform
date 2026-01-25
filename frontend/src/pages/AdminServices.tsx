import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ServiceCard from '@/components/ServiceCard';
import AdminServiceRequestsModal from '@/components/AdminServiceRequestsModal';
import servicesData from '@/data/umang-services.json';
import { Service, Category } from '@/types';
import { useRequests } from '@/contexts/RequestsContext';

const categories = servicesData.categories as Category[];
const services = servicesData.services as Service[];

export default function AdminServices() {
  const { getRequestsByService, getAllCallRequests } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allCallRequests = getAllCallRequests();

  const servicesWithCounts = useMemo(() => {
    return services.map(service => {
      const onlineRequests = getRequestsByService(service.id);
      const callRequests = allCallRequests.filter(req => req.serviceId === service.id);

      const onlinePending = onlineRequests.filter(r => r.status === 'pending').length;
      const callPending = callRequests.filter(r => r.status === 'pending').length;

      return {
        ...service,
        totalRequests: onlineRequests.length + callRequests.length,
        pendingRequests: onlinePending + callPending,
        onlineRequests: onlineRequests.length,
        callRequests: callRequests.length,
      };
    });
  }, [getRequestsByService, allCallRequests]);

  const filteredServices = useMemo(() => {
    return servicesWithCounts.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [servicesWithCounts, searchQuery, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleServiceClick = (serviceWithCounts: any) => {
    // Extract only the Service properties, excluding the added count properties
    const cleanService: Service = {
      id: serviceWithCounts.id,
      name: serviceWithCounts.name,
      categoryId: serviceWithCounts.categoryId,
      categoryName: serviceWithCounts.categoryName,
      description: serviceWithCounts.description,
      requiredDocuments: serviceWithCounts.requiredDocuments,
      onlinePossibleItems: serviceWithCounts.onlinePossibleItems,
      offlineRequiredItems: serviceWithCounts.offlineRequiredItems,
    };
    setSelectedService(cleanService);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Services Management</h1>
          <p className="text-muted-foreground">
            View all services and manage their requests
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5"
              onClick={() => handleCategoryChange('all')}
            >
              All Services
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="relative">
                <ServiceCard
                  service={service}
                  onClick={() => handleServiceClick(service)}
                />
                {/* Request Statistics Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {service.totalRequests > 0 && (
                    <Badge variant="secondary" className="bg-primary/90 text-white text-xs">
                      {service.totalRequests} {service.totalRequests === 1 ? 'request' : 'requests'}
                    </Badge>
                  )}
                  {service.pendingRequests > 0 && (
                    <Badge className="status-pending text-xs">
                      {service.pendingRequests} pending
                    </Badge>
                  )}
                </div>
                {/* Request Type Breakdown */}
                {(service.onlineRequests > 0 || service.callRequests > 0) && (
                  <div className="absolute bottom-2 left-2 right-2 flex gap-1 text-xs">
                    {service.onlineRequests > 0 && (
                      <Badge variant="outline" className="bg-success/10 border-success text-success text-xs flex-1 justify-center">
                        {service.onlineRequests} online
                      </Badge>
                    )}
                    {service.callRequests > 0 && (
                      <Badge variant="outline" className="bg-warning/10 border-warning text-warning text-xs flex-1 justify-center">
                        {service.callRequests} calls
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">No services found</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              handleCategoryChange('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <AdminServiceRequestsModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
