import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t mt-24">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">{t("footer.tagline")}</p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Plateforme</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Patients</li>
            <li>Pharmaciens</li>
            <li>Fournisseurs</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Légal</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Conditions</li>
            <li>Confidentialité</li>
            <li>RGPD &amp; DPM</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} PharmaLink Tunisia</span>
          <span>Tunis • Sfax • Sousse • Bizerte</span>
        </div>
      </div>
    </footer>
  );
}
