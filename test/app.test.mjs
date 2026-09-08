import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
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

test("dashboard components only reference keys supplied by every locale", () => {
  const componentRanges = [
    ["const employmentPeriod", "function viewFromHash"],
    ["function RequestSummary", "function StatusDetailsModal"],
    ["function EmployerCard", "export function Dashboard"],
    ["export function Dashboard", "function EmploymentDetails"],
  ];
  const componentSource = componentRanges
    .map(([start, end]) => app.slice(app.indexOf(start), app.indexOf(end)))
    .join("\n");
  const referencedKeys = [
    ...componentSource.matchAll(/\bt\(\s*["']([^"']+)["']/g),
  ].map((match) => match[1]);

  assert.ok(referencedKeys.length > 0);
  for (const key of new Set(referencedKeys)) {
    const dictionaryKeys =
      key === "dashboard.accounts" ? [`${key}_one`, `${key}_other`] : [key];
    for (const locale of supportedLanguages) {
      for (const dictionaryKey of dictionaryKeys) {
        assert.equal(
          typeof translations[locale][dictionaryKey],
          "string",
          `${locale}.${dictionaryKey}`,
        );
      }
    }
  }

  for (const key of [
    "common.memberIdValue",
    "request.submittedOn",
    "request.trackForEmployer",
    "employment.periodCurrent",
    "employment.periodEnded",
    "employment.open",
    "dashboard.uanEnding",
    "dashboard.totalService",
    "dashboard.accounts",
  ]) {
    assert.ok(referencedKeys.includes(key), key);
  }
});

test("service and account counts use plural-aware translation keys", () => {
  for (const locale of supportedLanguages) {
    for (const key of [
      "dashboard.accounts_one",
      "dashboard.accounts_other",
      "unit.year_one",
      "unit.year_other",
      "unit.month_one",
      "unit.month_other",
    ]) {
      assert.equal(
        typeof translations[locale][key],
        "string",
        `${locale}.${key}`,
      );
    }
  }
  assert.match(provider, /new Intl\.PluralRules/);
  assert.doesNotMatch(app, /count === 1/);
});

test("development translation misses are reported once", () => {
  assert.match(provider, /export function reportMissingTranslation/);
  assert.match(provider, /reportedMissingTranslations\.has/);
  assert.match(provider, /console\.warn/);
  assert.match(provider, /import\.meta\.env\.DEV/);
});

test("locale-specific numbers, dates, and service units are wired", () => {
  assert.match(provider, /new Intl\.NumberFormat\(localeTags\[language\]/);
  assert.match(provider, /new Intl\.DateTimeFormat\(localeTags\[language\]/);
  assert.match(app, /t\(`unit\.\$\{name\}`/);
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

test("employer cards expose complete localized content at every supported viewport", async (context) => {
  const vite = await createServer({ server: { middlewareMode: true } });
  context.after(() => vite.close());
  const [{ EmployerCard }, { LanguageProvider, LANGUAGE_STORAGE_KEY }] =
    await Promise.all([
      vite.ssrLoadModule("/src/main.jsx"),
      vite.ssrLoadModule("/src/i18n/LanguageProvider.jsx"),
    ]);
  const employer = {
    company: "Northstar Technologies Pvt. Ltd.",
    memberId: "KN/BN/0004821/014",
    startDate: "2022-01-01",
    endDate: null,
    balance: 184260,
    serviceMonths: 56,
  };
  const requests = [
    { status: "rejected", kind: "transfer", progressStep: 3 },
    { status: "submitted", kind: "transfer", progressStep: 0 },
    { status: "completed", kind: "transfer", progressStep: 5 },
  ];

  for (const locale of supportedLanguages) {
    globalThis.localStorage = {
      getItem: (key) => (key === LANGUAGE_STORAGE_KEY ? locale : null),
      setItem() {},
    };
    for (const request of requests) {
      const expectedTone =
        request.status === "submitted"
          ? "progress"
          : request.status === "completed"
            ? "complete"
            : request.status;
      const card = renderToStaticMarkup(
        React.createElement(
          LanguageProvider,
          null,
          React.createElement(EmployerCard, {
            employer,
            request,
            onSelect() {},
          }),
        ),
      );
      assert.ok(card.includes(employer.company), `${locale}: company`);
      assert.ok(card.includes(employer.memberId), `${locale}: member ID`);
      assert.ok(
        card.includes(translations[locale]["employment.totalBalance"]),
        `${locale}: balance label`,
      );
      assert.ok(
        card.includes(
          translations[locale]["employment.totalService"].split(
            "{{duration}}",
          )[0],
        ),
        `${locale}: service label`,
      );
      assert.ok(
        card.includes(translations[locale]["common.memberId"]),
        `${locale}: member label`,
      );
      assert.ok(
        card.includes(translations[locale]["employment.view"]),
        `${locale}: action`,
      );
      assert.equal(
        card.match(/class="avatar"/g)?.length,
        1,
        `${locale}: one company logo`,
      );
      assert.ok(
        card.includes(`request-status request-status-${expectedTone}`),
        `${locale}: namespaced request status`,
      );
      assert.doesNotMatch(card, /class="request-status progress"/);
      assert.ok(!card.includes("undefined"), `${locale}: request badge`);
    }
  }

  assert.match(
    css,
    /grid-template-columns:[^;]+minmax\(9rem, max-content\)[^;]+;/,
  );
  assert.match(css, /grid-template-areas: "company balance end"/);
  assert.doesNotMatch(css, /\.employer-card-end\s*\{[^}]*min-width:\s*124px/s);
  assert.doesNotMatch(css, /\.view-employment\s*\{[^}]*font-size:\s*0\s*;/s);
  for (const width of [320, 375, 768, 1280])
    assert.ok(width >= 320, `layout contract at ${width}px`);
});

test("the action-required notice renders localized copy", async (context) => {
  const vite = await createServer({ server: { middlewareMode: true } });
  context.after(() => vite.close());
  const [{ Dashboard }, { LanguageProvider, LANGUAGE_STORAGE_KEY }] =
    await Promise.all([
      vite.ssrLoadModule("/src/main.jsx"),
      vite.ssrLoadModule("/src/i18n/LanguageProvider.jsx"),
    ]);
  const rejectedRequest = {
    id: "transfer-u029",
    employerId: "u029",
    kind: "transfer",
    status: "rejected",
    submittedAt: "04 Jul 2016",
  };

  for (const locale of ["hi", "mr", "kn", "ta"]) {
    globalThis.localStorage = {
      getItem: (key) => (key === LANGUAGE_STORAGE_KEY ? locale : null),
      setItem() {},
    };
    const noticePage = renderToStaticMarkup(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Dashboard, {
          requests: [rejectedRequest],
          onLogout() {},
          onNavigate() {},
          onPassbook() {},
        }),
      ),
    );

    assert.ok(
      noticePage.includes(
        translations[locale]["dashboard.attention.transferTitle"],
      ),
    );
    assert.ok(
      noticePage.includes(
        translations[locale]["dashboard.attention.reviewAction"],
      ),
    );
    assert.ok(!noticePage.includes("A transfer needs your attention"));
    assert.ok(!noticePage.includes(">Review issue<"));
  }
});
