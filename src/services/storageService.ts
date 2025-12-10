import { GroceryItem, MealPlan, Recipe } from '@/types';

const GROCERY_KEY = 'meal-planner-groceries';
const MEAL_PLAN_KEY = 'meal-planner-meals';
const SELECTED_RECIPES_KEY = 'meal-planner-selected-recipes';

export const storageService = {
  // Grocery Items
  getGroceries: (): GroceryItem[] => {
    const data = localStorage.getItem(GROCERY_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveGroceries: (items: GroceryItem[]): void => {
    localStorage.setItem(GROCERY_KEY, JSON.stringify(items));
  },

  addGrocery: (item: Omit<GroceryItem, 'id' | 'createdAt'>): GroceryItem => {
    const groceries = storageService.getGroceries();
    const newItem: GroceryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    groceries.push(newItem);
    storageService.saveGroceries(groceries);
    return newItem;
  },

  updateGrocery: (id: string, updates: Partial<GroceryItem>): GroceryItem | null => {
    const groceries = storageService.getGroceries();
    const index = groceries.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    groceries[index] = { ...groceries[index], ...updates };
    storageService.saveGroceries(groceries);
    return groceries[index];
  },

  deleteGrocery: (id: string): boolean => {
    const groceries = storageService.getGroceries();
    const filtered = groceries.filter(g => g.id !== id);
    if (filtered.length === groceries.length) return false;
    
    storageService.saveGroceries(filtered);
    return true;
  },

  // Meal Plan
  getMealPlan: (): MealPlan => {
    const data = localStorage.getItem(MEAL_PLAN_KEY);
    return data ? JSON.parse(data) : { breakfast: null, lunch: null, dinner: null };
  },

  saveMealPlan: (plan: MealPlan): void => {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
  },

  clearMealPlan: (): void => {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify({ breakfast: null, lunch: null, dinner: null }));
  },

  // Selected Recipes
  getSelectedRecipes: (): Recipe[] => {
    const data = localStorage.getItem(SELECTED_RECIPES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSelectedRecipes: (recipes: Recipe[]): void => {
    localStorage.setItem(SELECTED_RECIPES_KEY, JSON.stringify(recipes));
  },

  addSelectedRecipe: (recipe: Recipe): void => {
    const recipes = storageService.getSelectedRecipes();
    if (!recipes.find(r => r.id === recipe.id)) {
      recipes.push(recipe);
      storageService.saveSelectedRecipes(recipes);
    }
  },

  removeSelectedRecipe: (id: number): void => {
    const recipes = storageService.getSelectedRecipes();
    storageService.saveSelectedRecipes(recipes.filter(r => r.id !== id));
  },

  // Deduct ingredients from inventory
  deductIngredients: (recipes: (Recipe | null)[]): void => {
    const groceries = storageService.getGroceries();
    
    recipes.forEach(recipe => {
      if (!recipe) return;
      
      recipe.usedIngredients.forEach(ingredient => {
        const groceryIndex = groceries.findIndex(g => 
          g.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
          ingredient.name.toLowerCase().includes(g.name.toLowerCase())
        );
        
        if (groceryIndex !== -1) {
          groceries[groceryIndex].quantity = Math.max(0, groceries[groceryIndex].quantity - 1);
          if (groceries[groceryIndex].quantity === 0) {
            groceries.splice(groceryIndex, 1);
          }
        }
      });
    });
    
    storageService.saveGroceries(groceries);
  },
};
