import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveStack } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search, Filter, MapPin, Leaf, TrendingUp, 
  Star, ShoppingCart, Menu, X, SlidersHorizontal
} from 'lucide-react';

const Marketplace = () => {
  const { isMobile, isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const projects = [
    {
      id: '1',
      title: 'Amazon Rainforest Conservation',
      description: 'Protecting 10,000 hectares of pristine rainforest',
      location: 'Brazil',
      type: 'reforestation',
      price: 25.50,
      available: 5000,
      rating: 4.8,
      verified: true,
      image: '/api/placeholder/400/200'
    },
    {
      id: '2',
      title: 'Solar Farm Development',
      description: 'Clean energy generation in rural communities',
      location: 'Kenya',
      type: 'renewable_energy',
      price: 22.75,
      available: 8500,
      rating: 4.6,
      verified: true,
      image: '/api/placeholder/400/200'
    },
    {
      id: '3',
      title: 'Mangrove Restoration',
      description: 'Coastal ecosystem restoration and protection',
      location: 'Philippines',
      type: 'marine',
      price: 28.00,
      available: 3200,
      rating: 4.9,
      verified: true,
      image: '/api/placeholder/400/200'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Projects', count: projects.length },
    { id: 'reforestation', label: 'Reforestation', count: 1 },
    { id: 'renewable_energy', label: 'Renewable Energy', count: 1 },
    { id: 'marine', label: 'Marine', count: 1 }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.type === selectedCategory);

  return (
    <PageLayout>
      <ResponsiveLayout maxWidth="xl" padding="md">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </Button>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Carbon Credit Marketplace
            </h1>
            <p className="text-muted-foreground">
              Discover and invest in verified carbon offset projects worldwide.
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className={`mb-8 ${isMobile && !showFilters ? 'hidden' : ''}`}>
          <ResponsiveStack 
            direction={{ mobile: 'col', tablet: 'row', desktop: 'row' }}
            spacing="md"
            className="mb-6"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Button (Desktop) */}
            {!isMobile && (
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            )}
          </ResponsiveStack>

          {/* Categories */}
          <div className={`${isMobile ? 'space-y-2' : 'flex space-x-2'} mb-6`}>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size={isMobile ? "sm" : "default"}
                onClick={() => setSelectedCategory(category.id)}
                className={`${isMobile ? 'w-full justify-start' : ''}`}
              >
                {category.label}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <ResponsiveGrid 
          cols={{ mobile: 1, tablet: 2, desktop: 2, largeDesktop: 3 }}
          gap="lg"
          className="mb-8"
        >
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-card-gradient border-border/50 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Project Image */}
              <div className={`${isMobile ? 'h-48' : 'h-56'} bg-muted/20 relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {project.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  {project.verified && (
                    <Badge className="bg-green-500 text-white">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span>{project.location}</span>
                  </div>
                </div>
              </div>

              <CardHeader className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <ResponsiveStack 
                  direction={{ mobile: 'col', tablet: 'col', desktop: 'col' }}
                  spacing="sm"
                >
                  <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} line-clamp-2`}>
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </ResponsiveStack>
              </CardHeader>

              <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
                <div className="space-y-4">
                  {/* Stats */}
                  <ResponsiveStack 
                    direction={{ mobile: 'row', tablet: 'row', desktop: 'row' }}
                    justify="between"
                    align="center"
                  >
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{project.rating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.available.toLocaleString()} credits available
                    </div>
                  </ResponsiveStack>

                  {/* Price and Action */}
                  <ResponsiveStack 
                    direction={{ mobile: 'col', tablet: 'row', desktop: 'row' }}
                    justify="between"
                    align={isMobile ? 'stretch' : 'center'}
                    spacing="sm"
                  >
                    <div>
                      <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                        ${project.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">per credit</div>
                    </div>
                    
                    <ResponsiveStack 
                      direction={{ mobile: 'col', tablet: 'row', desktop: 'row' }}
                      spacing="sm"
                      className={isMobile ? 'w-full' : ''}
                    >
                      <Button 
                        variant="outline" 
                        size={isMobile ? "sm" : "default"}
                        className={isMobile ? 'w-full' : ''}
                      >
                        View Details
                      </Button>
                      <Button 
                        size={isMobile ? "sm" : "default"}
                        className={`bg-primary hover:bg-primary/90 ${isMobile ? 'w-full' : ''}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Credits
                      </Button>
                    </ResponsiveStack>
                  </ResponsiveStack>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size={isMobile ? "sm" : "default"}>
            Load More Projects
          </Button>
        </div>

        {/* Mobile Filter Overlay */}
        {isMobile && showFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-background w-full rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Project Type</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowFilters(false);
                        }}
                        className="w-full justify-start"
                      >
                        {category.label}
                        <Badge variant="secondary" className="ml-auto">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ResponsiveLayout>
    </PageLayout>
  );
};

export default Marketplace;