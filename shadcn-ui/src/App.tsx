import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/ui/Navbar';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Equipment from './pages/Equipment';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';
import { authService, User } from '@/lib/auth';
import { CartProvider } from '@/hooks/use-cart';

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth service and check for existing session
    const initAuth = async () => {
      try {
        await authService.initialize();
        // Only try to get current user if we have a token
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Silently fail - user is just not logged in
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthChange = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Agricultural Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Navbar user={currentUser} onAuthChange={handleAuthChange} />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/login" 
                  element={
                    currentUser ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Login onAuthChange={handleAuthChange} />
                    )
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    currentUser ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Register onAuthChange={handleAuthChange} />
                    )
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    currentUser ? (
                      <Dashboard user={currentUser} />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  } 
                />
                <Route 
                  path="/marketplace" 
                  element={<Marketplace user={currentUser} />} 
                />
                <Route 
                  path="/equipment" 
                  element={currentUser?.role === 'farmer' ? <Equipment user={currentUser} /> : <Navigate to="/marketplace" replace />} 
                />
                <Route 
                  path="/checkout" 
                  element={
                    currentUser?.role === 'buyer' ? (
                      <Checkout />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  } 
                />
                <Route 
                  path="/order-confirmation" 
                  element={<OrderConfirmation />} 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;