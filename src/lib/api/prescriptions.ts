import { supabase } from "@/integrations/supabase/client";

export async function uploadPrescription(file: File, patientId: string) {
  const fileName = `${patientId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("prescriptions")
    .upload(fileName, file);
  return data;
}

export async function createPrescription(
  patientId: string,
  branchId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  notes?: string
) {
  return supabase
    .from("prescriptions")
    .insert({
      patient_id: patientId,
      branch_id: branchId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      notes,
    })
    .select()
    .single();
}

export async function getPatientPrescriptions(patientId: string) {
  return supabase
    .from("prescriptions")
    .select("*, prescription_items(*)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
}

export async function getBranchPrescriptions(branchId: string, status?: string) {
  let query = supabase
    .from("prescriptions")
    .select("*, profiles!patient_id(full_name), prescription_items(*)")
    .eq("branch_id", branchId);
  if (status) query = query.eq("status", status);
  return query.order("created_at", { ascending: false });
}

export async function getPrescription(prescriptionId: string) {
  return supabase
    .from("prescriptions")
    .select("*, prescription_items(*)")
    .eq("id", prescriptionId)
    .single();
}

export async function reviewPrescription(
  prescriptionId: string,
  status: "approved" | "rejected",
  reason?: string,
  reviewedBy: string
) {
  return supabase
    .from("prescriptions")
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", prescriptionId);
}

export async function addPrescriptionItem(
  prescriptionId: string,
  medicineId: string | null,
  medicineName: string,
  quantity: number,
  dosage?: string,
  instructions?: string
) {
  return supabase.from("prescription_items").insert({
    prescription_id: prescriptionId,
    medicine_id,
    medicine_name,
    quantity,
    dosage,
    instructions,
  });
}

export async function updatePrescriptionItem(
  itemId: string,
  updates: {
    medicine_id?: string | null;
    medicine_name?: string;
    dosage?: string;
    quantity?: number;
    instructions?: string;
  }
) {
  return supabase.from("prescription_items").update(updates).eq("id", itemId);
}

export async function deletePrescriptionItem(itemId: string) {
  return supabase.from("prescription_items").delete().eq("id", itemId);
}

export async function getPrescriptionFileUrl(fileUrl: string) {
  const { data } = await supabase.storage.from("prescriptions").getPublicUrl(fileUrl);
  return data.publicUrl;
}
