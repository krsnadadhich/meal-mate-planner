import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storageService } from '@/services/storageService';
import { spoonacularService } from '@/services/spoonacularService';
import { ShoppingBasket, ChefHat, Calendar, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index() {
  const [groceryCount, setGroceryCount] = useState(0);
  const [mealPlan, setMealPlan] = useState({ breakfast: null, lunch: null, dinner: null });
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setGroceryCount(storageService.getGroceries().length);
    setMealPlan(storageService.getMealPlan());
    setHasApiKey(spoonacularService.hasApiKey());
  }, []);

  const plannedMeals = [mealPlan.breakfast, mealPlan.lunch, mealPlan.dinner].filter(Boolean).length;

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-8 md:py-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-slide-up">
              <Sparkles className="w-4 h-4" />
              Smart meal planning made easy
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-slide-up stagger-1">
              <span className="text-gradient-fresh">Meal Planner</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-slide-up stagger-2">
              Track your groceries, discover recipes that match your ingredients, and plan your meals effortlessly.
            </p>
          </div>

          {/* API Key Warning */}
          {!hasApiKey && (
            <Card className="p-4 mb-8 border-warm-orange/50 bg-warm-orange/5 animate-slide-up stagger-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warm-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">API Key Required</p>
                  <p className="text-sm text-muted-foreground">
                    To search recipes, you'll need a Spoonacular API key. Head to the Recipes page to set it up.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card className="p-6 hover:shadow-card transition-all duration-300 animate-slide-up stagger-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-fresh flex items-center justify-center shadow-soft">
                  <ShoppingBasket className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{groceryCount}</p>
                  <p className="text-sm text-muted-foreground">Items in inventory</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all duration-300 animate-slide-up stagger-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center shadow-soft">
                  <ChefHat className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{hasApiKey ? '∞' : '0'}</p>
                  <p className="text-sm text-muted-foreground">Recipes available</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all duration-300 animate-slide-up stagger-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{plannedMeals}/3</p>
                  <p className="text-sm text-muted-foreground">Meals planned today</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/inventory" className="block">
              <Card className="p-6 hover:shadow-card transition-all duration-300 group cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-fresh flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                      <ShoppingBasket className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Manage Inventory</h3>
                      <p className="text-sm text-muted-foreground">Add and track your groceries</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>

            <Link to="/recipes" className="block">
              <Card className="p-6 hover:shadow-card transition-all duration-300 group cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                      <ChefHat className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Find Recipes</h3>
                      <p className="text-sm text-muted-foreground">Discover meals with your ingredients</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
