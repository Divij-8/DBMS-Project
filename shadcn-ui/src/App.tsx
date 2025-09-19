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
import NotFound from './pages/NotFound';
import { storage, User } from '@/lib/storage';

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const user = storage.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleAuthChange = () => {
    const user = storage.getCurrentUser();
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;