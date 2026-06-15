import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Search, Calendar, Building2, Package, Users, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — PharmaLink" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading, primaryRole, roles } = useAuth();
  const { t, dir } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } as never });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1 w-full">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm text-muted-foreground">{t("dash.welcome")}</div>
            <h1 className="text-3xl md:text-4xl font-bold">{user.email}</h1>
          </div>
          <div className="flex gap-2">
            {roles.map((r) => (
              <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="capitalize">{r.replace("_", " ")}</Badge>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {primaryRole === "admin" && <AdminDash />}
          {primaryRole === "pharmacy_owner" && <OwnerDash />}
          {primaryRole === "pharmacist" && <PharmacistDash />}
          {(!primaryRole || primaryRole === "patient" || primaryRole === "supplier") && <PatientDash />}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Pill; label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </Card>
  );
}

function PatientDash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: reservations } = useQuery({
    queryKey: ["my-reservations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, quantity, status, created_at, expires_at, medicine:medicines(brand_name, generic_name), branch:branches(name, city)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Pill} label="Réservations actives" value={reservations?.filter((r) => ["pending", "confirmed", "ready"].includes(r.status)).length ?? 0} />
        <StatCard icon={Calendar} label="Historique total" value={reservations?.length ?? 0} />
        <StatCard icon={Search} label="Médicaments suivis" value={0} />
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">Mes réservations</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/owner/onboarding" })}>
              <Building2 className="h-4 w-4 me-2" />Je suis pharmacien
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/search" })}>
              <Search className="h-4 w-4 me-2" />Nouvelle recherche
            </Button>
          </div>
        </div>
        {!reservations?.length && (
          <div className="text-center py-12 text-muted-foreground">
            <Pill className="h-10 w-10 mx-auto opacity-40" />
            <p className="mt-3 text-sm">Aucune réservation pour le moment.</p>
          </div>
        )}
        <ul className="divide-y">
          {reservations?.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {(r as unknown as { medicine?: { brand_name?: string } }).medicine?.brand_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(r as unknown as { branch?: { name?: string; city?: string } }).branch?.name} · {(r as unknown as { branch?: { city?: string } }).branch?.city} · qty {r.quantity}
                </div>
              </div>
              <Badge variant={r.status === "fulfilled" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function PharmacistDash() {
  const navigate = useNavigate();
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Package} label="Console" value="Stock & files" />
        <StatCard icon={Pill} label="Réservations" value="Inbox" />
        <StatCard icon={Building2} label="Transferts" value="Inter-pharma" />
        <StatCard icon={Calendar} label="Expirations" value="90j" />
      </div>
      <Card className="mt-8 p-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold">Console pharmacien</div>
          <div className="text-sm text-muted-foreground">Gérez l'inventaire, les réservations entrantes et les alertes d'expiration.</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/transfers" })}>Transferts</Button>
          <Button onClick={() => navigate({ to: "/pharmacist" })}>Ouvrir la console</Button>
        </div>
      </Card>
    </>
  );
}

function OwnerDash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["owner-overview", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: pharmacy } = await supabase
        .from("pharmacies")
        .select("id, name, status")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (!pharmacy) return { pharmacy: null, branches: 0 };
      const { count } = await supabase
        .from("branches")
        .select("id", { count: "exact", head: true })
        .eq("pharmacy_id", pharmacy.id);
      return { pharmacy, branches: count ?? 0 };
    },
  });

  const status = data?.pharmacy?.status as ("pending" | "approved" | "suspended" | undefined);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Building2} label="Succursales" value={data?.branches ?? 0} />
        <StatCard icon={Users} label="Employés" value={0} />
        <StatCard icon={Package} label="Stock total" value={0} />
        <StatCard icon={Pill} label="Statut" value={status ?? "—"} />
      </div>
      <Card className="mt-8 p-6">
        {!data?.pharmacy ? (
          <div className="text-center py-6">
            <Building2 className="h-10 w-10 mx-auto opacity-40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enregistrez votre pharmacie pour rejoindre le réseau PharmaLink.
            </p>
            <Button className="mt-4" onClick={() => navigate({ to: "/owner/onboarding" })}>
              Devenir partenaire
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-semibold">{data.pharmacy.name}</div>
              <div className="text-sm text-muted-foreground">
                {status === "approved"
                  ? "Pharmacie active sur le réseau."
                  : status === "pending"
                    ? "En attente de validation par l'administration."
                    : "Compte suspendu."}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate({ to: "/pharmacist" })}>Console</Button>
              <Button variant="outline" onClick={() => navigate({ to: "/transfers" })}>Transferts</Button>
              <Button onClick={() => navigate({ to: "/owner/onboarding" })}>Gérer</Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

function AdminDash() {
  const navigate = useNavigate();
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [pharmacies, medicines, branches, pending] = await Promise.all([
        supabase.from("pharmacies").select("id", { count: "exact", head: true }),
        supabase.from("medicines").select("id", { count: "exact", head: true }),
        supabase.from("branches").select("id", { count: "exact", head: true }),
        supabase.from("pharmacies").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        pharmacies: pharmacies.count ?? 0,
        medicines: medicines.count ?? 0,
        branches: branches.count ?? 0,
        pending: pending.count ?? 0,
      };
    },
  });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Building2} label="Pharmacies" value={stats.data?.pharmacies ?? "…"} />
        <StatCard icon={Building2} label="Succursales" value={stats.data?.branches ?? "…"} />
        <StatCard icon={Pill} label="Médicaments" value={stats.data?.medicines ?? "…"} />
        <StatCard icon={ShieldCheck} label="En attente" value={stats.data?.pending ?? "…"} />
      </div>
      <Card className="mt-8 p-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold">Validation des pharmacies</div>
          <div className="text-sm text-muted-foreground">
            Approuvez les nouvelles inscriptions et gérez les comptes existants.
          </div>
        </div>
        <Button onClick={() => navigate({ to: "/admin" })}>
          <ShieldCheck className="h-4 w-4 me-2" />Console admin
        </Button>
      </Card>
    </>
  );
}
