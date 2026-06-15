import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Package, Pill, Plus, Trash2, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/pharmacist")({
  head: () => ({ meta: [{ title: "Console pharmacien — PharmaLink" }] }),
  component: PharmacistConsole,
});

type Branch = { id: string; name: string; city: string; pharmacy_id: string };

function PharmacistConsole() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } as never });
  }, [loading, user, navigate]);

  const { data: branches } = useQuery({
    queryKey: ["my-branches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Branches I own
      const { data: owned } = await supabase
        .from("branches")
        .select("id, name, city, pharmacy_id, pharmacies!inner(owner_id)")
        .eq("pharmacies.owner_id", user!.id);
      // Branches I'm staff at
      const { data: staffed } = await supabase
        .from("branch_staff")
        .select("branch:branches(id, name, city, pharmacy_id)")
        .eq("user_id", user!.id);
      const all: Branch[] = [
        ...((owned ?? []) as unknown as Branch[]),
        ...((staffed ?? []).map((s) => (s as unknown as { branch: Branch }).branch).filter(Boolean)),
      ];
      const unique = Array.from(new Map(all.map((b) => [b.id, b])).values());
      return unique;
    },
  });

  useEffect(() => {
    if (branches && branches.length && !branchId) setBranchId(branches[0].id);
  }, [branches, branchId]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-sm text-muted-foreground">Console pharmacien</div>
            <h1 className="text-3xl md:text-4xl font-bold">Gestion de succursale</h1>
          </div>
          {branches && branches.length > 0 && (
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-[260px]"><SelectValue placeholder="Succursale" /></SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name} · {b.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!branches?.length ? (
          <Card className="p-10 text-center text-muted-foreground">
            Aucune succursale liée à votre compte. Demandez à votre titulaire de vous ajouter en tant que personnel.
          </Card>
        ) : !branchId ? null : (
          <Tabs defaultValue="inventory">
            <TabsList>
              <TabsTrigger value="inventory"><Package className="h-4 w-4 me-2" />Inventaire</TabsTrigger>
              <TabsTrigger value="reservations"><Pill className="h-4 w-4 me-2" />Réservations</TabsTrigger>
              <TabsTrigger value="expiry"><AlertTriangle className="h-4 w-4 me-2" />Expirations</TabsTrigger>
              <TabsTrigger value="transfers"><ArrowLeftRight className="h-4 w-4 me-2" />Transferts</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory" className="mt-6"><InventoryTab branchId={branchId} /></TabsContent>
            <TabsContent value="reservations" className="mt-6"><ReservationsTab branchId={branchId} /></TabsContent>
            <TabsContent value="expiry" className="mt-6"><ExpiryTab branchId={branchId} /></TabsContent>
            <TabsContent value="transfers" className="mt-6"><TransfersShortcut /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function TransfersShortcut() {
  const navigate = useNavigate();
  return (
    <Card className="p-8 text-center">
      <ArrowLeftRight className="h-10 w-10 mx-auto opacity-40" />
      <p className="mt-3 text-sm text-muted-foreground">Demandez ou gérez les transferts inter-pharmacies.</p>
      <Button className="mt-4" onClick={() => navigate({ to: "/transfers" })}>Ouvrir les transferts</Button>
    </Card>
  );
}

function InventoryTab({ branchId }: { branchId: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["branch-inventory", branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id, quantity, price_tnd, low_stock_threshold, batch_number, expiry_date, medicine:medicines(brand_name, generic_name, dosage, form)")
        .eq("branch_id", branchId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!search) return items ?? [];
    const q = search.toLowerCase();
    return (items ?? []).filter((i) => {
      const m = (i as unknown as { medicine?: { brand_name?: string; generic_name?: string } }).medicine;
      return (m?.brand_name ?? "").toLowerCase().includes(q) || (m?.generic_name ?? "").toLowerCase().includes(q);
    });
  }, [items, search]);

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Article retiré");
      qc.invalidateQueries({ queryKey: ["branch-inventory", branchId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="p-6">
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Rechercher dans le stock…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 me-2" />Ajouter</Button></DialogTrigger>
          <AddInventoryDialog branchId={branchId} onDone={() => setOpen(false)} />
        </Dialog>
      </div>
      {!filtered.length ? (
        <div className="text-center py-12 text-muted-foreground">Aucun article. Ajoutez votre premier médicament.</div>
      ) : (
        <ul className="divide-y">
          {filtered.map((i) => {
            const m = (i as unknown as { medicine?: { brand_name?: string; generic_name?: string; dosage?: string; form?: string } }).medicine;
            const low = i.quantity <= i.low_stock_threshold;
            const expSoon = i.expiry_date && new Date(i.expiry_date).getTime() < Date.now() + 30 * 86400000;
            return (
              <li key={i.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{m?.brand_name} <span className="text-xs text-muted-foreground">· {m?.generic_name}</span></div>
                  <div className="text-xs text-muted-foreground">{m?.dosage} {m?.form} · lot {i.batch_number ?? "—"} · exp. {i.expiry_date ?? "—"}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {low && <Badge variant="destructive">Stock bas</Badge>}
                  {expSoon && <Badge variant="secondary">Expire bientôt</Badge>}
                  <div className="text-sm font-semibold w-16 text-end">{i.quantity}</div>
                  <div className="text-sm text-muted-foreground w-20 text-end">{Number(i.price_tnd).toFixed(2)} TND</div>
                  <Button size="icon" variant="ghost" onClick={() => removeItem.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function AddInventoryDialog({ branchId, onDone }: { branchId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [price, setPrice] = useState("");
  const [batch, setBatch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [threshold, setThreshold] = useState("5");

  const { data: meds } = useQuery({
    queryKey: ["med-search", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("medicines")
        .select("id, brand_name, generic_name, dosage, form")
        .or(`brand_name.ilike.%${q}%,generic_name.ilike.%${q}%`)
        .limit(20);
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!medicineId) throw new Error("Sélectionnez un médicament");
      const { error } = await supabase.from("inventory").insert({
        branch_id: branchId,
        medicine_id: medicineId,
        quantity: Number(quantity),
        price_tnd: Number(price || 0),
        batch_number: batch || null,
        expiry_date: expiry || null,
        low_stock_threshold: Number(threshold),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Article ajouté");
      qc.invalidateQueries({ queryKey: ["branch-inventory", branchId] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Ajouter au stock</DialogTitle></DialogHeader>
      <div className="grid gap-3">
        <div>
          <Label>Médicament</Label>
          <Input placeholder="Rechercher (min. 2 lettres)…" value={q} onChange={(e) => { setQ(e.target.value); setMedicineId(""); }} />
          {meds && meds.length > 0 && !medicineId && (
            <div className="border rounded-md mt-1 max-h-40 overflow-auto">
              {meds.map((m) => (
                <button key={m.id} type="button" onClick={() => { setMedicineId(m.id); setQ(`${m.brand_name} — ${m.generic_name}`); }} className="w-full text-start px-3 py-2 hover:bg-muted text-sm">
                  <div className="font-medium">{m.brand_name}</div>
                  <div className="text-xs text-muted-foreground">{m.generic_name} · {m.dosage} {m.form}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Quantité</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
          <div><Label>Prix (TND)</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><Label>Lot</Label><Input value={batch} onChange={(e) => setBatch(e.target.value)} /></div>
          <div><Label>Expiration</Label><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
          <div><Label>Seuil bas</Label><Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => submit.mutate()} disabled={submit.isPending}>Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ReservationsTab({ branchId }: { branchId: string }) {
  const qc = useQueryClient();
  const { data: items } = useQuery({
    queryKey: ["branch-reservations", branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, quantity, status, created_at, expires_at, note, medicine:medicines(brand_name, generic_name)")
        .eq("branch_id", branchId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "confirmed" | "ready" | "fulfilled" | "cancelled" }) => {
      const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation mise à jour");
      qc.invalidateQueries({ queryKey: ["branch-reservations", branchId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="p-6">
      {!items?.length ? (
        <div className="text-center py-12 text-muted-foreground">Aucune réservation pour cette succursale.</div>
      ) : (
        <ul className="divide-y">
          {items.map((r) => {
            const m = (r as unknown as { medicine?: { brand_name?: string; generic_name?: string } }).medicine;
            return (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-medium truncate">{m?.brand_name} <span className="text-xs text-muted-foreground">· qty {r.quantity}</span></div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()} · expire {new Date(r.expires_at).toLocaleString()}</div>
                  {r.note && <div className="text-xs italic text-muted-foreground mt-1">« {r.note} »</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "fulfilled" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
                  {r.status === "pending" && <Button size="sm" onClick={() => update.mutate({ id: r.id, status: "confirmed" })}>Confirmer</Button>}
                  {r.status === "confirmed" && <Button size="sm" onClick={() => update.mutate({ id: r.id, status: "ready" })}>Prêt</Button>}
                  {r.status === "ready" && <Button size="sm" onClick={() => update.mutate({ id: r.id, status: "fulfilled" })}>Servi</Button>}
                  {["pending", "confirmed", "ready"].includes(r.status) && (
                    <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: r.id, status: "cancelled" })}>Annuler</Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function ExpiryTab({ branchId }: { branchId: string }) {
  const { data } = useQuery({
    queryKey: ["expiry-alerts", branchId],
    queryFn: async () => {
      const horizon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("inventory")
        .select("id, quantity, expiry_date, batch_number, medicine:medicines(brand_name, generic_name)")
        .eq("branch_id", branchId)
        .not("expiry_date", "is", null)
        .lte("expiry_date", horizon)
        .order("expiry_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Card className="p-6">
      <div className="text-sm text-muted-foreground mb-4">Articles expirant dans les 90 prochains jours.</div>
      {!data?.length ? (
        <div className="text-center py-12 text-muted-foreground">Aucune alerte d'expiration.</div>
      ) : (
        <ul className="divide-y">
          {data.map((i) => {
            const m = (i as unknown as { medicine?: { brand_name?: string; generic_name?: string } }).medicine;
            const days = Math.ceil((new Date(i.expiry_date!).getTime() - Date.now()) / 86400000);
            return (
              <li key={i.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{m?.brand_name} <span className="text-xs text-muted-foreground">· {m?.generic_name}</span></div>
                  <div className="text-xs text-muted-foreground">Lot {i.batch_number ?? "—"} · expire le {i.expiry_date}</div>
                </div>
                <Badge variant={days < 0 ? "destructive" : days < 30 ? "destructive" : "secondary"}>
                  {days < 0 ? `Expiré il y a ${-days}j` : `${days}j restants`}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
