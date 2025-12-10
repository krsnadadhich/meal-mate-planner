import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GroceryCard } from '@/components/grocery/GroceryCard';
import { AddGroceryDialog } from '@/components/grocery/AddGroceryDialog';
import { storageService } from '@/services/storageService';
import { GroceryItem } from '@/types';
import { Plus, Search, ShoppingBasket } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);

  useEffect(() => {
    setGroceries(storageService.getGroceries());
  }, []);

  const filteredGroceries = groceries.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (data: Omit<GroceryItem, 'id' | 'createdAt'>) => {
    if (editItem) {
      const updated = storageService.updateGrocery(editItem.id, data);
      if (updated) {
        setGroceries((prev) =>
          prev.map((g) => (g.id === editItem.id ? updated : g))
        );
        toast.success('Item updated successfully');
      }
    } else {
      const newItem = storageService.addGrocery(data);
      setGroceries((prev) => [...prev, newItem]);
      toast.success('Item added to inventory');
    }
    setEditItem(null);
  };

  const handleEdit = (item: GroceryItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    storageService.deleteGrocery(id);
    setGroceries((prev) => prev.filter((g) => g.id !== id));
    toast.success('Item removed from inventory');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Grocery Inventory</h1>
            <p className="text-muted-foreground">
              {groceries.length} items in stock
            </p>
          </div>
          <Button
            variant="fresh"
            onClick={() => {
              setEditItem(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search groceries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>

        {/* Grocery List */}
        {filteredGroceries.length > 0 ? (
          <div className="space-y-3">
            {filteredGroceries.map((item, index) => (
              <div
                key={item.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GroceryCard
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBasket className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {searchQuery ? 'No items found' : 'Your inventory is empty'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Start by adding your grocery items'}
            </p>
            {!searchQuery && (
              <Button
                variant="fresh"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        )}

        <AddGroceryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          editItem={editItem}
        />
      </div>
    </Layout>
  );
}
