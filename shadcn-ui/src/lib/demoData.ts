import db from './mysql';
import { User, Product, Farm } from './types';

export class DatabaseService {
  
  // Initialize database tables
  async initializeDatabase(): Promise<void> {
    try {
      // Create users table
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('farmer', 'buyer') NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create farms table
      await db.query(`
        CREATE TABLE IF NOT EXISTS farms (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          size_acres DECIMAL(10,2),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create products table
      await db.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(36) PRIMARY KEY,
          farm_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL,
          unit VARCHAR(50) NOT NULL,
          description TEXT,
          harvest_date DATE,
          expiry_date DATE,
          organic BOOLEAN DEFAULT FALSE,
          image_url VARCHAR(500),
          status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
        )
      `);

      // Create orders table
      await db.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(36) PRIMARY KEY,
          buyer_id VARCHAR(36) NOT NULL,
          product_id VARCHAR(36) NOT NULL,
          quantity INTEGER NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
          order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          delivery_address TEXT,
          notes TEXT,
          FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // User management
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = this.generateId();
    const query = `
      INSERT INTO users (id, email, password_hash, role, name, phone, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      id, user.email, user.password, user.role, 
      user.name, user.phone || null, user.address || null
    ]);

    return {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ?';
    const results = await db.query(query, [email]);
    
    if (Array.isArray(results) && results.length > 0) {
      const user = results[0] as any;
      return {
        id: user.id,
        email: user.email,
        password: user.password_hash,
        role: user.role,
        name: user.name,
        phone: user.phone,
        address: user.address,
        createdAt: user.created_at
      };
    }
    
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await db.query(query, [id]);
    
    if (Array.isArray(results) && results.length > 0) {
      const user = results[0] as any;
      return {
        id: user.id,
        email: user.email,
        password: user.password_hash,
        role: user.role,
        name: user.name,
        phone: user.phone,
        address: user.address,
        createdAt: user.created_at
      };
    }
    
    return null;
  }

  // Farm management
  async createFarm(farm: Omit<Farm, 'id' | 'createdAt'>): Promise<Farm> {
    const id = this.generateId();
    const query = `
      INSERT INTO farms (id, user_id, name, location, size_acres, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      id, farm.userId, farm.name, farm.location, 
      farm.sizeAcres || null, farm.description || null
    ]);

    return {
      ...farm,
      id,
      createdAt: new Date().toISOString()
    };
  }

  async getFarmsByUserId(userId: string): Promise<Farm[]> {
    const query = 'SELECT * FROM farms WHERE user_id = ?';
    const results = await db.query(query, [userId]);
    
    if (Array.isArray(results)) {
      return results.map((farm: any) => ({
        id: farm.id,
        userId: farm.user_id,
        name: farm.name,
        location: farm.location,
        sizeAcres: farm.size_acres,
        description: farm.description,
        createdAt: farm.created_at
      }));
    }
    
    return [];
  }

  // Product management
  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const id = this.generateId();
    const query = `
      INSERT INTO products (id, farm_id, name, category, price, quantity, unit, description, harvest_date, expiry_date, organic, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      id, product.farmId, product.name, product.category, product.price,
      product.quantity, product.unit, product.description || null,
      product.harvestDate || null, product.expiryDate || null,
      product.organic || false, product.imageUrl || null, product.status || 'available'
    ]);

    return {
      ...product,
      id,
      createdAt: new Date().toISOString()
    };
  }

  async getProducts(filters?: { category?: string; farmId?: string }): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE status = "available"';
    const params: any[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.farmId) {
      query += ' AND farm_id = ?';
      params.push(filters.farmId);
    }

    query += ' ORDER BY created_at DESC';

    const results = await db.query(query, params);
    
    if (Array.isArray(results)) {
      return results.map((product: any) => ({
        id: product.id,
        farmId: product.farm_id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        unit: product.unit,
        description: product.description,
        harvestDate: product.harvest_date,
        expiryDate: product.expiry_date,
        organic: product.organic,
        imageUrl: product.image_url,
        status: product.status,
        createdAt: product.created_at
      }));
    }
    
    return [];
  }

  async getProductById(id: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = ?';
    const results = await db.query(query, [id]);
    
    if (Array.isArray(results) && results.length > 0) {
      const product = results[0] as any;
      return {
        id: product.id,
        farmId: product.farm_id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        unit: product.unit,
        description: product.description,
        harvestDate: product.harvest_date,
        expiryDate: product.expiry_date,
        organic: product.organic,
        imageUrl: product.image_url,
        status: product.status,
        createdAt: product.created_at
      };
    }
    
    return null;
  }

  // Order management
  async createOrder(order: {
    buyerId: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    deliveryAddress?: string;
    notes?: string;
  }): Promise<string> {
    const id = this.generateId();
    const query = `
      INSERT INTO orders (id, buyer_id, product_id, quantity, total_price, delivery_address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      id, order.buyerId, order.productId, order.quantity,
      order.totalPrice, order.deliveryAddress || null, order.notes || null
    ]);

    return id;
  }

  async getOrdersByUserId(userId: string): Promise<any[]> {
    const query = `
      SELECT o.*, p.name as product_name, p.category, u.name as farmer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN farms f ON p.farm_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE o.buyer_id = ?
      ORDER BY o.order_date DESC
    `;
    
    const results = await db.query(query, [userId]);
    return Array.isArray(results) ? results : [];
  }

  // Utility methods
  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }
}

export const databaseService = new DatabaseService();