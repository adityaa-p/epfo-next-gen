import { createContext, useContext, useEffect, useMemo, useState } from "react";
import translations, {
  supportedLanguages,
  languageNames,
} from "./translations.js";

export const LANGUAGE_STORAGE_KEY = "epfo-one-language";
const localeTags = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  kn: "kn-IN",
  ta: "ta-IN",
};
const LanguageContext = createContext(null);
export function resolveLanguage(value) {
  const code = String(value || "")
    .toLowerCase()
    .split(/[-_]/)[0];
  return supportedLanguages.includes(code) ? code : "en";
}
function initialLanguage() {
  try {
    const stored = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) return resolveLanguage(stored);
  } catch {
    /* storage can be unavailable */
  }
  return resolveLanguage(globalThis.navigator?.language);
}
export function interpolate(template, variables = {}) {
  return String(template).replace(
    /{{\s*([^}]+)\s*}}/g,
    (_, name) => variables[name.trim()] ?? "",
  );
}
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(initialLanguage);
  const setLanguage = (value) => {
    const next = resolveLanguage(value);
    document.documentElement.lang = next;
    try {
      globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      /* preference remains in memory */
    }
    setLanguageState(next);
  };
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      /* preference remains in memory */
    }
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languageNames,
      locale: localeTags[language],
      t: (key, variables) =>
        interpolate(
          translations[language]?.[key] ?? translations.en[key] ?? key,
          variables,
        ),
      formatAmount: (amount) =>
        new Intl.NumberFormat(localeTags[language], {
          maximumFractionDigits: 0,
        }).format(amount),
      formatDate: (
        date,
        options = { day: "2-digit", month: "long", year: "numeric" },
      ) =>
        new Intl.DateTimeFormat(localeTags[language], options).format(
          date instanceof Date ? date : new Date(date),
        ),
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value)
    throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
export function LanguageSelector({ className = "" }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className={`language-selector ${className}`.trim()}>
      <span>{t("common.language")}</span>
      <select
        aria-label={t("common.language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {supportedLanguages.map((code) => (
          <option key={code} value={code}>
            {languageNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
