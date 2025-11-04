import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { Bell, X, MessageCircle } from 'lucide-react';

interface NotificationCenterProps {
  userId: number;
  onOrderConfirmed?: () => void;
  onRentalConfirmed?: () => void;
}

interface Notification {
  id: string;
  type: 'order' | 'rental' | 'inquiry';
  title: string;
  description: string;
  amount?: number;
  status: string;
  data: any;
}

export const NotificationCenter = ({
  userId,
  onOrderConfirmed,
  onRentalConfirmed,
}: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Poll for new orders, rentals, and inquiries every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingNotifications();
    }, 10000);

    // Fetch immediately on mount
    fetchPendingNotifications();

    return () => clearInterval(interval);
  }, []);

  const fetchPendingNotifications = async () => {
    try {
      // Fetch pending orders
      const ordersResponse = await apiService.get('/orders/my_sales/');
      const allOrders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.results || []);
      const pendingOrders = allOrders.filter((order: any) => order.status === 'pending');

      // Fetch pending rentals
      const rentalsResponse = await apiService.getMyEquipmentRentals();
      const allRentals = Array.isArray(rentalsResponse) ? rentalsResponse : [];
      const pendingRentals = allRentals.filter((rental: any) => rental.status === 'pending');

      // Fetch product inquiries received
      const inquiriesResponse = await apiService.get('/product-inquiries/my_inquiries_received/');
      const allInquiries = Array.isArray(inquiriesResponse) ? inquiriesResponse : [];
      const openInquiries = allInquiries.filter((inquiry: any) => inquiry.status === 'open');

      // Convert to notifications
      const newNotifications: Notification[] = [
        ...pendingOrders.map((order: any) => ({
          id: `order-${order.id}`,
          type: 'order' as const,
          title: `New Order: ${order.product_name}`,
          description: `${order.buyer_name} ordered ${order.quantity} ${order.product_unit}`,
          amount: parseFloat(String(order.total_amount || 0)),
          status: order.status,
          data: order,
        })),
        ...pendingRentals.map((rental: any) => ({
          id: `rental-${rental.id}`,
          type: 'rental' as const,
          title: `New Rental Request: ${rental.equipment_name}`,
          description: `${rental.renter_name} requested rental for ${rental.rental_days} days`,
          amount: parseFloat(String(rental.total_amount || 0)),
          status: rental.status,
          data: rental,
        })),
        ...openInquiries.map((inquiry: any) => ({
          id: `inquiry-${inquiry.id}`,
          type: 'inquiry' as const,
          title: `Product Inquiry: ${inquiry.product_name}`,
          description: `${inquiry.inquirer_name} asked: ${inquiry.subject}`,
          status: inquiry.status,
          data: inquiry,
        })),
      ];

      setNotifications(newNotifications);

      // Show toast notification if there are new notifications
      if (newNotifications.length > 0) {
        console.log(`${newNotifications.length} pending notification(s)`);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleConfirmOrder = async (notification: Notification) => {
    try {
      const orderId = notification.data.id;
      await apiService.post(`/orders/${orderId}/confirm_order/`, {});
      
      toast.success(`Order confirmed! ₹${notification.amount?.toFixed(2)} added to revenue`);
      
      // Remove notification
      setNotifications(notifications.filter(n => n.id !== notification.id));
      
      // Callback to parent
      onOrderConfirmed?.();
    } catch (error) {
      toast.error('Failed to confirm order');
      console.error('Error confirming order:', error);
    }
  };

  const handleConfirmRental = async (notification: Notification) => {
    try {
      const rentalId = notification.data.id;
      console.log('Confirming rental:', { rentalId, currentData: notification.data });
      
      const response = await apiService.post(`/equipment-rentals/${rentalId}/confirm_rental/`, {});
      console.log('Confirm rental response:', response);
      
      toast.success(`Rental confirmed! ₹${notification.amount?.toFixed(2)} added to revenue`);
      
      // Remove notification
      setNotifications(notifications.filter(n => n.id !== notification.id));
      
      // Callback to parent
      onRentalConfirmed?.();
    } catch (error) {
      toast.error('Failed to confirm rental');
      console.error('Error confirming rental:', error);
    }
  };

  const handleOpenChat = (notification: Notification) => {
    // This will navigate to chat page in future - for now just show toast
    toast.info(`Opening chat for inquiry from ${notification.data.inquirer_name}`);
    // TODO: Navigate to chat page with inquiry ID
  };

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 mb-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border-2 border-green-500"
      >
        <Bell className="h-6 w-6 text-green-600" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <Card className="shadow-xl border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Pending Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No pending transactions</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                    </div>
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 items-center">
                      {notification.amount && (
                        <Badge variant="secondary">
                          ₹{notification.amount.toFixed(2)}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          notification.status === 'pending'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {notification.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {notification.type === 'order' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmOrder(notification)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Confirm Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismiss(notification.id)}
                          className="flex-1"
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {notification.type === 'rental' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmRental(notification)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Confirm Rental
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismiss(notification.id)}
                          className="flex-1"
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {notification.type === 'inquiry' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleOpenChat(notification)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismiss(notification.id)}
                          className="flex-1"
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
