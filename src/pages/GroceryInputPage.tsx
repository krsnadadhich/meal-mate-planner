import { useState, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ShoppingBasket, ArrowRight } from 'lucide-react';
import { storageService } from '@/services/storageService';

const COMMON_GROCERIES = [
  'Rice', 'Paneer', 'Chicken', 'Tomato', 'Onion', 'Potato', 'Garlic',
  'Ginger', 'Milk', 'Eggs', 'Bread', 'Butter', 'Cheese', 'Yogurt',
  'Spinach', 'Carrot', 'Capsicum', 'Mushroom', 'Tofu', 'Pasta'
];

export default function GroceryInputPage() {
  const navigate = useNavigate();
  const [groceries, setGroceries] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const saved = storageService.getGroceryList();
    if (saved.length > 0) {
      setGroceries(saved);
    }
  }, []);

  const addGrocery = (item: string) => {
    const trimmed = item.trim().toLowerCase();
    if (trimmed && !groceries.some(g => g.toLowerCase() === trimmed)) {
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      setGroceries(prev => [...prev, capitalized]);
    }
    setInputValue('');
  };

  const removeGrocery = (item: string) => {
    setGroceries(prev => prev.filter(g => g !== item));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addGrocery(inputValue);
    }
  };

  const handleContinue = () => {
    storageService.saveGroceryList(groceries);
    navigate('/diet-selection');
  };

  const suggestedItems = COMMON_GROCERIES.filter(
    item => !groceries.some(g => g.toLowerCase() === item.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBasket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Step 1 of 3</p>
            <h1 className="text-2xl font-bold text-foreground">Your Groceries</h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          Add the ingredients you have at home
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-4 space-y-6 overflow-auto">
        {/* Input Field */}
        <div className="flex gap-2">
          <Input
            placeholder="Type an ingredient..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            variant="fresh"
            size="icon"
            onClick={() => addGrocery(inputValue)}
            disabled={!inputValue.trim()}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Added Groceries */}
        {groceries.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Your ingredients ({groceries.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {groceries.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="pl-3 pr-2 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {item}
                  <button
                    onClick={() => removeGrocery(item)}
                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Add Suggestions */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Quick add
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestedItems.map((item) => (
              <Button
                key={item}
                variant="outline"
                size="sm"
                onClick={() => addGrocery(item)}
                className="rounded-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6 pb-safe border-t bg-background">
        <Button
          size="lg"
          variant="fresh"
          className="w-full"
          onClick={handleContinue}
          disabled={groceries.length === 0}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        {groceries.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            Add at least one ingredient to continue
          </p>
        )}
      </div>
    </div>
  );
}
