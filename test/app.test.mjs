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
  ]) {
    assert.ok(app.includes(feature), `Expected the app to include: ${feature}`);
  }
});
