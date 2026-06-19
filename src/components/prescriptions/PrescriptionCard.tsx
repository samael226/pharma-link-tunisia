import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileImage, FileText, Eye, Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

interface PrescriptionCardProps {
  prescription: Prescription;
  onView?: (prescriptionId: string) => void;
  onDownload?: (prescriptionId: string) => void;
}

export function PrescriptionCard({ prescription, onView, onDownload }: PrescriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "under_review":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-muted text-muted-foreground";
      case "expired":
        return "bg-muted text-muted-foreground";
      case "fulfilled":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isImage = prescription.file_type === "image/jpeg" || prescription.file_type === "image/png";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isImage ? (
            <FileImage className="h-5 w-5 text-muted-foreground" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium">{prescription.file_name}</span>
        </div>
        <Badge className={getStatusColor(prescription.status)}>
          {prescription.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground mb-3">
        <p>Uploaded: {new Date(prescription.created_at).toLocaleDateString()}</p>
        {prescription.expires_at && (
          <p>Expires: {new Date(prescription.expires_at).toLocaleDateString()}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onView?.(prescription.id)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDownload?.(prescription.id)}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </Card>
  );
}
