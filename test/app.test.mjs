import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

function assertStrings(strings) {
  for (const value of strings) {
    assert.ok(app.includes(value), `Expected the app to include: ${value}`);
  }
}

test("keeps transfer and withdrawal milestones in their exact order", () => {
  const milestoneSets = [
    [
      "Submitted",
      "Pending at employer",
      "Approved by employer",
      "Pending at field office",
      "Approved by field officer",
      "Done",
    ],
    [
      "Submitted",
      "Pending at field office",
      "Approved by field office",
      "Done",
    ],
  ];

  for (const milestones of milestoneSets) {
    let previous = -1;
    for (const milestone of milestones) {
      const current = app.indexOf(`"${milestone}"`, previous + 1);
      assert.ok(
        current > previous,
        `${milestone} should follow the prior milestone`,
      );
      previous = current;
    }
  }
});

test("uses the task-oriented dashboard information architecture", () => {
  assertStrings([
    "function EmploymentDetails",
    "Manage funds",
    "Requests",
    "Track status",
    "Recent contributions",
    "View complete passbook",
    "Transfer Amount",
    "Withdraw Amount",
  ]);
});

test("keeps dashboard employment cards compact and opens details as a task", () => {
  assertStrings([
    "employer-card",
    "employment-details",
    "onSelect",
    "Back to employments",
    "Total PF balance",
    "Total service:",
  ]);
});

test("masks the UAN on home and reveals it in the member profile", () => {
  assertStrings([
    "UAN ending ••••",
    "function ProfilePage",
    "Universal Account Number (UAN)",
    "1009 2847 3612",
  ]);
});

test("uses one normalized request model for transfer and withdrawal requests", () => {
  assertStrings([
    'kind: "transfer"',
    'kind: "withdrawal"',
    "employerId",
    "statusDates",
    "progressStep",
    "claimStatus",
  ]);
});

test("supports request tracking and rejection details", () => {
  assertStrings([
    "Requests",
    "Track status",
    "Transfer claim submitted successfully.",
    "Withdrawal request submitted successfully.",
    "Rejected by field office",
    "View rejection reason",
    "Rejection reference",
    "Retry transfer",
  ]);
});

test("chat guidance follows the task-oriented paths", () => {
  assertStrings([
    "EPFO One assistant",
    "Open an employment",
    "Manage funds",
    "Requests",
    "Track status",
    "View complete passbook",
    "available in Profile",
    "Mock assistant",
    "getChatResponse",
  ]);
});
