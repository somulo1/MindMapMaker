import { useState } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Brain, Send } from "lucide-react";

export default function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user' as const, content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // TODO: Implement AI API call here
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      
      const data = await response.json();
      const aiMessage = { role: 'assistant' as const, content: data.response };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message to chat
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserLayout title="AI Assistant">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Ask me anything about finance, investments, or chama management.
          </p>
        </div>

        <Card className="p-4 mb-4 h-[calc(100vh-300px)] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1"
              rows={1}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !message.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </Card>
      </div>
    </UserLayout>
  );
} 