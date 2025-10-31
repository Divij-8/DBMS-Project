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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, MapPin, Calendar, DollarSign, Wrench, CheckCircle, Clock, X, Mail, Phone } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { User } from '@/lib/auth';

interface EquipmentFormData {
  name: string;
  equipment_type: string;
  description: string;
  daily_rate: string;
  weekly_rate: string;
  monthly_rate: string;
  security_deposit: string;
  location: string;
  condition: string;
  brand: string;
  model: string;
  year_manufactured: string;
  min_rental_days: string;
  max_rental_days: string;
  delivery_available: boolean;
  delivery_radius_km: string;
  specifications: string;
}

interface RentalFormData {
  equipment: string;
  start_date: string;
  end_date: string;
  rental_days: string;
  daily_rate: string;
  total_amount: string;
  security_deposit: string;
  delivery_required: boolean;
  delivery_address: string;
  special_instructions: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EquipmentData {
  id: number;
  name: string;
  equipment_type: string;
  description: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  security_deposit?: number;
  location: string;
  condition: string;
  status: string;
  owner_id: number;
  owner_name: string;
  owner_phone: string;
  owner_location: string;
  created_at: string;
}

interface RentalData {
  id: number;
  equipment: number;
  equipment_name: string;
  equipment_type: string;
  renter: number;
  renter_name: string;
  owner_name: string;
  start_date: string;
  end_date: string;
  rental_days: number;
  daily_rate: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  delivery_required?: boolean;
  delivery_address?: string;
  special_instructions?: string;
}

interface EquipmentProps {
  user?: User | null;
}

const Equipment = ({ user }: EquipmentProps) => {
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentData[]>([]);
  const [myEquipment, setMyEquipment] = useState<EquipmentData[]>([]);
  const [myRentals, setMyRentals] = useState<RentalData[]>([]);
  const [equipmentRentalRequests, setEquipmentRentalRequests] = useState<RentalData[]>([]);

  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showRentalRequest, setShowRentalRequest] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentData | null>(null);
  const [selectedEquipmentForRental, setSelectedEquipmentForRental] = useState<EquipmentData | null>(null);
  const [selectedFarmerForContact, setSelectedFarmerForContact] = useState<EquipmentData | null>(null);

  const [equipmentForm, setEquipmentForm] = useState<EquipmentFormData>({
    name: '',
    equipment_type: '',
    description: '',
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    security_deposit: '',
    location: '',
    condition: 'good',
    brand: '',
    model: '',
    year_manufactured: '',
    min_rental_days: '1',
    max_rental_days: '',
    delivery_available: false,
    delivery_radius_km: '',
    specifications: ''
  });

  const [rentalForm, setRentalForm] = useState<RentalFormData>({
    equipment: '',
    start_date: '',
    end_date: '',
    rental_days: '',
    daily_rate: '',
    total_amount: '',
    security_deposit: '',
    delivery_required: false,
    delivery_address: '',
    special_instructions: ''
  });

  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      loadEquipment();
    }
  }, [user]);

  const loadEquipment = async () => {
    try {
      // Load available equipment for rental
      const availRes = await apiService.get('/equipment/available_equipment/');
      setAvailableEquipment(availRes.results || availRes);

      // Load user's equipment if farmer
      if (user?.role === 'farmer') {
        const myEquipRes = await apiService.get('/equipment/my_equipment/');
        setMyEquipment(myEquipRes.results || myEquipRes);

        // Load rental requests for user's equipment
        const rentalReqRes = await apiService.get('/equipment-rentals/my_equipment_rentals/');
        setEquipmentRentalRequests(rentalReqRes.results || rentalReqRes);

        // Load user's rentals
        const myRentalsRes = await apiService.get('/equipment-rentals/my_rentals/');
        setMyRentals(myRentalsRes.results || myRentalsRes);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment');
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: equipmentForm.name,
        equipment_type: equipmentForm.equipment_type,
        description: equipmentForm.description,
        daily_rate: parseFloat(equipmentForm.daily_rate),
        weekly_rate: equipmentForm.weekly_rate ? parseFloat(equipmentForm.weekly_rate) : null,
        monthly_rate: equipmentForm.monthly_rate ? parseFloat(equipmentForm.monthly_rate) : null,
        security_deposit: equipmentForm.security_deposit ? parseFloat(equipmentForm.security_deposit) : null,
        location: equipmentForm.location,
        condition: equipmentForm.condition,
        brand: equipmentForm.brand,
        model: equipmentForm.model,
        year_manufactured: equipmentForm.year_manufactured ? parseInt(equipmentForm.year_manufactured) : null,
        min_rental_days: parseInt(equipmentForm.min_rental_days),
        max_rental_days: equipmentForm.max_rental_days ? parseInt(equipmentForm.max_rental_days) : null,
        delivery_available: equipmentForm.delivery_available,
        delivery_radius_km: equipmentForm.delivery_radius_km ? parseInt(equipmentForm.delivery_radius_km) : null,
        specifications: equipmentForm.specifications
      };

      if (editingEquipment) {
        await apiService.patch(`/equipment/${editingEquipment.id}/`, payload);
        toast.success('Equipment updated successfully!');
      } else {
        await apiService.post('/equipment/', payload);
        toast.success('Equipment added successfully!');
      }

      resetEquipmentForm();
      loadEquipment();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save equipment');
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    try {
      await apiService.delete(`/equipment/${id}/`);
      toast.success('Equipment deleted successfully!');
      loadEquipment();
    } catch (error) {
      toast.error('Failed to delete equipment');
    }
  };

  const handleEditEquipment = (equipment: EquipmentData) => {
    setEditingEquipment(equipment);
    setEquipmentForm({
      name: equipment.name,
      equipment_type: equipment.equipment_type,
      description: equipment.description,
      daily_rate: equipment.daily_rate.toString(),
      weekly_rate: equipment.weekly_rate?.toString() || '',
      monthly_rate: equipment.monthly_rate?.toString() || '',
      security_deposit: equipment.security_deposit?.toString() || '',
      location: equipment.location,
      condition: equipment.condition,
      brand: equipment.owner_name,
      model: '',
      year_manufactured: '',
      min_rental_days: '1',
      max_rental_days: '',
      delivery_available: false,
      delivery_radius_km: '',
      specifications: ''
    });
    setShowAddEquipment(true);
  };

  const handleRequestRental = (equipment: EquipmentData) => {
    setSelectedEquipmentForRental(equipment);
    setRentalForm({
      equipment: equipment.id.toString(),
      start_date: '',
      end_date: '',
      rental_days: '',
      daily_rate: equipment.daily_rate.toString(),
      total_amount: '',
      security_deposit: equipment.security_deposit?.toString() || '',
      delivery_required: false,
      delivery_address: '',
      special_instructions: ''
    });
    setShowRentalRequest(true);
  };

  const handleContactFarmer = (equipment: EquipmentData) => {
    setSelectedFarmerForContact(equipment);
    setContactForm({
      name: user?.username || '',
      email: user?.email || '',
      subject: `Inquiry about ${equipment.name}`,
      message: ''
    });
    setShowContactModal(true);
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const calculateTotalAmount = () => {
    const days = parseInt(rentalForm.rental_days);
    const dailyRate = parseFloat(rentalForm.daily_rate);
    return (days * dailyRate).toFixed(2);
  };

  const handleRentalFormChange = (field: keyof RentalFormData, value: any) => {
    setRentalForm(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'start_date' || field === 'end_date') {
        if (updated.start_date && updated.end_date) {
          const days = calculateRentalDays(updated.start_date, updated.end_date);
          updated.rental_days = days.toString();
          updated.total_amount = (days * parseFloat(updated.daily_rate)).toFixed(2);
        }
      }
      
      return updated;
    });
  };

  const handleSubmitRentalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        equipment: parseInt(rentalForm.equipment),
        start_date: rentalForm.start_date,
        end_date: rentalForm.end_date,
        rental_days: parseInt(rentalForm.rental_days),
        daily_rate: parseFloat(rentalForm.daily_rate),
        total_amount: parseFloat(rentalForm.total_amount),
        security_deposit: rentalForm.security_deposit ? parseFloat(rentalForm.security_deposit) : null,
        delivery_required: rentalForm.delivery_required,
        delivery_address: rentalForm.delivery_address,
        special_instructions: rentalForm.special_instructions
      };

      await apiService.post('/equipment-rentals/', payload);
      toast.success('Rental request submitted! Awaiting owner confirmation.');
      resetRentalForm();
      loadEquipment();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit rental request');
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, we'll use email or show a success message
      // In a real app, this would send an email through the backend
      toast.success(`Message sent to ${selectedFarmerForContact?.owner_name}! They will contact you soon.`);
      resetContactForm();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleConfirmRental = async (rentalId: number) => {
    try {
      await apiService.post(`/equipment-rentals/${rentalId}/confirm_rental/`, {});
      toast.success('Rental confirmed!');
      loadEquipment();
    } catch (error) {
      toast.error('Failed to confirm rental');
    }
  };

  const handleCancelRental = async (rentalId: number) => {
    try {
      await apiService.post(`/equipment-rentals/${rentalId}/cancel_rental/`, {});
      toast.success('Rental cancelled!');
      loadEquipment();
    } catch (error) {
      toast.error('Failed to cancel rental');
    }
  };

  const handleCompleteRental = async (rentalId: number) => {
    try {
      await apiService.post(`/equipment-rentals/${rentalId}/complete_rental/`, {});
      toast.success('Rental marked as completed!');
      loadEquipment();
    } catch (error) {
      toast.error('Failed to complete rental');
    }
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({
      name: '',
      equipment_type: '',
      description: '',
      daily_rate: '',
      weekly_rate: '',
      monthly_rate: '',
      security_deposit: '',
      location: '',
      condition: 'good',
      brand: '',
      model: '',
      year_manufactured: '',
      min_rental_days: '1',
      max_rental_days: '',
      delivery_available: false,
      delivery_radius_km: '',
      specifications: ''
    });
    setShowAddEquipment(false);
    setEditingEquipment(null);
  };

  const resetRentalForm = () => {
    setRentalForm({
      equipment: '',
      start_date: '',
      end_date: '',
      rental_days: '',
      daily_rate: '',
      total_amount: '',
      security_deposit: '',
      delivery_required: false,
      delivery_address: '',
      special_instructions: ''
    });
    setShowRentalRequest(false);
    setSelectedEquipmentForRental(null);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access equipment rentals.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Equipment Rental</h1>
            <p className="text-gray-600 mt-2">
              Equipment rental is exclusively available for farmers.
            </p>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Farmer-to-Farmer Equipment Rental</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  This feature is exclusively for farmers to rent equipment from other farmers. 
                  As a buyer, you can browse and purchase agricultural products from our marketplace instead.
                </p>
                <Button onClick={() => window.location.href = '/marketplace'}>
                  Go to Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'farmer' 
              ? 'Manage your equipment and rental requests' 
              : 'Browse and rent equipment from local farmers'}
          </p>
        </div>

        {user.role === 'farmer' ? (
          <Tabs defaultValue="my-equipment" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-equipment">My Equipment</TabsTrigger>
              <TabsTrigger value="rental-requests">Rental Requests</TabsTrigger>
              <TabsTrigger value="my-rentals">My Rentals</TabsTrigger>
              <TabsTrigger value="browse">Browse Equipment</TabsTrigger>
            </TabsList>

            {/* My Equipment Tab */}
            <TabsContent value="my-equipment">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Equipment for Rent</CardTitle>
                    <CardDescription>Manage equipment you're offering to rent</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddEquipment(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddEquipment && (
                    <form onSubmit={handleAddEquipment} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">
                        {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Equipment Name *</Label>
                          <Input
                            id="name"
                            value={equipmentForm.name}
                            onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipment_type">Equipment Type *</Label>
                          <Select value={equipmentForm.equipment_type} onValueChange={(value) => setEquipmentForm({...equipmentForm, equipment_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tractor">Tractor</SelectItem>
                              <SelectItem value="harvester">Harvester</SelectItem>
                              <SelectItem value="plow">Plow</SelectItem>
                              <SelectItem value="sprayer">Sprayer</SelectItem>
                              <SelectItem value="seeder">Seeder</SelectItem>
                              <SelectItem value="cultivator">Cultivator</SelectItem>
                              <SelectItem value="irrigation">Irrigation System</SelectItem>
                              <SelectItem value="storage">Storage Equipment</SelectItem>
                              <SelectItem value="processing">Processing Equipment</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            value={equipmentForm.brand}
                            onChange={(e) => setEquipmentForm({...equipmentForm, brand: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="model">Model</Label>
                          <Input
                            id="model"
                            value={equipmentForm.model}
                            onChange={(e) => setEquipmentForm({...equipmentForm, model: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="year_manufactured">Year Manufactured</Label>
                          <Input
                            id="year_manufactured"
                            type="number"
                            value={equipmentForm.year_manufactured}
                            onChange={(e) => setEquipmentForm({...equipmentForm, year_manufactured: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="condition">Condition *</Label>
                          <Select value={equipmentForm.condition} onValueChange={(value) => setEquipmentForm({...equipmentForm, condition: value})}>
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
                        <div>
                          <Label htmlFor="daily_rate">Daily Rate (₹) *</Label>
                          <Input
                            id="daily_rate"
                            type="number"
                            step="0.01"
                            value={equipmentForm.daily_rate}
                            onChange={(e) => setEquipmentForm({...equipmentForm, daily_rate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="weekly_rate">Weekly Rate (₹)</Label>
                          <Input
                            id="weekly_rate"
                            type="number"
                            step="0.01"
                            value={equipmentForm.weekly_rate}
                            onChange={(e) => setEquipmentForm({...equipmentForm, weekly_rate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthly_rate">Monthly Rate (₹)</Label>
                          <Input
                            id="monthly_rate"
                            type="number"
                            step="0.01"
                            value={equipmentForm.monthly_rate}
                            onChange={(e) => setEquipmentForm({...equipmentForm, monthly_rate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
                          <Input
                            id="security_deposit"
                            type="number"
                            step="0.01"
                            value={equipmentForm.security_deposit}
                            onChange={(e) => setEquipmentForm({...equipmentForm, security_deposit: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="min_rental_days">Min Rental Days *</Label>
                          <Input
                            id="min_rental_days"
                            type="number"
                            value={equipmentForm.min_rental_days}
                            onChange={(e) => setEquipmentForm({...equipmentForm, min_rental_days: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_rental_days">Max Rental Days</Label>
                          <Input
                            id="max_rental_days"
                            type="number"
                            value={equipmentForm.max_rental_days}
                            onChange={(e) => setEquipmentForm({...equipmentForm, max_rental_days: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={equipmentForm.location}
                            onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery_radius_km">Delivery Radius (km)</Label>
                          <Input
                            id="delivery_radius_km"
                            type="number"
                            value={equipmentForm.delivery_radius_km}
                            onChange={(e) => setEquipmentForm({...equipmentForm, delivery_radius_km: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="delivery_available"
                          type="checkbox"
                          checked={equipmentForm.delivery_available}
                          onChange={(e) => setEquipmentForm({...equipmentForm, delivery_available: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="delivery_available" className="mb-0">Delivery Available</Label>
                      </div>
                      <div>
                        <Label htmlFor="specifications">Specifications</Label>
                        <Textarea
                          id="specifications"
                          value={equipmentForm.specifications}
                          onChange={(e) => setEquipmentForm({...equipmentForm, specifications: e.target.value})}
                          placeholder="e.g., 50 HP, 4WD, Power Steering, Fuel Tank Capacity..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
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
                    {myEquipment.map((equipment) => (
                      <Card key={equipment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{equipment.name}</h3>
                            <Badge variant={equipment.status === 'available' ? 'default' : 'secondary'}>
                              {equipment.status}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="mb-2">{equipment.equipment_type}</Badge>
                          <p className="text-sm text-gray-600 mb-3">{equipment.description}</p>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span><strong>₹{equipment.daily_rate}/day</strong></span>
                            </div>
                            {equipment.weekly_rate && (
                              <p><strong>Weekly:</strong> ₹{equipment.weekly_rate}</p>
                            )}
                            {equipment.monthly_rate && (
                              <p><strong>Monthly:</strong> ₹{equipment.monthly_rate}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>{equipment.location}</span>
                            </div>
                            <p><strong>Condition:</strong> {equipment.condition}</p>
                            {equipment.security_deposit && (
                              <p><strong>Security Deposit:</strong> ₹{equipment.security_deposit}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditEquipment(equipment)}>
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
                                <AlertDialogTitle>Delete Equipment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this equipment? This action cannot be undone.
                                </AlertDialogDescription>
                                <AlertDialogAction onClick={() => handleDeleteEquipment(equipment.id)}>
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
                  {myEquipment.length === 0 && !showAddEquipment && (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No equipment listed yet. Add your first equipment!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rental Requests Tab */}
            <TabsContent value="rental-requests">
              <Card>
                <CardHeader>
                  <CardTitle>Rental Requests for Your Equipment</CardTitle>
                  <CardDescription>Manage rental requests from other farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipmentRentalRequests.map((rental) => (
                      <Card key={rental.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{rental.equipment_name}</h3>
                              <p className="text-sm text-gray-600">Requested by: {rental.renter_name}</p>
                            </div>
                            <Badge variant={
                              rental.status === 'pending' ? 'outline' :
                              rental.status === 'confirmed' ? 'default' :
                              rental.status === 'active' ? 'secondary' :
                              rental.status === 'completed' ? 'default' :
                              'destructive'
                            }>
                              {rental.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Start Date</p>
                              <p className="font-semibold">{new Date(rental.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">End Date</p>
                              <p className="font-semibold">{new Date(rental.end_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Days</p>
                              <p className="font-semibold">{rental.rental_days}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-semibold">₹{rental.total_amount}</p>
                            </div>
                          </div>
                          {rental.delivery_required && (
                            <p className="text-sm mb-3 bg-blue-50 p-2 rounded">
                              <strong>Delivery Required:</strong> {rental.delivery_address}
                            </p>
                          )}
                          {rental.special_instructions && (
                            <p className="text-sm mb-3 bg-yellow-50 p-2 rounded">
                              <strong>Special Instructions:</strong> {rental.special_instructions}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {rental.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleConfirmRental(rental.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleCancelRental(rental.id)}>
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {rental.status === 'active' && (
                              <Button size="sm" onClick={() => handleCompleteRental(rental.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            {rental.status === 'confirmed' && (
                              <Button size="sm" variant="outline" onClick={() => handleCancelRental(rental.id)}>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {equipmentRentalRequests.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No rental requests yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Rentals Tab */}
            <TabsContent value="my-rentals">
              <Card>
                <CardHeader>
                  <CardTitle>My Equipment Rentals</CardTitle>
                  <CardDescription>Equipment you've rented from other farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myRentals.map((rental) => (
                      <Card key={rental.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{rental.equipment_name}</h3>
                              <p className="text-sm text-gray-600">Owner: {rental.owner_name}</p>
                            </div>
                            <Badge variant={
                              rental.status === 'pending' ? 'outline' :
                              rental.status === 'confirmed' ? 'default' :
                              rental.status === 'active' ? 'secondary' :
                              rental.status === 'completed' ? 'default' :
                              'destructive'
                            }>
                              {rental.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Start Date</p>
                              <p className="font-semibold">{new Date(rental.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">End Date</p>
                              <p className="font-semibold">{new Date(rental.end_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Payment</p>
                              <p className="font-semibold">{rental.payment_status}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-semibold">₹{rental.total_amount}</p>
                            </div>
                          </div>
                          {rental.status !== 'completed' && rental.status !== 'cancelled' && (
                            <Button size="sm" variant="outline" onClick={() => handleCancelRental(rental.id)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel Rental
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {myRentals.length === 0 && (
                      <div className="text-center py-8">
                        <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">You haven't rented any equipment yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Browse Equipment Tab */}
            <TabsContent value="browse">
              <Card>
                <CardHeader>
                  <CardTitle>Available Equipment to Rent</CardTitle>
                  <CardDescription>Browse equipment from other farmers in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableEquipment.filter(eq => eq.owner_id !== user.id).map((equipment) => (
                      <Card key={equipment.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
                          <Badge variant="outline" className="mb-3">{equipment.equipment_type}</Badge>
                          <p className="text-sm text-gray-600 mb-3">{equipment.description}</p>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span><strong>₹{equipment.daily_rate}/day</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>{equipment.location}</span>
                            </div>
                            <p><strong>Owner:</strong> {equipment.owner_name}</p>
                            <p><strong>Condition:</strong> {equipment.condition}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1"
                              size="sm"
                              onClick={() => handleRequestRental(equipment)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Rent
                            </Button>
                            <Button 
                              className="flex-1"
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactFarmer(equipment)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {availableEquipment.filter(eq => eq.owner_id !== user.id).length === 0 && (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No equipment available for rent right now</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Buyer view - Browse only
          <Card>
            <CardHeader>
              <CardTitle>Available Equipment</CardTitle>
              <CardDescription>Browse equipment from local farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableEquipment.map((equipment) => (
                  <Card key={equipment.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
                      <Badge variant="outline" className="mb-3">{equipment.equipment_type}</Badge>
                      <p className="text-sm text-gray-600 mb-3">{equipment.description}</p>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span><strong>₹{equipment.daily_rate}/day</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span>{equipment.location}</span>
                        </div>
                        <p><strong>Owner:</strong> {equipment.owner_name}</p>
                        <p><strong>Phone:</strong> {equipment.owner_phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rental Request Modal */}
        {showRentalRequest && selectedEquipmentForRental && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Request Equipment Rental</CardTitle>
                <CardDescription>{selectedEquipmentForRental.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRentalRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={rentalForm.start_date}
                        onChange={(e) => handleRentalFormChange('start_date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={rentalForm.end_date}
                        onChange={(e) => handleRentalFormChange('end_date', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {rentalForm.rental_days && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm"><strong>Rental Days:</strong> {rentalForm.rental_days}</p>
                      <p className="text-sm"><strong>Total Amount:</strong> ₹{rentalForm.total_amount}</p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        id="delivery_required"
                        type="checkbox"
                        checked={rentalForm.delivery_required}
                        onChange={(e) => handleRentalFormChange('delivery_required', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="delivery_required" className="mb-0">Require Delivery</Label>
                    </div>
                  </div>
                  {rentalForm.delivery_required && (
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address</Label>
                      <Textarea
                        id="delivery_address"
                        value={rentalForm.delivery_address}
                        onChange={(e) => handleRentalFormChange('delivery_address', e.target.value)}
                        required={rentalForm.delivery_required}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      value={rentalForm.special_instructions}
                      onChange={(e) => handleRentalFormChange('special_instructions', e.target.value)}
                      placeholder="Any special requirements or instructions..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Request Rental</Button>
                    <Button type="button" variant="outline" onClick={resetRentalForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
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
                  Get in touch with {selectedFarmerForContact.owner_name} about {selectedFarmerForContact.name}
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
                  <p><strong>Farmer's Phone:</strong> {selectedFarmerForContact.owner_phone || 'Not provided'}</p>
                  <p><strong>Location:</strong> {selectedFarmerForContact.owner_location || selectedFarmerForContact.location}</p>
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

export default Equipment;
