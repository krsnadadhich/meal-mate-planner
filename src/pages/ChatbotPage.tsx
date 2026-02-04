import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, Sparkles, Key, AlertTriangle } from 'lucide-react';
import { storageService } from '@/services/storageService';
import { geminiService } from '@/services/geminiService';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  "Calories in chicken?",
  "Substitute for eggs?",
  "Healthy dinner ideas",
  "How to meal prep?",
];

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const keyExists = geminiService.hasApiKey();
    setHasApiKey(keyExists);
    
    const saved = storageService.getChatMessages();
    if (saved.length === 0) {
      const welcomeContent = keyExists
        ? "Hi! 👋 I'm your AI food assistant powered by Gemini. I can help you with:\n\n• Nutritional information\n• Ingredient substitutions\n• Diet and meal planning tips\n• Cooking advice\n\n*Note: For recipe suggestions, please use the Recipes page which fetches real recipes.*\n\nWhat would you like to know?"
        : "Hi! 👋 I'm your AI food assistant. To unlock full AI capabilities, please add your Gemini API key in Settings.\n\nI can still help with basic questions about:\n\n• Nutritional information\n• Ingredient substitutions\n• Cooking tips\n\nWhat would you like to know?";
      
      const welcome: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    } else {
      setMessages(saved);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setApiError(null);
    
    const userMessage = storageService.addChatMessage({
      role: 'user',
      content: content.trim(),
    });
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const groceries = storageService.getGroceryList();
      const savedRecipes = storageService.getRecipeBook();
      const chatHistory = storageService.getChatMessages();
      
      let response: string;
      
      if (hasApiKey) {
        response = await geminiService.chat(content, groceries, savedRecipes, chatHistory);
      } else {
        response = await geminiService.mockChat(content, groceries);
      }
      
      const assistantMessage = storageService.addChatMessage({
        role: 'assistant',
        content: response,
      });
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      
      const errorResponse = storageService.addChatMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease check your API key in Settings > API Settings.`,
      });
      setMessages(prev => [...prev, errorResponse]);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  {hasApiKey ? 'Powered by Gemini' : 'Basic mode'}
                </p>
              </div>
            </div>
            {!hasApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/api-settings')}
                className="text-xs"
              >
                <Key className="w-3 h-3 mr-1" />
                Add API Key
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* API Key Warning Banner */}
      {!hasApiKey && (
        <div className="px-4 pt-2">
          <Card className="p-3 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 dark:text-amber-400">
                Running in limited mode. Add your Gemini API key for full AI features.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Error Banner */}
      {apiError && (
        <div className="px-4 pt-2">
          <Card className="p-3 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-destructive">{apiError}</span>
            </div>
          </Card>
        </div>
      )}

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
            placeholder="Ask about nutrition, substitutions, tips..."
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
