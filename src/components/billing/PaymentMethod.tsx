import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Lock, Building2 } from "lucide-react";
import { useState } from "react";

interface PaymentMethodProps {
  onSave?: (paymentMethod: any) => void;
  onCancel?: () => void;
}

export function PaymentMethod({ onSave, onCancel }: PaymentMethodProps) {
  const [paymentType, setPaymentType] = useState<"flouci" | "bank_transfer">("flouci");

  return (
    <Card className="p-6 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Payment Method</h3>
      </div>

      <div className="space-y-6">
        <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as "flouci" | "bank_transfer")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="flouci" id="flouci" />
            <Label htmlFor="flouci" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              <span>Flouci (Card Payment)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-4 w-4" />
              <span>Bank Transfer</span>
            </Label>
          </div>
        </RadioGroup>

        {paymentType === "flouci" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secured by Flouci - Tunisian Payment Gateway</span>
            </div>
            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-2">Supported Cards:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Visa</li>
                <li>Mastercard</li>
                <li>D17 Card</li>
                <li>CIB Card</li>
              </ul>
            </div>
            <Button type="button" className="w-full" onClick={() => onSave?.({ type: "flouci" })}>
              Continue with Flouci
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
              <p className="font-semibold">Bank Transfer Details:</p>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">Bank:</span> Banque de Tunisie</p>
                <p><span className="font-medium">Account Name:</span> PharmaLink Tunisia</p>
                <p><span className="font-medium">Account Number:</span> 12345678901234567890</p>
                <p><span className="font-medium">RIB:</span> 00000000000000000000</p>
                <p><span className="font-medium">SWIFT Code:</span> BKTNTNTT</p>
              </div>
              <p className="text-xs mt-2">Please include your invoice number in the transfer reference</p>
            </div>
            <Button type="button" className="w-full" onClick={() => onSave?.({ type: "bank_transfer" })}>
              Confirm Bank Transfer
            </Button>
          </div>
        )}

        {onCancel && (
          <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
