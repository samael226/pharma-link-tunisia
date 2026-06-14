import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPicker } from "@/components/site/MapPicker";
import { toast } from "sonner";
import { Building2, MapPin, Plus, Trash2, CheckCircle2, Clock, XCircle, LocateFixed } from "lucide-react";

export const Route = createFileRoute("/owner/onboarding")({
  head: () => ({ meta: [{ title: "Devenir partenaire — PharmaLink" }] }),
  component: OnboardingPage,
});

type Pharmacy = {
  id: string;
  name: string;
  license_number: string;
  status: "pending" | "approved" | "suspended";
  contact_email: string | null;
  contact_phone: string | null;
};

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  governorate: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  is_24_7: boolean;
  is_emergency: boolean;
};

function OnboardingPage() {
  const { user, loading, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } as never });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ph } = await supabase
        .from("pharmacies")
        .select("id, name, license_number, status, contact_email, contact_phone")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (ph) {
        setPharmacy(ph as Pharmacy);
        const { data: br } = await supabase
          .from("branches")
          .select("id, name, address, city, governorate, latitude, longitude, phone, is_24_7, is_emergency")
          .eq("pharmacy_id", ph.id)
          .order("created_at", { ascending: true });
        setBranches((br ?? []) as Branch[]);
      }
      setLoaded(true);
    })();
  }, [user]);

  if (loading || !user || !loaded) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1 w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Rejoindre PharmaLink</h1>
          <p className="text-muted-foreground mt-2">
            Enregistrez votre pharmacie en quelques minutes. Notre équipe vérifie votre licence avant activation.
          </p>
        </div>

        {/* Step 1 */}
        <StepHeader n={1} title="Informations de la pharmacie" done={!!pharmacy} />
        {!pharmacy ? (
          <PharmacyForm
            ownerId={user.id}
            onCreated={async (p) => {
              setPharmacy(p);
              await refreshRoles();
              toast.success("Pharmacie enregistrée. Statut : en attente de validation.");
            }}
          />
        ) : (
          <PharmacyCard pharmacy={pharmacy} />
        )}

        {/* Step 2 */}
        {pharmacy && (
          <>
            <StepHeader n={2} title="Succursales" done={branches.length > 0} />
            <BranchList
              pharmacyId={pharmacy.id}
              branches={branches}
              onChange={setBranches}
            />
          </>
        )}

        {/* Step 3 */}
        {pharmacy && branches.length > 0 && (
          <>
            <StepHeader
              n={3}
              title="Validation"
              done={pharmacy.status === "approved"}
            />
            <Card className="p-6">
              {pharmacy.status === "pending" && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium">En attente d'approbation</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Un administrateur va vérifier votre licence. Vous recevrez un email dès l'activation.
                    </p>
                    <Link to="/dashboard" className="inline-block mt-3">
                      <Button variant="outline" size="sm">Retour au tableau de bord</Button>
                    </Link>
                  </div>
                </div>
              )}
              {pharmacy.status === "approved" && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Pharmacie approuvée</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votre pharmacie est visible publiquement. Gérez votre inventaire depuis le tableau de bord.
                    </p>
                    <Link to="/dashboard" className="inline-block mt-3">
                      <Button size="sm">Aller au tableau de bord</Button>
                    </Link>
                  </div>
                </div>
              )}
              {pharmacy.status === "suspended" && (
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <div className="font-medium">Suspendue</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contactez le support pour réactiver votre compte.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function StepHeader({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${done ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function PharmacyForm({ ownerId, onCreated }: { ownerId: string; onCreated: (p: Pharmacy) => void }) {
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="p-6">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name || !license) return;
          setBusy(true);
          const { data, error } = await supabase
            .from("pharmacies")
            .insert({ owner_id: ownerId, name, license_number: license, contact_email: email || null, contact_phone: phone || null })
            .select("id, name, license_number, status, contact_email, contact_phone")
            .single();
          setBusy(false);
          if (error) {
            toast.error(error.message);
            return;
          }
          onCreated(data as Pharmacy);
        }}
      >
        <div className="md:col-span-2">
          <Label htmlFor="ph-name">Nom commercial *</Label>
          <Input id="ph-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Pharmacie El Manar" />
        </div>
        <div>
          <Label htmlFor="ph-lic">Numéro de licence *</Label>
          <Input id="ph-lic" value={license} onChange={(e) => setLicense(e.target.value)} required placeholder="TN-PHARM-2024-XXXX" />
        </div>
        <div>
          <Label htmlFor="ph-phone">Téléphone</Label>
          <Input id="ph-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 71 000 000" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ph-email">Email de contact</Label>
          <Input id="ph-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@pharmacie.tn" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer la pharmacie"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-primary mt-1" />
          <div>
            <div className="font-semibold">{pharmacy.name}</div>
            <div className="text-sm text-muted-foreground">Licence : {pharmacy.license_number}</div>
            <div className="text-sm text-muted-foreground">{pharmacy.contact_email ?? "—"} · {pharmacy.contact_phone ?? "—"}</div>
          </div>
        </div>
        <StatusBadge status={pharmacy.status} />
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Pharmacy["status"] }) {
  if (status === "approved") return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approuvée</Badge>;
  if (status === "suspended") return <Badge variant="destructive">Suspendue</Badge>;
  return <Badge variant="secondary">En attente</Badge>;
}

function BranchList({ pharmacyId, branches, onChange }: { pharmacyId: string; branches: Branch[]; onChange: (b: Branch[]) => void }) {
  const [adding, setAdding] = useState(branches.length === 0);

  return (
    <div className="space-y-3">
      {branches.map((b) => (
        <Card key={b.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{b.name}</div>
                <div className="text-sm text-muted-foreground truncate">{b.address}, {b.city} · {b.governorate}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {b.latitude && b.longitude ? `${b.latitude.toFixed(4)}, ${b.longitude.toFixed(4)}` : "Coordonnées manquantes"}
                  {b.is_24_7 && " · 24/7"}
                  {b.is_emergency && " · Garde"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!confirm("Supprimer cette succursale ?")) return;
                const { error } = await supabase.from("branches").delete().eq("id", b.id);
                if (error) return toast.error(error.message);
                onChange(branches.filter((x) => x.id !== b.id));
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}

      {adding ? (
        <BranchForm
          pharmacyId={pharmacyId}
          onCancel={() => setAdding(false)}
          onCreated={(b) => {
            onChange([...branches, b]);
            setAdding(false);
          }}
        />
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 me-2" />Ajouter une succursale
        </Button>
      )}
    </div>
  );
}

function BranchForm({ pharmacyId, onCreated, onCancel }: { pharmacyId: string; onCreated: (b: Branch) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [governorate, setGovernorate] = useState("Tunis");
  const [phone, setPhone] = useState("");
  const [is24, setIs24] = useState(false);
  const [isEm, setIsEm] = useState(false);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Card className="p-6">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!pos) return toast.error("Cliquez sur la carte pour placer la succursale.");
          setBusy(true);
          const { data, error } = await supabase
            .from("branches")
            .insert({
              pharmacy_id: pharmacyId,
              name,
              address,
              city,
              governorate,
              phone: phone || null,
              is_24_7: is24,
              is_emergency: isEm,
              latitude: pos.lat,
              longitude: pos.lng,
            })
            .select("id, name, address, city, governorate, latitude, longitude, phone, is_24_7, is_emergency")
            .single();
          setBusy(false);
          if (error) return toast.error(error.message);
          onCreated(data as Branch);
        }}
      >
        <div>
          <Label htmlFor="b-name">Nom *</Label>
          <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Succursale Centre-Ville" />
        </div>
        <div>
          <Label htmlFor="b-phone">Téléphone</Label>
          <Input id="b-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 71 000 000" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="b-addr">Adresse *</Label>
          <Input id="b-addr" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Avenue Habib Bourguiba" />
        </div>
        <div>
          <Label htmlFor="b-city">Ville *</Label>
          <Input id="b-city" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Tunis" />
        </div>
        <div>
          <Label htmlFor="b-gov">Gouvernorat *</Label>
          <Input id="b-gov" value={governorate} onChange={(e) => setGovernorate(e.target.value)} required />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={is24} onChange={(e) => setIs24(e.target.checked)} />
            Ouverte 24/7
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isEm} onChange={(e) => setIsEm(e.target.checked)} />
            Pharmacie de garde
          </label>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <Label>Position sur la carte * <span className="text-xs text-muted-foreground">— cliquez pour placer</span></Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.geolocation?.getCurrentPosition(
                  (g) => setPos({ lat: g.coords.latitude, lng: g.coords.longitude }),
                  () => toast.error("Géolocalisation refusée"),
                );
              }}
            >
              <LocateFixed className="h-4 w-4 me-2" />Ma position
            </Button>
          </div>
          <MapPicker value={pos} onChange={setPos} />
          {pos && (
            <div className="text-xs text-muted-foreground mt-2">
              {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
            </div>
          )}
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Enregistrement…" : "Ajouter cette succursale"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
