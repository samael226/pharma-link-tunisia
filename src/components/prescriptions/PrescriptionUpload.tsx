import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";

interface PrescriptionUploadProps {
  patientId: string;
  branchId: string;
  onUploadComplete?: (prescriptionId: string) => void;
}

export function PrescriptionUpload({ patientId, branchId, onUploadComplete }: PrescriptionUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, or PDF.");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // This will be implemented with the API functions
      toast.success("Prescription uploaded successfully");
      onUploadComplete?.("prescription-id");
    } catch (error) {
      toast.error("Failed to upload prescription");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Prescription</h3>

      {!file ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your prescription here, or click to browse
          </p>
          <Input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: JPEG, PNG, PDF (max 10MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information..."
              className="mt-1.5"
            />
          </div>

          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload Prescription"}
          </Button>
        </div>
      )}
    </Card>
  );
}
