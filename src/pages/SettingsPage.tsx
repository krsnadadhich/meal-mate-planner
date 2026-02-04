import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, ShoppingBasket, Leaf, UtensilsCrossed, 
  BookOpen, MessageSquare, Trash2, Info, ChevronRight,
  AlertTriangle, Key, CheckCircle
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [groceryCount, setGroceryCount] = useState(0);
  const [dietType, setDietType] = useState('');
  const [cuisineCount, setCuisineCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [hasApiKeys, setHasApiKeys] = useState({ food: false, gemini: false });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const prefs = storageService.getPreferences();
    setGroceryCount(prefs.groceries.length);
    setDietType(prefs.dietType);
    setCuisineCount(prefs.cuisines.length);
    setRecipeCount(storageService.getRecipeBook().length);
    setChatCount(storageService.getChatMessages().length);
    setHasApiKeys({
      food: storageService.hasFoodApiKey(),
      gemini: storageService.hasGeminiApiKey(),
    });
  };

  const handleClearRecipes = () => {
    storageService.clearRecipeBook();
    loadStats();
    toast.success('Recipe book cleared');
  };

  const handleClearChat = () => {
    storageService.clearChatMessages();
    loadStats();
    toast.success('Chat history cleared');
  };

  const handleClearAll = () => {
    storageService.clearAllData();
    toast.success('All data cleared');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-6 py-4 space-y-6">
        {/* API Settings Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            API Configuration
          </h2>
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/api-settings')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">API Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Configure Spoonacular & Gemini keys
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasApiKeys.food && hasApiKeys.gemini ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Preferences
          </h2>
          <Card className="divide-y">
            <SettingItem
              icon={ShoppingBasket}
              label="Edit Groceries"
              value={`${groceryCount} items`}
              onClick={() => navigate('/groceries')}
            />
            <SettingItem
              icon={Leaf}
              label="Diet Type"
              value={dietType || 'Not set'}
              onClick={() => navigate('/diet-selection')}
            />
            <SettingItem
              icon={UtensilsCrossed}
              label="Cuisines"
              value={`${cuisineCount} selected`}
              onClick={() => navigate('/cuisine-selection')}
            />
          </Card>
        </div>

        {/* Data Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Data Management
          </h2>
          <Card className="divide-y">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Recipe Book</p>
                  <p className="text-sm text-muted-foreground">
                    {recipeCount} saved recipe{recipeCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Recipe Book</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all your saved recipes. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearRecipes}>
                      Clear
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Chat History</p>
                  <p className="text-sm text-muted-foreground">
                    {chatCount} message{chatCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all chat messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat}>
                      Clear
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div>
          <h2 className="text-sm font-medium text-destructive mb-3">
            Danger Zone
          </h2>
          <Card className="border-destructive/20">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-destructive/5 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Clear All Data</p>
                    <p className="text-sm text-muted-foreground">
                      Reset app to initial state
                    </p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your groceries, preferences, saved recipes, and chat history. You'll need to set up the app again. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>

        {/* App Info */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            About
          </h2>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Meal Mate Planner</p>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your smart kitchen companion for effortless meal planning. Built with React and powered by AI.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface SettingItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onClick: () => void;
}

function SettingItem({ icon: Icon, label, value, onClick }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {value}
        </Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}
