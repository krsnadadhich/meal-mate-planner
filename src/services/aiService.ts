import { Recipe, DietType } from '@/types';

// Mock AI service - replace with actual Gemini API integration
export const aiService = {
  // Generate recipe suggestions based on groceries, diet, and cuisines
  generateRecipes: async (
    groceries: string[],
    dietType: DietType,
    cuisines: string[]
  ): Promise<Recipe[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock recipes based on inputs
    const mockRecipes: Recipe[] = [
      {
        id: crypto.randomUUID(),
        title: 'Paneer Butter Masala',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
        cuisine: 'North Indian',
        dietType: 'vegetarian',
        ingredients: ['paneer', 'tomatoes', 'butter', 'cream', 'spices', 'onion', 'garlic', 'ginger'],
        steps: [
          'Cube the paneer and lightly fry until golden.',
          'Blend tomatoes, onion, and cashews to make a smooth paste.',
          'Heat butter and sauté the paste with spices.',
          'Add cream and simmer for 10 minutes.',
          'Add paneer cubes and cook for 5 more minutes.',
          'Garnish with fresh cream and coriander.'
        ],
        calories: 450,
        protein: 18,
        carbs: 25,
        fats: 32,
        cookingTime: 35,
        servings: 4,
        tips: ['Use fresh paneer for best results', 'Add kasuri methi for authentic flavor']
      },
      {
        id: crypto.randomUUID(),
        title: 'Vegetable Fried Rice',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        cuisine: 'Indo-Chinese',
        dietType: 'vegetarian',
        ingredients: ['rice', 'mixed vegetables', 'soy sauce', 'garlic', 'spring onions', 'oil'],
        steps: [
          'Cook rice and let it cool completely.',
          'Heat oil in a wok on high heat.',
          'Add garlic and vegetables, stir-fry for 2 minutes.',
          'Add rice and toss well.',
          'Add soy sauce and seasonings.',
          'Garnish with spring onions.'
        ],
        calories: 320,
        protein: 8,
        carbs: 52,
        fats: 10,
        cookingTime: 20,
        servings: 3,
        tips: ['Use day-old rice for best texture', 'High heat is key for wok hei']
      },
      {
        id: crypto.randomUUID(),
        title: 'Chicken Tikka',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
        cuisine: 'North Indian',
        dietType: 'non-vegetarian',
        ingredients: ['chicken', 'yogurt', 'spices', 'lemon', 'ginger', 'garlic'],
        steps: [
          'Cut chicken into bite-sized pieces.',
          'Marinate with yogurt, spices, and lemon juice.',
          'Refrigerate for at least 2 hours.',
          'Skewer the chicken pieces.',
          'Grill or bake until charred and cooked through.',
          'Serve with mint chutney.'
        ],
        calories: 280,
        protein: 32,
        carbs: 8,
        fats: 14,
        cookingTime: 30,
        servings: 4,
        tips: ['Marinate overnight for best flavor', 'Use a tandoor or very hot oven']
      },
      {
        id: crypto.randomUUID(),
        title: 'Masala Dosa',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400',
        cuisine: 'South Indian',
        dietType: 'vegetarian',
        ingredients: ['dosa batter', 'potatoes', 'onions', 'mustard seeds', 'curry leaves', 'turmeric'],
        steps: [
          'Boil and mash potatoes.',
          'Heat oil, add mustard seeds and curry leaves.',
          'Add onions and sauté until golden.',
          'Add turmeric and mashed potatoes.',
          'Spread dosa batter on hot pan and crisp it.',
          'Add potato filling and fold.'
        ],
        calories: 350,
        protein: 10,
        carbs: 58,
        fats: 12,
        cookingTime: 25,
        servings: 2,
        tips: ['Fermented batter makes crispy dosas', 'Serve with sambar and chutney']
      },
      {
        id: crypto.randomUUID(),
        title: 'Thai Green Curry',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
        cuisine: 'Thai',
        dietType: 'vegetarian',
        ingredients: ['green curry paste', 'coconut milk', 'tofu', 'vegetables', 'basil', 'lime'],
        steps: [
          'Heat coconut cream in a pan.',
          'Add green curry paste and fry until fragrant.',
          'Add vegetables and tofu.',
          'Pour in coconut milk and simmer.',
          'Season with fish sauce or soy sauce.',
          'Garnish with Thai basil and lime.'
        ],
        calories: 380,
        protein: 14,
        carbs: 22,
        fats: 28,
        cookingTime: 25,
        servings: 4,
        tips: ['Use fresh curry paste if available', 'Add vegetables based on cooking time']
      },
      {
        id: crypto.randomUUID(),
        title: 'Mediterranean Quinoa Bowl',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        cuisine: 'Mediterranean',
        dietType: 'vegan',
        ingredients: ['quinoa', 'chickpeas', 'cucumber', 'tomatoes', 'olives', 'olive oil', 'lemon'],
        steps: [
          'Cook quinoa according to package instructions.',
          'Chop vegetables into bite-sized pieces.',
          'Drain and rinse chickpeas.',
          'Combine all ingredients in a bowl.',
          'Dress with olive oil and lemon juice.',
          'Season with herbs and salt.'
        ],
        calories: 420,
        protein: 16,
        carbs: 55,
        fats: 18,
        cookingTime: 20,
        servings: 2,
        tips: ['Add feta for extra protein', 'Use kalamata olives for authentic flavor']
      }
    ];

    // Filter based on diet type
    let filtered = mockRecipes;
    if (dietType !== 'none') {
      filtered = mockRecipes.filter(r => {
        if (dietType === 'vegetarian') return r.dietType === 'vegetarian' || r.dietType === 'vegan';
        if (dietType === 'vegan') return r.dietType === 'vegan';
        if (dietType === 'eggetarian') return r.dietType !== 'non-vegetarian';
        return true;
      });
    }

    // Filter based on cuisines if any selected
    if (cuisines.length > 0) {
      filtered = filtered.filter(r => 
        cuisines.some(c => r.cuisine.toLowerCase().includes(c.toLowerCase()))
      );
    }

    // If no matches, return some defaults
    if (filtered.length === 0) {
      filtered = mockRecipes.slice(0, 3);
    }

    return filtered;
  },

  // Chat with AI assistant
  chat: async (message: string, groceries: string[]): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    // Mock responses based on message content
    if (lowerMessage.includes('cook') || lowerMessage.includes('make') || lowerMessage.includes('recipe')) {
      if (groceries.length > 0) {
        return `Based on your groceries (${groceries.slice(0, 3).join(', ')}${groceries.length > 3 ? '...' : ''}), I'd suggest making a simple stir-fry or a curry! Would you like me to suggest specific recipes?`;
      }
      return "I'd love to help you cook something! Please add some groceries first so I can suggest recipes based on what you have.";
    }

    if (lowerMessage.includes('calorie') || lowerMessage.includes('protein') || lowerMessage.includes('nutrition')) {
      return "Here are some common nutritional values:\n\n🍗 Chicken breast (100g): 165 cal, 31g protein\n🥚 Egg: 78 cal, 6g protein\n🍚 Rice (1 cup): 206 cal, 4g protein\n🥛 Milk (1 cup): 103 cal, 8g protein\n🥬 Paneer (100g): 265 cal, 18g protein\n\nWould you like info on any specific food?";
    }

    if (lowerMessage.includes('substitute') || lowerMessage.includes('replacement') || lowerMessage.includes('instead')) {
      return "Here are some common substitutions:\n\n• Butter → Coconut oil or ghee\n• Cream → Coconut cream\n• Eggs → Flax eggs or banana\n• Rice → Quinoa or cauliflower rice\n• Paneer → Tofu\n• Chicken → Jackfruit or soy chunks\n\nWhat ingredient do you need to substitute?";
    }

    if (lowerMessage.includes('diet') || lowerMessage.includes('weight') || lowerMessage.includes('healthy')) {
      return "Here are some healthy eating tips:\n\n1. 🥗 Fill half your plate with vegetables\n2. 💧 Stay hydrated - drink 8 glasses of water\n3. 🍳 Include protein in every meal\n4. 🍎 Choose whole grains over refined\n5. ⏰ Don't skip breakfast\n\nWould you like diet-specific meal suggestions?";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm your AI food assistant. I can help you with:\n\n• Recipe suggestions based on your groceries\n• Nutritional information\n• Ingredient substitutions\n• Diet and meal planning tips\n\nWhat would you like to know?";
    }

    return "I'm here to help with cooking and nutrition! You can ask me about:\n\n• What to cook with your groceries\n• Calories and protein in foods\n• Ingredient substitutions\n• Healthy eating tips\n\nWhat would you like to know?";
  },
};
