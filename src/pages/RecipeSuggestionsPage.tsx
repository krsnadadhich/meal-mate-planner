import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChefHat, Clock, Flame, Dumbbell, RefreshCw, 
  BookmarkPlus, Eye, AlertTriangle, Key, ChevronRight
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { recipeApiService } from '@/services/recipeApiService';
import { Recipe, RawRecipesByCuisine, RecipeFetchError } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RecipeSuggestionsPage() {
  const navigate = useNavigate();
  const [recipesByCuisine, setRecipesByCuisine] = useState<Map<string, Recipe[]>>(new Map());
  const [errors, setErrors] = useState<RecipeFetchError[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const keyExists = recipeApiService.hasApiKey();
    setHasApiKey(keyExists);
    
    if (keyExists) {
      loadRecipes();
    } else {
      setLoading(false);
    }
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    setErrors([]);
    
    try {
      const groceries = storageService.getGroceryList();
      const dietType = storageService.getDietType();
      const cuisines = storageService.getCuisines();
      
      if (cuisines.length === 0) {
        toast.error('Please select at least one cuisine preference');
        navigate('/cuisine-selection');
        return;
      }

      const { recipes: rawRecipes, errors: fetchErrors } = 
        await recipeApiService.fetchRecipesByCuisines(cuisines, groceries, dietType);
      
      setErrors(fetchErrors);
      
      // Process recipes for display
      const processedRecipes = recipeApiService.processRecipesForDisplay(rawRecipes, groceries);
      setRecipesByCuisine(processedRecipes);
      
      // Show warnings for errors
      const criticalErrors = fetchErrors.filter(e => e.type === 'missing_key' || e.type === 'quota_exceeded');
      if (criticalErrors.length > 0) {
        toast.error(criticalErrors[0].error);
      }
      
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

  const totalRecipes = Array.from(recipesByCuisine.values()).reduce((sum, arr) => sum + arr.length, 0);

  // No API Key State
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header loading={false} onRefresh={() => {}} recipeCount={0} />
        <div className="px-6 py-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Key className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-xl mb-2">API Key Required</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              To fetch real recipes, you need to configure your Spoonacular API key.
            </p>
            <Button variant="fresh" onClick={() => navigate('/api-settings')}>
              Configure API Key
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header loading={loading} onRefresh={loadRecipes} recipeCount={totalRecipes} />

      {/* Error Banners */}
      {errors.length > 0 && (
        <div className="px-6 py-2 space-y-2">
          {errors.filter(e => e.type === 'quota_exceeded').slice(0, 1).map((err) => (
            <Card key={err.cuisine} className="p-3 border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">API Quota Exceeded</span>
                <span className="text-muted-foreground">- Daily limit reached</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recipe Sections by Cuisine */}
      <div className="px-6 py-4 space-y-8">
        {loading ? (
          <LoadingState />
        ) : totalRecipes === 0 ? (
          <EmptyState onNavigateToSettings={() => navigate('/settings')} />
        ) : (
          Array.from(recipesByCuisine.entries()).map(([cuisine, recipes]) => (
            <CuisineSection
              key={cuisine}
              cuisine={cuisine}
              recipes={recipes}
              error={errors.find(e => e.cuisine === cuisine)}
              onViewRecipe={handleViewRecipe}
              onSaveRecipe={handleAddToBook}
            />
          ))
        )}

        {/* Cuisines with no results */}
        {!loading && errors.filter(e => e.type === 'no_results').map((err) => (
          <Card key={err.cuisine} className="p-4 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium">{err.cuisine}</p>
                <p className="text-sm text-muted-foreground">{err.error}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface HeaderProps {
  loading: boolean;
  onRefresh: () => void;
  recipeCount: number;
}

function Header({ loading, onRefresh, recipeCount }: HeaderProps) {
  return (
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
                {recipeCount > 0 ? `${recipeCount} recipes found` : 'Find recipes'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Card key={j} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  onNavigateToSettings: () => void;
}

function EmptyState({ onNavigateToSettings }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg mb-2">No recipes found</h3>
      <p className="text-muted-foreground mb-4">
        Try adding more groceries or adjusting your cuisine preferences
      </p>
      <Button onClick={onNavigateToSettings}>
        Update Preferences
      </Button>
    </Card>
  );
}

interface CuisineSectionProps {
  cuisine: string;
  recipes: Recipe[];
  error?: RecipeFetchError;
  onViewRecipe: (recipe: Recipe) => void;
  onSaveRecipe: (recipe: Recipe) => void;
}

function CuisineSection({ cuisine, recipes, error, onViewRecipe, onSaveRecipe }: CuisineSectionProps) {
  // Flag: If only 1 recipe, show warning
  const isSingleRecipeWarning = recipes.length === 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg">{cuisine}</h2>
          <Badge variant="secondary" className="text-xs">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </Badge>
        </div>
        {isSingleRecipeWarning && (
          <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Limited results
          </Badge>
        )}
      </div>

      {error && error.type !== 'no_results' && (
        <Card className="p-3 mb-3 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            {error.error}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.slice(0, 6).map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onView={() => onViewRecipe(recipe)}
            onSave={() => onSaveRecipe(recipe)}
            isSaved={storageService.isInRecipeBook(recipe.id)}
          />
        ))}
      </div>

      {recipes.length > 6 && (
        <p className="text-sm text-muted-foreground mt-3 text-center">
          + {recipes.length - 6} more recipes
        </p>
      )}
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
      <div className="relative h-32 overflow-hidden">
        <img
          src={recipe.image || '/placeholder.svg'}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {/* Match Badge */}
        {recipe.matchPercentage !== undefined && (
          <Badge 
            className={cn(
              "absolute top-2 left-2 text-xs",
              recipe.matchPercentage >= 50 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {recipe.matchPercentage}% match
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{recipe.title}</h3>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
          {recipe.readyInMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.readyInMinutes}m
            </span>
          )}
          {recipe.calories > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {Math.round(recipe.calories)}
            </span>
          )}
          {recipe.protein > 0 && (
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-blue-500" />
              {Math.round(recipe.protein)}g
            </span>
          )}
        </div>

        {/* Ingredient Match */}
        <div className="text-xs text-muted-foreground mb-3">
          <span className="text-primary">
            Uses {recipe.usedIngredientCount || 0} groceries
          </span>
          {(recipe.missedIngredientCount || 0) > 0 && (
            <span className="ml-2">
              · Needs {recipe.missedIngredientCount} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onView}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            variant={isSaved ? "secondary" : "fresh"}
            size="sm"
            className="flex-1 text-xs"
            onClick={onSave}
            disabled={isSaved}
          >
            <BookmarkPlus className="w-3 h-3 mr-1" />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
