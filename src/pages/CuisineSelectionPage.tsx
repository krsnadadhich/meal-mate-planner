import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UtensilsCrossed, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { storageService } from '@/services/storageService';
import { CUISINE_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

export default function CuisineSelectionPage() {
  const navigate = useNavigate();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  useEffect(() => {
    const saved = storageService.getCuisines();
    if (saved.length > 0) {
      setSelectedCuisines(saved);
    }
  }, []);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleContinue = () => {
    storageService.saveCuisines(selectedCuisines);
    storageService.setOnboardingComplete(true);
    navigate('/recipes');
  };

  const handleBack = () => {
    navigate('/diet-selection');
  };

  const selectAll = () => {
    setSelectedCuisines([...CUISINE_OPTIONS]);
  };

  const clearAll = () => {
    setSelectedCuisines([]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Step 3 of 3</p>
            <h1 className="text-2xl font-bold text-foreground">Cuisines</h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          Select your favorite cuisines
        </p>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Cuisine Options */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        <div className="grid grid-cols-2 gap-3">
          {CUISINE_OPTIONS.map((cuisine) => {
            const isSelected = selectedCuisines.includes(cuisine);
            
            return (
              <Card
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={cn(
                  'p-4 cursor-pointer transition-all duration-200 relative',
                  'hover:shadow-md',
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCuisine(cuisine)}
                    className="pointer-events-none"
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                    {cuisine}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6 pb-safe border-t bg-background">
        <Button
          size="lg"
          variant="fresh"
          className="w-full"
          onClick={handleContinue}
        >
          Generate Recipes
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        {selectedCuisines.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            Select at least one cuisine for better results
          </p>
        )}
      </div>
    </div>
  );
}
