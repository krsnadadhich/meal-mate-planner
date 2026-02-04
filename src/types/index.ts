export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  createdAt: string;
}

export interface Recipe {
  id: number | string;
  title: string;
  image?: string;
  cuisine: string;
  dietType: DietType;
  ingredients: string[];
  steps: string[];
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  cookingTime?: number;
  servings?: number;
  tips?: string[];
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  usedIngredients?: Ingredient[];
  missedIngredients?: Ingredient[];
  matchPercentage?: number;
  instructions?: string;
  readyInMinutes?: number;
  // New fields for API integration
  apiRecipeId?: string;
  availableIngredients?: string[];
  missingIngredients?: string[];
  sourceApi?: 'spoonacular' | 'mock';
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

export type DietType = 'vegetarian' | 'vegan' | 'eggetarian' | 'non-vegetarian' | 'none';

export const DIET_OPTIONS: { value: DietType; label: string; description: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'eggetarian', label: 'Eggetarian', description: 'Vegetarian + eggs' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', description: 'All foods allowed' },
  { value: 'none', label: 'No Restrictions', description: 'Eat everything' },
];

export const CUISINE_OPTIONS = [
  'Indian',
  'Chinese', 
  'Italian',
  'Mexican',
  'Thai',
  'Korean',
  'Japanese',
  'Mediterranean',
  'Middle Eastern',
  'Continental',
  'South Indian',
  'North Indian',
  'Indo-Chinese',
  'Street Food',
  'High-Protein',
  'Low-Calorie',
  'Quick Meals',
];

// Map user-friendly cuisine names to Spoonacular API cuisine names
export const CUISINE_API_MAP: Record<string, string> = {
  'Indian': 'indian',
  'Chinese': 'chinese',
  'Italian': 'italian',
  'Mexican': 'mexican',
  'Thai': 'thai',
  'Korean': 'korean',
  'Japanese': 'japanese',
  'Mediterranean': 'mediterranean',
  'Middle Eastern': 'middle eastern',
  'Continental': 'european',
  'South Indian': 'indian',
  'North Indian': 'indian',
  'Indo-Chinese': 'chinese',
  'Street Food': 'indian',
  'High-Protein': '',
  'Low-Calorie': '',
  'Quick Meals': '',
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserPreferences {
  groceries: string[];
  dietType: DietType;
  cuisines: string[];
  onboardingComplete: boolean;
}

export interface ApiKeys {
  foodApiKey: string | null;
  geminiApiKey: string | null;
}

export interface RawRecipesByCuisine {
  [cuisine: string]: ApiRecipe[];
}

export interface ApiRecipe {
  id: number;
  title: string;
  image: string;
  cuisine: string;
  readyInMinutes?: number;
  servings?: number;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  usedIngredients?: Ingredient[];
  missedIngredients?: Ingredient[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface RecipeFetchError {
  cuisine: string;
  error: string;
  type: 'missing_key' | 'quota_exceeded' | 'no_results' | 'network_error';
}
