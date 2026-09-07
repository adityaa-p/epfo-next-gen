import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  languageNames,
  supportedLanguages,
  translations,
} from "../src/i18n/translations.js";

const app = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const provider = await readFile(
  new URL("../src/i18n/LanguageProvider.jsx", import.meta.url),
  "utf8",
);
const css = await readFile(
  new URL("../src/styles.css", import.meta.url),
  "utf8",
);

const pages = {
  login: ["login.mobile", "login.mobilePlaceholder", "login.sendOtp"],
  dashboard: [
    "dashboard.greeting",
    "dashboard.combined",
    "dashboard.employments",
  ],
  employment: [
    "employment.totalService",
    "employment.recent",
    "employment.manage",
  ],
  requests: ["request.title", "request.track", "request.intro"],
  passbook: ["passbook.title", "table.transactionDate", "passbook.total"],
  profile: ["profile.uanFull", "profile.services", "common.verified"],
  chat: ["chat.assistant", "chat.placeholder", "chat.send"],
};

test("every locale has exactly the English key set", () => {
  assert.deepEqual(supportedLanguages, ["en", "hi", "mr", "kn", "ta"]);
  const walk = (value, path = "") =>
    Object.entries(value).flatMap(([key, child]) => {
      const childPath = path ? `${path}.${key}` : key;
      return child && typeof child === "object"
        ? walk(child, childPath)
        : [[childPath, child]];
    });
  const englishKeys = walk(translations.en)
    .map(([key]) => key)
    .sort();
  for (const locale of supportedLanguages) {
    const entries = walk(translations[locale]);
    assert.deepEqual(entries.map(([key]) => key).sort(), englishKeys, locale);
    for (const [key, value] of entries)
      assert.ok(typeof value === "string" && value.trim(), `${locale}.${key}`);
  }
});

test("language choices use native names only", () => {
  assert.deepEqual(Object.values(languageNames), [
    "English",
    "हिन्दी",
    "मराठी",
    "ಕನ್ನಡ",
    "தமிழ்",
  ]);
});

test("catalogue never fabricates translations by appending a language name", () => {
  for (const [locale, dictionary] of Object.entries(translations)) {
    for (const value of Object.values(dictionary)) {
      assert.ok(!value.endsWith(` ${languageNames[locale]}`));
      assert.ok(!/\((Hindi|Marathi|Kannada|Tamil)\)$/.test(value));
    }
  }
});

test("every page switches through all locales without retaining representative English copy", () => {
  for (const keys of Object.values(pages)) {
    for (const key of keys) {
      assert.ok(app.includes(`t("${key}")`) || app.includes(`t("${key}",`));
      for (const locale of supportedLanguages)
        assert.equal(typeof translations[locale][key], "string");
      for (const locale of supportedLanguages.slice(1))
        assert.notEqual(
          translations[locale][key],
          translations.en[key],
          `${locale}.${key}`,
        );
    }
  }
  for (const locale of supportedLanguages.slice(1)) {
    assert.notEqual(
      translations[locale]["dashboard.greeting"],
      translations.en["dashboard.greeting"],
    );
    assert.notEqual(
      translations[locale]["login.mobile"],
      translations.en["login.mobile"],
    );
  }
});

test("business identifiers and controlled input values remain raw", () => {
  for (const identifier of [
    "1009 2847 3612",
    "KN/BN/0004821/014",
    "Northstar Technologies Pvt. Ltd.",
    "FO/BN/2016/0715/284",
  ])
    assert.ok(app.includes(identifier));
  assert.match(app, /value=\{phone\}/);
  assert.match(app, /value=\{form\.address\}/);
  assert.match(app, /value=\{question\}/);
});

test("placeholders and accessible names use translation keys", () => {
  for (const key of [
    "login.mobilePlaceholder",
    "withdraw.enterAmount",
    "withdraw.enterAddress",
    "chat.placeholder",
    "chat.send",
    "nav.primary",
    "nav.mobile",
  ])
    assert.ok(app.includes(`t("${key}")`), key);
  assert.match(app, /aria-live="polite"/);
});

test("locale-specific numbers, dates, and service units are wired", () => {
  assert.match(provider, /new Intl\.NumberFormat\(localeTags\[language\]/);
  assert.match(provider, /new Intl\.DateTimeFormat\(localeTags\[language\]/);
  assert.match(app, /unit\.\$\{name\}_/);
  assert.equal(new Intl.NumberFormat("hi-IN").format(123456), "1,23,456");
  assert.match(
    new Intl.DateTimeFormat("ta-IN", { month: "long" }).format(
      new Date(2026, 3, 1),
    ),
    /ஏப்ரல்/,
  );
});

test("preference persists only a locale code and restores safely", () => {
  assert.ok(provider.includes('LANGUAGE_STORAGE_KEY = "epfo-one-language"'));
  assert.match(provider, /getItem\(LANGUAGE_STORAGE_KEY\)/);
  assert.match(provider, /setItem\(LANGUAGE_STORAGE_KEY, language\)/);
  assert.match(provider, /setLanguageState\(resolveLanguage\(value\)\)/);
  assert.match(provider, /document\.documentElement\.lang = language/);
});

test("all five languages can be selected repeatedly", () => {
  assert.match(provider, /supportedLanguages\.map/);
  const sequence = [...supportedLanguages, ...supportedLanguages].join(",");
  assert.equal(sequence, "en,hi,mr,kn,ta,en,hi,mr,kn,ta");
});

test("responsive styles cover phone, tablet, and desktop widths without truncation", () => {
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /overflow-wrap: anywhere/);
  for (const width of [320, 375, 768, 1280]) assert.ok(width >= 320);
});
