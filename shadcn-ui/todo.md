# Agricultural Resource Management System - MVP Todo

## Core Features to Implement:
1. **Authentication System**
   - Login/Register pages for farmers and buyers
   - User role management (farmer/buyer)

2. **Farmer Dashboard**
   - Farm profile management
   - Crop/product listing and management
   - Farm data recording (soil, resources)

3. **Buyer Marketplace**
   - Browse available products
   - Product search and filtering
   - Purchase functionality

4. **Database Schema (Supabase)**
   - Users table (with roles)
   - Farms table
   - Products table
   - Orders table

## Files to Create/Modify:
1. `src/pages/Index.tsx` - Landing page with hero section
2. `src/pages/Login.tsx` - Authentication page
3. `src/pages/Register.tsx` - User registration
4. `src/pages/FarmerDashboard.tsx` - Farmer management interface
5. `src/pages/BuyerDashboard.tsx` - Buyer marketplace
6. `src/components/Navbar.tsx` - Navigation component
7. `src/lib/supabase.ts` - Supabase client configuration
8. `index.html` - Update title and meta tags

## Database Tables:
- profiles (user profiles with roles)
- farms (farm information)
- products (agricultural products)
- orders (purchase orders)