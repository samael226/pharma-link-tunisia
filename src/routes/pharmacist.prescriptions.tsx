import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PrescriptionReview } from "@/components/prescriptions/PrescriptionReview";
import { Badge } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/pharmacist/prescriptions")({
  head: () => ({ meta: [{ title: "PharmaLink — Pharmacist Prescriptions" }] }),
  component: PharmacistPrescriptionsPage,
});

function PharmacistPrescriptionsPage() {
  const { user, primaryRole } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Get pharmacist's branches
  const { data: branches } = useQuery({
    queryKey: ["pharmacist-branches", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("branch_staff")
        .select("branches(*)")
        .eq("user_id", user?.id);
      return data?.map((s) => s.branches).filter(Boolean);
    },
    enabled: !!user && primaryRole === "pharmacist",
  });

  // Get prescriptions for branch
  const { data: prescriptions, refetch } = useQuery({
    queryKey: ["branch-prescriptions", selectedBranch, statusFilter],
    queryFn: async () => {
      if (!selectedBranch) return [];
      const { data } = await supabase
        .from("prescriptions")
        .select("*, profiles!patient_id(full_name), prescription_items(*)")
        .eq("branch_id", selectedBranch)
        .eq("status", statusFilter)
        .order("created_at", { ascending: false });
      return data;
    },
    enabled: !!selectedBranch,
  });

  const handleApprove = async (prescriptionId: string) => {
    await supabase
      .from("prescriptions")
      .update({
        status: "approved",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", prescriptionId);
    refetch();
  };

  const handleReject = async (prescriptionId: string, reason: string) => {
    await supabase
      .from("prescriptions")
      .update({
        status: "rejected",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", prescriptionId);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prescription Review</h1>

      <div className="mb-6 flex gap-4">
        <select
          value={selectedBranch || ""}
          onChange={(e) => setSelectedBranch(e.target.value || null)}
          className="px-3 py-2 border rounded"
        >
          <option value="">Select Branch</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {prescriptions && prescriptions.length > 0 ? (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <PrescriptionReview
              key={prescription.id}
              prescription={prescription}
              items={prescription.prescription_items || []}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {selectedBranch ? "No prescriptions to review" : "Select a branch to view prescriptions"}
          </p>
        </Card>
      )}
    </div>
  );
}
