import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Package, TrendingUp, Users, DollarSign, Wrench, FileText, Calendar, MapPin, Phone } from 'lucide-react';
import { storage, Product, Farm, Equipment, EquipmentRental, GovernmentScheme, SchemeApplication } from '@/lib/storage';
import { User } from '@/lib/auth';
import { toast } from 'sonner';

interface DashboardProps {
  user?: User | null;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<EquipmentRental[]>([]);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showSchemeApplication, setShowSchemeApplication] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const currentUser = user;

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    location: '',
    harvestDate: ''
  });

  const [farmForm, setFarmForm] = useState({
    name: '',
    location: '',
    size: '',
    soilType: '',
    crops: '',
    waterSource: '',
    equipment: '',
    fertilizers: ''
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: '',
    description: '',
    pricePerDay: '',
    pricePerWeek: '',
    location: '',
    condition: 'good' as 'excellent' | 'good' | 'fair',
    specifications: ''
  });

  const [applicationForm, setApplicationForm] = useState({
    farmSize: '',
    cropType: '',
    annualIncome: '',
    landOwnership: 'owned' as 'owned' | 'leased',
    documents: '',
    additionalInfo: ''
  });

  useEffect(() => {
    if (currentUser?.role === 'farmer') {
      loadFarmerData();
    } else {
      loadBuyerData();
    }
    loadSchemes();
  }, [currentUser]);

  const loadFarmerData = () => {
    if (!currentUser) return;
    const userId = String(currentUser.id);
    const userProducts = storage.getProductsByFarmer(userId);
    const userFarms = storage.getFarmsByFarmer(userId);
    const userEquipments = storage.getEquipmentsByOwner(userId);
    const userRentals = storage.getRentalsByRenter(userId);
    const userApplications = storage.getSchemeApplicationsByFarmer(userId);
    
    setProducts(userProducts);
    setFarms(userFarms);
    setEquipments(userEquipments);
    setRentals(userRentals);
    setApplications(userApplications);
  };

  const loadBuyerData = () => {
    const allProducts = storage.getProducts();
    const allEquipments = storage.getEquipments();
    setProducts(allProducts);
    setEquipments(allEquipments);
  };

  const loadSchemes = () => {
    const allSchemes = storage.getGovernmentSchemes();
    setSchemes(allSchemes);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const productData = {
        farmerId: String(currentUser.id),
        farmerName: currentUser.username,
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        quantity: parseInt(productForm.quantity),
        description: productForm.description,
        location: productForm.location,
        harvestDate: productForm.harvestDate
      };

      if (editingProduct) {
        storage.updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        storage.saveProduct(productData);
        toast.success('Product added successfully!');
      }

      resetProductForm();
      loadFarmerData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleFarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const farmData = {
        farmerId: String(currentUser.id),
        name: farmForm.name,
        location: farmForm.location,
        size: parseFloat(farmForm.size),
        soilType: farmForm.soilType,
        crops: farmForm.crops.split(',').map(c => c.trim()),
        resources: {
          water: farmForm.waterSource,
          equipment: farmForm.equipment.split(',').map(e => e.trim()),
          fertilizers: farmForm.fertilizers.split(',').map(f => f.trim())
        }
      };

      if (editingFarm) {
        storage.updateFarm(editingFarm.id, farmData);
        toast.success('Farm updated successfully!');
      } else {
        storage.saveFarm(farmData);
        toast.success('Farm added successfully!');
      }

      resetFarmForm();
      loadFarmerData();
    } catch (error) {
      toast.error('Failed to save farm');
    }
  };

  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const equipmentData = {
        ownerId: String(currentUser.id),
        ownerName: currentUser.username,
        name: equipmentForm.name,
        type: equipmentForm.type,
        description: equipmentForm.description,
        pricePerDay: parseFloat(equipmentForm.pricePerDay),
        pricePerWeek: parseFloat(equipmentForm.pricePerWeek),
        location: equipmentForm.location,
        availability: true,
        condition: equipmentForm.condition,
        specifications: equipmentForm.specifications
      };

      if (editingEquipment) {
        storage.updateEquipment(editingEquipment.id, equipmentData);
        toast.success('Equipment updated successfully!');
      } else {
        storage.saveEquipment(equipmentData);
        toast.success('Equipment added successfully!');
      }

      resetEquipmentForm();
      loadFarmerData();
    } catch (error) {
      toast.error('Failed to save equipment');
    }
  };

  const handleSchemeApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedScheme) return;

    try {
      const applicationData = {
        schemeId: selectedScheme.id,
        schemeName: selectedScheme.name,
        farmerId: String(currentUser.id),
        farmerName: currentUser.username,
        applicationData: {
          farmSize: parseFloat(applicationForm.farmSize),
          cropType: applicationForm.cropType,
          annualIncome: parseFloat(applicationForm.annualIncome),
          landOwnership: applicationForm.landOwnership,
          documents: applicationForm.documents.split(',').map(d => d.trim()),
          additionalInfo: applicationForm.additionalInfo
        },
        status: 'submitted' as const,
        submittedAt: new Date().toISOString()
      };

      storage.saveSchemeApplication(applicationData);
      toast.success('Application submitted successfully!');
      
      resetApplicationForm();
      loadFarmerData();
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      price: '',
      unit: 'kg',
      quantity: '',
      description: '',
      location: '',
      harvestDate: ''
    });
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const resetFarmForm = () => {
    setFarmForm({
      name: '',
      location: '',
      size: '',
      soilType: '',
      crops: '',
      waterSource: '',
      equipment: '',
      fertilizers: ''
    });
    setShowAddFarm(false);
    setEditingFarm(null);
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({
      name: '',
      type: '',
      description: '',
      pricePerDay: '',
      pricePerWeek: '',
      location: '',
      condition: 'good',
      specifications: ''
    });
    setShowAddEquipment(false);
    setEditingEquipment(null);
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      farmSize: '',
      cropType: '',
      annualIncome: '',
      landOwnership: 'owned',
      documents: '',
      additionalInfo: ''
    });
    setShowSchemeApplication(false);
    setSelectedScheme(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      quantity: product.quantity.toString(),
      description: product.description,
      location: product.location,
      harvestDate: product.harvestDate
    });
    setShowAddProduct(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmForm({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      soilType: farm.soilType,
      crops: farm.crops.join(', '),
      waterSource: farm.resources.water,
      equipment: farm.resources.equipment.join(', '),
      fertilizers: farm.resources.fertilizers.join(', ')
    });
    setShowAddFarm(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setEquipmentForm({
      name: equipment.name,
      type: equipment.type,
      description: equipment.description,
      pricePerDay: equipment.pricePerDay.toString(),
      pricePerWeek: equipment.pricePerWeek.toString(),
      location: equipment.location,
      condition: equipment.condition,
      specifications: equipment.specifications
    });
    setShowAddEquipment(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (storage.deleteProduct(id)) {
      toast.success('Product deleted successfully!');
      loadFarmerData();
    } else {
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteEquipment = (id: string) => {
    if (storage.deleteEquipment(id)) {
      toast.success('Equipment deleted successfully!');
      loadFarmerData();
    } else {
      toast.error('Failed to delete equipment');
    }
  };

  const handleRentEquipment = (equipment: Equipment) => {
    // This would open a rental booking modal in a real application
    toast.info('Rental booking feature coming soon!');
  };

  const handleApplyScheme = (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme);
    setShowSchemeApplication(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const stats = currentUser.role === 'farmer' ? [
    { title: 'Total Products', value: products.length, icon: Package },
    { title: 'Total Farms', value: farms.length, icon: TrendingUp },
    { title: 'Equipment Listed', value: equipments.length, icon: Wrench },
    { title: 'Applications', value: applications.length, icon: FileText },
    { title: 'Revenue', value: '₹' + (products.reduce((sum, p) => sum + (p.price * p.quantity), 0)).toFixed(2), icon: DollarSign }
  ] : [
    { title: 'Available Products', value: products.length, icon: Package },
    { title: 'Available Equipment', value: equipments.length, icon: Wrench },
    { title: 'Categories', value: new Set(products.map(p => p.category)).size, icon: TrendingUp },
    { title: 'Farmers', value: new Set(products.map(p => p.farmerId)).size, icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            {currentUser.role === 'farmer' ? 'Manage your farm, products, equipment, and government schemes' : 'Discover fresh products and equipment from local farmers'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentUser.role === 'farmer' ? (
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="farms">Farms</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="schemes">Gov. Schemes</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Products</CardTitle>
                    <CardDescription>Manage your agricultural products</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddProduct(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddProduct && (
                    <form onSubmit={handleProductSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vegetables">Vegetables</SelectItem>
                              <SelectItem value="fruits">Fruits</SelectItem>
                              <SelectItem value="grains">Grains</SelectItem>
                              <SelectItem value="herbs">Herbs</SelectItem>
                              <SelectItem value="dairy">Dairy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">Unit</Label>
                          <Select value={productForm.unit} onValueChange={(value) => setProductForm({...productForm, unit: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">Kilogram</SelectItem>
                              <SelectItem value="lbs">Pounds</SelectItem>
                              <SelectItem value="pieces">Pieces</SelectItem>
                              <SelectItem value="bunches">Bunches</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={productForm.quantity}
                            onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="harvestDate">Harvest Date</Label>
                          <Input
                            id="harvestDate"
                            type="date"
                            value={productForm.harvestDate}
                            onChange={(e) => setProductForm({...productForm, harvestDate: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={productForm.location}
                          onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetProductForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEditProduct(product)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Price:</strong> ₹{product.price}/{product.unit}</p>
                            <p><strong>Quantity:</strong> {product.quantity} {product.unit}</p>
                            <p><strong>Location:</strong> {product.location}</p>
                            <p><strong>Harvest:</strong> {new Date(product.harvestDate).toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="farms">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Farms</CardTitle>
                    <CardDescription>Manage your farm information</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddFarm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Farm
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddFarm && (
                    <form onSubmit={handleFarmSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">
                        {editingFarm ? 'Edit Farm' : 'Add New Farm'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="farmName">Farm Name</Label>
                          <Input
                            id="farmName"
                            value={farmForm.name}
                            onChange={(e) => setFarmForm({...farmForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="farmLocation">Location</Label>
                          <Input
                            id="farmLocation"
                            value={farmForm.location}
                            onChange={(e) => setFarmForm({...farmForm, location: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="size">Size (acres)</Label>
                          <Input
                            id="size"
                            type="number"
                            step="0.1"
                            value={farmForm.size}
                            onChange={(e) => setFarmForm({...farmForm, size: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="soilType">Soil Type</Label>
                          <Input
                            id="soilType"
                            value={farmForm.soilType}
                            onChange={(e) => setFarmForm({...farmForm, soilType: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="crops">Crops (comma-separated)</Label>
                          <Input
                            id="crops"
                            value={farmForm.crops}
                            onChange={(e) => setFarmForm({...farmForm, crops: e.target.value})}
                            placeholder="e.g., Tomatoes, Lettuce, Carrots"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="waterSource">Water Source</Label>
                          <Input
                            id="waterSource"
                            value={farmForm.waterSource}
                            onChange={(e) => setFarmForm({...farmForm, waterSource: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                          <Input
                            id="equipment"
                            value={farmForm.equipment}
                            onChange={(e) => setFarmForm({...farmForm, equipment: e.target.value})}
                            placeholder="e.g., Tractor, Harvester"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fertilizers">Fertilizers (comma-separated)</Label>
                          <Input
                            id="fertilizers"
                            value={farmForm.fertilizers}
                            onChange={(e) => setFarmForm({...farmForm, fertilizers: e.target.value})}
                            placeholder="e.g., Organic compost, Natural fertilizer"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingFarm ? 'Update Farm' : 'Add Farm'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetFarmForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farms.map((farm) => (
                      <Card key={farm.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{farm.name}</h3>
                            <Button size="sm" variant="ghost" onClick={() => handleEditFarm(farm)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Location:</strong> {farm.location}</p>
                            <p><strong>Size:</strong> {farm.size} acres</p>
                            <p><strong>Soil Type:</strong> {farm.soilType}</p>
                            <p><strong>Crops:</strong> {farm.crops.join(', ')}</p>
                            <p><strong>Water Source:</strong> {farm.resources.water}</p>
                            <p><strong>Equipment:</strong> {farm.resources.equipment.join(', ')}</p>
                            <p><strong>Fertilizers:</strong> {farm.resources.fertilizers.join(', ')}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Equipment</CardTitle>
                    <CardDescription>Manage equipment for rent</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddEquipment(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddEquipment && (
                    <form onSubmit={handleEquipmentSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">
                        {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="equipmentName">Equipment Name</Label>
                          <Input
                            id="equipmentName"
                            value={equipmentForm.name}
                            onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipmentType">Type</Label>
                          <Select value={equipmentForm.type} onValueChange={(value) => setEquipmentForm({...equipmentForm, type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tractor">Tractor</SelectItem>
                              <SelectItem value="harvester">Harvester</SelectItem>
                              <SelectItem value="plough">Plough</SelectItem>
                              <SelectItem value="seeder">Seeder</SelectItem>
                              <SelectItem value="sprayer">Sprayer</SelectItem>
                              <SelectItem value="thresher">Thresher</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                          <Input
                            id="pricePerDay"
                            type="number"
                            value={equipmentForm.pricePerDay}
                            onChange={(e) => setEquipmentForm({...equipmentForm, pricePerDay: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pricePerWeek">Price per Week (₹)</Label>
                          <Input
                            id="pricePerWeek"
                            type="number"
                            value={equipmentForm.pricePerWeek}
                            onChange={(e) => setEquipmentForm({...equipmentForm, pricePerWeek: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipmentLocation">Location</Label>
                          <Input
                            id="equipmentLocation"
                            value={equipmentForm.location}
                            onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="condition">Condition</Label>
                          <Select value={equipmentForm.condition} onValueChange={(value: 'excellent' | 'good' | 'fair') => setEquipmentForm({...equipmentForm, condition: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="specifications">Specifications</Label>
                        <Input
                          id="specifications"
                          value={equipmentForm.specifications}
                          onChange={(e) => setEquipmentForm({...equipmentForm, specifications: e.target.value})}
                          placeholder="e.g., 50 HP, 4WD, Power Steering"
                        />
                      </div>
                      <div>
                        <Label htmlFor="equipmentDescription">Description</Label>
                        <Textarea
                          id="equipmentDescription"
                          value={equipmentForm.description}
                          onChange={(e) => setEquipmentForm({...equipmentForm, description: e.target.value})}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetEquipmentForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipments.map((equipment) => (
                      <Card key={equipment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{equipment.name}</h3>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEditEquipment(equipment)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteEquipment(equipment.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Badge variant="secondary" className="mb-2">{equipment.type}</Badge>
                          <Badge variant={equipment.availability ? "default" : "destructive"} className="mb-2 ml-2">
                            {equipment.availability ? "Available" : "Rented"}
                          </Badge>
                          <p className="text-sm text-gray-600 mb-2">{equipment.description}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Daily Rate:</strong> ₹{equipment.pricePerDay}</p>
                            <p><strong>Weekly Rate:</strong> ₹{equipment.pricePerWeek}</p>
                            <p><strong>Condition:</strong> {equipment.condition}</p>
                            <p><strong>Location:</strong> {equipment.location}</p>
                            <p><strong>Specs:</strong> {equipment.specifications}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schemes">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Government Schemes & Subsidies</CardTitle>
                    <CardDescription>Apply for government schemes and track your applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schemes.map((scheme) => (
                        <Card key={scheme.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold">{scheme.name}</h3>
                              <Badge variant={scheme.category === 'subsidy' ? 'default' : 'secondary'}>
                                {scheme.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
                            <div className="space-y-2 text-sm">
                              <p><strong>Benefits:</strong> {scheme.benefits}</p>
                              <p><strong>Eligibility:</strong> {scheme.eligibility.join(', ')}</p>
                              {scheme.deadline && (
                                <p><strong>Deadline:</strong> {new Date(scheme.deadline).toLocaleDateString()}</p>
                              )}
                            </div>
                            <Button 
                              className="w-full mt-4" 
                              size="sm"
                              onClick={() => handleApplyScheme(scheme)}
                            >
                              Apply Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {showSchemeApplication && selectedScheme && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Apply for {selectedScheme.name}</CardTitle>
                      <CardDescription>Fill in the required information to apply</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSchemeApplicationSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="farmSize">Farm Size (acres)</Label>
                            <Input
                              id="farmSize"
                              type="number"
                              step="0.1"
                              value={applicationForm.farmSize}
                              onChange={(e) => setApplicationForm({...applicationForm, farmSize: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cropType">Primary Crop Type</Label>
                            <Input
                              id="cropType"
                              value={applicationForm.cropType}
                              onChange={(e) => setApplicationForm({...applicationForm, cropType: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="annualIncome">Annual Income (₹)</Label>
                            <Input
                              id="annualIncome"
                              type="number"
                              value={applicationForm.annualIncome}
                              onChange={(e) => setApplicationForm({...applicationForm, annualIncome: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="landOwnership">Land Ownership</Label>
                            <Select value={applicationForm.landOwnership} onValueChange={(value: 'owned' | 'leased') => setApplicationForm({...applicationForm, landOwnership: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owned">Owned</SelectItem>
                                <SelectItem value="leased">Leased</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="documents">Documents Available (comma-separated)</Label>
                          <Input
                            id="documents"
                            value={applicationForm.documents}
                            onChange={(e) => setApplicationForm({...applicationForm, documents: e.target.value})}
                            placeholder="e.g., Aadhaar Card, Land Records, Bank Account Details"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="additionalInfo">Additional Information</Label>
                          <Textarea
                            id="additionalInfo"
                            value={applicationForm.additionalInfo}
                            onChange={(e) => setApplicationForm({...applicationForm, additionalInfo: e.target.value})}
                            placeholder="Any additional information that might help your application"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">Submit Application</Button>
                          <Button type="button" variant="outline" onClick={resetApplicationForm}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                    <CardDescription>Track the status of your scheme applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <Card key={application.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold">{application.schemeName}</h3>
                              <Badge variant={
                                application.status === 'approved' ? 'default' :
                                application.status === 'rejected' ? 'destructive' :
                                application.status === 'under_review' ? 'secondary' :
                                'outline'
                              }>
                                {application.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><strong>Farm Size:</strong> {application.applicationData.farmSize} acres</p>
                              <p><strong>Crop Type:</strong> {application.applicationData.cropType}</p>
                              <p><strong>Annual Income:</strong> ₹{application.applicationData.annualIncome}</p>
                              <p><strong>Submitted:</strong> {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'Draft'}</p>
                              {application.comments && (
                                <p><strong>Comments:</strong> {application.comments}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {applications.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No applications yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Available Products</CardTitle>
                  <CardDescription>Browse fresh products from local farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{product.name}</h3>
                          <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Farmer:</strong> {product.farmerName}</p>
                            <p><strong>Price:</strong> ₹{product.price}/{product.unit}</p>
                            <p><strong>Available:</strong> {product.quantity} {product.unit}</p>
                            <p><strong>Location:</strong> {product.location}</p>
                            <p><strong>Harvest:</strong> {new Date(product.harvestDate).toLocaleDateString()}</p>
                          </div>
                          <Button className="w-full mt-4" size="sm">
                            Contact Farmer
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card>
                <CardHeader>
                  <CardTitle>Available Equipment</CardTitle>
                  <CardDescription>Rent farming equipment from local farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipments.filter(e => e.availability).map((equipment) => (
                      <Card key={equipment.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{equipment.name}</h3>
                          <Badge variant="secondary" className="mb-2">{equipment.type}</Badge>
                          <p className="text-sm text-gray-600 mb-2">{equipment.description}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Owner:</strong> {equipment.ownerName}</p>
                            <p><strong>Daily Rate:</strong> ₹{equipment.pricePerDay}</p>
                            <p><strong>Weekly Rate:</strong> ₹{equipment.pricePerWeek}</p>
                            <p><strong>Condition:</strong> {equipment.condition}</p>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{equipment.location}</span>
                            </div>
                            <p><strong>Specs:</strong> {equipment.specifications}</p>
                          </div>
                          <Button 
                            className="w-full mt-4" 
                            size="sm"
                            onClick={() => handleRentEquipment(equipment)}
                          >
                            Rent Equipment
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;