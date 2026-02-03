import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChefHat, Clock, Flame, Dumbbell, RefreshCw, 
  BookmarkPlus, Eye, ArrowRight 
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { aiService } from '@/services/aiService';
import { Recipe } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RecipeSuggestionsPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const groceries = storageService.getGroceryList();
      const dietType = storageService.getDietType();
      const cuisines = storageService.getCuisines();
      
      const results = await aiService.generateRecipes(groceries, dietType, cuisines);
      setRecipes(results);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBook = (recipe: Recipe) => {
    const added = storageService.addToRecipeBook(recipe);
    if (added) {
      toast.success('Recipe saved to your book!');
    } else {
      toast.info('Recipe already in your book');
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`, { state: { recipe } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Recipes</h1>
                <p className="text-sm text-muted-foreground">
                  {recipes.length} suggestions
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={loadRecipes}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </Card>
          ))
        ) : recipes.length === 0 ? (
          // Empty State
          <Card className="p-8 text-center">
            <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No recipes found</h3>
            <p className="text-muted-foreground mb-4">
              Try adding more groceries or adjusting your preferences
            </p>
            <Button onClick={() => navigate('/settings')}>
              Update Preferences
            </Button>
          </Card>
        ) : (
          // Recipe Cards
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => handleViewRecipe(recipe)}
              onSave={() => handleAddToBook(recipe)}
              isSaved={storageService.isInRecipeBook(recipe.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onView: () => void;
  onSave: () => void;
  isSaved: boolean;
}

function RecipeCard({ recipe, onView, onSave, isSaved }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {recipe.image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
            {recipe.cuisine}
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          {recipe.cookingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.cookingTime} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            {recipe.calories} cal
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4 text-blue-500" />
            {recipe.protein}g protein
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onView}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Recipe
          </Button>
          <Button
            variant={isSaved ? "secondary" : "fresh"}
            size="sm"
            className="flex-1"
            onClick={onSave}
            disabled={isSaved}
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
