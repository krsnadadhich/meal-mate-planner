import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Recipe } from '@/types';
import { spoonacularService } from '@/services/spoonacularService';
import { Check, Plus, Clock, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelected?: boolean;
  onSelect?: (recipe: Recipe) => void;
}

export function RecipeDetailDialog({
  recipe,
  open,
  onOpenChange,
  isSelected,
  onSelect,
}: RecipeDetailDialogProps) {
  const [details, setDetails] = useState<Partial<Recipe> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipe && open) {
      setLoading(true);
      spoonacularService
        .getRecipeDetails(Number(recipe.id))
        .then(setDetails)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [recipe, open]);

  if (!recipe) return null;

  const matchPercentage = recipe.matchPercentage || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4">
            <Badge
              className={cn(
                'mb-2 px-3 py-1',
                matchPercentage >= 70
                  ? 'gradient-fresh text-primary-foreground'
                  : matchPercentage >= 40
                  ? 'bg-warm-orange text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {matchPercentage}% match
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{recipe.title}</h2>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] px-6 pb-6">
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {(details?.readyInMinutes || recipe.readyInMinutes) && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  {details?.readyInMinutes || recipe.readyInMinutes} min
                </span>
              )}
              {(details?.servings || recipe.servings) && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  {details?.servings || recipe.servings} servings
                </span>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipe.usedIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/5"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      {ing.amount} {ing.unit} {ing.name}
                    </span>
                  </div>
                ))}
                {recipe.missedIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-warm-orange/10"
                  >
                    <Plus className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span>
                      {ing.amount} {ing.unit} {ing.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Instructions</h3>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading instructions...
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: details?.instructions || 'No instructions available.',
                  }}
                />
              )}
            </div>
          </div>
        </ScrollArea>

        {onSelect && (
          <div className="p-4 border-t">
            <Button
              variant={isSelected ? 'outline' : 'fresh'}
              className="w-full"
              onClick={() => {
                onSelect(recipe);
                onOpenChange(false);
              }}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Selection
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
