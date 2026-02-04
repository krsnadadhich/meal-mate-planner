import { GroceryItem, MealPlan, Recipe, ChatMessage, UserPreferences, DietType, ApiKeys, RawRecipesByCuisine } from '@/types';

const GROCERY_KEY = 'meal-planner-groceries';
const MEAL_PLAN_KEY = 'meal-planner-meals';
const SELECTED_RECIPES_KEY = 'meal-planner-selected-recipes';
const RECIPE_BOOK_KEY = 'meal-planner-recipe-book';
const CHAT_MESSAGES_KEY = 'meal-planner-chat-messages';
const USER_PREFERENCES_KEY = 'meal-planner-user-preferences';
const API_KEYS_KEY = 'meal-planner-api-keys';
const RAW_RECIPES_KEY = 'meal-planner-raw-recipes';

const defaultPreferences: UserPreferences = {
  groceries: [],
  dietType: 'none',
  cuisines: [],
  onboardingComplete: false,
};

const defaultApiKeys: ApiKeys = {
  foodApiKey: null,
  geminiApiKey: null,
};

export const storageService = {
  // API Keys
  getApiKeys: (): ApiKeys => {
    const data = localStorage.getItem(API_KEYS_KEY);
    return data ? { ...defaultApiKeys, ...JSON.parse(data) } : defaultApiKeys;
  },

  saveApiKeys: (keys: Partial<ApiKeys>): void => {
    const current = storageService.getApiKeys();
    localStorage.setItem(API_KEYS_KEY, JSON.stringify({ ...current, ...keys }));
  },

  hasFoodApiKey: (): boolean => {
    const keys = storageService.getApiKeys();
    return !!keys.foodApiKey;
  },

  hasGeminiApiKey: (): boolean => {
    const keys = storageService.getApiKeys();
    return !!keys.geminiApiKey;
  },

  getFoodApiKey: (): string | null => {
    return storageService.getApiKeys().foodApiKey;
  },

  getGeminiApiKey: (): string | null => {
    return storageService.getApiKeys().geminiApiKey;
  },

  // Raw Recipes Cache (by cuisine)
  getRawRecipesByCuisine: (): RawRecipesByCuisine => {
    const data = localStorage.getItem(RAW_RECIPES_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveRawRecipesByCuisine: (recipes: RawRecipesByCuisine): void => {
    localStorage.setItem(RAW_RECIPES_KEY, JSON.stringify(recipes));
  },

  clearRawRecipes: (): void => {
    localStorage.removeItem(RAW_RECIPES_KEY);
  },

  // User Preferences
  getPreferences: (): UserPreferences => {
    const data = localStorage.getItem(USER_PREFERENCES_KEY);
    return data ? { ...defaultPreferences, ...JSON.parse(data) } : defaultPreferences;
  },

  savePreferences: (preferences: Partial<UserPreferences>): void => {
    const current = storageService.getPreferences();
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify({ ...current, ...preferences }));
  },

  getGroceryList: (): string[] => {
    return storageService.getPreferences().groceries;
  },

  saveGroceryList: (groceries: string[]): void => {
    storageService.savePreferences({ groceries });
  },

  getDietType: (): DietType => {
    return storageService.getPreferences().dietType;
  },

  saveDietType: (dietType: DietType): void => {
    storageService.savePreferences({ dietType });
  },

  getCuisines: (): string[] => {
    return storageService.getPreferences().cuisines;
  },

  saveCuisines: (cuisines: string[]): void => {
    storageService.savePreferences({ cuisines });
  },

  setOnboardingComplete: (complete: boolean): void => {
    storageService.savePreferences({ onboardingComplete: complete });
  },

  isOnboardingComplete: (): boolean => {
    return storageService.getPreferences().onboardingComplete;
  },

  // Legacy Grocery Items (with full details)
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

  // Selected Recipes (temporary selection)
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

  removeSelectedRecipe: (id: number | string): void => {
    const recipes = storageService.getSelectedRecipes();
    storageService.saveSelectedRecipes(recipes.filter(r => r.id !== id));
  },

  // Recipe Book (saved recipes)
  getRecipeBook: (): Recipe[] => {
    const data = localStorage.getItem(RECIPE_BOOK_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRecipeBook: (recipes: Recipe[]): void => {
    localStorage.setItem(RECIPE_BOOK_KEY, JSON.stringify(recipes));
  },

  addToRecipeBook: (recipe: Recipe): boolean => {
    const recipes = storageService.getRecipeBook();
    if (recipes.find(r => r.id === recipe.id)) return false;
    recipes.push(recipe);
    storageService.saveRecipeBook(recipes);
    return true;
  },

  removeFromRecipeBook: (id: number | string): void => {
    const recipes = storageService.getRecipeBook();
    storageService.saveRecipeBook(recipes.filter(r => r.id !== id));
  },

  isInRecipeBook: (id: number | string): boolean => {
    const recipes = storageService.getRecipeBook();
    return recipes.some(r => r.id === id);
  },

  clearRecipeBook: (): void => {
    localStorage.setItem(RECIPE_BOOK_KEY, JSON.stringify([]));
  },

  // Chat Messages
  getChatMessages: (): ChatMessage[] => {
    const data = localStorage.getItem(CHAT_MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveChatMessages: (messages: ChatMessage[]): void => {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  },

  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const messages = storageService.getChatMessages();
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    storageService.saveChatMessages(messages);
    return newMessage;
  },

  clearChatMessages: (): void => {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify([]));
  },

  // Deduct ingredients from inventory
  deductIngredients: (recipes: (Recipe | null)[]): void => {
    const groceries = storageService.getGroceries();
    
    recipes.forEach(recipe => {
      if (!recipe || !recipe.usedIngredients) return;
      
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

  // Clear all data
  clearAllData: (): void => {
    localStorage.removeItem(GROCERY_KEY);
    localStorage.removeItem(MEAL_PLAN_KEY);
    localStorage.removeItem(SELECTED_RECIPES_KEY);
    localStorage.removeItem(RECIPE_BOOK_KEY);
    localStorage.removeItem(CHAT_MESSAGES_KEY);
    localStorage.removeItem(USER_PREFERENCES_KEY);
    localStorage.removeItem(API_KEYS_KEY);
    localStorage.removeItem(RAW_RECIPES_KEY);
  },
};
