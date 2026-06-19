import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "PharmaLink — Notifications" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data;
    },
    enabled: !!user,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "unread");
      return count;
    },
    enabled: !!user,
  });

  const handleMarkRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("id", notificationId);
    refetch();
  };

  const handleMarkAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("user_id", user?.id);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount && unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} variant="outline">
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 ${
                notification.status === "unread" ? "border-primary" : ""
              }`}
              onClick={() => handleMarkRead(notification.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {notification.status === "unread" && (
                      <Badge className="bg-primary">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No notifications yet</p>
        </Card>
      )}
    </div>
  );
}
