import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Calendar, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { User } from '@/lib/auth';

interface Product {
  id: number;
  farmer: number;
  farmer_name: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
  image?: string;
  location: string;
  harvest_date: string;
  created_at: string;
}

interface MarketplaceProps {
  user?: User | null;
}

const Marketplace = ({ user }: MarketplaceProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getProducts();
      // Handle paginated response from Django REST framework
      const productsArray = data.results || data;
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProducts}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="mt-2 text-gray-600">
            Discover fresh products from local farmers
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products, farmers, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="date">Harvest Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  By {product.farmer_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-600">
                      ₹{product.price} per {product.unit}
                    </span>
                    <span className="text-gray-500">
                      {product.quantity} {product.unit} available
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="text-xs">{product.location}</span>
                  </div>

                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      Harvested: {new Date(product.harvest_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" size="sm">
                    Contact Farmer
                  </Button>
                  {user?.role === 'buyer' && (
                    <Button variant="outline" className="w-full" size="sm">
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Marketplace Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(products.map(p => p.farmer)).size}
              </div>
              <div className="text-sm text-gray-600">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {new Set(products.map(p => p.category)).size}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;