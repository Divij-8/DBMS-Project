import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, MapPin, Calendar, Loader2, ShoppingCart, Plus, Edit2, Trash2, Mail } from 'lucide-react';
import { apiService } from '@/lib/api';
import { User } from '@/lib/auth';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

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
  status: string;
  created_at: string;
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  unit: string;
  quantity: string;
  location: string;
  harvest_date: string;
  status: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface MarketplaceProps {
  user?: User | null;
}

const Marketplace = ({ user }: MarketplaceProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedFarmerForContact, setSelectedFarmerForContact] = useState<Product | null>(null);
  const { addToCart } = useCart();

  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    category: 'vegetables',
    description: '',
    price: '',
    unit: 'kg',
    quantity: '',
    location: '',
    harvest_date: '',
    status: 'available'
  });

  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getProducts();
      const productsArray = data.results || data;
      setProducts(productsArray);
      setFilteredProducts(productsArray);

      if (user?.role === 'farmer') {
        const myProductsData = await apiService.getMyProducts();
        setMyProducts(myProductsData.results || myProductsData);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
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

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'livestock', 'seeds', 'fertilizers', 'other'];

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        description: productForm.description,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        quantity: parseFloat(productForm.quantity),
        location: productForm.location,
        harvest_date: productForm.harvest_date,
        status: productForm.status
      };

      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id.toString(), payload);
        toast.success('Product updated successfully!');
      } else {
        await apiService.createProduct(payload);
        toast.success('Product listed successfully!');
      }

      resetProductForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiService.deleteProduct(id.toString());
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      unit: product.unit,
      quantity: product.quantity.toString(),
      location: product.location,
      harvest_date: product.harvest_date,
      status: product.status
    });
    setShowAddProduct(true);
  };

  const handleContactFarmer = (product: Product) => {
    setSelectedFarmerForContact(product);
    setContactForm({
      name: user?.username || '',
      email: user?.email || '',
      subject: `Inquiry about ${product.name}`,
      message: ''
    });
    setShowContactModal(true);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success(`Message sent to ${selectedFarmerForContact?.farmer_name}! They will contact you soon.`);
      resetContactForm();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: 'vegetables',
      description: '',
      price: '',
      unit: 'kg',
      quantity: '',
      location: '',
      harvest_date: '',
      status: 'available'
    });
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const resetContactForm = () => {
    setContactForm({
      name: user?.username || '',
      email: user?.email || '',
      subject: '',
      message: ''
    });
    setShowContactModal(false);
    setSelectedFarmerForContact(null);
  };

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
            {user?.role === 'farmer' 
              ? 'List your products for sale and manage orders' 
              : 'Discover fresh products from local farmers'}
          </p>
        </div>

        {user?.role === 'farmer' ? (
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-products">My Products</TabsTrigger>
              <TabsTrigger value="browse">Browse All Products</TabsTrigger>
            </TabsList>

            {/* My Products Tab */}
            <TabsContent value="my-products">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Products you're selling on the marketplace</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddProduct(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddProduct && (
                    <form onSubmit={handleAddProduct} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">
                        {editingProduct ? 'Edit Product' : 'List New Product'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            required
                            placeholder="e.g., Fresh Tomatoes"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vegetables">Vegetables</SelectItem>
                              <SelectItem value="fruits">Fruits</SelectItem>
                              <SelectItem value="grains">Grains</SelectItem>
                              <SelectItem value="dairy">Dairy</SelectItem>
                              <SelectItem value="livestock">Livestock</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="seeds">Seeds</SelectItem>
                              <SelectItem value="fertilizers">Fertilizers</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price">Price per Unit (₹) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            required
                            placeholder="e.g., 50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">Unit *</Label>
                          <Input
                            id="unit"
                            value={productForm.unit}
                            onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                            required
                            placeholder="e.g., kg, liter, piece"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity Available *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            value={productForm.quantity}
                            onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                            required
                            placeholder="e.g., 100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={productForm.location}
                            onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                            required
                            placeholder="e.g., Village, District"
                          />
                        </div>
                        <div>
                          <Label htmlFor="harvest_date">Harvest Date *</Label>
                          <Input
                            id="harvest_date"
                            type="date"
                            value={productForm.harvest_date}
                            onChange={(e) => setProductForm({...productForm, harvest_date: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status *</Label>
                          <Select value={productForm.status} onValueChange={(value) => setProductForm({...productForm, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          required
                          placeholder="Describe your product, growing methods, quality, etc."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingProduct ? 'Update Product' : 'List Product'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetProductForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {myProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <Badge variant={product.status === 'available' ? 'default' : product.status === 'sold' ? 'secondary' : 'outline'}>
                              {product.status}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="mb-2">{product.category}</Badge>
                          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span><strong>₹{product.price}/{product.unit}</strong></span>
                              <span className="text-gray-500">{product.quantity} {product.unit} available</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>{product.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>Harvested: {new Date(product.harvest_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditProduct(product)}>
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this product listing? This action cannot be undone.
                                </AlertDialogDescription>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                  Delete
                                </AlertDialogAction>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {myProducts.length === 0 && !showAddProduct && (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No products listed yet. Start selling today!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Browse Tab */}
            <TabsContent value="browse">
              <Card>
                <CardHeader>
                  <CardTitle>Browse Marketplace</CardTitle>
                  <CardDescription>Discover products from other farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search products, farmers..."
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
                            {categories.map(category => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.filter(p => p.farmer !== user?.id).map((product) => (
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
                                ₹{product.price}/{product.unit}
                              </span>
                              <span className="text-gray-500">
                                {product.quantity} {product.unit}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="text-xs">{product.location}</span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span className="text-xs">
                                {new Date(product.harvest_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Button 
                              className="w-full" 
                              size="sm"
                              onClick={() => handleContactFarmer(product)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Farmer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredProducts.filter(p => p.farmer !== user?.id).length === 0 && (
                    <div className="text-center py-12">
                      <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-gray-500">No products found</p>
                      <p className="text-sm text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Buyer view
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
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
                        {categories.map(category => (
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
              </CardContent>
            </Card>

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
                          ₹{product.price}/{product.unit}
                        </span>
                        <span className="text-gray-500">
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="text-xs">{product.location}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          {new Date(product.harvest_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleContactFarmer(product)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Farmer
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Marketplace Stats</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Farmer Modal */}
        {showContactModal && selectedFarmerForContact && (
          <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Farmer</DialogTitle>
                <DialogDescription>
                  Get in touch with {selectedFarmerForContact.farmer_name} about {selectedFarmerForContact.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div>
                  <Label htmlFor="contact_name">Your Name</Label>
                  <Input
                    id="contact_name"
                    value={contactForm.name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Your Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={contactForm.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_subject">Subject</Label>
                  <Input
                    id="contact_subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_message">Message *</Label>
                  <Textarea
                    id="contact_message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Tell them more details..."
                    required
                    rows={4}
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <p><strong>Product:</strong> {selectedFarmerForContact.name}</p>
                  <p><strong>Price:</strong> ₹{selectedFarmerForContact.price}/{selectedFarmerForContact.unit}</p>
                  <p><strong>Location:</strong> {selectedFarmerForContact.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button type="button" variant="outline" onClick={resetContactForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Marketplace;