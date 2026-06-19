import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];
type PrescriptionItem = Database["public"]["Tables"]["prescription_items"]["Row"];

interface PrescriptionReviewProps {
  prescription: Prescription;
  items: PrescriptionItem[];
  onApprove?: (prescriptionId: string) => void;
  onReject?: (prescriptionId: string, reason: string) => void;
}

export function PrescriptionReview({ prescription, items, onApprove, onReject }: PrescriptionReviewProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isImage = prescription.file_type === "image/jpeg" || prescription.file_type === "image/png";

  const handleApprove = () => {
    onApprove?.(prescription.id);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    onReject?.(prescription.id, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Prescription Review</h3>
          <p className="text-sm text-muted-foreground">
            Uploaded: {new Date(prescription.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge>{prescription.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="mb-4">
        {isImage ? (
          <img src={prescription.file_url} alt="Prescription" className="w-full h-96 object-cover rounded-lg" />
        ) : (
          <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">PDF Document</span>
          </div>
        )}
      </div>

      {prescription.notes && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Patient Notes:</p>
          <p className="text-sm">{prescription.notes}</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Medicines</h4>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="font-medium">{item.medicine_name}</p>
                  {item.dosage && <p className="text-sm text-muted-foreground">Dosage: {item.dosage}</p>}
                  {item.instructions && (
                    <p className="text-sm text-muted-foreground">Instructions: {item.instructions}</p>
                  )}
                </div>
                <Badge variant="outline">Qty: {item.quantity}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleApprove} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
        {!showRejectForm ? (
          <Button variant="destructive" onClick={() => setShowRejectForm(true)} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        ) : (
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleReject} variant="destructive" size="sm">
                Confirm Rejection
              </Button>
              <Button onClick={() => setShowRejectForm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
