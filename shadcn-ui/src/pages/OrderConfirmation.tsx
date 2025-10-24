import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { orderData, orderNumber } = location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!orderData || !orderNumber) {
      navigate('/marketplace');
    }
  }, [orderData, orderNumber, navigate]);

  if (!orderData || !orderNumber) {
    return null;
  }

  const totalItems = orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your order and will process it shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <CardDescription>
                  Order #{orderNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order Number:</span>
                    <Badge variant="outline">{orderNumber}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Items:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment Method:</span>
                    <span className="capitalize">{orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : orderData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order Total:</span>
                    <span className="font-bold text-green-600">₹{orderData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-gray-600">{orderData.customer.firstName} {orderData.customer.lastName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{orderData.customer.email}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">{orderData.customer.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-900">{orderData.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.pincode}
                  </p>
                  {orderData.deliveryInstructions && (
                    <div className="mt-4">
                      <p className="font-medium">Delivery Instructions:</p>
                      <p className="text-gray-600 text-sm">{orderData.deliveryInstructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">Product #{item.productId}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>₹{orderData.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Order Processing</p>
                      <p className="text-xs text-gray-600">We'll prepare your order within 1-2 business days</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Quality Check</p>
                      <p className="text-xs text-gray-600">Fresh products are inspected before shipping</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Delivery</p>
                      <p className="text-xs text-gray-600">Your order will be delivered within 3-5 business days</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/marketplace')}
                    className="w-full"
                    variant="outline"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>

                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Need help? Contact our support team
                  </p>
                  <p className="text-xs text-gray-500">
                    support@arms-marketplace.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;