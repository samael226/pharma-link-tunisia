import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { LangSwitcher } from "./LangSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { LogOut, LayoutDashboard } from "lucide-react";

export function Header() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/search" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.search")}
          </Link>
          <a href="/#features" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("feat.title").split(" ").slice(0, 2).join(" ")}
          </a>
          <a href="/#pricing" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("price.title").split(" ").slice(0, 2).join(" ")}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
                <LayoutDashboard className="h-4 w-4 me-2" />
                <span className="hidden sm:inline">{t("nav.dashboard")}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signin" } as never })}>
                {t("nav.signin")}
              </Button>
              <Button size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as never })}>
                {t("nav.signup")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
