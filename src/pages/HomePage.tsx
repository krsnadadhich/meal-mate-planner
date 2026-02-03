import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, ShoppingBasket, BookOpen, Sparkles, 
  ArrowRight, Plus, Clock
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { Recipe } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [groceryCount, setGroceryCount] = useState(0);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const prefs = storageService.getPreferences();
    setGroceryCount(prefs.groceries.length);
    setRecentRecipes(storageService.getRecipeBook().slice(0, 3));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Meal Mate
            </h1>
            <p className="text-sm text-muted-foreground">
              Your smart kitchen companion
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={ShoppingBasket}
            label="Groceries"
            value={`${groceryCount} items`}
            onClick={() => navigate('/groceries')}
            color="bg-green-500"
          />
          <QuickActionCard
            icon={ChefHat}
            label="Get Recipes"
            value="AI powered"
            onClick={() => navigate('/recipes')}
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Start Planning CTA */}
        {groceryCount === 0 && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Start Planning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your groceries to get personalized recipe suggestions
                </p>
                <Button
                  variant="fresh"
                  size="sm"
                  onClick={() => navigate('/groceries')}
                >
                  Add Groceries
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* AI Assistant Card */}
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/chatbot')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Food Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Ask anything about cooking & nutrition
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Recent Recipes */}
        {recentRecipes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Recent Recipes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/recipe-book')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}
                >
                  <div className="flex items-center gap-3">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-14 h-14 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {recipe.cuisine}
                        </Badge>
                        {recipe.cookingTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recipe.cookingTime}m
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <h2 className="font-semibold text-lg mb-3">What You Can Do</h2>
          <div className="space-y-3">
            <FeatureCard
              icon={ShoppingBasket}
              title="Track Groceries"
              description="Add ingredients you have at home"
            />
            <FeatureCard
              icon={ChefHat}
              title="Get Recipes"
              description="AI suggests meals based on your groceries"
            />
            <FeatureCard
              icon={BookOpen}
              title="Save Favorites"
              description="Build your personal recipe book"
            />
            <FeatureCard
              icon={Sparkles}
              title="Ask AI"
              description="Get cooking tips and nutrition info"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onClick: () => void;
  color: string;
}

function QuickActionCard({ icon: Icon, label, value, onClick, color }: QuickActionCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold">{label}</h3>
      <p className="text-sm text-muted-foreground">{value}</p>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
