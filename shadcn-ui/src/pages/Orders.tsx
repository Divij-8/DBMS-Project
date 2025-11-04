import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertCircle } from 'lucide-react';
import { User } from '@/lib/auth';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:8000/api';

interface Order {
  id: number;
  product: number;
  product_name: string;
  product_unit: string;
  buyer: number;
  buyer_name: string;
  seller: number;
  seller_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  delivery_address: string;
  special_instructions: string;
  created_at: string;
  updated_at: string;
}

interface OrdersProps {
  user?: User | null;
}

const Orders = ({ user }: OrdersProps) => {
  const [myPurchases, setMyPurchases] = useState<Order[]>([]);
  const [mySales, setMySales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      if (user?.role === 'buyer') {
        const response = await fetch(`${API_BASE_URL}/orders/my_purchases/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch purchases');
        const data = await response.json();
        setMyPurchases(data);
      } else if (user?.role === 'farmer') {
        const [salesRes, purchasesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders/my_sales/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE_URL}/orders/my_purchases/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!salesRes.ok) throw new Error('Failed to fetch sales');
        if (!purchasesRes.ok) throw new Error('Failed to fetch purchases');

        const salesData = await salesRes.json();
        const purchasesData = await purchasesRes.json();

        setMySales(salesData);
        setMyPurchases(purchasesData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to confirm order');
      toast.success('Order confirmed successfully');
      fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm order';
      toast.error(message);
    }
  };

  const handleMarkShipped = async (orderId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/mark_shipped/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to mark as shipped');
      toast.success('Order marked as shipped');
      fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark as shipped';
      toast.error(message);
    }
  };

  const handleMarkDelivered = async (orderId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/mark_delivered/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to mark as delivered');
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark as delivered';
      toast.error(message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const OrderCard = ({ order, isSale }: { order: Order; isSale: boolean }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.product_name}</CardTitle>
            <CardDescription>
              {isSale ? `Buyer: ${order.buyer_name}` : `Seller: ${order.seller_name}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge className={getPaymentStatusColor(order.payment_status)}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Quantity</p>
            <p className="font-semibold">{order.quantity} {order.product_unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unit Price</p>
            <p className="font-semibold">₹{parseFloat(String(order.unit_price)).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold text-lg text-green-600">₹{parseFloat(String(order.total_amount)).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {order.delivery_address && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Delivery Address</p>
            <p className="text-sm">{order.delivery_address}</p>
          </div>
        )}

        {order.special_instructions && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Special Instructions</p>
            <p className="text-sm">{order.special_instructions}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {isSale && order.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleConfirmOrder(order.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Order
            </Button>
          )}
          {isSale && order.status === 'confirmed' && (
            <Button
              size="sm"
              onClick={() => handleMarkShipped(order.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Mark as Shipped
            </Button>
          )}
          {!isSale && order.status === 'shipped' && (
            <Button
              size="sm"
              onClick={() => handleMarkDelivered(order.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Delivered
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <p>Please log in to view your orders.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="w-8 h-8 text-green-600" />
          Orders
        </h1>
        <p className="text-gray-600">Manage and track your orders</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : user.role === 'buyer' ? (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>My Purchases</CardTitle>
              <CardDescription>Orders you have placed</CardDescription>
            </CardHeader>
            <CardContent>
              {myPurchases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No purchases yet</p>
              ) : (
                <div>
                  {myPurchases.map((order) => (
                    <OrderCard key={order.id} order={order} isSale={false} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sales">My Sales</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>My Sales</CardTitle>
                <CardDescription>Orders from buyers for your products</CardDescription>
              </CardHeader>
              <CardContent>
                {mySales.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sales yet</p>
                ) : (
                  <div>
                    {mySales.map((order) => (
                      <OrderCard key={order.id} order={order} isSale={true} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>My Purchases</CardTitle>
                <CardDescription>Orders you have placed from other farmers</CardDescription>
              </CardHeader>
              <CardContent>
                {myPurchases.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No purchases yet</p>
                ) : (
                  <div>
                    {myPurchases.map((order) => (
                      <OrderCard key={order.id} order={order} isSale={false} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Orders;