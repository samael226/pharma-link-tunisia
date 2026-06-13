import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "ar" | "en";

export const LANGS: { code: Lang; label: string; native: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "en", label: "English", native: "English", dir: "ltr" },
];

type Dict = Record<string, { fr: string; ar: string; en: string }>;

export const T: Dict = {
  // Nav
  "nav.home": { fr: "Accueil", ar: "الرئيسية", en: "Home" },
  "nav.search": { fr: "Rechercher", ar: "بحث", en: "Search" },
  "nav.pharmacies": { fr: "Pharmacies", ar: "الصيدليات", en: "Pharmacies" },
  "nav.dashboard": { fr: "Tableau de bord", ar: "لوحة التحكم", en: "Dashboard" },
  "nav.signin": { fr: "Se connecter", ar: "تسجيل الدخول", en: "Sign in" },
  "nav.signup": { fr: "S'inscrire", ar: "إنشاء حساب", en: "Sign up" },
  "nav.signout": { fr: "Déconnexion", ar: "تسجيل الخروج", en: "Sign out" },

  // Hero
  "hero.badge": { fr: "Le réseau national des pharmacies", ar: "الشبكة الوطنية للصيدليات", en: "Tunisia's national pharmacy network" },
  "hero.title": {
    fr: "Trouvez vos médicaments en quelques secondes, partout en Tunisie.",
    ar: "اعثر على أدويتك في ثوانٍ، في كل أنحاء تونس.",
    en: "Find your medicines in seconds, anywhere in Tunisia.",
  },
  "hero.subtitle": {
    fr: "PharmaLink relie patients, pharmacies et fournisseurs sur une plateforme en temps réel pour ne plus jamais manquer un traitement.",
    ar: "يربط PharmaLink بين المرضى والصيدليات والموردين في منصة لحظية حتى لا ينقطع علاجك أبدًا.",
    en: "PharmaLink connects patients, pharmacies and suppliers on a real-time network so no one runs out of treatment.",
  },
  "hero.cta.primary": { fr: "Rechercher un médicament", ar: "ابحث عن دواء", en: "Search a medicine" },
  "hero.cta.secondary": { fr: "Je suis pharmacien", ar: "أنا صيدلي", en: "I'm a pharmacist" },
  "hero.search.placeholder": { fr: "Doliprane, Amoxicilline, Ventoline…", ar: "دوليبران، أموكسيسيلين…", en: "Doliprane, Amoxicillin, Ventolin…" },

  // Stats
  "stats.pharmacies": { fr: "Pharmacies connectées", ar: "صيدلية متصلة", en: "Connected pharmacies" },
  "stats.medicines": { fr: "Médicaments référencés", ar: "دواء مرجعي", en: "Medicines catalogued" },
  "stats.cities": { fr: "Villes couvertes", ar: "مدينة مغطاة", en: "Cities covered" },
  "stats.uptime": { fr: "Disponibilité plateforme", ar: "توفر المنصة", en: "Platform uptime" },

  // Features
  "feat.title": { fr: "Une plateforme pour tout l'écosystème pharmaceutique", ar: "منصة لكامل المنظومة الصيدلانية", en: "One platform for the entire pharmacy ecosystem" },
  "feat.subtitle": {
    fr: "Du patient au fournisseur, chacun gagne du temps.",
    ar: "من المريض إلى المورد، الجميع يربح وقته.",
    en: "From patient to supplier, everyone saves time.",
  },
  "feat.search.title": { fr: "Recherche intelligente", ar: "بحث ذكي", en: "Smart search" },
  "feat.search.desc": {
    fr: "Marque, DCI, code-barres ou catégorie. Tolérance aux fautes, suggestions instantanées, FR / AR / EN.",
    ar: "اسم تجاري، اسم علمي، باركود أو صنف. تصحيح الأخطاء واقتراحات فورية بثلاث لغات.",
    en: "Brand, generic, barcode or category. Typo-tolerant, instant suggestions, FR / AR / EN.",
  },
  "feat.live.title": { fr: "Stock en temps réel", ar: "المخزون في الوقت الفعلي", en: "Live inventory" },
  "feat.live.desc": {
    fr: "Disponibilité minute par minute, alertes de rupture, suivi des dates de péremption.",
    ar: "توفر لحظي، تنبيهات النفاد ومتابعة تواريخ الصلاحية.",
    en: "Minute-by-minute availability, shortage alerts and expiry tracking.",
  },
  "feat.map.title": { fr: "Pharmacies à proximité", ar: "صيدليات قريبة منك", en: "Nearby pharmacies" },
  "feat.map.desc": {
    fr: "Carte des pharmacies ouvertes, de garde et 24/7 autour de vous, avec navigation intégrée.",
    ar: "خريطة الصيدليات المفتوحة ومناوبة الليل والصيدليات 24/7 من حولك مع الملاحة.",
    en: "Open, on-call and 24/7 pharmacies near you, with built-in navigation.",
  },
  "feat.reserve.title": { fr: "Réservation en 1 clic", ar: "حجز بنقرة واحدة", en: "1-click reservation" },
  "feat.reserve.desc": {
    fr: "Réservez votre médicament, recevez la confirmation, passez le retirer. Sans appel téléphonique.",
    ar: "احجز دواءك، تلقى التأكيد، ومرّ لاستلامه. دون مكالمة هاتفية.",
    en: "Reserve your medicine, get confirmation, pick it up. No phone calls.",
  },
  "feat.transfer.title": { fr: "Transferts inter-pharmacies", ar: "تحويلات بين الصيدليات", en: "Inter-pharmacy transfers" },
  "feat.transfer.desc": {
    fr: "Demandez un produit à une pharmacie voisine quand vous êtes en rupture. Suivi complet.",
    ar: "اطلب منتجًا من صيدلية مجاورة عند النفاد، مع تتبّع كامل.",
    en: "Request stock from a nearby pharmacy when you run out. Full tracking.",
  },
  "feat.ai.title": { fr: "Analyse & IA", ar: "تحليلات وذكاء اصطناعي", en: "Analytics & AI" },
  "feat.ai.desc": {
    fr: "Prévision de la demande, alternatives suggérées, heatmaps régionales.",
    ar: "توقع الطلب، اقتراح البدائل، خرائط حرارية إقليمية.",
    en: "Demand forecasting, alternative suggestions, regional heatmaps.",
  },

  // Audiences
  "aud.title": { fr: "Conçu pour chaque acteur du parcours de soins", ar: "مصمم لكل فاعل في مسار الرعاية", en: "Built for every link in the care chain" },
  "aud.patient": { fr: "Patients", ar: "المرضى", en: "Patients" },
  "aud.pharmacist": { fr: "Pharmaciens", ar: "الصيادلة", en: "Pharmacists" },
  "aud.owner": { fr: "Propriétaires de pharmacie", ar: "ملاك الصيدليات", en: "Pharmacy owners" },
  "aud.supplier": { fr: "Fournisseurs", ar: "الموردون", en: "Suppliers" },

  // Pricing
  "price.title": { fr: "Une tarification simple, adaptée à chaque pharmacie", ar: "تسعير بسيط يناسب كل صيدلية", en: "Simple pricing built for every pharmacy" },
  "price.month": { fr: "/ mois", ar: "/ شهريًا", en: "/ month" },
  "price.cta": { fr: "Démarrer", ar: "ابدأ الآن", en: "Get started" },
  "price.free": { fr: "Gratuit", ar: "مجاني", en: "Free" },
  "price.pro": { fr: "Professionnel", ar: "احترافي", en: "Professional" },
  "price.ent": { fr: "Entreprise", ar: "مؤسسي", en: "Enterprise" },
  "price.contact": { fr: "Sur devis", ar: "حسب الطلب", en: "Custom" },

  // Footer / common
  "footer.tagline": {
    fr: "Le réseau qui n'arrête jamais. Conforme à la réglementation tunisienne du médicament.",
    ar: "الشبكة التي لا تتوقف. مطابقة لتنظيم الدواء التونسي.",
    en: "The network that never stops. Compliant with Tunisian medicine regulations.",
  },
  "common.loading": { fr: "Chargement…", ar: "جارٍ التحميل…", en: "Loading…" },
  "common.email": { fr: "E-mail", ar: "البريد الإلكتروني", en: "Email" },
  "common.password": { fr: "Mot de passe", ar: "كلمة المرور", en: "Password" },
  "common.fullname": { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "common.continue": { fr: "Continuer", ar: "متابعة", en: "Continue" },
  "common.or": { fr: "ou", ar: "أو", en: "or" },
  "common.google": { fr: "Continuer avec Google", ar: "المتابعة عبر Google", en: "Continue with Google" },
  "common.no_account": { fr: "Pas encore de compte ?", ar: "ليس لديك حساب؟", en: "No account yet?" },
  "common.have_account": { fr: "Déjà inscrit ?", ar: "لديك حساب؟", en: "Already registered?" },

  // Auth
  "auth.signin.title": { fr: "Bon retour parmi nous", ar: "أهلًا بعودتك", en: "Welcome back" },
  "auth.signin.subtitle": { fr: "Accédez à votre espace PharmaLink.", ar: "ادخل إلى حسابك على PharmaLink.", en: "Sign in to your PharmaLink account." },
  "auth.signup.title": { fr: "Créer votre compte", ar: "أنشئ حسابك", en: "Create your account" },
  "auth.signup.subtitle": { fr: "En quelques secondes. Aucune carte requise.", ar: "في ثوانٍ. بدون بطاقة.", en: "In seconds. No card required." },

  // Dashboard
  "dash.welcome": { fr: "Bienvenue", ar: "مرحبًا", en: "Welcome" },
  "dash.patient.title": { fr: "Mon espace patient", ar: "مساحتي كمريض", en: "My patient space" },
  "dash.patient.search": { fr: "Rechercher un médicament", ar: "ابحث عن دواء", en: "Search a medicine" },
  "dash.patient.reservations": { fr: "Mes réservations", ar: "حجوزاتي", en: "My reservations" },
  "dash.pharmacist.title": { fr: "Console pharmacien", ar: "وحدة الصيدلي", en: "Pharmacist console" },
  "dash.admin.title": { fr: "Administration", ar: "الإدارة", en: "Administration" },
  "dash.role": { fr: "Rôle", ar: "الدور", en: "Role" },
};

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const saved = window.localStorage.getItem("pl_lang") as Lang | null;
  if (saved && ["fr", "ar", "en"].includes(saved)) return saved;
  const nav = window.navigator.language.slice(0, 2).toLowerCase();
  if (nav === "ar") return "ar";
  if (nav === "en") return "en";
  return "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir,
      setLang: (l) => {
        setLangState(l);
        if (typeof window !== "undefined") window.localStorage.setItem("pl_lang", l);
      },
      t: (key) => T[key]?.[lang] ?? String(key),
    }),
    [lang, dir],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
