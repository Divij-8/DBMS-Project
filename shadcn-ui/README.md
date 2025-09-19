# Agricultural Resource Management System

A comprehensive platform designed to connect farmers with buyers, streamline agricultural operations, and manage farm data effectively using MySQL database.

## Features

- **User Authentication**: Separate registration and login for farmers and buyers
- **Farm Management**: Tools for farmers to manage their farm profiles, crops, and resources
- **Product Marketplace**: Platform for farmers to list products and buyers to browse and purchase
- **Dashboard**: Role-based dashboards with analytics and management tools
- **MySQL Integration**: Robust database backend for data persistence
- **Responsive Design**: Accessible on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: MySQL Database
- **State Management**: React Query
- **UI Components**: Custom components built with Tailwind CSS
- **Database**: MySQL with connection pooling

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (version 16 or higher)
2. **MySQL Server** (version 8.0 or higher)
3. **pnpm** package manager

## MySQL Setup

### 1. Install MySQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**On macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**On Windows:**
Download and install MySQL from [official website](https://dev.mysql.com/downloads/mysql/)

### 2. Create Database User (Optional)

Connect to MySQL as root and create a dedicated user:

```sql
mysql -u root -p

CREATE USER 'agri_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON agricultural_management.* TO 'agri_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd agricultural-resource-management
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your MySQL configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=agricultural_management
   DB_SSL=false
   
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Setup the database**:
   ```bash
   pnpm run setup-db
   ```
   
   This will:
   - Create the database if it doesn't exist
   - Create all necessary tables
   - Insert demo data

5. **Build the project**:
   ```bash
   pnpm run build
   ```

6. **Start the development server**:
   ```bash
   pnpm run dev
   ```

## Database Schema

The application uses the following main tables:

- **users**: Store user accounts (farmers and buyers)
- **farms**: Store farm information linked to farmers
- **products**: Store product listings from farms
- **orders**: Store purchase orders from buyers

## Demo Accounts

After running the database setup, you can use these demo accounts:

- **Farmer**: `demo@farmer.com` / `demo123`
- **Buyer**: `demo@buyer.com` / `demo123`

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run setup-db` - Initialize database and tables
- `pnpm run db:reset` - Reset database with fresh data

## Database Management

### Backup Database
```bash
mysqldump -u root -p agricultural_management > backup.sql
```

### Restore Database
```bash
mysql -u root -p agricultural_management < backup.sql
```

### Reset Database
```bash
pnpm run db:reset
```

## Troubleshooting

### MySQL Connection Issues

1. **Check MySQL service is running**:
   ```bash
   # On Linux/macOS
   sudo systemctl status mysql
   # or
   brew services list | grep mysql
   
   # On Windows
   net start mysql
   ```

2. **Verify MySQL credentials**:
   ```bash
   mysql -u your_username -p
   ```

3. **Check firewall settings** (if connecting remotely)

4. **Verify environment variables** in `.env` file

### Common Errors

- **ER_ACCESS_DENIED_ERROR**: Check username and password in `.env`
- **ECONNREFUSED**: MySQL server is not running
- **ER_BAD_DB_ERROR**: Database doesn't exist, run `pnpm run setup-db`

## Production Deployment

For production deployment:

1. Use a production MySQL server
2. Set `NODE_ENV=production` in environment variables
3. Use proper password hashing (implement bcrypt)
4. Enable SSL for database connections
5. Set up proper backup strategies
6. Configure connection pooling limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with MySQL database
5. Submit a pull request

