import { supabase } from "@/integrations/supabase/client";

export async function getUserNotifications(userId: string) {
  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
}

export async function getUnreadNotifications(userId: string) {
  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "unread")
    .order("created_at", { ascending: false });
}

export async function getUnreadCount(userId: string) {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "unread");
  return count;
}

export async function markNotificationRead(notificationId: string) {
  return supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string) {
  return supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("user_id", userId)
    .eq("status", "unread");
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: any
) {
  return supabase.rpc("create_notification", {
    _user_id: userId,
    _type: type,
    _title: title,
    _body: body,
    _data: data,
  });
}

export async function deleteNotification(notificationId: string) {
  return supabase.from("notifications").delete().eq("id", notificationId);
}
