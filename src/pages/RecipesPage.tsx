import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { RecipeDetailDialog } from '@/components/recipe/RecipeDetailDialog';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { storageService } from '@/services/storageService';
import { spoonacularService } from '@/services/spoonacularService';
import { Recipe } from '@/types';
import { ChefHat, Key, Loader2, RefreshCw, ShoppingBasket, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [groceryCount, setGroceryCount] = useState(0);

  useEffect(() => {
    setHasApiKey(spoonacularService.hasApiKey());
    setSelectedRecipes(storageService.getSelectedRecipes());
    setGroceryCount(storageService.getGroceries().length);
  }, []);

  const fetchRecipes = async () => {
    const groceries = storageService.getGroceries();
    if (groceries.length === 0) {
      toast.error('Add some groceries first to find matching recipes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ingredients = groceries.map((g) => g.name);
      const fetchedRecipes = await spoonacularService.findRecipesByIngredients(ingredients, 20);
      setRecipes(fetchedRecipes);
      
      if (fetchedRecipes.length === 0) {
        toast.info('No recipes found for your ingredients');
      } else {
        toast.success(`Found ${fetchedRecipes.length} recipes!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recipes';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySave = (key: string) => {
    spoonacularService.setApiKey(key);
    setHasApiKey(true);
    toast.success('API key saved successfully');
  };

  const toggleRecipeSelection = (recipe: Recipe) => {
    const isSelected = selectedRecipes.some((r) => r.id === recipe.id);
    
    if (isSelected) {
      storageService.removeSelectedRecipe(recipe.id);
      setSelectedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      toast.info('Recipe removed from selection');
    } else {
      storageService.addSelectedRecipe(recipe);
      setSelectedRecipes((prev) => [...prev, recipe]);
      toast.success('Recipe added to selection');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Recipe Suggestions</h1>
            <p className="text-muted-foreground">
              {selectedRecipes.length} recipes selected
            </p>
          </div>
          {hasApiKey && (
            <Button variant="ghost" size="icon" onClick={() => setApiKeyDialogOpen(true)}>
              <Key className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* No API Key State */}
        {!hasApiKey && (
          <Card className="p-8 text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">API Key Required</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To search for recipes based on your ingredients, you'll need a free Spoonacular API key.
            </p>
            <Button variant="fresh" onClick={() => setApiKeyDialogOpen(true)}>
              <Key className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </Card>
        )}

        {/* No Groceries State */}
        {hasApiKey && groceryCount === 0 && (
          <Card className="p-8 text-center mb-6 border-warm-orange/50 bg-warm-orange/5">
            <div className="w-16 h-16 mx-auto rounded-full bg-warm-orange/20 flex items-center justify-center mb-4">
              <ShoppingBasket className="w-8 h-8 text-warm-orange" />
            </div>
            <h3 className="font-bold text-xl mb-2">No Groceries Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add some groceries to your inventory first, then we can suggest recipes that match your ingredients.
            </p>
            <Link to="/inventory">
              <Button variant="warm">
                <ShoppingBasket className="w-4 h-4 mr-2" />
                Go to Inventory
              </Button>
            </Link>
          </Card>
        )}

        {/* Search Button */}
        {hasApiKey && groceryCount > 0 && (
          <Button
            variant="fresh"
            className="w-full mb-6"
            onClick={fetchRecipes}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding recipes...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Find Recipes Based on My Groceries
              </>
            )}
          </Button>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-4 mb-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">{error}</p>
                {error.includes('API key') && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-destructive"
                    onClick={() => setApiKeyDialogOpen(true)}
                  >
                    Update API Key
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Recipe Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RecipeCard
                  recipe={recipe}
                  isSelected={selectedRecipes.some((r) => r.id === recipe.id)}
                  onSelect={toggleRecipeSelection}
                  onViewDetails={setDetailRecipe}
                />
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          hasApiKey &&
          groceryCount > 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <ChefHat className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No recipes loaded yet</h3>
              <p className="text-muted-foreground">
                Click the button above to find recipes based on your groceries
              </p>
            </div>
          )
        )}

        <ApiKeyDialog
          open={apiKeyDialogOpen}
          onOpenChange={setApiKeyDialogOpen}
          onSave={handleApiKeySave}
        />

        <RecipeDetailDialog
          recipe={detailRecipe}
          open={!!detailRecipe}
          onOpenChange={(open) => !open && setDetailRecipe(null)}
          isSelected={detailRecipe ? selectedRecipes.some((r) => r.id === detailRecipe.id) : false}
          onSelect={toggleRecipeSelection}
        />
      </div>
    </Layout>
  );
}
