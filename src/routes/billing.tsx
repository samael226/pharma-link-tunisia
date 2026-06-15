import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Abonnements — PharmaLink" }] }),
  component: BillingPage,
});

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "49",
    period: "/mois",
    description: "Pour les pharmacies indépendantes qui rejoignent le réseau.",
    features: ["1 succursale", "Inventaire en temps réel", "Réservations patients", "Support email"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "149",
    period: "/mois",
    description: "Pour les pharmacies multi-sites et collaborations actives.",
    features: ["Jusqu'à 5 succursales", "Transferts inter-pharmacies", "Alertes d'expiration", "Statistiques détaillées", "Support prioritaire"],
    featured: true,
  },
  {
    id: "network",
    name: "Réseau",
    price: "Sur devis",
    period: "",
    description: "Pour les groupements de plus de 5 pharmacies ou les fournisseurs.",
    features: ["Succursales illimitées", "API B2B fournisseurs", "Tableau de bord groupé", "Account manager dédié"],
  },
];

function BillingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1 w-full">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="secondary"><Sparkles className="h-3 w-3 me-1" />Pricing</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mt-3">Choisissez votre formule</h1>
          <p className="text-muted-foreground mt-3">Tarifs en TND, sans engagement. Annulez à tout moment depuis votre tableau de bord.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {PLANS.map((p) => (
            <Card key={p.id} className={`p-6 flex flex-col ${p.featured ? "border-primary ring-2 ring-primary/20" : ""}`}>
              {p.featured && <Badge className="self-start mb-2">Le plus choisi</Badge>}
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="mt-2"><span className="text-4xl font-bold">{p.price}</span><span className="text-muted-foreground"> {p.period}</span></div>
              <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button className="mt-6" variant={p.featured ? "default" : "outline"} onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as never })}>
                {p.id === "network" ? "Nous contacter" : "Commencer l'essai"}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Le paiement sécurisé est traité par notre passerelle. Les prix peuvent varier selon la TVA applicable.
        </p>
      </main>
    </div>
  );
}
