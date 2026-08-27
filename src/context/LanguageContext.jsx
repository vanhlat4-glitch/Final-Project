import { createContext, useContext, useState, useEffect } from "react";
import { translations, phraseDictionary } from "../i18n/translations";

export const LanguageContext = createContext(null);

const STORAGE_KEY = "morent_language";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "vi" ? saved : "vi";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === "vi" || lang === "en") {
      setLanguageState(lang);
    }
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "vi" ? "en" : "vi"));
  };

  /**
   * Smart Translation Function:
   * 1. Checks direct translation key in translations[lang]
   * 2. Checks phraseDictionary mapping for exact or trimmed string
   * 3. Handles dynamic regex patterns (e.g. "Chào ... 👋", "Xem toàn bộ (...)")
   */
  const t = (input, fallback = "") => {
    if (input === null || input === undefined) return fallback;
    const str = String(input);
    const trimmed = str.trim();

    // 1. If language is English
    if (language === "en") {
      // Key lookup
      if (translations.en[str] !== undefined) return translations.en[str];
      if (translations.en[trimmed] !== undefined) return translations.en[trimmed];

      // Direct phrase dictionary lookup
      if (phraseDictionary[str] !== undefined) return phraseDictionary[str];
      if (phraseDictionary[trimmed] !== undefined) return phraseDictionary[trimmed];

      // Dynamic Greeting pattern: "Chào [Tên] 👋" -> "Hello [Tên] 👋"
      if (str.startsWith("Chào ") && str.includes("👋")) {
        const namePart = str.replace("Chào ", "").replace("👋", "").trim();
        return `Hello ${namePart} 👋`;
      }

      // Dynamic View count pattern: "Xem toàn bộ ([N] xe)" -> "View all ([N] cars)"
      if (str.includes("Xem toàn bộ (") && str.includes("xe)")) {
        return str.replace("Xem toàn bộ", "View all").replace("xe", "cars");
      }

      // Dynamic "Đánh giá từ khách hàng ([N])" -> "Customer Reviews ([N])"
      if (str.includes("Đánh giá từ khách hàng (")) {
        return str.replace("Đánh giá từ khách hàng", "Customer Reviews");
      }

      // If fallback provided and different from input, use fallback
      if (fallback && fallback !== str) return fallback;

      return str;
    }

    // 2. If language is Vietnamese
    if (translations.vi[str] !== undefined) return translations.vi[str];
    if (translations.vi[trimmed] !== undefined) return translations.vi[trimmed];

    return fallback || str;
  };

  return (
    <LanguageContext.Provider value={{ language, isEn: language === "en", isVi: language === "vi", setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
