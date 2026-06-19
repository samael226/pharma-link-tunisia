import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
          <ScrollArea className="h-64">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No notifications
              </p>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted cursor-pointer ${
                      notification.status === "unread" ? "bg-muted/50" : ""
                    }`}
                    onClick={() => onMarkRead?.(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {notification.status === "unread" && (
                        <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
