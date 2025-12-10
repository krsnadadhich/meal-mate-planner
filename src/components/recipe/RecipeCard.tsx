import { Recipe } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  isSelected?: boolean;
  onSelect?: (recipe: Recipe) => void;
  onViewDetails?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, isSelected, onSelect, onViewDetails }: RecipeCardProps) {
  const matchPercentage = recipe.matchPercentage || 0;

  return (
    <Card
      className={cn(
        'overflow-hidden animate-scale-in cursor-pointer group',
        'hover:shadow-card transition-all duration-300',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={() => onViewDetails?.(recipe)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Match Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className={cn(
              'px-3 py-1 text-sm font-bold shadow-lg',
              matchPercentage >= 70
                ? 'gradient-fresh text-primary-foreground'
                : matchPercentage >= 40
                ? 'bg-warm-orange text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {matchPercentage}% match
          </Badge>
        </div>

        {/* Select Button */}
        {onSelect && (
          <Button
            variant={isSelected ? 'fresh' : 'secondary'}
            size="icon"
            className="absolute top-3 right-3 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(recipe);
            }}
          >
            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-primary" />
            {recipe.usedIngredientCount} have
          </span>
          <span className="flex items-center gap-1 text-warm-orange">
            <Plus className="w-4 h-4" />
            {recipe.missedIngredientCount} need
          </span>
        </div>

        {(recipe.readyInMinutes || recipe.servings) && (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {recipe.readyInMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.readyInMinutes} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
