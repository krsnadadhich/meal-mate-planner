import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MealSlot } from '@/components/meal/MealSlot';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { storageService } from '@/services/storageService';
import { MealPlan, MealType, Recipe } from '@/types';
import { Check, Calendar, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [selectingFor, setSelectingFor] = useState<MealType | null>(null);

  useEffect(() => {
    setMealPlan(storageService.getMealPlan());
    setSelectedRecipes(storageService.getSelectedRecipes());
  }, []);

  const handleAssignMeal = (type: MealType, recipe: Recipe) => {
    const newPlan = { ...mealPlan, [type]: recipe };
    setMealPlan(newPlan);
    storageService.saveMealPlan(newPlan);
    setSelectingFor(null);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} set to ${recipe.title}`);
  };

  const handleRemoveMeal = (type: MealType) => {
    const newPlan = { ...mealPlan, [type]: null };
    setMealPlan(newPlan);
    storageService.saveMealPlan(newPlan);
    toast.info(`${type.charAt(0).toUpperCase() + type.slice(1)} cleared`);
  };

  const handleConfirmPlan = () => {
    const meals = [mealPlan.breakfast, mealPlan.lunch, mealPlan.dinner].filter(Boolean);
    
    if (meals.length === 0) {
      toast.error('Please select at least one meal');
      return;
    }

    // Deduct ingredients
    storageService.deductIngredients(meals);
    
    // Clear the meal plan
    storageService.clearMealPlan();
    setMealPlan({ breakfast: null, lunch: null, dinner: null });

    // Clear selected recipes that were used
    const usedIds = new Set(meals.map((m) => m?.id));
    const remaining = selectedRecipes.filter((r) => !usedIds.has(r.id));
    storageService.saveSelectedRecipes(remaining);
    setSelectedRecipes(remaining);

    toast.success('Meal plan confirmed! Ingredients have been deducted from your inventory.');
  };

  const plannedMeals = [mealPlan.breakfast, mealPlan.lunch, mealPlan.dinner].filter(Boolean).length;

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Meal Plan</h1>
            <p className="text-muted-foreground">
              {plannedMeals}/3 meals planned for today
            </p>
          </div>
        </div>

        {/* Meal Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MealSlot
            type="breakfast"
            recipe={mealPlan.breakfast}
            onRemove={() => handleRemoveMeal('breakfast')}
            onAssign={() => setSelectingFor('breakfast')}
          />
          <MealSlot
            type="lunch"
            recipe={mealPlan.lunch}
            onRemove={() => handleRemoveMeal('lunch')}
            onAssign={() => setSelectingFor('lunch')}
          />
          <MealSlot
            type="dinner"
            recipe={mealPlan.dinner}
            onRemove={() => handleRemoveMeal('dinner')}
            onAssign={() => setSelectingFor('dinner')}
          />
        </div>

        {/* Confirm Button */}
        {plannedMeals > 0 && (
          <Button
            variant="fresh"
            size="lg"
            className="w-full mb-8"
            onClick={handleConfirmPlan}
          >
            <Check className="w-5 h-5 mr-2" />
            Confirm Meal Plan & Deduct Ingredients
          </Button>
        )}

        {/* Selected Recipes */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Your Selected Recipes</h2>
          <p className="text-muted-foreground text-sm">
            Select recipes from the Recipes page to use them in your meal plan
          </p>
        </div>

        {selectedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onViewDetails={() => {}}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <ChefHat className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No recipes selected</h3>
            <p className="text-muted-foreground mb-6">
              Go to the Recipes page and select recipes to add them to your meal plan
            </p>
            <Link to="/recipes">
              <Button variant="soft">
                <ChefHat className="w-4 h-4 mr-2" />
                Browse Recipes
              </Button>
            </Link>
          </Card>
        )}

        {/* Recipe Selection Dialog */}
        <Dialog open={!!selectingFor} onOpenChange={(open) => !open && setSelectingFor(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Choose {selectingFor?.charAt(0).toUpperCase()}{selectingFor?.slice(1)} Recipe
              </DialogTitle>
            </DialogHeader>

            {selectedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {selectedRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="overflow-hidden cursor-pointer hover:shadow-card transition-all"
                    onClick={() => selectingFor && handleAssignMeal(selectingFor, recipe)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold line-clamp-1">{recipe.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {recipe.matchPercentage}% match
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't selected any recipes yet
                </p>
                <Link to="/recipes" onClick={() => setSelectingFor(null)}>
                  <Button variant="soft">Browse Recipes</Button>
                </Link>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
