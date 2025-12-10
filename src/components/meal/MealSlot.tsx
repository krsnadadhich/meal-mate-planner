import { Recipe, MealType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Cloud, Moon, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealSlotProps {
  type: MealType;
  recipe: Recipe | null;
  onRemove: () => void;
  onAssign: () => void;
}

const mealConfig = {
  breakfast: {
    icon: Sun,
    label: 'Breakfast',
    gradient: 'from-warm-orange/20 to-warm-coral/10',
    iconColor: 'text-warm-orange',
  },
  lunch: {
    icon: Cloud,
    label: 'Lunch',
    gradient: 'from-fresh-sage/20 to-primary/10',
    iconColor: 'text-primary',
  },
  dinner: {
    icon: Moon,
    label: 'Dinner',
    gradient: 'from-primary/20 to-fresh-green/10',
    iconColor: 'text-fresh-green',
  },
};

export function MealSlot({ type, recipe, onRemove, onAssign }: MealSlotProps) {
  const config = mealConfig[type];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'overflow-hidden animate-scale-in',
        'hover:shadow-card transition-all duration-300',
        !recipe && 'border-dashed border-2'
      )}
    >
      <div className={cn('p-4 bg-gradient-to-r', config.gradient)}>
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', config.iconColor)} />
          <span className="font-semibold">{config.label}</span>
        </div>
      </div>

      {recipe ? (
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="p-4">
            <h4 className="font-semibold line-clamp-2">{recipe.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {recipe.matchPercentage}% match • {recipe.usedIngredientCount} ingredients used
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">No meal selected</p>
          <Button variant="soft" size="sm" onClick={onAssign}>
            Choose Recipe
          </Button>
        </div>
      )}
    </Card>
  );
}
