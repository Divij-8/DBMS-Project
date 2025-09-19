import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Users, ShoppingCart, BarChart3, Leaf, TrendingUp, Shield, Globe } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect <span className="text-green-600">Farmers</span> with{' '}
              <span className="text-blue-600">Buyers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline agricultural operations, manage farm data efficiently, and create direct connections 
              between farmers and buyers for fair pricing and sustainable agriculture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  <Sprout className="mr-2 h-5 w-5" />
                  Start as Farmer
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionizing Agriculture
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform brings modern technology to traditional farming, creating opportunities 
              for growth and sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Farm Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Track crops, soil health, resources, and optimize your farming operations with data-driven insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Direct Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Sell your produce directly to buyers, eliminating middlemen and ensuring fair prices for your harvest.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get detailed insights into market trends, pricing, and performance to make informed decisions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with other farmers and buyers, share knowledge, and build lasting business relationships.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose AgriConnect?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Increase Profits</h3>
                    <p className="text-gray-600">
                      Direct sales mean better prices for farmers and fresh produce for buyers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Transactions</h3>
                    <p className="text-gray-600">
                      Safe and secure payment processing with buyer and seller protection.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Wider Reach</h3>
                    <p className="text-gray-600">
                      Connect with buyers across regions and expand your market presence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Agriculture?</h3>
              <p className="text-green-100 mb-6">
                Join thousands of farmers and buyers who are already benefiting from our platform.
              </p>
              <div className="space-y-3">
                <Link to="/register">
                  <Button size="lg" className="w-full bg-white text-green-600 hover:bg-gray-100">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Active Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">₹50L+</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}