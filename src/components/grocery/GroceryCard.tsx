import { GroceryItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday, addDays, isBefore } from 'date-fns';

interface GroceryCardProps {
  item: GroceryItem;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
}

export function GroceryCard({ item, onEdit, onDelete }: GroceryCardProps) {
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const isExpired = expiryDate && isPast(expiryDate) && !isToday(expiryDate);
  const isExpiringSoon = expiryDate && isBefore(expiryDate, addDays(new Date(), 3)) && !isExpired;

  return (
    <Card
      className={cn(
        'p-4 flex items-center justify-between gap-4 animate-scale-in',
        'hover:shadow-card transition-all duration-200',
        isExpired && 'border-destructive/50 bg-destructive/5',
        isExpiringSoon && 'border-warm-orange/50 bg-warm-orange/5'
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-primary">
            {item.quantity} {item.unit}
          </span>
          {expiryDate && (
            <span
              className={cn(
                'flex items-center gap-1',
                isExpired && 'text-destructive',
                isExpiringSoon && 'text-warm-orange'
              )}
            >
              <Calendar className="w-3 h-3" />
              {format(expiryDate, 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="text-muted-foreground hover:text-primary"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
