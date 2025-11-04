import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/lib/api';
import { User } from '@/lib/auth';
import { toast } from 'sonner';
import { MessageCircle, Send, Loader2, ArrowLeft } from 'lucide-react';

interface Message {
  id: number;
  inquiry: number;
  sender: number;
  sender_name: string;
  recipient: number;
  recipient_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ProductInquiry {
  id: number;
  inquiry_type: string;
  product: number;
  product_name: string;
  equipment: number;
  equipment_name: string;
  item_name: string;
  inquirer: number;
  inquirer_name: string;
  seller: number;
  seller_name: string;
  subject: string;
  message: string;
  status: string;
  messages: Message[];
  unread_count: number;
  created_at: string;
}

interface ChatProps {
  user: User | null;
}

const Chat = ({ user }: ChatProps) => {
  const [conversations, setConversations] = useState<ProductInquiry[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ProductInquiry | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await apiService.get('/messages/my_conversations/');
      const data = Array.isArray(response) ? response : response?.results || [];
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageContent.trim()) return;

    setSendingMessage(true);
    try {
      await apiService.post('/messages/', {
        inquiry: selectedConversation.id,
        content: messageContent.trim()
      });

      setMessageContent('');
      await fetchConversations();
      
      // Update selected conversation after sending
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }

      toast.success('Message sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await apiService.post(`/messages/${messageId}/mark_as_read/`, {});
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleStatusChange = async (inquiryId: number, newStatus: string) => {
    try {
      await apiService.patch(`/product-inquiries/${inquiryId}/update_status/`, {
        status: newStatus
      });
      await fetchConversations();
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-green-600" />
            Messages
          </h1>
          <p className="mt-2 text-gray-600">
            Chat with other farmers about product inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  {conversations.length} active chat{conversations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No conversations yet. Start by sending an inquiry!
                    </p>
                  ) : (
                    conversations.map((conv) => {
                      const otherUser = user?.id === conv.inquirer ? conv.seller_name : conv.inquirer_name;
                      const isSelected = selectedConversation?.id === conv.id;
                      
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            isSelected
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{otherUser}</h3>
                              <p className="text-xs text-gray-600 truncate">{conv.product_name}</p>
                              <p className="text-xs text-gray-500 mt-1 truncate">{conv.subject}</p>
                            </div>
                            {conv.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs flex-shrink-0">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              {conv.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(conv.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden p-1 hover:bg-gray-100 rounded"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <CardTitle>
                            {user?.id === selectedConversation.inquirer
                              ? selectedConversation.seller_name
                              : selectedConversation.inquirer_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {selectedConversation.inquiry_type === 'equipment' ? '🚜 Equipment' : '📦 Product'}
                            </Badge>
                            {selectedConversation.item_name}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedConversation.status}
                        onChange={(e) =>
                          handleStatusChange(selectedConversation.id, e.target.value)
                        }
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                    <p><strong>Subject:</strong> {selectedConversation.subject}</p>
                    <p className="text-gray-600 mt-1">{selectedConversation.message}</p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedConversation.messages.map((msg) => {
                      const isOwnMessage = msg.sender === user?.id;
                      
                      if (!msg.is_read && !isOwnMessage) {
                        handleMarkAsRead(msg.id);
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-green-100 text-green-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs font-semibold mb-1">{msg.sender_name}</p>
                            )}
                            <p className="text-sm break-words">{msg.content}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>

                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="resize-none"
                    />
                    <Button
                      type="submit"
                      disabled={!messageContent.trim() || sendingMessage}
                      className="self-end"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-gray-600">Select a conversation</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Choose a conversation from the list to start chatting
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
