import { supabase } from "@/integrations/supabase/client";

export async function getBranchDeliveries(branchId: string, status?: string) {
  let query = supabase
    .from("deliveries")
    .select("*")
    .eq("branch_id", branchId);
  if (status) query = query.eq("status", status);
  return query.order("created_at", { ascending: false });
}

export async function getPatientDeliveries(patientId: string) {
  return supabase
    .from("deliveries")
    .select("*")
    .or(`reservation_id.patient_id.eq.${patientId},prescription_id.patient_id.eq.${patientId}`)
    .order("created_at", { ascending: false });
}

export async function getDelivery(deliveryId: string) {
  return supabase.from("deliveries").select("*").eq("id", deliveryId).single();
}

export async function createDelivery(
  branchId: string,
  patientName: string,
  patientAddress: string,
  patientPhone?: string,
  notes?: string,
  reservationId?: string,
  prescriptionId?: string
) {
  return supabase
    .from("deliveries")
    .insert({
      branch_id: branchId,
      patient_name: patientName,
      patient_address: patientAddress,
      patient_phone: patientPhone,
      notes,
      reservation_id: reservationId,
      prescription_id: prescriptionId,
    })
    .select()
    .single();
}

export async function assignDelivery(deliveryId: string, driverName: string) {
  return supabase
    .from("deliveries")
    .update({ assigned_to: driverName, status: "assigned" })
    .eq("id", deliveryId);
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: string,
  pickedUpAt?: string,
  deliveredAt?: string
) {
  const updates: any = { status };
  if (pickedUpAt) updates.picked_up_at = pickedUpAt;
  if (deliveredAt) updates.delivered_at = deliveredAt;
  return supabase.from("deliveries").update(updates).eq("id", deliveryId);
}

export async function cancelDelivery(deliveryId: string, reason?: string) {
  return supabase
    .from("deliveries")
    .update({ status: "cancelled", notes: reason })
    .eq("id", deliveryId);
}
