import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiService } from '@/lib/api';
import { User } from '@/lib/auth';
import { toast } from 'sonner';
import { Send, MessageCircle, Loader2 } from 'lucide-react';

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
  product: number;
  product_name: string;
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
  updated_at: string;
}

interface MessagesProps {
  user?: User | null;
}

const Messages = ({ user }: MessagesProps) => {
  const [conversations, setConversations] = useState<ProductInquiry[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ProductInquiry | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await apiService.get('/messages/my_conversations/');
      const conversationsArray = Array.isArray(data) ? data : (data?.results || []);
      setConversations(conversationsArray);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageContent.trim()) return;

    setSending(true);
    try {
      await apiService.post('/messages/', {
        inquiry: selectedConversation.id,
        content: messageContent
      });

      setMessageContent('');
      toast.success('Message sent!');
      await fetchConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherPartyName = (inquiry: ProductInquiry): string => {
    if (user?.id === inquiry.inquirer) {
      return inquiry.seller_name;
    }
    return inquiry.inquirer_name;
  };

  const getOtherPartyId = (inquiry: ProductInquiry): number => {
    if (user?.id === inquiry.inquirer) {
      return inquiry.seller;
    }
    return inquiry.inquirer;
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
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
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
                <CardDescription>{conversations.length} total</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        No conversations yet
                      </p>
                    ) : (
                      conversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-green-100 border-2 border-green-500'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm">
                              {getOtherPartyName(conversation)}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {conversation.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            About: {conversation.product_name}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="flex flex-col h-96 lg:h-auto">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Chat with {getOtherPartyName(selectedConversation)}</CardTitle>
                      <CardDescription>
                        About: {selectedConversation.product_name}
                      </CardDescription>
                      <p className="text-xs text-gray-500 mt-2">
                        Inquiry: {selectedConversation.subject}
                      </p>
                    </div>
                    <Badge variant="secondary">{selectedConversation.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <ScrollArea className="flex-1 mb-4 pr-4">
                    <div className="space-y-4">
                      {/* Initial Inquiry */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm">
                            {selectedConversation.inquirer_name} - Initial Inquiry
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedConversation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {selectedConversation.message}
                        </p>
                      </div>

                      {/* Chat Messages */}
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                              message.sender === user?.id
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-gray-100 border border-gray-300'
                            }`}
                          >
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              {message.sender_name}
                            </p>
                            <p className="text-sm text-gray-800">{message.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="border-t pt-4">
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
                        disabled={sending || !messageContent.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Select a conversation to start chatting</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
