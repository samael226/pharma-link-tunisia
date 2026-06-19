import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { DeliveryCard } from "@/components/delivery/DeliveryCard";
import { DeliveryForm } from "@/components/delivery/DeliveryForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "PharmaLink — Delivery" }] }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const { user, primaryRole } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

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

  // Get deliveries for branch
  const { data: deliveries, refetch } = useQuery({
    queryKey: ["branch-deliveries", branches?.[0]?.id, statusFilter],
    queryFn: async () => {
      if (!branches || branches.length === 0) return [];
      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .eq("branch_id", branches[0].id)
        .eq("status", statusFilter)
        .order("created_at", { ascending: false });
      return data;
    },
    enabled: !!branches && branches.length > 0,
  });

  const handleAssign = async (deliveryId: string) => {
    const driverName = prompt("Enter driver name:");
    if (!driverName) return;
    await supabase
      .from("deliveries")
      .update({ assigned_to: driverName, status: "assigned" })
      .eq("id", deliveryId);
    refetch();
  };

  const handleUpdateStatus = async (deliveryId: string, status: string) => {
    const updates: any = { status };
    if (status === "picked_up") updates.picked_up_at = new Date().toISOString();
    if (status === "delivered") updates.delivered_at = new Date().toISOString();
    await supabase.from("deliveries").update(updates).eq("id", deliveryId);
    refetch();
  };

  const handleCreateDelivery = async (data: any) => {
    if (!branches || branches.length === 0) return;
    await supabase.from("deliveries").insert({
      branch_id: branches[0].id,
      patient_name: user?.user_metadata?.full_name || "Patient",
      patient_address: data.patient_address,
      patient_phone: data.patient_phone,
      notes: data.notes,
    });
    setShowForm(false);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Delivery Management</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "New Delivery"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <DeliveryForm
            patientName={user?.user_metadata?.full_name || "Patient"}
            onSubmit={handleCreateDelivery}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deliveries?.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            onAssign={handleAssign}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>

      {deliveries && deliveries.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No deliveries to display</p>
        </Card>
      )}
    </div>
  );
}
