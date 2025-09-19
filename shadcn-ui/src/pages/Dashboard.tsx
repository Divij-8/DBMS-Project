import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, Package, Users, MapPin, Calendar, DollarSign } from 'lucide-react';
import { storage, User, Product, Farm } from '@/lib/storage';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    unit: '',
    description: '',
    harvestDate: ''
  });
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    soilType: '',
    crops: '',
    water: '',
    equipment: '',
    fertilizers: ''
  });

  useEffect(() => {
    if (user.role === 'farmer') {
      const userProducts = storage.getProductsByFarmer(user.id);
      const userFarms = storage.getFarmsByFarmer(user.id);
      setProducts(userProducts);
      setFarms(userFarms);
    } else {
      const allProducts = storage.getProducts();
      setProducts(allProducts);
    }
  }, [user]);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productData = {
      farmerId: user.id,
      farmerName: user.name,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity) || 1,
      unit: newProduct.unit || 'kg',
      description: newProduct.description,
      location: user.location || 'Not specified',
      harvestDate: newProduct.harvestDate || new Date().toISOString().split('T')[0]
    };

    const product = storage.saveProduct(productData);
    setProducts(prev => [product, ...prev]);
    setIsAddProductOpen(false);
    setNewProduct({
      name: '',
      category: '',
      price: '',
      quantity: '',
      unit: '',
      description: '',
      harvestDate: ''
    });
    toast.success('Product added successfully!');
  };

  const handleAddFarm = () => {
    if (!newFarm.name || !newFarm.location || !newFarm.size) {
      toast.error('Please fill in all required fields');
      return;
    }

    const farmData = {
      farmerId: user.id,
      name: newFarm.name,
      location: newFarm.location,
      size: parseFloat(newFarm.size),
      soilType: newFarm.soilType || 'Not specified',
      crops: newFarm.crops.split(',').map(c => c.trim()).filter(c => c),
      resources: {
        water: newFarm.water || 'Not specified',
        equipment: newFarm.equipment.split(',').map(e => e.trim()).filter(e => e),
        fertilizers: newFarm.fertilizers.split(',').map(f => f.trim()).filter(f => f)
      }
    };

    const farm = storage.saveFarm(farmData);
    setFarms(prev => [farm, ...prev]);
    setIsAddFarmOpen(false);
    setNewFarm({
      name: '',
      location: '',
      size: '',
      soilType: '',
      crops: '',
      water: '',
      equipment: '',
      fertilizers: ''
    });
    toast.success('Farm added successfully!');
  };

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy', 'Meat', 'Other'];

  // Helper function for INR formatting
  const formatINR = (amount: number) =>
    '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'farmer' ? 'Manage your farm and products' : 'Browse available products'}
        </p>
      </div>

      {user.role === 'farmer' ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="farms">Farms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active listings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{farms.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered farms
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatINR(products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Potential earnings
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Products</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your marketplace listing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Organic Tomatoes"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={newProduct.unit} onValueChange={(value) => setNewProduct(prev => ({ ...prev, unit: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="kg" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                            <SelectItem value="tons">tons</SelectItem>
                            <SelectItem value="pieces">pieces</SelectItem>
                            <SelectItem value="bunches">bunches</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your product..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="harvestDate">Harvest Date</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        value={newProduct.harvestDate}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, harvestDate: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleAddProduct} className="w-full">
                      Add Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                    <CardDescription>
                      {formatINR(Number(product.price))} per {product.unit}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>Quantity: {product.quantity} {product.unit}</span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {product.harvestDate}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="farms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Farms</h2>
              <Dialog open={isAddFarmOpen} onOpenChange={setIsAddFarmOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Farm
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Farm</DialogTitle>
                    <DialogDescription>
                      Register a new farm to your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Farm form fields here as before */}
                    {/* ... */}
                    <Button onClick={handleAddFarm} className="w-full">
                      Add Farm
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Farms grid as before */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {farms.map((farm) => (
                <Card key={farm.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{farm.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {farm.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Size:</span>
                        <span className="text-sm">{farm.size} acres</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Soil Type:</span>
                        <span className="text-sm">{farm.soilType}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Crops:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {farm.crops.map((crop, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Buyer Dashboard
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Available Products
              </CardTitle>
              <CardDescription>
                Browse products from local farmers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                      <CardDescription>
                        By {product.farmerName} • {formatINR(Number(product.price))} per {product.unit}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span>Available: {product.quantity} {product.unit}</span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {product.location}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
