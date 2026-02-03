import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Clock, Flame, Dumbbell, Eye, Trash2, 
  ChefHat 
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { Recipe } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RecipeBookPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    const saved = storageService.getRecipeBook();
    setRecipes(saved);
  };

  const handleDelete = (id: string | number) => {
    storageService.removeFromRecipeBook(id);
    loadRecipes();
    toast.success('Recipe removed from book');
  };

  const handleViewRecipe = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`, { state: { recipe } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Recipe Book</h1>
              <p className="text-sm text-muted-foreground">
                {recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="px-6 py-4 space-y-4">
        {recipes.length === 0 ? (
          // Empty State
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No saved recipes</h3>
            <p className="text-muted-foreground mb-4">
              Browse recipes and save your favorites here
            </p>
            <Button onClick={() => navigate('/recipes')}>
              <ChefHat className="w-4 h-4 mr-2" />
              Browse Recipes
            </Button>
          </Card>
        ) : (
          // Recipe Cards
          recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                {/* Thumbnail */}
                {recipe.image && (
                  <div className="w-28 h-28 flex-shrink-0 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">
                      {recipe.cuisine}
                    </Badge>
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {recipe.title}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {recipe.cookingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.cookingTime}m
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {recipe.calories}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" />
                      {recipe.protein}g
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-2 p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove "{recipe.title}" from your recipe book?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(recipe.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
