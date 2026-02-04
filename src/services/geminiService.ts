import { storageService } from './storageService';
import { Recipe, ChatMessage } from '@/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export const geminiService = {
  // Check if Gemini API key is configured
  hasApiKey: (): boolean => {
    return storageService.hasGeminiApiKey();
  },

  // Chat with the AI assistant
  chat: async (
    message: string,
    groceries: string[],
    savedRecipes: Recipe[],
    chatHistory: ChatMessage[]
  ): Promise<string> => {
    const apiKey = storageService.getGeminiApiKey();
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Build context
    const groceryContext = groceries.length > 0 
      ? `User has these groceries: ${groceries.join(', ')}.` 
      : 'User has not added any groceries yet.';
    
    const recipeContext = savedRecipes.length > 0
      ? `User has saved these recipes: ${savedRecipes.map(r => r.title).join(', ')}.`
      : '';

    // Build conversation history (last 5 messages)
    const recentHistory = chatHistory.slice(-5).map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const systemPrompt = `You are a helpful AI food assistant called Meal Mate. You help users with:
- Answering questions about cooking and recipes
- Providing nutritional information
- Suggesting ingredient substitutions
- Giving diet and meal planning tips

${groceryContext}
${recipeContext}

IMPORTANT RULES:
1. DO NOT invent or generate new recipes. If the user asks for recipes, tell them to use the Recipes page which fetches real recipes from the API.
2. You can discuss recipes the user has saved and provide tips about cooking them.
3. For nutritional questions, provide accurate information.
4. Be friendly, concise, and helpful.

Recent conversation:
${recentHistory}`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error('Invalid request. Please check your API key.');
        }
        if (response.status === 403) {
          throw new Error('API key invalid or quota exceeded.');
        }
        throw new Error(errorData.error?.message || 'Failed to get response');
      }

      const data: GeminiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No response received from AI');
      }

      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  },

  // Mock fallback for when API key is not available
  mockChat: async (message: string, groceries: string[]): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('cook') || lowerMessage.includes('make') || lowerMessage.includes('recipe')) {
      if (groceries.length > 0) {
        return `Based on your groceries (${groceries.slice(0, 3).join(', ')}${groceries.length > 3 ? '...' : ''}), I'd suggest checking the Recipes page! It will show you real recipes from our food database that match your ingredients.\n\n*Note: To get AI-powered suggestions, please add your Gemini API key in Settings > API Settings.*`;
      }
      return "I'd love to help you find recipes! Please add some groceries first, then visit the Recipes page to see real recipe suggestions.\n\n*Note: Add your Gemini API key in Settings for enhanced AI features.*";
    }

    if (lowerMessage.includes('calorie') || lowerMessage.includes('protein') || lowerMessage.includes('nutrition')) {
      return "Here are some common nutritional values:\n\n🍗 Chicken breast (100g): 165 cal, 31g protein\n🥚 Egg: 78 cal, 6g protein\n🍚 Rice (1 cup): 206 cal, 4g protein\n🥛 Milk (1 cup): 103 cal, 8g protein\n🥬 Paneer (100g): 265 cal, 18g protein\n\n*Add your Gemini API key for detailed nutrition answers!*";
    }

    if (lowerMessage.includes('substitute') || lowerMessage.includes('replacement') || lowerMessage.includes('instead')) {
      return "Here are some common substitutions:\n\n• Butter → Coconut oil or ghee\n• Cream → Coconut cream\n• Eggs → Flax eggs or banana\n• Rice → Quinoa or cauliflower rice\n• Paneer → Tofu\n\n*Add your Gemini API key for personalized substitution advice!*";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm your AI food assistant. I can help you with cooking tips, nutritional info, and ingredient substitutions.\n\n💡 *Tip: Add your Gemini API key in API Settings for full AI capabilities!*";
    }

    return "I'm here to help with cooking and nutrition! You can ask me about:\n\n• Nutritional information\n• Ingredient substitutions\n• Cooking tips\n\n📌 For recipe suggestions, please use the Recipes page.\n💡 For enhanced AI features, add your Gemini API key in Settings.";
  },
};
