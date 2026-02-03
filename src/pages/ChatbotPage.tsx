import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import { storageService } from '@/services/storageService';
import { aiService } from '@/services/aiService';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  "What can I cook today?",
  "Calories in chicken?",
  "Substitute for eggs?",
  "Healthy dinner ideas",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = storageService.getChatMessages();
    if (saved.length === 0) {
      // Add welcome message
      const welcome: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! 👋 I'm your AI food assistant. I can help you with:\n\n• Recipe suggestions based on your groceries\n• Nutritional information\n• Ingredient substitutions\n• Diet and meal planning tips\n\nWhat would you like to know?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    } else {
      setMessages(saved);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage = storageService.addChatMessage({
      role: 'user',
      content: content.trim(),
    });
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const groceries = storageService.getGroceryList();
      const response = await aiService.chat(content, groceries);
      
      // Add assistant message
      const assistantMessage = storageService.addChatMessage({
        role: 'assistant',
        content: response,
      });
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = storageService.addChatMessage({
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
      });
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Your cooking companion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(prompt)}
                className="rounded-full text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            placeholder="Ask me anything about food..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="fresh"
            size="icon"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-primary/20 to-primary/10'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Message */}
      <Card
        className={cn(
          'max-w-[80%] p-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </Card>
    </div>
  );
}
