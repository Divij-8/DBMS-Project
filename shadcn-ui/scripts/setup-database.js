const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'agricultural_management';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists`);

    // Switch to the database
    await connection.execute(`USE \`${dbName}\``);

    // Create tables
    console.log('Creating tables...');

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('farmer', 'buyer') NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    // Farms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS farms (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        size_acres DECIMAL(10,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    // Products table
    await connection.execute(`
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
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        INDEX idx_farm_id (farm_id),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // Orders table
    await connection.execute(`
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
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_buyer_id (buyer_id),
        INDEX idx_product_id (product_id),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date)
      )
    `);

    console.log('All tables created successfully');

    // Insert demo data
    console.log('Inserting demo data...');

    // Demo users
    const demoUsers = [
      {
        id: 'user_farmer_demo',
        email: 'demo@farmer.com',
        password_hash: 'hashed_demo123', // In production, this should be properly hashed
        role: 'farmer',
        name: 'John Farmer',
        phone: '+1234567890',
        address: '123 Farm Road, Rural County'
      },
      {
        id: 'user_buyer_demo',
        email: 'demo@buyer.com',
        password_hash: 'hashed_demo123', // In production, this should be properly hashed
        role: 'buyer',
        name: 'Jane Buyer',
        phone: '+0987654321',
        address: '456 City Street, Urban Area'
      }
    ];

    for (const user of demoUsers) {
      await connection.execute(
        'INSERT IGNORE INTO users (id, email, password_hash, role, name, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.password_hash, user.role, user.name, user.phone, user.address]
      );
    }

    // Demo farm
    await connection.execute(
      'INSERT IGNORE INTO farms (id, user_id, name, location, size_acres, description) VALUES (?, ?, ?, ?, ?, ?)',
      ['farm_demo_1', 'user_farmer_demo', 'Green Valley Farm', 'California, USA', 25.5, 'Organic farm specializing in vegetables and fruits']
    );

    // Demo products
    const demoProducts = [
      {
        id: 'prod_demo_1',
        farm_id: 'farm_demo_1',
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        price: 5.99,
        quantity: 100,
        unit: 'kg',
        description: 'Fresh organic tomatoes grown without pesticides',
        harvest_date: '2024-01-15',
        expiry_date: '2024-01-25',
        organic: true,
        status: 'available'
      },
      {
        id: 'prod_demo_2',
        farm_id: 'farm_demo_1',
        name: 'Fresh Carrots',
        category: 'Vegetables',
        price: 3.50,
        quantity: 50,
        unit: 'kg',
        description: 'Crunchy and sweet carrots',
        harvest_date: '2024-01-10',
        expiry_date: '2024-02-10',
        organic: false,
        status: 'available'
      }
    ];

    for (const product of demoProducts) {
      await connection.execute(
        'INSERT IGNORE INTO products (id, farm_id, name, category, price, quantity, unit, description, harvest_date, expiry_date, organic, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [product.id, product.farm_id, product.name, product.category, product.price, product.quantity, product.unit, product.description, product.harvest_date, product.expiry_date, product.organic, product.status]
      );
    }

    console.log('Demo data inserted successfully');
    console.log('\n=== Database Setup Complete ===');
    console.log('Demo accounts:');
    console.log('Farmer: demo@farmer.com / demo123');
    console.log('Buyer: demo@buyer.com / demo123');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();