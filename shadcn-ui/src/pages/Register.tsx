import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

interface RegisterProps {
  onAuthChange: () => void;
}

const Register = ({ onAuthChange }: RegisterProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: '' as 'farmer' | 'buyer' | '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('registerFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedData);
    
    // Save to localStorage automatically
    localStorage.setItem('registerFormData', JSON.stringify(updatedData));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (formData.password.toLowerCase() === formData.username.toLowerCase()) {
      errors.password = 'Password cannot be the same as username';
    }

    if (formData.password !== formData.password2) {
      errors.password2 = 'Passwords do not match';
    }

    if (!formData.role) {
      errors.role = 'Please select your role';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        role: formData.role as 'farmer' | 'buyer',
      });

      if (result.success) {
        // Clear saved form data on successful registration
        localStorage.removeItem('registerFormData');
        toast.success('Registration successful!');
        onAuthChange();
        navigate('/dashboard');
      } else {
        // Handle backend validation errors
        const message = result.message || 'Registration failed';
        setError(message);
        
        // Try to parse field-specific errors
        if (message.includes('username')) {
          setFieldErrors(prev => ({ ...prev, username: message }));
        } else if (message.includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: message }));
        } else if (message.includes('password')) {
          setFieldErrors(prev => ({ ...prev, password: message }));
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem('registerFormData');
    setFormData({
      username: '',
      email: '',
      password: '',
      password2: '',
      role: '' as 'farmer' | 'buyer' | '',
    });
    setFieldErrors({});
    toast.info('Form data cleared');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the agricultural community
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your account to start managing your agricultural business
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
                <Label htmlFor="username">
                  Username
                  {fieldErrors.username && <span className="text-red-600 ml-1">*</span>}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  className={fieldErrors.username ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.username && (
                  <p className="text-xs text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                  {fieldErrors.email && <span className="text-red-600 ml-1">*</span>}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={fieldErrors.email ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  I am a
                  {fieldErrors.role && <span className="text-red-600 ml-1">*</span>}
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className={fieldErrors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.role && (
                  <p className="text-xs text-red-600">{fieldErrors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                  {fieldErrors.password && <span className="text-red-600 ml-1">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password (min. 8 characters)"
                  className={fieldErrors.password ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2">
                  Confirm Password
                  {fieldErrors.password2 && <span className="text-red-600 ml-1">*</span>}
                </Label>
                <Input
                  id="password2"
                  type="password"
                  value={formData.password2}
                  onChange={(e) => handleInputChange('password2', e.target.value)}
                  placeholder="Confirm your password"
                  className={fieldErrors.password2 ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.password2 && (
                  <p className="text-xs text-red-600">{fieldErrors.password2}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearSavedData}
                  disabled={isLoading}
                  title="Clear saved form data"
                >
                  Clear
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;