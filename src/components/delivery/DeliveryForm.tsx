import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryFormProps {
  patientName: string;
  onSubmit?: (data: {
    patient_address: string;
    patient_phone: string;
    notes?: string;
  }) => void;
  onCancel?: () => void;
}

export function DeliveryForm({ patientName, onSubmit, onCancel }: DeliveryFormProps) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ patient_address: address, patient_phone: phone, notes });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Create Delivery</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="patient-name">Patient Name</Label>
          <Input id="patient-name" value={patientName} disabled className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="address">Delivery Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter delivery address"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+216 XX XXX XXX"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions..."
            className="mt-1.5"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Create Delivery
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
