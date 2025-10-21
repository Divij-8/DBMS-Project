// Storage service that works with both MySQL and localStorage fallback
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'farmer' | 'buyer';
    phone?: string;
    location?: string;
  }
  
  export interface Product {
    id: string;
    farmerId: string;
    farmerName: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    quantity: number;
    description: string;
    image?: string;
    location: string;
    harvestDate: string;
    createdAt: string;
  }
  
  export interface Farm {
    id: string;
    farmerId: string;
    name: string;
    location: string;
    size: number;
    soilType: string;
    crops: string[];
    resources: {
      water: string;
      equipment: string[];
      fertilizers: string[];
    };
    createdAt: string;
  }
  
  export interface Equipment {
    id: string;
    ownerId: string;
    ownerName: string;
    name: string;
    type: string;
    description: string;
    pricePerDay: number;
    pricePerWeek: number;
    location: string;
    availability: boolean;
    condition: 'excellent' | 'good' | 'fair';
    specifications: string;
    images?: string[];
    createdAt: string;
  }
  
  export interface EquipmentRental {
    id: string;
    equipmentId: string;
    equipmentName: string;
    renterId: string;
    renterName: string;
    ownerId: string;
    ownerName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalCost: number;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    createdAt: string;
  }
  
  export interface GovernmentScheme {
    id: string;
    name: string;
    description: string;
    eligibility: string[];
    benefits: string;
    applicationProcess: string;
    documents: string[];
    deadline?: string;
    category: 'subsidy' | 'loan' | 'insurance' | 'training' | 'equipment';
    status: 'active' | 'inactive';
  }
  
  export interface SchemeApplication {
    id: string;
    schemeId: string;
    schemeName: string;
    farmerId: string;
    farmerName: string;
    applicationData: {
      farmSize: number;
      cropType: string;
      annualIncome: number;
      landOwnership: 'owned' | 'leased';
      documents: string[];
      additionalInfo: string;
    };
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    submittedAt?: string;
    reviewedAt?: string;
    comments?: string;
    createdAt: string;
  }
  
  class LocalStorage {
    private getItem<T>(key: string): T[] {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    }
  
    private setItem<T>(key: string, data: T[]): void {
      localStorage.setItem(key, JSON.stringify(data));
    }
  
    // User management
    saveUser(user: User): void {
      localStorage.setItem('currentUser', JSON.stringify(user));
      const users = this.getItem<User>('users');
      const existingIndex = users.findIndex(u => u.id === user.id);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      this.setItem('users', users);
    }
  
    getCurrentUser(): User | null {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
  
    login(email: string, password: string): User | null {
      // Simple demo login - check for demo accounts
      if (email === 'demo@farmer.com' && password === 'demo123') {
        const user: User = {
          id: '1',
          email: 'demo@farmer.com',
          name: 'Demo Farmer',
          role: 'farmer',
          phone: '+1234567890',
          location: 'Maharashtra, India'
        };
        this.saveUser(user);
        return user;
      }
      
      if (email === 'demo@buyer.com' && password === 'demo123') {
        const user: User = {
          id: '2',
          email: 'demo@buyer.com',
          name: 'Demo Buyer',
          role: 'buyer',
          phone: '+0987654321',
          location: 'Delhi, India'
        };
        this.saveUser(user);
        return user;
      }
  
      // Check existing users
      const users = this.getItem<User>('users');
      const user = users.find(u => u.email === email);
      if (user) {
        this.saveUser(user);
        return user;
      }
      return null;
    }
  
    logout(): void {
      localStorage.removeItem('currentUser');
    }
  
    register(userData: Omit<User, 'id'>): User {
      const users = this.getItem<User>('users');
      const existingUser = users.find(u => u.email === userData.email);
      
      if (existingUser) {
        throw new Error('User already exists');
      }
  
      const newUser: User = {
        ...userData,
        id: Date.now().toString()
      };
  
      users.push(newUser);
      this.setItem('users', users);
      this.saveUser(newUser);
      return newUser;
    }
  
    // Product management
    saveProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
      const products = this.getItem<Product>('products');
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      this.setItem('products', products);
      return newProduct;
    }
  
    getProducts(): Product[] {
      const stored = this.getItem<Product>('products');
      if (stored.length === 0) {
        // Initialize with demo data
        const demoProducts: Product[] = [
          {
            id: '1',
            farmerId: '1',
            farmerName: 'Demo Farmer',
            name: 'Organic Tomatoes',
            category: 'vegetables',
            price: 80,
            unit: 'kg',
            quantity: 100,
            description: 'Fresh organic tomatoes, vine-ripened',
            location: 'Maharashtra, India',
            harvestDate: '2024-01-15',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            farmerId: '1',
            farmerName: 'Demo Farmer',
            name: 'Fresh Lettuce',
            category: 'vegetables',
            price: 45,
            unit: 'heads',
            quantity: 50,
            description: 'Crisp romaine lettuce, pesticide-free',
            location: 'Maharashtra, India',
            harvestDate: '2024-01-10',
            createdAt: '2024-01-10T08:00:00Z'
          }
        ];
        this.setItem('products', demoProducts);
        return demoProducts;
      }
      return stored;
    }
  
    getProductsByFarmer(farmerId: string): Product[] {
      return this.getProducts().filter(p => p.farmerId === farmerId);
    }
  
    updateProduct(id: string, updates: Partial<Product>): Product | null {
      const products = this.getItem<Product>('products');
      const index = products.findIndex(p => p.id === id);
      if (index >= 0) {
        products[index] = { ...products[index], ...updates };
        this.setItem('products', products);
        return products[index];
      }
      return null;
    }
  
    deleteProduct(id: string): boolean {
      const products = this.getItem<Product>('products');
      const filteredProducts = products.filter(p => p.id !== id);
      if (filteredProducts.length !== products.length) {
        this.setItem('products', filteredProducts);
        return true;
      }
      return false;
    }
  
    // Farm management
    saveFarm(farm: Omit<Farm, 'id' | 'createdAt'>): Farm {
      const farms = this.getItem<Farm>('farms');
      const newFarm: Farm = {
        ...farm,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      farms.push(newFarm);
      this.setItem('farms', farms);
      return newFarm;
    }
  
    getFarmsByFarmer(farmerId: string): Farm[] {
      const stored = this.getItem<Farm>('farms');
      if (stored.length === 0) {
        // Initialize with demo data for farmer
        if (farmerId === '1') {
          const demoFarm: Farm = {
            id: '1',
            farmerId: '1',
            name: 'Green Valley Farm',
            location: 'Pune, Maharashtra',
            size: 25.5,
            soilType: 'Loamy',
            crops: ['Tomatoes', 'Lettuce', 'Carrots'],
            resources: {
              water: 'Drip irrigation',
              equipment: ['Tractor', 'Harvester', 'Sprinkler system'],
              fertilizers: ['Organic compost', 'Natural fertilizer']
            },
            createdAt: '2024-01-01T00:00:00Z'
          };
          this.setItem('farms', [demoFarm]);
          return [demoFarm];
        }
      }
      return stored.filter(f => f.farmerId === farmerId);
    }
  
    updateFarm(id: string, updates: Partial<Farm>): Farm | null {
      const farms = this.getItem<Farm>('farms');
      const index = farms.findIndex(f => f.id === id);
      if (index >= 0) {
        farms[index] = { ...farms[index], ...updates };
        this.setItem('farms', farms);
        return farms[index];
      }
      return null;
    }
  
    // Equipment management
    saveEquipment(equipment: Omit<Equipment, 'id' | 'createdAt'>): Equipment {
      const equipments = this.getItem<Equipment>('equipments');
      const newEquipment: Equipment = {
        ...equipment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      equipments.push(newEquipment);
      this.setItem('equipments', equipments);
      return newEquipment;
    }
  
    getEquipments(): Equipment[] {
      const stored = this.getItem<Equipment>('equipments');
      if (stored.length === 0) {
        // Initialize with demo data
        const demoEquipments: Equipment[] = [
          {
            id: '1',
            ownerId: '1',
            ownerName: 'Demo Farmer',
            name: 'John Deere 5050D Tractor',
            type: 'tractor',
            description: '50 HP tractor suitable for medium farming operations',
            pricePerDay: 2500,
            pricePerWeek: 15000,
            location: 'Maharashtra, India',
            availability: true,
            condition: 'excellent',
            specifications: '50 HP, 4WD, Power Steering',
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            ownerId: '1',
            ownerName: 'Demo Farmer',
            name: 'Combine Harvester',
            type: 'harvester',
            description: 'Modern combine harvester for wheat and rice',
            pricePerDay: 5000,
            pricePerWeek: 30000,
            location: 'Maharashtra, India',
            availability: true,
            condition: 'good',
            specifications: 'Self-propelled, 4m cutting width',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ];
        this.setItem('equipments', demoEquipments);
        return demoEquipments;
      }
      return stored;
    }
  
    getEquipmentsByOwner(ownerId: string): Equipment[] {
      return this.getEquipments().filter(e => e.ownerId === ownerId);
    }
  
    updateEquipment(id: string, updates: Partial<Equipment>): Equipment | null {
      const equipments = this.getItem<Equipment>('equipments');
      const index = equipments.findIndex(e => e.id === id);
      if (index >= 0) {
        equipments[index] = { ...equipments[index], ...updates };
        this.setItem('equipments', equipments);
        return equipments[index];
      }
      return null;
    }
  
    deleteEquipment(id: string): boolean {
      const equipments = this.getItem<Equipment>('equipments');
      const filteredEquipments = equipments.filter(e => e.id !== id);
      if (filteredEquipments.length !== equipments.length) {
        this.setItem('equipments', filteredEquipments);
        return true;
      }
      return false;
    }
  
    // Equipment rental management
    saveRental(rental: Omit<EquipmentRental, 'id' | 'createdAt'>): EquipmentRental {
      const rentals = this.getItem<EquipmentRental>('rentals');
      const newRental: EquipmentRental = {
        ...rental,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      rentals.push(newRental);
      rentals.push(newRental);
      this.setItem('rentals', rentals);
      return newRental;
    }
  
    getRentalsByRenter(renterId: string): EquipmentRental[] {
      return this.getItem<EquipmentRental>('rentals').filter(r => r.renterId === renterId);
    }
  
    getRentalsByOwner(ownerId: string): EquipmentRental[] {
      return this.getItem<EquipmentRental>('rentals').filter(r => r.ownerId === ownerId);
    }
  
    updateRental(id: string, updates: Partial<EquipmentRental>): EquipmentRental | null {
      const rentals = this.getItem<EquipmentRental>('rentals');
      const index = rentals.findIndex(r => r.id === id);
      if (index >= 0) {
        rentals[index] = { ...rentals[index], ...updates };
        this.setItem('rentals', rentals);
        return rentals[index];
      }
      return null;
    }
  
    // Government schemes management
    getGovernmentSchemes(): GovernmentScheme[] {
      const stored = this.getItem<GovernmentScheme>('schemes');
      if (stored.length === 0) {
        // Initialize with demo schemes
        const demoSchemes: GovernmentScheme[] = [
          {
            id: '1',
            name: 'PM-KISAN Samman Nidhi',
            description: 'Income support scheme providing ₹6000 per year to farmer families',
            eligibility: ['Small and marginal farmers', 'Landholding up to 2 hectares', 'Valid Aadhaar card'],
            benefits: '₹2000 per installment, 3 installments per year',
            applicationProcess: 'Online application through PM-KISAN portal or CSC centers',
            documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details', 'Mobile Number'],
            category: 'subsidy',
            status: 'active'
          },
          {
            id: '2',
            name: 'Pradhan Mantri Fasal Bima Yojana',
            description: 'Crop insurance scheme to protect farmers against crop loss',
            eligibility: ['All farmers growing notified crops', 'Sharecroppers and tenant farmers eligible'],
            benefits: 'Insurance coverage up to sum insured amount',
            applicationProcess: 'Apply through banks, CSCs, or insurance companies',
            documents: ['Aadhaar Card', 'Land Records', 'Sowing Certificate', 'Bank Account Details'],
            deadline: '2024-12-31',
            category: 'insurance',
            status: 'active'
          },
          {
            id: '3',
            name: 'Sub-Mission on Agricultural Mechanization',
            description: 'Financial assistance for purchase of agricultural machinery',
            eligibility: ['Individual farmers', 'Self Help Groups', 'Cooperative societies'],
            benefits: '40-50% subsidy on agricultural machinery',
            applicationProcess: 'Apply through state agriculture department',
            documents: ['Aadhaar Card', 'Land Records', 'Income Certificate', 'Bank Account Details'],
            category: 'equipment',
            status: 'active'
          },
          {
            id: '4',
            name: 'Kisan Credit Card Scheme',
            description: 'Credit facility for farmers to meet agricultural expenses',
            eligibility: ['All farmers including tenant farmers', 'Minimum age 18 years'],
            benefits: 'Credit limit based on land holding and cropping pattern',
            applicationProcess: 'Apply through banks and cooperative societies',
            documents: ['Aadhaar Card', 'Land Records', 'Income Proof', 'Passport Size Photos'],
            category: 'loan',
            status: 'active'
          }
        ];
        this.setItem('schemes', demoSchemes);
        return demoSchemes;
      }
      return stored;
    }
  
    // Scheme applications management
    saveSchemeApplication(application: Omit<SchemeApplication, 'id' | 'createdAt'>): SchemeApplication {
      const applications = this.getItem<SchemeApplication>('schemeApplications');
      const newApplication: SchemeApplication = {
        ...application,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      applications.push(newApplication);
      this.setItem('schemeApplications', applications);
      return newApplication;
    }
  
    getSchemeApplicationsByFarmer(farmerId: string): SchemeApplication[] {
      return this.getItem<SchemeApplication>('schemeApplications').filter(a => a.farmerId === farmerId);
    }
  
    updateSchemeApplication(id: string, updates: Partial<SchemeApplication>): SchemeApplication | null {
      const applications = this.getItem<SchemeApplication>('schemeApplications');
      const index = applications.findIndex(a => a.id === id);
      if (index >= 0) {
        applications[index] = { ...applications[index], ...updates };
        this.setItem('schemeApplications', applications);
        return applications[index];
      }
      return null;
    }
  }
  
  export const storage = new LocalStorage();