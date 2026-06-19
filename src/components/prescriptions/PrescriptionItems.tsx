import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface PrescriptionItem {
  id?: string;
  medicine_id?: string | null;
  medicine_name: string;
  dosage?: string;
  quantity: number;
  instructions?: string;
}

interface PrescriptionItemsProps {
  items: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
}

export function PrescriptionItems({ items, onChange }: PrescriptionItemsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<PrescriptionItem>({
    medicine_name: "",
    quantity: 1,
  });

  const handleAddItem = () => {
    if (!newItem.medicine_name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (newItem.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    onChange([...items, { ...newItem, id: crypto.randomUUID() }]);
    setNewItem({ medicine_name: "", quantity: 1 });
    setShowAddForm(false);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange(updatedItems);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Medicines</h3>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Medicine
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-muted rounded-lg space-y-3">
          <div>
            <Label htmlFor="medicine-name">Medicine Name</Label>
            <Input
              id="medicine-name"
              value={newItem.medicine_name}
              onChange={(e) => setNewItem({ ...newItem, medicine_name: e.target.value })}
              placeholder="Search or enter medicine name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={newItem.dosage || ""}
                onChange={(e) => setNewItem({ ...newItem, dosage: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Input
              id="instructions"
              value={newItem.instructions || ""}
              onChange={(e) => setNewItem({ ...newItem, instructions: e.target.value })}
              placeholder="e.g., Take twice daily with food"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddItem} size="sm">
              Add
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No medicines added yet
          </p>
        ) : (
          items.map((item, index) => (
            <div key={item.id || index} className="flex items-center gap-3 p-3 bg-muted rounded">
              <div className="flex-1 space-y-1">
                <Input
                  value={item.medicine_name}
                  onChange={(e) => handleUpdateItem(index, "medicine_name", e.target.value)}
                  placeholder="Medicine name"
                />
                <div className="flex gap-2">
                  <Input
                    value={item.dosage || ""}
                    onChange={(e) => handleUpdateItem(index, "dosage", e.target.value)}
                    placeholder="Dosage"
                    className="w-24"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                    className="w-20"
                  />
                </div>
                <Input
                  value={item.instructions || ""}
                  onChange={(e) => handleUpdateItem(index, "instructions", e.target.value)}
                  placeholder="Instructions"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
