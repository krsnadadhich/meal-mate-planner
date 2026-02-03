import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Leaf, Egg, Drumstick, CircleDot, ArrowRight, ArrowLeft } from 'lucide-react';
import { storageService } from '@/services/storageService';
import { DietType, DIET_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

const DIET_ICONS: Record<DietType, React.ComponentType<{ className?: string }>> = {
  'vegetarian': Leaf,
  'vegan': Leaf,
  'eggetarian': Egg,
  'non-vegetarian': Drumstick,
  'none': CircleDot,
};

export default function DietSelectionPage() {
  const navigate = useNavigate();
  const [selectedDiet, setSelectedDiet] = useState<DietType>('none');

  useEffect(() => {
    const saved = storageService.getDietType();
    if (saved) {
      setSelectedDiet(saved);
    }
  }, []);

  const handleContinue = () => {
    storageService.saveDietType(selectedDiet);
    navigate('/cuisine-selection');
  };

  const handleBack = () => {
    navigate('/groceries');
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
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Step 2 of 3</p>
            <h1 className="text-2xl font-bold text-foreground">Diet Type</h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          Select your dietary preference
        </p>
      </div>

      {/* Diet Options */}
      <div className="flex-1 px-6 py-4 space-y-3 overflow-auto">
        {DIET_OPTIONS.map(({ value, label, description }) => {
          const Icon = DIET_ICONS[value];
          const isSelected = selectedDiet === value;
          
          return (
            <Card
              key={value}
              onClick={() => setSelectedDiet(value)}
              className={cn(
                'p-4 cursor-pointer transition-all duration-200',
                'hover:shadow-md',
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-colors',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="p-6 pb-safe border-t bg-background">
        <Button
          size="lg"
          variant="fresh"
          className="w-full"
          onClick={handleContinue}
        >
          Choose Cuisines
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
