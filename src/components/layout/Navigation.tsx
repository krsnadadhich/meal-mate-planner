import { NavLink } from 'react-router-dom';
import { Home, ShoppingBasket, ChefHat, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/inventory', icon: ShoppingBasket, label: 'Inventory' },
  { to: '/recipes', icon: ChefHat, label: 'Recipes' },
  { to: '/meal-plan', icon: Calendar, label: 'Meal Plan' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-card md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto">
        <div className="flex items-center justify-around md:justify-center md:gap-8 py-2 md:py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200',
                  'hover:bg-primary/10 group',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-2 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'group-hover:bg-primary/10'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
