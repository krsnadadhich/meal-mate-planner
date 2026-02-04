import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";

// Pages
import OnboardingPage from "./pages/OnboardingPage";
import GroceryInputPage from "./pages/GroceryInputPage";
import DietSelectionPage from "./pages/DietSelectionPage";
import CuisineSelectionPage from "./pages/CuisineSelectionPage";
import HomePage from "./pages/HomePage";
import RecipeSuggestionsPage from "./pages/RecipeSuggestionsPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import RecipeBookPage from "./pages/RecipeBookPage";
import ChatbotPage from "./pages/ChatbotPage";
import SettingsPage from "./pages/SettingsPage";
import ApiSettingsPage from "./pages/ApiSettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Onboarding Flow */}
            <Route path="/" element={<OnboardingPage />} />
            <Route path="/groceries" element={<GroceryInputPage />} />
            <Route path="/diet-selection" element={<DietSelectionPage />} />
            <Route path="/cuisine-selection" element={<CuisineSelectionPage />} />
            
            {/* Main App */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/recipes" element={<RecipeSuggestionsPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/recipe-book" element={<RecipeBookPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/api-settings" element={<ApiSettingsPage />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Navigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
