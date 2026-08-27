import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

test("contains all required claim-status milestones in order", () => {
  const milestones = [
    "Submitted",
    "Pending at employer",
    "Approved by employer",
    "Pending at field office",
    "Approved by field officer",
    "Done",
  ];
  let previous = -1;
  for (const milestone of milestones) {
    const current = app.indexOf(milestone);
    assert.ok(
      current > previous,
      `${milestone} should follow the prior milestone`,
    );
    previous = current;
  }
});

test("provides mock OTP, employer actions, and a passbook route", () => {
  for (const feature of [
    "Send OTP",
    "Verify & continue",
    "Transfer Claim",
    "Withdrawal Request",
    "View complete passbook",
    "Total experience",
    "Track claim",
    "Hide claim progress",
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
  ]) {
    assert.ok(app.includes(feature), `Expected the app to include: ${feature}`);
  }
});
