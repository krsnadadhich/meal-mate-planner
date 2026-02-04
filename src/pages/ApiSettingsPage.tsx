import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, ArrowLeft, Eye, EyeOff, AlertTriangle, 
  CheckCircle, ExternalLink, Shield
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { toast } from 'sonner';

export default function ApiSettingsPage() {
  const navigate = useNavigate();
  const [foodApiKey, setFoodApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showFoodKey, setShowFoodKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  useEffect(() => {
    const keys = storageService.getApiKeys();
    setFoodApiKey(keys.foodApiKey || '');
    setGeminiApiKey(keys.geminiApiKey || '');
  }, []);

  const handleSave = () => {
    storageService.saveApiKeys({
      foodApiKey: foodApiKey.trim() || null,
      geminiApiKey: geminiApiKey.trim() || null,
    });
    toast.success('API keys saved successfully');
  };

  const handleClear = (type: 'food' | 'gemini') => {
    if (type === 'food') {
      setFoodApiKey('');
      storageService.saveApiKeys({ 
        foodApiKey: null, 
        geminiApiKey: geminiApiKey.trim() || null 
      });
      toast.success('Food API key cleared');
    } else {
      setGeminiApiKey('');
      storageService.saveApiKeys({ 
        foodApiKey: foodApiKey.trim() || null, 
        geminiApiKey: null 
      });
      toast.success('Gemini API key cleared');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">API Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Configure your API keys
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Security Warning */}
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Security Notice
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                API keys are stored locally on your device. Never share your API keys with others.
              </p>
            </div>
          </div>
        </Card>

        {/* Food API Key */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Spoonacular API Key
                {foodApiKey && <CheckCircle className="w-4 h-4 text-green-500" />}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Required for fetching real recipes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showFoodKey ? 'text' : 'password'}
                value={foodApiKey}
                onChange={(e) => setFoodApiKey(e.target.value)}
                placeholder="Enter your Spoonacular API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowFoodKey(!showFoodKey)}
              >
                {showFoodKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <a
              href="https://spoonacular.com/food-api/console#Dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Get a free Spoonacular API key
            </a>

            {!foodApiKey && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                Recipe fetching is disabled without this key
              </div>
            )}

            {foodApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClear('food')}
                className="text-destructive"
              >
                Clear Key
              </Button>
            )}
          </div>
        </Card>

        {/* Gemini API Key */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Gemini API Key
                {geminiApiKey && <CheckCircle className="w-4 h-4 text-green-500" />}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Required for AI chatbot and recipe enhancement
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Get a free Gemini API key
            </a>

            {!geminiApiKey && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                AI chatbot is disabled without this key
              </div>
            )}

            {geminiApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClear('gemini')}
                className="text-destructive"
              >
                Clear Key
              </Button>
            )}
          </div>
        </Card>

        {/* Save Button */}
        <Button
          variant="fresh"
          className="w-full"
          onClick={handleSave}
        >
          Save API Keys
        </Button>

        {/* Info Section */}
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-2">About API Keys</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Spoonacular:</strong> Free tier includes 150 requests/day</li>
            <li>• <strong>Gemini:</strong> Free tier includes generous usage limits</li>
            <li>• Keys are stored in your browser's local storage</li>
            <li>• Clearing browser data will remove saved keys</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
