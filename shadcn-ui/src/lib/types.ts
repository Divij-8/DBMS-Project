export interface User {
    id: string;
    email: string;
    password: string;
    role: 'farmer' | 'buyer';
    name: string;
    phone?: string;
    address?: string;
    createdAt: string;
  }
  
  export interface Farm {
    id: string;
    userId: string;
    name: string;
    location: string;
    sizeAcres?: number;
    description?: string;
    createdAt: string;
  }
  
  export interface Product {
    id: string;
    farmId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    unit: string;
    description?: string;
    harvestDate?: string;
    expiryDate?: string;
    organic?: boolean;
    imageUrl?: string;
    status: 'available' | 'sold' | 'reserved';
    createdAt: string;
  }
  
  export interface Order {
    id: string;
    buyerId: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: string;
    deliveryAddress?: string;
    notes?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
  }