import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, XCircle, Clock, Building2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration — PharmaLink" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, roles, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } as never });
  }, [loading, user, navigate]);

  const isAdmin = roles.includes("admin");

  const { data: pharmacies, refetch } = useQuery({
    queryKey: ["admin-pharmacies"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacies")
        .select("id, name, license_number, status, contact_email, contact_phone, created_at, owner_id, branches(id, name, city, governorate, latitude, longitude)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1 w-full max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Administration</h1>
        </div>

        {!isAdmin && (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Accès administrateur requis</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Si vous êtes le premier utilisateur de la plateforme, vous pouvez vous promouvoir comme administrateur initial.
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  disabled={bootstrapping}
                  onClick={async () => {
                    setBootstrapping(true);
                    const { data, error } = await supabase.rpc("bootstrap_first_admin");
                    setBootstrapping(false);
                    if (error) return toast.error(error.message);
                    if (data) {
                      toast.success("Vous êtes maintenant administrateur.");
                      await refreshRoles();
                    } else {
                      toast.error("Un administrateur existe déjà.");
                    }
                  }}
                >
                  {bootstrapping ? "…" : "Devenir administrateur initial"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isAdmin && (
          <>
            <h2 className="text-xl font-semibold mb-3">Pharmacies</h2>
            <div className="space-y-3">
              {pharmacies?.length === 0 && (
                <Card className="p-10 text-center text-muted-foreground">Aucune pharmacie enregistrée.</Card>
              )}
              {pharmacies?.map((p) => {
                type Br = { id: string; name: string; city: string; governorate: string; latitude: number | null; longitude: number | null };
                const branches = (p.branches as Br[] | null) ?? [];
                return (
                  <Card key={p.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0">
                        <Building2 className="h-5 w-5 text-primary mt-1" />
                        <div className="min-w-0">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Licence : {p.license_number} · {p.contact_email ?? "—"} · {p.contact_phone ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {branches.length} succursale{branches.length > 1 ? "s" : ""}
                            {branches.length > 0 && ` · ${branches.map((b) => b.city).join(", ")}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        {p.status !== "approved" && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              const { error } = await supabase.rpc("set_pharmacy_status", { _pharmacy_id: p.id, _status: "approved" });
                              if (error) return toast.error(error.message);
                              toast.success("Pharmacie approuvée");
                              refetch();
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 me-2" />Approuver
                          </Button>
                        )}
                        {p.status !== "suspended" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const { error } = await supabase.rpc("set_pharmacy_status", { _pharmacy_id: p.id, _status: "suspended" });
                              if (error) return toast.error(error.message);
                              toast.success("Pharmacie suspendue");
                              refetch();
                            }}
                          >
                            <XCircle className="h-4 w-4 me-2" />Suspendre
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Retour au tableau de bord</Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3 me-1" />Approuvée</Badge>;
  if (status === "suspended") return <Badge variant="destructive"><XCircle className="h-3 w-3 me-1" />Suspendue</Badge>;
  return <Badge variant="secondary"><Clock className="h-3 w-3 me-1" />En attente</Badge>;
}
