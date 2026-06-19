import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface InvoiceListProps {
  invoices: Invoice[];
  onDownload?: (invoiceId: string) => void;
  onPay?: (invoiceId: string) => void;
}

export function InvoiceList({ invoices, onDownload, onPay }: InvoiceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Invoices</h3>
      
      {invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoices yet</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.amount_tnd} TND</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {invoice.pdf_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload?.(invoice.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.status === "pending" && onPay && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPay(invoice.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
