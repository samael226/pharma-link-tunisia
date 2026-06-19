import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, User, Clock } from "lucide-react";

interface Delivery {
  id: string;
  patient_name: string;
  patient_address: string;
  patient_phone?: string;
  delivery_fee_tnd: number;
  status: string;
  assigned_to?: string;
  created_at: string;
}

interface DeliveryCardProps {
  delivery: Delivery;
  onAssign?: (deliveryId: string) => void;
  onUpdateStatus?: (deliveryId: string, status: string) => void;
}

export function DeliveryCard({ delivery, onAssign, onUpdateStatus }: DeliveryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-muted text-muted-foreground";
      case "assigned":
        return "bg-warning text-warning-foreground";
      case "picked_up":
        return "bg-primary text-primary-foreground";
      case "in_transit":
        return "bg-info text-info-foreground";
      case "delivered":
        return "bg-success text-success-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{delivery.patient_name}</span>
        </div>
        <Badge className={getStatusColor(delivery.status)}>
          {delivery.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{delivery.patient_address}</span>
        </div>
        {delivery.patient_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{delivery.patient_phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(delivery.created_at).toLocaleString()}</span>
        </div>
        {delivery.assigned_to && (
          <div className="text-sm">
            <span className="text-muted-foreground">Driver: </span>
            <span>{delivery.assigned_to}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{delivery.delivery_fee_tnd} TND</span>
        <div className="flex gap-2">
          {delivery.status === "pending" && onAssign && (
            <Button size="sm" onClick={() => onAssign(delivery.id)}>
              Assign Driver
            </Button>
          )}
          {delivery.status === "assigned" && onUpdateStatus && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(delivery.id, "picked_up")}
            >
              Mark Picked Up
            </Button>
          )}
          {delivery.status === "picked_up" && onUpdateStatus && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(delivery.id, "in_transit")}
            >
              Mark In Transit
            </Button>
          )}
          {delivery.status === "in_transit" && onUpdateStatus && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(delivery.id, "delivered")}
            >
              Mark Delivered
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
