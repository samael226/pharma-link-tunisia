import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/site/Header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, MapPin, Package, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { PharmacyMap, distanceKm, type MapBranch } from "@/components/site/PharmacyMap";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Rechercher un médicament — PharmaLink" }] }),
  component: SearchPage,
});

type MedicineRow = {
  id: string;
  brand_name: string;
  generic_name: string;
  manufacturer: string | null;
  category: string | null;
  dosage: string | null;
};

type InventoryRow = {
  id: string;
  quantity: number;
  price_tnd: number;
  branch: {
    id: string;
    name: string;
    city: string;
    governorate: string;
    address: string;
    is_24_7: boolean;
    latitude: number | null;
    longitude: number | null;
    pharmacy: { name: string } | null;
  } | null;
};

function SearchPage() {
  const { t, dir } = useI18n();
  const { q: initial } = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState(initial ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  const { data: medicines, isLoading } = useQuery({
    queryKey: ["medicines", debouncedQ],
    enabled: debouncedQ.trim().length > 0,
    queryFn: async () => {
      const term = debouncedQ.trim();
      const { data, error } = await supabase
        .from("medicines")
        .select("id, brand_name, generic_name, manufacturer, category, dosage")
        .or(`brand_name.ilike.%${term}%,generic_name.ilike.%${term}%,barcode.ilike.%${term}%`)
        .limit(20);
      if (error) throw error;
      return (data ?? []) as MedicineRow[];
    },
  });

  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const selectedMedicine = useMemo(
    () => medicines?.find((m) => m.id === selectedMedicineId) ?? null,
    [medicines, selectedMedicineId],
  );

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl md:text-4xl font-bold">{t("nav.search")}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search", search: { q } });
          }}
          className="mt-6 max-w-2xl"
        >
          <div className="relative">
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("hero.search.placeholder")} className="ps-11 h-12" />
          </div>
        </form>

        <div className="mt-10 grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <Card className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3 px-2">Résultats</div>
            {debouncedQ.trim() === "" && (
              <div className="px-2 py-8 text-sm text-muted-foreground text-center">Tapez au moins un caractère pour rechercher.</div>
            )}
            {isLoading && <div className="px-2 py-8 text-sm text-muted-foreground">{t("common.loading")}</div>}
            {!isLoading && medicines && medicines.length === 0 && debouncedQ.trim() !== "" && (
              <div className="px-2 py-8 text-sm text-muted-foreground text-center">Aucun médicament trouvé.</div>
            )}
            <ul className="space-y-1">
              {medicines?.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setSelectedMedicineId(m.id)}
                    className={`w-full text-start px-3 py-2.5 rounded-lg transition-colors ${
                      m.id === selectedMedicineId ? "bg-primary-soft" : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium">{m.brand_name}</div>
                    <div className="text-xs text-muted-foreground">{m.generic_name} {m.dosage ? `· ${m.dosage}` : ""}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div>
            {selectedMedicine ? <AvailabilityPanel medicine={selectedMedicine} /> : (
              <Card className="p-10 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto opacity-40" />
                <p className="mt-3 text-sm">Sélectionnez un médicament pour voir sa disponibilité.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function AvailabilityPanel({ medicine }: { medicine: MedicineRow }) {
  const { user } = useAuth();
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["inventory", medicine.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`id, quantity, price_tnd, branch:branches(id, name, city, governorate, address, is_24_7, latitude, longitude, pharmacy:pharmacies(name))`)
        .eq("medicine_id", medicine.id)
        .gt("quantity", 0)
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as InventoryRow[];
    },
  });

  const enriched = useMemo(() => {
    const rows = (data ?? []).filter((r) => r.branch);
    const withDist = rows.map((r) => ({
      ...r,
      distance:
        userPos && r.branch?.latitude != null && r.branch?.longitude != null
          ? distanceKm(userPos, { lat: r.branch.latitude, lng: r.branch.longitude })
          : null,
    }));
    if (userPos) withDist.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    return nearbyOnly && userPos ? withDist.filter((r) => (r.distance ?? Infinity) <= 10) : withDist;
  }, [data, userPos, nearbyOnly]);

  const mapBranches: MapBranch[] = useMemo(
    () =>
      enriched
        .filter((r) => r.branch?.latitude != null && r.branch?.longitude != null)
        .map((r) => ({
          id: r.branch!.id,
          name: r.branch!.name,
          city: r.branch!.city,
          address: r.branch!.address,
          latitude: r.branch!.latitude,
          longitude: r.branch!.longitude,
          pharmacy_name: r.branch!.pharmacy?.name ?? null,
          badge: r.branch!.is_24_7 ? "Ouvert 24/7" : undefined,
        })),
    [enriched],
  );

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Impossible d'obtenir votre position."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const reserve = async (branchId: string) => {
    if (!user) {
      toast.error("Connectez-vous pour réserver.");
      return;
    }
    const { error } = await supabase.from("reservations").insert({
      patient_id: user.id,
      branch_id: branchId,
      medicine_id: medicine.id,
      quantity: 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Réservation envoyée à la pharmacie.");
      refetch();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{medicine.category ?? "Médicament"}</div>
          <h2 className="text-2xl font-bold mt-1">{medicine.brand_name}</h2>
          <div className="text-sm text-muted-foreground">{medicine.generic_name} {medicine.dosage ? `· ${medicine.dosage}` : ""}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={locate}>
            <Navigation className="h-4 w-4 me-1.5" />{userPos ? "Position OK" : "Me localiser"}
          </Button>
          {userPos && (
            <Button variant={nearbyOnly ? "default" : "outline"} size="sm" onClick={() => setNearbyOnly((v) => !v)}>
              ≤ 10 km
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PharmacyMap branches={mapBranches} selectedId={selectedBranchId} onSelect={setSelectedBranchId} height={320} />
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold mb-3">Pharmacies disponibles ({enriched.length})</div>
        {isLoading && <div className="text-sm text-muted-foreground">Recherche…</div>}
        {!isLoading && enriched.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aucun stock disponible. Les pharmacies du réseau seront alertées.
          </div>
        )}
        <ul className="space-y-2">
          {enriched.map((row) => (
            <li
              key={row.id}
              onMouseEnter={() => setSelectedBranchId(row.branch!.id)}
              className={`flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors ${
                selectedBranchId === row.branch?.id ? "border-primary bg-primary-soft/40" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{row.branch?.pharmacy?.name ?? row.branch?.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{row.branch?.address}, {row.branch?.city}</span>
                  {row.branch?.is_24_7 && <Badge variant="secondary" className="ms-1 text-[10px]">24/7</Badge>}
                  {row.distance != null && (
                    <Badge variant="outline" className="ms-1 text-[10px]">{row.distance.toFixed(1)} km</Badge>
                  )}
                </div>
              </div>
              <div className="text-end shrink-0">
                <div className="text-sm font-semibold">{row.price_tnd?.toFixed(3)} TND</div>
                <div className="text-[11px] text-muted-foreground">Stock : {row.quantity}</div>
                <Button size="sm" className="mt-1.5" onClick={() => reserve(row.branch!.id)}>Réserver</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
