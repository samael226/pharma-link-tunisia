import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Search, MapPin, Package, Bell, ArrowRightLeft, Sparkles, Check, Pill, Stethoscope, Building2, Truck, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaLink Tunisia — Trouvez vos médicaments en temps réel" },
      { name: "description", content: "Réseau national des pharmacies tunisiennes. Recherchez, localisez et réservez vos médicaments en quelques secondes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh -z-10" />
        <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 me-1.5" />
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/search", search: { q } as never });
              }}
              className="mt-10 mx-auto max-w-xl"
            >
              <div className="relative flex items-center bg-card rounded-2xl shadow-glow border p-1.5">
                <Search className="absolute start-4 h-5 w-5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("hero.search.placeholder")}
                  className="border-0 bg-transparent ps-11 h-12 focus-visible:ring-0 shadow-none"
                />
                <Button size="lg" type="submit" className="rounded-xl h-11">
                  {t("hero.cta.primary")}
                </Button>
              </div>
            </form>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as never })}>
                <Stethoscope className="h-4 w-4 me-2" />
                {t("hero.cta.secondary")}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { v: "2 400+", k: "stats.pharmacies" },
              { v: "18 000+", k: "stats.medicines" },
              { v: "24", k: "stats.cities" },
              { v: "99.9%", k: "stats.uptime" },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{t(s.k as never)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">{t("feat.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("feat.subtitle")}</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { Icon: Search, t: "feat.search.title", d: "feat.search.desc" },
            { Icon: Package, t: "feat.live.title", d: "feat.live.desc" },
            { Icon: MapPin, t: "feat.map.title", d: "feat.map.desc" },
            { Icon: Bell, t: "feat.reserve.title", d: "feat.reserve.desc" },
            { Icon: ArrowRightLeft, t: "feat.transfer.title", d: "feat.transfer.desc" },
            { Icon: Sparkles, t: "feat.ai.title", d: "feat.ai.desc" },
          ].map(({ Icon, t: tk, d }) => (
            <Card key={tk} className="p-6 shadow-soft hover:shadow-glow transition-shadow border-border/60">
              <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{t(tk as never)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(d as never)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-balance max-w-2xl mx-auto">{t("aud.title")}</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            { Icon: Pill, k: "aud.patient" },
            { Icon: Stethoscope, k: "aud.pharmacist" },
            { Icon: Building2, k: "aud.owner" },
            { Icon: Truck, k: "aud.supplier" },
          ].map(({ Icon, k }) => (
            <Card key={k} className="p-6 text-center border-border/60 hover:border-primary/40 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-hero text-primary-foreground flex items-center justify-center mx-auto">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{t(k as never)}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-balance max-w-2xl mx-auto">{t("price.title")}</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { name: t("price.free"), price: "0 TND", desc: "1 pharmacie, 50 produits", features: ["Recherche de base", "Profil pharmacie", "Réservations limitées"], cta: t("price.cta") },
            { name: t("price.pro"), price: "129 TND", desc: "Jusqu'à 5 succursales", features: ["Stock illimité", "Analytics avancés", "Transferts inter-pharmacies", "Support prioritaire"], featured: true, cta: t("price.cta") },
            { name: t("price.ent"), price: t("price.contact"), desc: "Chaînes & groupements", features: ["Multi-branches illimitées", "API personnalisée", "IA prévisionnelle", "Account manager dédié"], cta: "Contact" },
          ].map((p) => (
            <Card key={p.name} className={`p-7 relative ${p.featured ? "border-primary shadow-glow scale-[1.02]" : "shadow-soft"}`}>
              {p.featured && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Populaire</Badge>}
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{p.price}</span>
                {p.price !== t("price.contact") && p.price !== "0 TND" && <span className="text-sm text-muted-foreground">{t("price.month")}</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-7 w-full"
                variant={p.featured ? "default" : "outline"}
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as never })}
              >
                {p.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl bg-hero text-primary-foreground p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-30" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-balance max-w-2xl mx-auto">Rejoignez le réseau qui ne s'arrête jamais.</h2>
            <p className="mt-4 opacity-90 max-w-xl mx-auto">Inscription en 2 minutes. Validation par l'ordre des pharmaciens incluse.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button size="lg" variant="secondary" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as never })}>
                Démarrer gratuitement
                <ArrowRight className="h-4 w-4 ms-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
