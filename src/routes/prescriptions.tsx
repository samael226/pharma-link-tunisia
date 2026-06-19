import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PrescriptionUpload } from "@/components/prescriptions/PrescriptionUpload";
import { PrescriptionCard } from "@/components/prescriptions/PrescriptionCard";
import { PrescriptionItems } from "@/components/prescriptions/PrescriptionItems";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/prescriptions")({
  head: () => ({ meta: [{ title: "PharmaLink — Prescriptions" }] }),
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // Get user's branches
  const { data: branches } = useQuery({
    queryKey: ["user-branches", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("branches")
        .select("*")
        .order("name");
      return data;
    },
    enabled: !!user,
  });

  // Get prescriptions
  const { data: prescriptions, refetch } = useQuery({
    queryKey: ["prescriptions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("prescriptions")
        .select("*, prescription_items(*)")
        .eq("patient_id", user?.id)
        .order("created_at", { ascending: false });
      return data;
    },
    enabled: !!user,
  });

  const handleUploadComplete = (prescriptionId: string) => {
    setShowUpload(false);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Prescriptions</h1>
        <Button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? "Cancel" : "Upload Prescription"}
        </Button>
      </div>

      {showUpload && branches && branches.length > 0 && (
        <div className="mb-8">
          <PrescriptionUpload
            patientId={user!.id}
            branchId={selectedBranch || branches[0].id}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prescriptions?.map((prescription) => (
          <PrescriptionCard
            key={prescription.id}
            prescription={prescription}
            onView={(id) => console.log("View prescription:", id)}
            onDownload={(id) => console.log("Download prescription:", id)}
          />
        ))}
      </div>

      {prescriptions && prescriptions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No prescriptions yet</p>
        </Card>
      )}
    </div>
  );
}
