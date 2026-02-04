import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Clock, Flame, Dumbbell, Users, 
  BookmarkPlus, Check, Lightbulb, ShoppingBasket, AlertCircle
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { recipeApiService } from '@/services/recipeApiService';
import { Recipe } from '@/types';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function RecipeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(location.state?.recipe || null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRecipeDetails = async () => {
      if (!recipe && id) {
        // Try to find recipe in recipe book first
        const savedRecipes = storageService.getRecipeBook();
        const found = savedRecipes.find(r => String(r.id) === id);
        if (found) {
          setRecipe(found);
          return;
        }
      }

      // If we have a recipe from state but missing details, fetch full details
      if (recipe && recipe.sourceApi === 'spoonacular' && (!recipe.steps || recipe.steps.length === 0)) {
        setLoading(true);
        try {
          const details = await recipeApiService.getRecipeDetails(Number(recipe.id));
          if (details) {
            setRecipe({ ...recipe, ...details, cuisine: recipe.cuisine });
          }
        } catch (error) {
          console.error('Error fetching recipe details:', error);
        } finally {
          setLoading(false);
        }
      }
      
      if (recipe) {
        setIsSaved(storageService.isInRecipeBook(recipe.id));
      }
    };

    loadRecipeDetails();
  }, [recipe?.id, id]);

  const handleSave = () => {
    if (!recipe) return;
    const added = storageService.addToRecipeBook(recipe);
    if (added) {
      setIsSaved(true);
      toast.success('Recipe saved to your book!');
    } else {
      toast.info('Recipe already in your book');
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Recipe not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="mb-2">{recipe.cuisine}</Badge>
          <h1 className="text-2xl font-bold text-foreground">{recipe.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {(recipe.cookingTime || recipe.readyInMinutes) && (
            <StatCard
              icon={Clock}
              value={`${recipe.cookingTime || recipe.readyInMinutes}`}
              label="min"
            />
          )}
          <StatCard
            icon={Flame}
            value={`${Math.round(recipe.calories || 0)}`}
            label="cal"
            iconColor="text-orange-500"
          />
          <StatCard
            icon={Dumbbell}
            value={`${Math.round(recipe.protein || 0)}g`}
            label="protein"
            iconColor="text-blue-500"
          />
          {recipe.servings && (
            <StatCard
              icon={Users}
              value={`${recipe.servings}`}
              label="servings"
            />
          )}
        </div>

        {/* Ingredient Matching */}
        {(recipe.availableIngredients || recipe.missingIngredients) && (
          <div className="grid grid-cols-2 gap-4">
            {/* Available Ingredients */}
            {recipe.availableIngredients && recipe.availableIngredients.length > 0 && (
              <Card className="p-4 border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-sm text-green-700 dark:text-green-400">
                    You Have ({recipe.availableIngredients.length})
                  </h3>
                </div>
                <ul className="space-y-1 text-sm">
                  {recipe.availableIngredients.slice(0, 5).map((ing, i) => (
                    <li key={i} className="text-muted-foreground truncate">• {ing}</li>
                  ))}
                  {recipe.availableIngredients.length > 5 && (
                    <li className="text-muted-foreground text-xs">
                      +{recipe.availableIngredients.length - 5} more
                    </li>
                  )}
                </ul>
              </Card>
            )}

            {/* Missing Ingredients */}
            {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
              <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBasket className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                    Need ({recipe.missingIngredients.length})
                  </h3>
                </div>
                <ul className="space-y-1 text-sm">
                  {recipe.missingIngredients.slice(0, 5).map((ing, i) => (
                    <li key={i} className="text-muted-foreground truncate">• {ing}</li>
                  ))}
                  {recipe.missingIngredients.length > 5 && (
                    <li className="text-muted-foreground text-xs">
                      +{recipe.missingIngredients.length - 5} more
                    </li>
                  )}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Nutrition */}
        {(recipe.carbs || recipe.fats) && (
          <Card className="p-4">
            <h2 className="font-semibold mb-3">Nutrition Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {recipe.carbs && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carbs</span>
                  <span className="font-medium">{Math.round(recipe.carbs)}g</span>
                </div>
              )}
              {recipe.fats && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fats</span>
                  <span className="font-medium">{Math.round(recipe.fats)}g</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Ingredients */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3">All Ingredients</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : recipe.ingredients.length > 0 ? (
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Ingredient details loading...
            </p>
          )}
        </Card>

        {/* Steps */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Instructions</h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : recipe.steps.length > 0 ? (
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Instructions will be loaded when you open the recipe.
            </p>
          )}
        </Card>

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Cooking Tips</h2>
            </div>
            <ul className="space-y-2">
              {recipe.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* API Source Badge */}
        {recipe.sourceApi && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Recipe from {recipe.sourceApi === 'spoonacular' ? 'Spoonacular API' : 'Meal Mate'}
            </Badge>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
        <Button
          size="lg"
          variant={isSaved ? "secondary" : "fresh"}
          className="w-full"
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Saved to Recipe Book
            </>
          ) : (
            <>
              <BookmarkPlus className="w-5 h-5 mr-2" />
              Save to Recipe Book
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  iconColor?: string;
}

function StatCard({ icon: Icon, value, label, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="p-3 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${iconColor}`} />
      <div className="font-semibold text-sm">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}
