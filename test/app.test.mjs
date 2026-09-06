import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const styles = await readFile(
  new URL("../src/styles.css", import.meta.url),
  "utf8",
);

const readStringArray = (name) => {
  const match = app.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  assert.ok(match, `Expected to find the ${name} array`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
};

test("keeps the exact transfer and withdrawal milestone sequences", () => {
  assert.deepEqual(readStringArray("steps"), [
    "Submitted",
    "Pending at employer",
    "Approved by employer",
    "Pending at field office",
    "Approved by field officer",
    "Done",
  ]);
  assert.deepEqual(readStringArray("withdrawalSteps"), [
    "Submitted",
    "Pending at field office",
    "Approved by field office",
    "Done",
  ]);
});

test("presents the new account and status concepts with a masked UAN", () => {
  for (const concept of [
    "Track status",
    "Manage account",
    "Status details",
    "View details",
  ]) {
    assert.ok(app.includes(concept), `Expected the app to include: ${concept}`);
  }

  const uan = app.match(/const uan = "([\d ]+)";/)?.[1];
  assert.equal(uan, "1009 2847 3612");
  assert.match(app, /<strong>UAN ending •••• \{uan\.slice\(-4\)\}<\/strong>/);
  assert.equal(`UAN ending •••• ${uan.slice(-4)}`, "UAN ending •••• 3612");
});

test("Dashboard starts with every employer collapsed", () => {
  const dashboard = app.slice(
    app.indexOf("function Dashboard("),
    app.indexOf("function Passbook("),
  );
  assert.match(dashboard, /const \[open, setOpen\] = useState\(null\);/);
  assert.match(dashboard, /expanded=\{open === employer\.id\}/);
  assert.match(
    dashboard,
    /setOpen\(open === employer\.id \? null : employer\.id\)/,
  );
});

test("wires employer, account-management, and status disclosures", () => {
  assert.match(app, /onClick=\{onToggle\}/);
  assert.match(app, /\{expanded && \(\s*<div className="detail">/);
  assert.match(
    app,
    /onClick=\{\(\) => setIsManaging\(\(current\) => !current\)\}/,
  );
  assert.match(app, /\{isManaging && \(\s*<div\s+className="managed-actions"/);
  assert.match(app, /onClick=\{onTrackStatus\}>\s*Track status/);
  assert.match(app, /onClick=\{onClose\}\s+aria-label="Close status details"/);
  assert.match(app, /onClick=\{onClose\}>\s*Close/);
  assert.match(
    app,
    /setSelectedStatusEmployerId\(transferEmployer\.id\)[\s\S]*?Transfer claim submitted successfully\./,
  );
  assert.match(
    app,
    /setSelectedStatusEmployerId\(withdrawEmployer\.id\)[\s\S]*?Withdrawal request submitted successfully\./,
  );
});

test("provides mock OTP, employer actions, and a passbook route", () => {
  for (const feature of [
    "Send OTP",
    "Verify & continue",
    "Transfer Amount",
    "Withdraw Amount",
    "View complete passbook",
    "Total experience",
    "Processed",
    "Transaction date",
    "Employee share (12%)",
    "Employer share (3.67%)",
    "Pension share (8.33%)",
    "Universal Account Number (UAN)",
    "Total service:",
    "01 April 2019 — 31 December 2021",
    "Transfer your PF balance",
    "Select an employer",
    "Submit transfer claim?",
    "Yes",
    "Transfer claim submitted successfully.",
    "Withdrawal request",
    "PF ADVANCE (FORM-31)",
    "Purpose for which advance is required",
    "Eligible Claim Amount: Rs",
    "Employee&apos;s address",
    "Submit withdrawal request?",
    "Withdrawal request submitted successfully.",
    "Selected employer",
    "Financial year",
    "Wage month",
    "EPF wages",
    "EPS wages",
    "Total Contributions for the year",
    "12 contributions from April to March",
    "Choose employer",
    "allowEmployerSelection",
    "Hide details",
    "Approved by field office",
    "EPFO One assistant",
    "Ask about your PF account",
    "Mock assistant",
    "getChatResponse",
    "Member overview",
    "contribution-passbook",
    "verified-pill",
    "canSubmit",
    "Profile menu",
    "Change phone no",
    "E-Nomination",
    "UAN Card",
    "BluePeak Logistics Pvt. Ltd.",
    "Rejected by field office",
    "View rejection reason",
    "Transfer claim rejected by field office",
    "Rejection reference",
    "employer-company-copy",
    "employer-toggle",
  ]) {
    assert.ok(app.includes(feature), `Expected the app to include: ${feature}`);
  }
});

test("keeps the mobile assistant trigger compact and accessible", () => {
  assert.match(app, /"Open EPFO One assistant"/);
  assert.match(
    styles,
    /\.chat-bubble \{[\s\S]*?width: 50px;[\s\S]*?border-radius: 50%;/,
  );
  assert.match(
    styles,
    /\.chat-bubble small \{[\s\S]*?position: absolute;[\s\S]*?clip: rect\(0, 0, 0, 0\);/,
  );
});
