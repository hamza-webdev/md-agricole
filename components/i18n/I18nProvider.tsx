"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "fr" | "ar";

type Messages = Record<string, string>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;        // public site/header
  ta: (key: string) => string;       // admin common
  tau: (key: string, params?: Record<string, string | number>) => string; // admin users (with params)
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

async function loadMessages(locale: Locale): Promise<Messages> {
  // Charge dynamiquement les traductions du header
  const header = await import(`../../messages/${locale}/header.json`).then((m) => m.default);
  return { ...header } as Messages;
}

async function loadAdminMessages(locale: Locale): Promise<Messages> {
  // Charge dynamiquement les traductions de l'admin
  const admin = await import(`../../messages/${locale}/admin.json`).then((m) => m.default);
  return admin as Messages;
}

async function loadAdminUsersMessages(locale: Locale): Promise<Messages> {
  const mod = await import(`../../messages/${locale}/admin.users.json`).then(m => m.default).catch(() => ({}));
  return mod as Messages;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Initialiser toujours en "fr" pour éviter tout décalage SSR/CSR.
  const [locale, setLocaleState] = useState<Locale>('fr');
  // Appliquer la préférence utilisateur côté client après hydratation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('locale') as Locale | null;
    if (saved === 'fr' || saved === 'ar') {
      setLocaleState(saved);
    } else {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith('ar')) setLocaleState('ar');
    }
  }, []);

  const [messages, setMessages] = useState<Messages>({});
  const [adminMessages, setAdminMessages] = useState<Messages>({});
  const [adminUsersMessages, setAdminUsersMessages] = useState<Messages>({});

  useEffect(() => {
    // Charger les messages à chaque changement de locale
    loadMessages(locale).then(setMessages).catch(() => setMessages({}));
    loadAdminMessages(locale).then(setAdminMessages).catch(() => setAdminMessages({}));
    loadAdminUsersMessages(locale).then(setAdminUsersMessages).catch(() => setAdminUsersMessages({}));
  }, [locale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", locale);
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => messages[key] ?? key;
  }, [messages]);

  const ta = useMemo(() => {
    return (key: string) => adminMessages[key] ?? key;
  }, [adminMessages]);
  const tau = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const raw = adminUsersMessages[key] ?? key;
      if (!params) return raw;
      return Object.keys(params).reduce((acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k])), raw);
    };
  }, [adminUsersMessages]);

  // expose: t (header), ta (admin), tau (admin.users)


  const setLocale = (l: Locale) => setLocaleState(l);

  const value = useMemo(() => ({ locale, setLocale, t, ta, tau }), [locale, t, ta, tau]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

