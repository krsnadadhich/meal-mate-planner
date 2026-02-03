import { NavLink, useLocation } from 'react-router-dom';
import { Home, ChefHat, BookOpen, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/recipes', icon: ChefHat, label: 'Recipes' },
  { to: '/recipe-book', icon: BookOpen, label: 'Book' },
  { to: '/chatbot', icon: Sparkles, label: 'Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const location = useLocation();
  
  // Hide navigation on onboarding pages
  const hideNavPaths = ['/', '/groceries', '/diet-selection', '/cuisine-selection'];
  if (hideNavPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-2 rounded-xl transition-all duration-200',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
