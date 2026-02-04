import { ApiRecipe, Recipe, RawRecipesByCuisine, RecipeFetchError, CUISINE_API_MAP, DietType } from '@/types';
import { storageService } from './storageService';

const SPOONACULAR_BASE = 'https://api.spoonacular.com';
const RECIPES_PER_CUISINE = 15;

interface SpoonacularSearchResult {
  results: SpoonacularRecipe[];
  totalResults: number;
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

interface SpoonacularRecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    image?: string;
  }>;
  instructions?: string;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export const recipeApiService = {
  // Check if API key is configured
  hasApiKey: (): boolean => {
    return storageService.hasFoodApiKey();
  },

  // Fetch recipes for all selected cuisines
  fetchRecipesByCuisines: async (
    cuisines: string[],
    groceries: string[],
    dietType: DietType
  ): Promise<{
    recipes: RawRecipesByCuisine;
    errors: RecipeFetchError[];
  }> => {
    const apiKey = storageService.getFoodApiKey();
    
    if (!apiKey) {
      return {
        recipes: {},
        errors: cuisines.map(c => ({
          cuisine: c,
          error: 'API key not configured',
          type: 'missing_key' as const,
        })),
      };
    }

    const rawRecipes: RawRecipesByCuisine = {};
    const errors: RecipeFetchError[] = [];

    // Fetch recipes for each cuisine in parallel
    const fetchPromises = cuisines.map(async (cuisine) => {
      try {
        const apiCuisine = CUISINE_API_MAP[cuisine] || cuisine.toLowerCase();
        const dietParam = getDietParam(dietType);
        
        // Build query - use groceries as include ingredients for better matching
        const ingredientQuery = groceries.slice(0, 5).join(',');
        
        let url = `${SPOONACULAR_BASE}/recipes/complexSearch?apiKey=${apiKey}`;
        url += `&number=${RECIPES_PER_CUISINE}`;
        url += `&addRecipeNutrition=true`;
        url += `&fillIngredients=true`;
        
        // Add cuisine if it maps to a valid API cuisine
        if (apiCuisine) {
          url += `&cuisine=${encodeURIComponent(apiCuisine)}`;
        }
        
        // Add diet restriction
        if (dietParam) {
          url += `&diet=${encodeURIComponent(dietParam)}`;
        }
        
        // Add ingredient query for better matching
        if (ingredientQuery) {
          url += `&includeIngredients=${encodeURIComponent(ingredientQuery)}`;
        }
        
        // For special categories, use different params
        if (cuisine === 'High-Protein') {
          url += `&minProtein=25`;
        } else if (cuisine === 'Low-Calorie') {
          url += `&maxCalories=400`;
        } else if (cuisine === 'Quick Meals') {
          url += `&maxReadyTime=30`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 401) {
            errors.push({ cuisine, error: 'Invalid API key', type: 'missing_key' });
            return;
          }
          if (response.status === 402) {
            errors.push({ cuisine, error: 'API quota exceeded', type: 'quota_exceeded' });
            return;
          }
          errors.push({ cuisine, error: `Request failed: ${response.status}`, type: 'network_error' });
          return;
        }

        const data: SpoonacularSearchResult = await response.json();
        
        if (!data.results || data.results.length === 0) {
          errors.push({ cuisine, error: 'No recipes found', type: 'no_results' });
          return;
        }

        // Warn if fewer than expected
        if (data.results.length < 3) {
          errors.push({ 
            cuisine, 
            error: `Only ${data.results.length} recipe(s) found`, 
            type: 'no_results' 
          });
        }

        rawRecipes[cuisine] = data.results.map((r): ApiRecipe => ({
          id: r.id,
          title: r.title,
          image: r.image || '/placeholder.svg',
          cuisine,
          readyInMinutes: r.readyInMinutes,
          servings: r.servings,
          nutrition: extractNutrition(r.nutrition),
        }));

      } catch (error) {
        console.error(`Error fetching ${cuisine} recipes:`, error);
        errors.push({ 
          cuisine, 
          error: error instanceof Error ? error.message : 'Network error', 
          type: 'network_error' 
        });
      }
    });

    await Promise.all(fetchPromises);
    
    // Cache results
    storageService.saveRawRecipesByCuisine(rawRecipes);
    
    return { recipes: rawRecipes, errors };
  },

  // Get detailed recipe information
  getRecipeDetails: async (recipeId: number): Promise<Recipe | null> => {
    const apiKey = storageService.getFoodApiKey();
    if (!apiKey) return null;

    try {
      const url = `${SPOONACULAR_BASE}/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.status}`);
      }

      const data: SpoonacularRecipeDetail = await response.json();
      const groceries = storageService.getGroceryList();
      
      // Separate ingredients into available and missing
      const { available, missing } = categorizeIngredients(
        data.extendedIngredients.map(i => i.name),
        groceries
      );

      // Extract cooking steps
      const steps = extractSteps(data);

      return {
        id: data.id,
        apiRecipeId: String(data.id),
        title: data.title,
        image: data.image,
        cuisine: '', // Will be set by caller
        dietType: 'none',
        ingredients: data.extendedIngredients.map(i => `${i.amount} ${i.unit} ${i.name}`),
        steps,
        calories: extractNutrientValue(data.nutrition, 'Calories'),
        protein: extractNutrientValue(data.nutrition, 'Protein'),
        carbs: extractNutrientValue(data.nutrition, 'Carbohydrates'),
        fats: extractNutrientValue(data.nutrition, 'Fat'),
        cookingTime: data.readyInMinutes,
        readyInMinutes: data.readyInMinutes,
        servings: data.servings,
        usedIngredientCount: available.length,
        missedIngredientCount: missing.length,
        availableIngredients: available,
        missingIngredients: missing,
        sourceApi: 'spoonacular',
        usedIngredients: data.extendedIngredients
          .filter(i => available.some(a => i.name.toLowerCase().includes(a.toLowerCase())))
          .map(i => ({
            id: i.id,
            name: i.name,
            amount: i.amount,
            unit: i.unit,
            image: i.image,
          })),
        missedIngredients: data.extendedIngredients
          .filter(i => missing.some(m => i.name.toLowerCase().includes(m.toLowerCase())))
          .map(i => ({
            id: i.id,
            name: i.name,
            amount: i.amount,
            unit: i.unit,
            image: i.image,
          })),
      };
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  },

  // Convert API recipes to display recipes with ingredient matching
  processRecipesForDisplay: (
    rawRecipes: RawRecipesByCuisine,
    groceries: string[]
  ): Map<string, Recipe[]> => {
    const processed = new Map<string, Recipe[]>();

    Object.entries(rawRecipes).forEach(([cuisine, apiRecipes]) => {
      const recipes = apiRecipes.map((r): Recipe => {
        // Simple ingredient matching based on title (full matching done in details)
        const titleWords = r.title.toLowerCase().split(/\s+/);
        const matchedIngredients = groceries.filter(g => 
          titleWords.some(word => word.includes(g.toLowerCase()) || g.toLowerCase().includes(word))
        );
        
        const matchCount = Math.max(matchedIngredients.length, r.usedIngredientCount || 0);
        const totalIngredients = Math.max(5, matchCount + (r.missedIngredientCount || 3));
        
        return {
          id: r.id,
          apiRecipeId: String(r.id),
          title: r.title,
          image: r.image,
          cuisine,
          dietType: 'none',
          ingredients: [],
          steps: [],
          calories: r.nutrition?.calories || 0,
          protein: r.nutrition?.protein || 0,
          carbs: r.nutrition?.carbs,
          fats: r.nutrition?.fat,
          cookingTime: r.readyInMinutes,
          readyInMinutes: r.readyInMinutes,
          servings: r.servings,
          usedIngredientCount: matchCount,
          missedIngredientCount: totalIngredients - matchCount,
          matchPercentage: Math.round((matchCount / totalIngredients) * 100),
          sourceApi: 'spoonacular',
        };
      });

      // Sort by match percentage
      recipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      
      processed.set(cuisine, recipes);
    });

    return processed;
  },
};

// Helper functions
function getDietParam(dietType: DietType): string {
  switch (dietType) {
    case 'vegetarian': return 'vegetarian';
    case 'vegan': return 'vegan';
    case 'eggetarian': return 'ovo-vegetarian';
    default: return '';
  }
}

function extractNutrition(nutrition?: SpoonacularRecipe['nutrition']) {
  if (!nutrition?.nutrients) return undefined;
  
  return {
    calories: nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0,
    protein: nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0,
    carbs: nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
    fat: nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0,
  };
}

function extractNutrientValue(nutrition: SpoonacularRecipeDetail['nutrition'], name: string): number {
  if (!nutrition?.nutrients) return 0;
  return nutrition.nutrients.find(n => n.name === name)?.amount || 0;
}

function categorizeIngredients(recipeIngredients: string[], userGroceries: string[]) {
  const available: string[] = [];
  const missing: string[] = [];

  recipeIngredients.forEach(ingredient => {
    const ingredientLower = ingredient.toLowerCase();
    const isAvailable = userGroceries.some(grocery => {
      const groceryLower = grocery.toLowerCase();
      return ingredientLower.includes(groceryLower) || groceryLower.includes(ingredientLower);
    });

    if (isAvailable) {
      available.push(ingredient);
    } else {
      missing.push(ingredient);
    }
  });

  return { available, missing };
}

function extractSteps(data: SpoonacularRecipeDetail): string[] {
  // Try analyzed instructions first
  if (data.analyzedInstructions?.[0]?.steps) {
    return data.analyzedInstructions[0].steps.map(s => s.step);
  }
  
  // Fall back to raw instructions
  if (data.instructions) {
    return data.instructions
      .split(/\n|<br>|<\/li>/)
      .map(s => s.replace(/<[^>]*>/g, '').trim())
      .filter(s => s.length > 0);
  }

  return ['Instructions not available. Check the original recipe source.'];
}
