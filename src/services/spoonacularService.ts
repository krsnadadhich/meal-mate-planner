import { Recipe } from '@/types';

const API_BASE = 'https://api.spoonacular.com';

// Cache for recipe data
const recipeCache = new Map<string, { data: Recipe[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const spoonacularService = {
  getApiKey: (): string | null => {
    return localStorage.getItem('spoonacular-api-key');
  },

  setApiKey: (key: string): void => {
    localStorage.setItem('spoonacular-api-key', key);
  },

  hasApiKey: (): boolean => {
    return !!localStorage.getItem('spoonacular-api-key');
  },

  findRecipesByIngredients: async (ingredients: string[], number = 20): Promise<Recipe[]> => {
    const apiKey = spoonacularService.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const cacheKey = ingredients.sort().join(',');
    const cached = recipeCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${API_BASE}/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${encodeURIComponent(ingredients.join(','))}&number=${number}&ranking=2&ignorePantry=true`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        if (response.status === 402) {
          throw new Error('API quota exceeded');
        }
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      
      const recipes: Recipe[] = data.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title || 'Untitled Recipe',
        image: recipe.image || '/placeholder.svg',
        usedIngredientCount: recipe.usedIngredientCount || 0,
        missedIngredientCount: recipe.missedIngredientCount || 0,
        usedIngredients: (recipe.usedIngredients || []).map((ing: any) => ({
          id: ing.id,
          name: ing.name || 'Unknown',
          amount: ing.amount || 0,
          unit: ing.unit || '',
          image: ing.image,
        })),
        missedIngredients: (recipe.missedIngredients || []).map((ing: any) => ({
          id: ing.id,
          name: ing.name || 'Unknown',
          amount: ing.amount || 0,
          unit: ing.unit || '',
          image: ing.image,
        })),
        matchPercentage: Math.round(
          ((recipe.usedIngredientCount || 0) / 
           ((recipe.usedIngredientCount || 0) + (recipe.missedIngredientCount || 1))) * 100
        ),
      }));

      // Sort by match percentage
      recipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

      recipeCache.set(cacheKey, { data: recipes, timestamp: Date.now() });
      return recipes;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  getRecipeDetails: async (recipeId: number): Promise<Partial<Recipe>> => {
    const apiKey = spoonacularService.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const response = await fetch(
        `${API_BASE}/recipes/${recipeId}/information?apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }

      const data = await response.json();
      
      return {
        instructions: data.instructions || data.summary || 'No instructions available',
        readyInMinutes: data.readyInMinutes,
        servings: data.servings,
      };
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  },
};
