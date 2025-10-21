# Agricultural Management System - Integration Guide

## 🎯 Project Overview
This is a full-stack agricultural management system with:
- **Backend**: Django REST API with MySQL database
- **Frontend**: React + TypeScript with Vite
- **Database**: MySQL with proper schema and relationships

## 📋 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL Server 5.7+
- npm or pnpm package manager

### 1. Backend Setup (Django)

#### Step 1: Install Python Dependencies
```bash
cd DBMS-PROJECT
pip install -r requirements.txt
```

#### Step 2: Configure MySQL Database
Make sure MySQL is running, then create the database:
```bash
mysql -u root -p
CREATE DATABASE agricultural_db;
CREATE USER 'agri_user'@'localhost' IDENTIFIED BY 'agri_password123';
GRANT ALL PRIVILEGES ON agricultural_db.* TO 'agri_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Or update the `.env` file with your MySQL credentials:
```
DB_NAME=agricultural_db
DB_USER=agri_user
DB_PASSWORD=agri_password123
DB_HOST=localhost
DB_PORT=3306
```

#### Step 3: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Step 4: Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

#### Step 5: Start Django Server
```bash
python manage.py runserver
```
Django will run on `http://localhost:8000`

### 2. Frontend Setup (React)

#### Step 1: Install Dependencies
```bash
cd shadcn-ui
npm install
# or
pnpm install
```

#### Step 2: Verify .env Configuration
Make sure `.env` contains:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DB_HOST=localhost
REACT_APP_DB_USER=root
REACT_APP_DB_PASSWORD=Bapsy_007
REACT_APP_DB_NAME=agricultural_db
```

#### Step 3: Start Frontend Development Server
```bash
npm run dev
# or
pnpm dev
```
Frontend will run on `http://localhost:5173`

### 3. Database Configuration

#### MySQL Connection (Django)
Django is configured in `DBMS-PROJECT/agricultural_system/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'mysql.connector.django',
        'NAME': config('DB_NAME', default='agricultural_db'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default='Bapsy_007'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}
```

#### CORS Configuration
Frontend is allowed to communicate with backend via CORS:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `GET /api/auth/user/` - Get current user (requires auth)
- `PUT /api/user/profile/` - Update user profile (requires auth)

### Products (Marketplace)
- `GET /api/products/` - List all available products
- `POST /api/products/` - Create product (farmer only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product
- `GET /api/products/my_products/` - Get current user's products

### Farm Data
- `GET /api/farm-data/` - List farm data
- `POST /api/farm-data/` - Create farm data
- `PUT /api/farm-data/{id}/` - Update farm data
- `DELETE /api/farm-data/{id}/` - Delete farm data

### Alerts
- `GET /api/alerts/` - List alerts
- `POST /api/alerts/` - Create alert
- `PUT /api/alerts/{id}/` - Update alert
- `DELETE /api/alerts/{id}/` - Delete alert

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## 🔐 Authentication Flow

1. **Register**: User fills registration form → Backend creates user in MySQL → JWT tokens returned
2. **Login**: User enters email/password → Backend validates → JWT tokens returned → Stored in localStorage
3. **Authenticated Requests**: Frontend sends requests with `Authorization: Bearer <token>` header
4. **Token Refresh**: When access token expires, frontend uses refresh token to get new access token
5. **Logout**: Frontend clears tokens from localStorage

## 📱 Frontend Architecture

### Key Files
- `src/lib/api.ts` - API service with all HTTP methods
- `src/lib/auth.ts` - Authentication service with login/register/logout
- `src/lib/storage.ts` - localStorage utilities (fallback for demo data)
- `src/pages/Login.tsx` - Login component
- `src/pages/Register.tsx` - Registration component
- `src/pages/Dashboard.tsx` - User dashboard
- `src/pages/Marketplace.tsx` - Product marketplace

### Authentication Flow in Frontend
```
App.tsx (initializes auth)
  ↓
authService.initialize() (checks for existing token)
  ↓
apiService.setToken() (sets Authorization header)
  ↓
authService.getCurrentUser() (fetches user data)
  ↓
Components use authService/apiService for data operations
```

## 🏗️ Backend Models

### Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `role` - farmer/buyer/admin
- `phone` - Optional phone number
- `location` - Farm location
- `farm_size` - Farm size in acres
- `profile_image` - User profile picture

### Products
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `category` - vegetables/fruits/grains/etc
- `price` - Price per unit
- `quantity` - Available quantity
- `unit` - kg/tons/bundles/etc
- `seller` - Foreign key to User
- `status` - available/sold/reserved
- `created_at` - Creation timestamp

### FarmData
- `id` - Primary key
- `user` - Foreign key to User
- `crop_type` - Type of crop
- `planting_date` - Date planted
- `expected_harvest` - Expected harvest date
- `area` - Farm area
- `soil_type` - clay/sandy/loamy/silt
- `irrigation_type` - drip/sprinkler/surface/manual
- `notes` - Additional notes

### Alerts
- `id` - Primary key
- `alert_type` - weather/pest/disease/market
- `title` - Alert title
- `message` - Alert message
- `severity` - low/medium/high
- `location` - Location of alert
- `is_active` - Whether alert is active
- `created_at` - Creation timestamp

## 🧪 Testing the Integration

### Test Registration
1. Go to `http://localhost:5173/register`
2. Fill in registration form
3. Check MySQL: `SELECT * FROM users;`

### Test Login
1. Go to `http://localhost:5173/login`
2. Use registered email and password
3. Should redirect to `/dashboard`

### Test Products
1. As a farmer, add a product in dashboard
2. Check MySQL: `SELECT * FROM products;`
3. As a buyer, view products in marketplace

### Test API Directly
```bash
# Get auth token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user@email.com","password":"password"}'

# Use token to get user info
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/auth/user/
```

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: Unknown database 'agricultural_db'
```
**Solution**: Run migrations or check database name in `.env`

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Make sure `CORS_ALLOWED_ORIGINS` in settings.py includes your frontend URL

### Token Invalid Error
```
Error: Invalid or expired token
```
**Solution**: Clear localStorage (`access_token`) and login again

### Port Already in Use
```
Error: Address already in use
```
**Solution**: 
- Django: Change port with `python manage.py runserver 8001`
- Frontend: Change port with `npm run dev -- --port 5174`

## 📦 Project Structure

```
DBMS-PROJECT/
├── agricultural_system/    # Main Django settings
├── users/                  # User authentication app
├── marketplace/            # Products and orders app
├── farm_data/             # Farm data management app
├── alerts/                # Alerts app
├── api/                   # API endpoints
└── manage.py

shadcn-ui/
├── src/
│   ├── lib/
│   │   ├── api.ts        # API service
│   │   ├── auth.ts       # Auth service
│   │   └── storage.ts    # Storage utilities
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   └── App.tsx           # Main app component
└── package.json
```

## 🚀 Deployment Checklist

- [ ] Update `DEBUG=False` in Django settings.py
- [ ] Set `SECRET_KEY` to a strong random value
- [ ] Configure allowed hosts in settings.py
- [ ] Set up production MySQL database
- [ ] Configure HTTPS/SSL
- [ ] Set up CORS for production frontend URL
- [ ] Build frontend: `npm run build`
- [ ] Deploy to hosting service (Heroku, AWS, Digital Ocean, etc.)

## 📚 Additional Resources

- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [Django JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)
- [React Documentation](https://react.dev)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [REST API Best Practices](https://restfulapi.net/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/feature-name`
4. Open pull request

## 📝 Notes

- All API requests require `Content-Type: application/json` header
- JWT tokens are valid for 7 days (access) and 30 days (refresh)
- Images are stored in `media/` directory
- Frontend uses Vite for fast development and building
- Backend uses Django REST Framework for API
- Database queries are optimized with `select_related` and `prefetch_related`
