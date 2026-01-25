import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Sparkles, Shield, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ServiceCard from '@/components/ServiceCard';
import ServiceDetailModal from '@/components/ServiceDetailModal';
import servicesData from '@/data/umang-services.json';
import { Service, Category } from '@/types';

const categories = servicesData.categories as Category[];
const services = servicesData.services as Service[];

const features = [
  {
    icon: Sparkles,
    title: 'Web3 Powered',
    description: 'Connect your wallet for secure, decentralized access to government services',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'All requests are tracked on-chain for complete transparency',
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Get real-time updates on your service requests',
  },
  {
    icon: Users,
    title: '100+ Services',
    description: 'Access a wide range of government services in one place',
  },
];

export default function UserHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const popularServices = useMemo(() => {
    return services.slice(0, 8);
  }, []);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--pastel-lavender)),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--pastel-mint)),transparent_50%)]" />

        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Sparkles className="h-3 w-3 mr-2" />
              Web3 Government Services
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              All Government Services{' '}
              <span className="text-gradient">in One Place</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access 100+ government services seamlessly with your Web3 wallet.
              Secure, transparent, and hassle-free.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm shadow-pastel"
              />
            </div>

            <Link to="/services">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 h-12 px-8 gap-2">
                Explore All Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border border-border/50 hover-lift"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Popular Services
              </h2>
              <p className="text-muted-foreground">
                Most requested government services
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-gradient-hero">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Browse by Category
            </h2>
            <p className="text-muted-foreground">
              Find services organized by department
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.slice(0, 10).map((category) => (
              <Link key={category.id} to={`/services?category=${category.id}`}>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
            <Link to="/services">
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              >
                View All →
              </Badge>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-card border border-border/50 shadow-pastel">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet and access all government services with just a few clicks.
            </p>
            <Link to="/services">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 gap-2">
                Start Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-6 w-6">
                <img src="/logo.png" alt="CivicChain" className="h-full w-full object-contain filter grayscale opacity-50" />
              </div>
              <span className="font-semibold">CivicChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CivicChain. Powered by Blockchain.
            </p>
          </div>
        </div>
      </footer>

      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
