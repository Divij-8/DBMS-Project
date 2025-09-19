import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Home, ShoppingCart, BarChart3 } from 'lucide-react';
import { storage, User as UserType } from '@/lib/storage';

interface NavbarProps {
  user?: UserType | null;
  onAuthChange?: () => void;
}

const Navbar = ({ user, onAuthChange }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.logout();
    if (onAuthChange) {
      onAuthChange();
    }
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <span className="font-bold text-xl text-gray-900">ARMS</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/marketplace">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Marketplace</span>
              </Button>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
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