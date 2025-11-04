import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Home, ShoppingCart, BarChart3, Wrench, Package, MessageCircle } from 'lucide-react';
import { authService, User as UserType } from '@/lib/auth';
import { useCart } from '@/hooks/use-cart';
import CartSidebar from '@/components/ui/CartSidebar';
import { toast } from 'sonner';

interface NavbarProps {
  user?: UserType | null;
  onAuthChange?: () => void;
}

const Navbar = ({ user, onAuthChange }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    await authService.logout();
    toast.success('Logged out successfully');
    if (onAuthChange) {
      onAuthChange();
    }
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-white to-green-50 shadow-md border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <span className="font-bold text-xl text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">ARMS</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthPage && (
              <Link to="/marketplace">
                <Button variant="ghost" className="flex items-center space-x-2 transition-all duration-300 hover:bg-green-100 hover:text-green-700 transform hover:scale-105">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Marketplace</span>
                </Button>
              </Link>
            )}

            {!isAuthPage && user?.role === 'farmer' && (
              <>
                <Link to="/equipment">
                  <Button variant="ghost" className="flex items-center space-x-2 transition-all duration-300 hover:bg-orange-100 hover:text-orange-700 transform hover:scale-105">
                    <Wrench className="w-4 h-4" />
                    <span>Equipment</span>
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="ghost" className="flex items-center space-x-2 transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 transform hover:scale-105">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Button>
                </Link>
              </>
            )}

            {user?.role === 'buyer' && (
              <CartSidebar>
                <Button variant="ghost" className="flex items-center space-x-2 relative">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </CartSidebar>
            )}

            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <Link to="/orders">
                  <Button variant="ghost" className="flex items-center space-x-2 transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 transform hover:scale-105">
                    <Package className="w-4 h-4" />
                    <span>Orders</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.username?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.username}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;