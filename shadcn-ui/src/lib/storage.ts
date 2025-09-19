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
          location: 'California, USA'
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
          location: 'New York, USA'
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
            category: 'Vegetables',
            price: 4.50,
            unit: 'kg',
            quantity: 100,
            description: 'Fresh organic tomatoes, vine-ripened',
            location: 'California, USA',
            harvestDate: '2024-01-15',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            farmerId: '1',
            farmerName: 'Demo Farmer',
            name: 'Fresh Lettuce',
            category: 'Vegetables',
            price: 2.25,
            unit: 'heads',
            quantity: 50,
            description: 'Crisp romaine lettuce, pesticide-free',
            location: 'California, USA',
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
            location: 'Fresno, California',
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
  }
  
  export const storage = new LocalStorage();