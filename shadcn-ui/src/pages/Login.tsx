import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

interface LoginProps {
  onAuthChange: () => void;
}

const Login = ({ onAuthChange }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedUsernames, setSavedUsernames] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load saved usernames on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedUsernames');
    if (saved) {
      try {
        const usernames = JSON.parse(saved);
        setSavedUsernames(usernames);
        // Auto-fill the most recently used username
        if (usernames.length > 0) {
          setUsername(usernames[0]);
        }
      } catch (e) {
        console.error('Failed to parse saved usernames:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(username, password);
      if (result.success) {
        // Save username to browser storage for auto-fill next time
        const currentSaved = savedUsernames.filter(u => u !== username);
        const updated = [username, ...currentSaved].slice(0, 5); // Keep last 5 usernames
        localStorage.setItem('savedUsernames', JSON.stringify(updated));
        setSavedUsernames(updated);

        toast.success('Login successful!');
        onAuthChange();
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedUsername = (usernameToRemove: string) => {
    const updated = savedUsernames.filter(u => u !== usernameToRemove);
    localStorage.setItem('savedUsernames', JSON.stringify(updated));
    setSavedUsernames(updated);
    if (username === usernameToRemove) {
      setUsername('');
    }
  };

  const useSavedUsername = (savedUsername: string) => {
    setUsername(savedUsername);
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
      backgroundImage: 'url(/agriculture.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your agricultural management dashboard
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
                {/* Saved usernames dropdown */}
                {savedUsernames.length > 0 && (
                  <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 px-2">Recently used:</p>
                    {savedUsernames.map((savedUsername) => (
                      <div
                        key={savedUsername}
                        className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 group"
                      >
                        <button
                          type="button"
                          onClick={() => useSavedUsername(savedUsername)}
                          className="flex-1 text-left text-sm text-gray-700 hover:text-green-600 font-medium"
                        >
                          {savedUsername}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSavedUsername(savedUsername)}
                          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Remove this username"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;