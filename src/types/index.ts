export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  createdAt: string;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: Ingredient[];
  missedIngredients: Ingredient[];
  matchPercentage?: number;
  instructions?: string;
  readyInMinutes?: number;
  servings?: number;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  image?: string;
}

export interface MealPlan {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';
