import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Filter, ShoppingCart, Calendar, User } from 'lucide-react';
import { storage, Product, User as UserType } from '@/lib/storage';
import { toast } from 'sonner';

interface MarketplaceProps {
  user?: UserType | null;
}

const Marketplace = ({ user }: MarketplaceProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy', 'Meat', 'Other'];

  useEffect(() => {
    const allProducts = storage.getProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleContactFarmer = (product: Product) => {
    if (!user) {
      toast.error('Please login to contact farmers');
      return;
    }
    toast.success(`Contact request sent to ${product.farmerName}!`);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    toast.success(`${product.name} added to cart!`);
  };

  const formatINR = (amount: number) =>
    '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agricultural Marketplace
        </h1>
        <p className="text-gray-600">
          Discover fresh, local agricultural products from farmers in your area
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products, farmers, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(searchTerm || selectedCategory) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria'
              : 'No products are currently available'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {product.category}
                  </Badge>
                </div>
                <CardDescription className="space-y-1">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-1" />
                    {product.farmerName}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.location}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatINR(Number(product.price))} / {product.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.quantity} {product.unit} available
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Harvested: {product.harvestDate}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactFarmer(product)}
                    >
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-12 text-center bg-green-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to start buying?
          </h3>
          <p className="text-gray-600 mb-4">
            Create an account to contact farmers and purchase products directly
          </p>
          <div className="space-x-4">
            <Button asChild>
              <a href="/register">Sign Up</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
