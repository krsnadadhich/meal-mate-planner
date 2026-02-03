import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, ShoppingBasket, Utensils, Sparkles } from 'lucide-react';
import { storageService } from '@/services/storageService';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If onboarding is complete, redirect to home
    if (storageService.isOnboardingComplete()) {
      navigate('/home');
    }
  }, [navigate]);

  const handleStart = () => {
    navigate('/groceries');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center space-y-6 max-w-md">
          {/* Logo/Icon */}
          <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <ChefHat className="w-12 h-12 text-primary-foreground" />
          </div>

          {/* App Name */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Meal Mate Planner
            </h1>
            <p className="text-muted-foreground text-lg">
              Your smart kitchen companion for effortless meal planning
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 pt-6">
            <FeatureCard
              icon={ShoppingBasket}
              title="Track Groceries"
              description="Enter your ingredients once"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI-Powered Recipes"
              description="Get personalized suggestions"
            />
            <FeatureCard
              icon={Utensils}
              title="Easy Meal Planning"
              description="Save and organize your favorites"
            />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pb-safe">
        <Button
          size="xl"
          variant="fresh"
          className="w-full"
          onClick={handleStart}
        >
          Start Planning
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Set up takes less than 2 minutes
        </p>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4 bg-card/50 border-border/50">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
