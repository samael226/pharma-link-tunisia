import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Plus } from "lucide-react";

export const Route = createFileRoute("/transfers")({
  head: () => ({ meta: [{ title: "Transferts inter-pharmacies — PharmaLink" }] }),
  component: TransfersPage,
});

type Branch = { id: string; name: string; city: string };

function TransfersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } as never });
  }, [loading, user, navigate]);

  const { data: myBranches } = useQuery({
    queryKey: ["transfer-my-branches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: owned } = await supabase
        .from("branches")
        .select("id, name, city, pharmacies!inner(owner_id)")
        .eq("pharmacies.owner_id", user!.id);
      const { data: staffed } = await supabase
        .from("branch_staff")
        .select("branch:branches(id, name, city)")
        .eq("user_id", user!.id);
      const all: Branch[] = [
        ...((owned ?? []) as unknown as Branch[]),
        ...((staffed ?? []).map((s) => (s as unknown as { branch: Branch }).branch).filter(Boolean)),
      ];
      return Array.from(new Map(all.map((b) => [b.id, b])).values());
    },
  });

  const myBranchIds = (myBranches ?? []).map((b) => b.id);

  const { data: list } = useQuery({
    queryKey: ["transfers", myBranchIds.join(",")],
    enabled: myBranchIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select("id, quantity, status, note, created_at, from_branch_id, to_branch_id, medicine:medicines(brand_name, generic_name), from_branch:branches!transfers_from_branch_id_fkey(name, city), to_branch:branches!transfers_to_branch_id_fkey(name, city)")
        .or(`from_branch_id.in.(${myBranchIds.join(",")}),to_branch_id.in.(${myBranchIds.join(",")})`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;

  const incoming = (list ?? []).filter((t) => myBranchIds.includes(t.from_branch_id));
  const outgoing = (list ?? []).filter((t) => myBranchIds.includes(t.to_branch_id));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-sm text-muted-foreground">Réseau PharmaLink</div>
            <h1 className="text-3xl md:text-4xl font-bold">Transferts inter-pharmacies</h1>
          </div>
          <NewTransferDialog myBranches={myBranches ?? []} />
        </div>

        {!myBranches?.length ? (
          <Card className="p-10 text-center text-muted-foreground">
            Aucune succursale associée à votre compte.
          </Card>
        ) : (
          <Tabs defaultValue="incoming">
            <TabsList>
              <TabsTrigger value="incoming">Demandes reçues ({incoming.length})</TabsTrigger>
              <TabsTrigger value="outgoing">Mes demandes ({outgoing.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="incoming" className="mt-6"><TransferList items={incoming} side="from" /></TabsContent>
            <TabsContent value="outgoing" className="mt-6"><TransferList items={outgoing} side="to" /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

type TransferRow = {
  id: string;
  quantity: number;
  status: string;
  note: string | null;
  created_at: string;
  from_branch_id: string;
  to_branch_id: string;
};

function TransferList({ items, side }: { items: TransferRow[]; side: "from" | "to" }) {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" | "in_transit" | "completed" | "cancelled" }) => {
      const { error } = await supabase.from("transfers").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transfert mis à jour");
      qc.invalidateQueries({ queryKey: ["transfers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!items.length) return <Card className="p-10 text-center text-muted-foreground"><ArrowLeftRight className="h-10 w-10 mx-auto opacity-40" /><p className="mt-3 text-sm">Aucun transfert.</p></Card>;

  return (
    <Card className="p-6">
      <ul className="divide-y">
        {items.map((t) => {
          const m = (t as unknown as { medicine?: { brand_name?: string; generic_name?: string } }).medicine;
          const from = (t as unknown as { from_branch?: { name?: string; city?: string } }).from_branch;
          const to = (t as unknown as { to_branch?: { name?: string; city?: string } }).to_branch;
          return (
            <li key={t.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium truncate">{m?.brand_name} · qty {t.quantity}</div>
                <div className="text-xs text-muted-foreground">{from?.name} ({from?.city}) → {to?.name} ({to?.city})</div>
                {t.note && <div className="text-xs italic text-muted-foreground mt-1">« {t.note} »</div>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.status === "completed" ? "default" : "secondary"} className="capitalize">{t.status.replace("_", " ")}</Badge>
                {side === "from" && t.status === "requested" && (
                  <>
                    <Button size="sm" onClick={() => update.mutate({ id: t.id, status: "approved" })}>Approuver</Button>
                    <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: t.id, status: "rejected" })}>Refuser</Button>
                  </>
                )}
                {side === "from" && t.status === "approved" && (
                  <Button size="sm" onClick={() => update.mutate({ id: t.id, status: "in_transit" })}>Envoyé</Button>
                )}
                {side === "to" && t.status === "in_transit" && (
                  <Button size="sm" onClick={() => update.mutate({ id: t.id, status: "completed" })}>Reçu</Button>
                )}
                {side === "to" && t.status === "requested" && (
                  <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: t.id, status: "cancelled" })}>Annuler</Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function NewTransferDialog({ myBranches }: { myBranches: Branch[] }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [toBranch, setToBranch] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [medQ, setMedQ] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  const { data: meds } = useQuery({
    queryKey: ["transfer-med-search", medQ],
    enabled: medQ.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("medicines")
        .select("id, brand_name, generic_name")
        .or(`brand_name.ilike.%${medQ}%,generic_name.ilike.%${medQ}%`)
        .limit(15);
      return data ?? [];
    },
  });

  const { data: candidateBranches } = useQuery({
    queryKey: ["candidate-source-branches", medicineId],
    enabled: !!medicineId,
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory")
        .select("quantity, branch:branches(id, name, city)")
        .eq("medicine_id", medicineId)
        .gt("quantity", 0)
        .limit(30);
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!toBranch || !fromBranch || !medicineId) throw new Error("Champs manquants");
      if (toBranch === fromBranch) throw new Error("Branches source et destination identiques");
      const { error } = await supabase.from("transfers").insert({
        from_branch_id: fromBranch,
        to_branch_id: toBranch,
        medicine_id: medicineId,
        quantity: Number(qty),
        note: note || null,
        requested_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Demande de transfert envoyée");
      qc.invalidateQueries({ queryKey: ["transfers"] });
      setOpen(false);
      setMedQ(""); setMedicineId(""); setQty("1"); setNote(""); setFromBranch("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 me-2" />Nouvelle demande</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Demander un transfert</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Ma succursale (destination)</Label>
            <Select value={toBranch} onValueChange={setToBranch}>
              <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
              <SelectContent>{myBranches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name} · {b.city}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Médicament</Label>
            <Input placeholder="Rechercher (min. 2 lettres)…" value={medQ} onChange={(e) => { setMedQ(e.target.value); setMedicineId(""); setFromBranch(""); }} />
            {meds && meds.length > 0 && !medicineId && (
              <div className="border rounded-md mt-1 max-h-32 overflow-auto">
                {meds.map((m) => (
                  <button key={m.id} type="button" onClick={() => { setMedicineId(m.id); setMedQ(`${m.brand_name} — ${m.generic_name}`); }} className="w-full text-start px-3 py-2 hover:bg-muted text-sm">
                    <div className="font-medium">{m.brand_name}</div>
                    <div className="text-xs text-muted-foreground">{m.generic_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {medicineId && (
            <div>
              <Label>Pharmacie source (avec stock)</Label>
              <Select value={fromBranch} onValueChange={setFromBranch}>
                <SelectTrigger><SelectValue placeholder={candidateBranches?.length ? "Choisir une source…" : "Aucune source disponible"} /></SelectTrigger>
                <SelectContent>
                  {(candidateBranches ?? []).map((c, idx) => {
                    const b = (c as unknown as { branch?: Branch }).branch;
                    if (!b) return null;
                    return <SelectItem key={`${b.id}-${idx}`} value={b.id}>{b.name} · {b.city} (stock: {c.quantity})</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>Quantité</Label><Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <div><Label>Note</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motif, urgence, etc." /></div>
        </div>
        <DialogFooter>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending}>Envoyer la demande</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
