import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Users, ShoppingCart, BarChart3, Leaf, TrendingUp, Shield, Globe, Tractor, Droplet, Wind } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mb-8 inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold animate-pulse">
                <Sprout className="h-4 w-4" />
                Welcome to ARMS - Agricultural Resource Management System
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Empower <span className="text-green-600 animate-text-gradient">Farmers</span>, Connect with{' '}
              <span className="text-blue-600 animate-text-gradient">Buyers</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your agricultural journey with ARMS. Manage farms efficiently, sell produce directly, rent equipment, and grow sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Sprout className="mr-2 h-6 w-6" />
                  Start as Farmer
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <ShoppingCart className="mr-2 h-6 w-6" />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose ARMS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive agricultural solutions designed for modern farming
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Leaf,
                title: 'Farm Management',
                desc: 'Track crops, soil health, resources, and optimize operations with data-driven insights.',
                color: 'green',
                delay: '0s'
              },
              {
                icon: ShoppingCart,
                title: 'Direct Marketplace',
                desc: 'Sell produce directly to buyers, eliminate middlemen, and ensure fair prices.',
                color: 'blue',
                delay: '100ms'
              },
              {
                icon: Tractor,
                title: 'Equipment Rental',
                desc: 'Rent or list equipment to other farmers, maximizing resource utilization.',
                color: 'orange',
                delay: '200ms'
              },
              {
                icon: BarChart3,
                title: 'Smart Analytics',
                desc: 'Get insights into market trends, pricing, and performance metrics.',
                color: 'purple',
                delay: '300ms'
              }
            ].map((feature, idx) => {
              const colorMap = {
                green: { bg: 'bg-green-100', text: 'text-green-600' },
                blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
                purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
              };
              const colors = colorMap[feature.color as keyof typeof colorMap];
              return (
                <Card key={idx} className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: feature.delay }}>
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110`}>
                      <feature.icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Revolutionizing Agriculture
              </h2>
              <div className="space-y-8">
                {[
                  {
                    icon: TrendingUp,
                    title: 'Increase Profits',
                    desc: 'Direct sales mean better prices for farmers and fresh produce for buyers.'
                  },
                  {
                    icon: Shield,
                    title: 'Secure Transactions',
                    desc: 'Safe and secure payment processing with buyer and seller protection.'
                  },
                  {
                    icon: Globe,
                    title: 'Wider Reach',
                    desc: 'Connect with buyers across regions and expand your market presence.'
                  },
                  {
                    icon: Droplet,
                    title: 'Sustainable Farming',
                    desc: 'Track resources and optimize usage for sustainable agricultural practices.'
                  }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-4 transform transition-transform duration-300 hover:translate-x-2">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-3xl p-12 text-white shadow-2xl transform transition-transform duration-300 hover:scale-105">
                <h3 className="text-3xl font-bold mb-6">Ready to Transform?</h3>
                <p className="text-green-100 mb-8 text-lg leading-relaxed">
                  Join thousands of farmers and buyers who are already benefiting from ARMS. Start your agricultural journey today.
                </p>
                <div className="space-y-4">
                  <Link to="/register">
                    <Button size="lg" className="w-full bg-white text-green-600 hover:bg-gray-100 font-semibold py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                      Get Started Today
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button size="lg" variant="outline" className="w-full border-2 border-white text-white hover:bg-white/20 font-semibold py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                      Explore Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Farmers', color: 'green' },
              { value: '1000+', label: 'Products Listed', color: 'blue' },
              { value: '₹50L+', label: 'Revenue Generated', color: 'purple' }
            ].map((stat, idx) => (
              <div key={idx} className={`p-8 rounded-xl bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                <div className={`text-5xl font-bold text-${stat.color}-600 mb-3`}>{stat.value}</div>
                <div className="text-gray-600 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}