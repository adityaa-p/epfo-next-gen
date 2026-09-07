import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  LanguageProvider,
  LanguageSelector,
  useLanguage,
} from "./i18n/LanguageProvider.jsx";

const employers = [
  {
    id: "u112",
    company: "Northstar Technologies Pvt. Ltd.",
    dates: "01 January 2022 — Present",
    memberId: "KN/BN/0004821/014",
    balance: 184260,
    serviceMonths: 56,
    active: true,
    contributions: [
      { date: "01 July 2026", employee: 3600, employer: 1100, pension: 2500 },
      { date: "01 June 2026", employee: 3600, employer: 1100, pension: 2500 },
      { date: "01 May 2026", employee: 3600, employer: 1100, pension: 2500 },
    ],
  },
  {
    id: "u088",
    company: "Aster Cloud Services",
    dates: "01 April 2019 — 31 December 2021",
    memberId: "KN/BN/0004821/009",
    balance: 0,
    serviceMonths: 33,
    contributions: [
      {
        date: "01 December 2021",
        employee: 2800,
        employer: 1020,
        pension: 1780,
      },
      {
        date: "01 November 2021",
        employee: 2800,
        employer: 1020,
        pension: 1780,
      },
      {
        date: "01 October 2021",
        employee: 2800,
        employer: 1020,
        pension: 1780,
      },
    ],
    claim: {
      type: "Transfer claim",
      claimStatus: "Processed",
      progressStep: 5,
      statusDates: [
        "14 Jan 2022",
        "16 Jan 2022",
        "19 Jan 2022",
        "22 Jan 2022",
        "25 Jan 2022",
        "27 Jan 2022",
      ],
    },
  },
  {
    id: "u051",
    company: "Cedar Retail India Ltd.",
    dates: "01 July 2016 — 31 March 2019",
    memberId: "KN/BN/0004821/004",
    balance: 47820,
    serviceMonths: 33,
    contributions: [
      { date: "01 March 2019", employee: 2100, employer: 770, pension: 1330 },
      {
        date: "01 February 2019",
        employee: 2100,
        employer: 770,
        pension: 1330,
      },
      { date: "01 January 2019", employee: 2100, employer: 770, pension: 1330 },
    ],
  },
  {
    id: "u029",
    company: "BluePeak Logistics Pvt. Ltd.",
    dates: "01 January 2014 — 30 June 2016",
    memberId: "KN/BN/0004821/002",
    balance: 58320,
    serviceMonths: 30,
    contributions: [
      { date: "01 June 2016", employee: 1800, employer: 660, pension: 1140 },
      { date: "01 May 2016", employee: 1800, employer: 660, pension: 1140 },
      { date: "01 April 2016", employee: 1800, employer: 660, pension: 1140 },
    ],
    claim: {
      type: "Transfer claim",
      claimStatus: "Rejected",
      progressStep: 3,
      rejectedAt: 4,
      statusDates: [
        "04 Jul 2016",
        "05 Jul 2016",
        "08 Jul 2016",
        "11 Jul 2016",
        "15 Jul 2016",
      ],
      rejectionTitle: "Transfer claim rejected by field office",
      rejectionMessage:
        "The member name in the previous establishment record does not match the name registered against the current UAN. Please ask the previous employer to correct the member details and submit a fresh transfer request.",
      rejectionReference: "Rejection reference: FO/BN/2016/0715/284",
    },
  },
];
const steps = [
  "Submitted",
  "Pending at employer",
  "Approved by employer",
  "Pending at field office",
  "Approved by field officer",
  "Done",
];
const withdrawalSteps = [
  "Submitted",
  "Pending at field office",
  "Approved by field office",
  "Done",
];
const memberName = "Ananya Kapoor";
const uan = "1009 2847 3612";
const locations = {
  Karnataka: ["Bengaluru Urban", "Mysuru", "Dharwad"],
  Maharashtra: ["Mumbai Suburban", "Pune", "Nagpur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
};
const emptyWithdrawalForm = {
  applicationType: "",
  purpose: "",
  amount: "",
  address: "",
  state: "",
  district: "",
};
const financialYears = [2026, 2025, 2024];
const requestStorageKey = "epfo-one-requests";
const defaultView = { name: "dashboard" };
const financialYearLabel = (startYear) =>
  `${startYear}–${String(startYear + 1).slice(-2)}`;
const buildPassbookEntries = (employer, startYear) => {
  const months = [
    ["April", 3],
    ["May", 4],
    ["June", 5],
    ["July", 6],
    ["August", 7],
    ["September", 8],
    ["October", 9],
    ["November", 10],
    ["December", 11],
    ["January", 0],
    ["February", 1],
    ["March", 2],
  ];
  const employerIndex = employers.findIndex((item) => item.id === employer.id);
  const epfWages = 30000 - employerIndex * 5000;
  const epsWages = 15000;

  return months.map(([month, monthIndex], index) => {
    const wageYear = index < 9 ? startYear : startYear + 1;
    const transactionMonthIndex = (monthIndex + 1) % 12;
    const transactionYear =
      transactionMonthIndex === 0 ? wageYear + 1 : wageYear;
    return {
      wageMonth: `${month} ${wageYear}`,
      transactionDate: `10 ${new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(transactionYear, transactionMonthIndex, 10))} ${transactionYear}`,
      epfWages,
      epsWages,
      employeeShare: Math.round(epfWages * 0.12),
      employerShare: Math.round(epfWages * 0.0367),
      pensionShare: Math.round(epsWages * 0.0833),
    };
  });
};
const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
const serviceDuration = (months) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
};

function viewFromHash() {
  const [name = "dashboard", id, option] = globalThis.location?.hash
    ?.replace(/^#\/?/, "")
    .split("/") || ["dashboard"];
  if (name === "employment" && id) return { name, employerId: id };
  if (name === "requests") return { name, requestId: id || undefined };
  if (name === "profile") return { name };
  if (name === "passbook" && id) {
    return {
      name,
      employerId: id,
      allowEmployerSelection: option === "all",
    };
  }
  return defaultView;
}

function hashFromView(view) {
  if (view.name === "employment") return `#employment/${view.employerId}`;
  if (view.name === "requests") {
    return `#requests${view.requestId ? `/${view.requestId}` : ""}`;
  }
  if (view.name === "profile") return "#profile";
  if (view.name === "passbook") {
    return `#passbook/${view.employerId}${view.allowEmployerSelection ? "/all" : ""}`;
  }
  return "#dashboard";
}

const escapeCsvValue = (value) => `"${String(value).replaceAll('"', '""')}"`;

function downloadPassbookCsv(employer, financialYear, entries, totals, t) {
  const headers = [
    t("table.wageMonth"),
    t("table.transactionDate"),
    t("table.epfWages"),
    t("table.epsWages"),
    t("table.employeeShare"),
    t("table.employerShare"),
    t("table.pensionShare"),
  ];
  const rows = entries.map((entry) => [
    entry.wageMonth,
    entry.transactionDate,
    entry.epfWages,
    entry.epsWages,
    entry.employeeShare,
    entry.employerShare,
    entry.pensionShare,
  ]);
  rows.push([
    t("passbook.total", { year: financialYearLabel(financialYear) }),
    "",
    totals.epfWages,
    totals.epsWages,
    totals.employeeShare,
    totals.employerShare,
    totals.pensionShare,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${employer.company.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-fy-${financialYearLabel(financialYear)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Header({ onLogout, currentView = "dashboard", onNavigate }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;
    const closeMenu = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (
        event.type === "pointerdown" &&
        profileMenuRef.current?.contains(event.target)
      )
        return;
      setIsProfileMenuOpen(false);
    };
    document.addEventListener("keydown", closeMenu);
    document.addEventListener("pointerdown", closeMenu);
    return () => {
      document.removeEventListener("keydown", closeMenu);
      document.removeEventListener("pointerdown", closeMenu);
    };
  }, [isProfileMenuOpen]);

  return (
    <header>
      <button
        className="brand brand-button"
        type="button"
        onClick={() => onNavigate?.("dashboard")}
        aria-label="EPFO One home"
      >
        <span>e</span> EPFO <b>one</b>
      </button>
      <nav className="signed-in-nav" aria-label="Primary navigation">
        {["dashboard", "requests", "profile"].map((destination) => (
          <button
            key={destination}
            type="button"
            className={currentView === destination ? "active" : ""}
            aria-current={currentView === destination ? "page" : undefined}
            onClick={() => onNavigate?.(destination)}
          >
            {destination === "dashboard"
              ? "Home"
              : destination[0].toUpperCase() + destination.slice(1)}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <LanguageSelector />
        <div className="profile-menu-wrap" ref={profileMenuRef}>
          <button
            className="profile"
            onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
            aria-label={
              isProfileMenuOpen ? "Close profile menu" : "Open profile menu"
            }
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
          >
            AK
          </button>
          {isProfileMenuOpen && (
            <div className="profile-menu" role="menu" aria-label="Profile menu">
              <div className="profile-menu-summary">
                <span>AK</span>
                <div>
                  <strong>{memberName}</strong>
                  <small>UAN ending •••• {uan.slice(-4)}</small>
                </div>
              </div>
              <div className="profile-menu-options">
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.("profile");
                  }}
                >
                  <span aria-hidden>◉</span> Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.("profile");
                  }}
                >
                  <span aria-hidden>✓</span> KYC
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.("profile");
                  }}
                >
                  <span aria-hidden>⌕</span> Change phone no
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.("profile");
                  }}
                >
                  <span aria-hidden>♧</span> E-Nomination
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.("profile");
                  }}
                >
                  <span aria-hidden>▤</span> UAN Card
                </button>
              </div>
              <button className="profile-menu-logout" onClick={onLogout}>
                <span aria-hidden>↪</span> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNavigation({ currentView, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile primary navigation">
      {[
        ["dashboard", "Home", "⌂"],
        ["requests", "Requests", "◎"],
        ["profile", "Profile", "○"],
      ].map(([destination, label, icon]) => (
        <button
          key={destination}
          type="button"
          className={currentView === destination ? "active" : ""}
          aria-current={currentView === destination ? "page" : undefined}
          onClick={() => onNavigate(destination)}
        >
          <span aria-hidden>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}
function ClaimProgress({ claim }) {
  const [showRejectionDetails, setShowRejectionDetails] = useState(false);

  return (
    <>
      <section className="claim" aria-label={`${claim.type} status`}>
        <div className="claim-title">
          <span className="status-dot" /> Claim status
        </div>
        <ol className="progress">
          {steps.map((step, i) => {
            const isRejected = i === claim.rejectedAt;
            const isComplete = i <= claim.progressStep;
            return (
              <li
                key={step}
                className={
                  isRejected ? "rejected" : isComplete ? "complete" : ""
                }
                style={{ "--step": i }}
              >
                <span>{isRejected ? "×" : isComplete ? "✓" : i + 1}</span>
                <small>{isRejected ? "Rejected by field office" : step}</small>
                {claim.statusDates[i] && <time>{claim.statusDates[i]}</time>}
                {isRejected && (
                  <button
                    className="rejection-link"
                    onClick={() => setShowRejectionDetails(true)}
                  >
                    View rejection reason
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      {showRejectionDetails && (
        <RejectionDetailsModal
          claim={claim}
          onClose={() => setShowRejectionDetails(false)}
        />
      )}
    </>
  );
}

function RejectionDetailsModal({ claim, onClose }) {
  return (
    <div className="modal-backdrop rejection-backdrop" role="presentation">
      <section
        className="modal-card rejection-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rejection-modal-title"
        aria-describedby="rejection-modal-message"
      >
        <span className="rejection-modal-icon" aria-hidden>
          ×
        </span>
        <p className="eyebrow">CLAIM UPDATE</p>
        <h2 id="rejection-modal-title">{claim.rejectionTitle}</h2>
        <p id="rejection-modal-message">{claim.rejectionMessage}</p>
        <small>{claim.rejectionReference}</small>
        <div className="modal-actions">
          <button className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function WithdrawalProgress({ request }) {
  return (
    <section
      className="claim withdrawal-progress"
      aria-label="Withdrawal request status"
    >
      <div className="claim-title">
        <span className="status-dot" /> Withdrawal request
      </div>
      <ol className="progress withdrawal-progress-steps">
        {withdrawalSteps.map((step, index) => (
          <li
            key={step}
            className={index <= request.progressStep ? "complete" : ""}
            style={{ "--step": index }}
          >
            <span>{index <= request.progressStep ? "✓" : index + 1}</span>
            <small>{step}</small>
            {request.statusDates[index] && (
              <time>{request.statusDates[index]}</time>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function TransferClaimModal({
  employer,
  targetEmployer,
  onCancel,
  onContinue,
  onTargetChange,
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">PF TRANSFER</p>
            <h2 id="transfer-modal-title">Transfer your PF balance</h2>
            <p>
              Confirm the source and choose the employer receiving the funds.
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close transfer claim dialog"
          >
            ×
          </button>
        </div>

        <div className="transfer-parties">
          <div className="transfer-party source-party">
            <span className="party-label">From</span>
            <strong>{employer.company}</strong>
            <small>Member ID</small>
            <b>{employer.memberId}</b>
          </div>

          <span className="transfer-arrow" aria-hidden>
            →
          </span>

          <div className="transfer-party target-party">
            <label htmlFor="target-employer">Transfer to</label>
            <select
              id="target-employer"
              value={targetEmployer?.id || ""}
              onChange={(event) =>
                onTargetChange(
                  employers.find(
                    (candidate) => candidate.id === event.target.value,
                  ) || null,
                )
              }
            >
              <option value="">Select an employer</option>
              {employers
                .filter((candidate) => candidate.id !== employer.id)
                .map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.company}
                  </option>
                ))}
            </select>
            {targetEmployer && (
              <div className="selected-member">
                <small>Member ID</small>
                <b>{targetEmployer.memberId}</b>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={!targetEmployer}
            onClick={onContinue}
          >
            Submit
          </button>
        </div>
      </section>
    </div>
  );
}

function ConfirmationModal({ sourceEmployer, targetEmployer, onNo, onYes }) {
  return (
    <div className="modal-backdrop confirmation-backdrop" role="presentation">
      <section
        className="modal-card confirmation-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <span className="confirmation-icon" aria-hidden>
          ?
        </span>
        <h2 id="confirmation-modal-title">Submit transfer claim?</h2>
        <p id="confirmation-modal-description">
          Do you want to submit the claim to transfer funds from{" "}
          <strong>{sourceEmployer.company}</strong> to{" "}
          <strong>{targetEmployer.company}</strong>?
        </p>
        <div className="modal-actions confirmation-actions">
          <button className="secondary" onClick={onNo}>
            No
          </button>
          <button className="primary" onClick={onYes}>
            Yes
          </button>
        </div>
      </section>
    </div>
  );
}

function WithdrawalModal({ employer, form, onCancel, onChange, onContinue }) {
  const eligibleAmount = Math.floor(employer.balance * 0.8);
  const requestedAmount = Number(form.amount);
  const isComplete =
    form.applicationType &&
    form.purpose &&
    requestedAmount > 0 &&
    form.address.trim() &&
    form.state &&
    form.district;
  const canSubmit = Boolean(isComplete);
  const updateField = (field, value) =>
    onChange((current) => ({ ...current, [field]: value }));

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card withdrawal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">ONLINE CLAIM</p>
            <h2 id="withdrawal-modal-title">Withdrawal request</h2>
          </div>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close withdrawal request dialog"
          >
            ×
          </button>
        </div>

        <div className="claimant-summary">
          <div>
            <small>Member name</small>
            <strong>{memberName}</strong>
          </div>
          <div>
            <small>UAN</small>
            <strong>{uan}</strong>
          </div>
        </div>

        <div className="withdrawal-form">
          <label>
            I want to apply for
            <select
              value={form.applicationType}
              onChange={(event) =>
                updateField("applicationType", event.target.value)
              }
            >
              <option value="">Select claim type</option>
              <option value="PF ADVANCE (FORM-31)">PF ADVANCE (FORM-31)</option>
            </select>
          </label>

          <label>
            Purpose for which advance is required
            <select
              value={form.purpose}
              onChange={(event) => updateField("purpose", event.target.value)}
            >
              <option value="">Select purpose</option>
              <option value="Illness">Illness</option>
              <option value="Education">Education</option>
              <option value="Unemployment">Unemployment</option>
            </select>
          </label>

          <label>
            Amount of advance required (in Rs.)
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.amount ? money(Number(form.amount)) : ""}
              onChange={(event) =>
                updateField("amount", event.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter amount"
            />
            <small className="eligible-amount">
              Eligible Claim Amount: Rs {money(eligibleAmount)} (Amount subject
              to change during processing at EPFO office)
            </small>
          </label>

          <label>
            Employee&apos;s address
            <textarea
              rows="3"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Enter complete address"
            />
          </label>

          <div className="location-fields">
            <label>
              State
              <select
                value={form.state}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    state: event.target.value,
                    district: "",
                  }))
                }
              >
                <option value="">Select state</option>
                {Object.keys(locations).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label>
              District
              <select
                value={form.district}
                disabled={!form.state}
                onChange={(event) =>
                  updateField("district", event.target.value)
                }
              >
                <option value="">Select district</option>
                {(locations[form.state] || []).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={!canSubmit}
            onClick={onContinue}
          >
            Submit
          </button>
        </div>
      </section>
    </div>
  );
}

function WithdrawalConfirmationModal({ form, onNo, onYes }) {
  return (
    <div className="modal-backdrop confirmation-backdrop" role="presentation">
      <section
        className="modal-card confirmation-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="withdrawal-confirmation-title"
        aria-describedby="withdrawal-confirmation-description"
      >
        <span className="confirmation-icon" aria-hidden>
          ?
        </span>
        <h2 id="withdrawal-confirmation-title">Submit withdrawal request?</h2>
        <p id="withdrawal-confirmation-description">
          Do you want to submit your {form.applicationType} claim for Rs{" "}
          {money(Number(form.amount))}?
        </p>
        <div className="modal-actions confirmation-actions">
          <button className="secondary" onClick={onNo}>
            No
          </button>
          <button className="primary" onClick={onYes}>
            Yes
          </button>
        </div>
      </section>
    </div>
  );
}

function requestState(request) {
  if (request.status === "rejected" || request.rejectedAt !== undefined) {
    return { label: "Action required", tone: "rejected", priority: 0 };
  }
  const finalStep =
    request.kind === "withdrawal"
      ? withdrawalSteps.length - 1
      : steps.length - 1;
  if (request.progressStep >= finalStep) {
    return { label: "Completed", tone: "complete", priority: 2 };
  }
  return {
    label: request.progressStep === 0 ? "Submitted" : "In progress",
    tone: "progress",
    priority: 1,
  };
}

const sortRequests = (requests) =>
  [...requests].sort((a, b) => {
    const priorityDifference =
      requestState(a).priority - requestState(b).priority;
    if (priorityDifference) return priorityDifference;
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

function initialRequests() {
  const defaults = employers
    .filter((employer) => employer.claim)
    .map((employer) => ({
      ...employer.claim,
      id: `transfer-${employer.id}`,
      kind: "transfer",
      employerId: employer.id,
      status:
        employer.claim.claimStatus === "Rejected"
          ? "rejected"
          : employer.claim.claimStatus === "Processed"
            ? "completed"
            : "progress",
      submittedAt: employer.claim.statusDates[0],
    }));
  try {
    const saved = JSON.parse(
      globalThis.localStorage?.getItem(requestStorageKey),
    );
    return Array.isArray(saved) ? saved : defaults;
  } catch {
    return defaults;
  }
}

function RequestSummary({ request, employer, onTrack }) {
  const state = requestState(request);
  return (
    <article className={`request-summary ${state.tone}`}>
      <div>
        <small>
          {request.kind === "transfer" ? "PF transfer" : "PF withdrawal"}
        </small>
        <strong>{employer.company}</strong>
        <span>Member ID: {employer.memberId}</span>
      </div>
      <div className="request-summary-status">
        <span className={`request-status ${state.tone}`}>{state.label}</span>
        <time>{request.submittedAt}</time>
        <button className="secondary" type="button" onClick={onTrack}>
          Track status
        </button>
      </div>
    </article>
  );
}

function StatusDetailsModal({ request, employer, onClose }) {
  useEffect(() => {
    if (!request) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [request, onClose]);

  if (!request || !employer) return null;
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-card status-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-details-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">REQUEST STATUS</p>
            <h2 id="status-details-title">Status details</h2>
            <p>
              {employer.company} · {employer.memberId}
            </p>
          </div>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close status details"
            autoFocus
          >
            ×
          </button>
        </div>
        {request.kind === "withdrawal" ? (
          <WithdrawalProgress request={request} />
        ) : (
          <ClaimProgress claim={request} />
        )}
      </section>
    </div>
  );
}

function EmployerCard({ employer, request, onSelect }) {
  const state = request ? requestState(request) : null;
  return (
    <article className="employer employer-compact">
      <button
        className="employer-summary employer-select"
        type="button"
        onClick={onSelect}
      >
        <span className="employer-company">
          <span className="avatar">{employer.company[0]}</span>
          <span className="employer-company-copy">
            <strong>{employer.company}</strong>
            <small className="employment-dates">{employer.dates}</small>
            <small className="row-service">
              Total service: {serviceDuration(employer.serviceMonths)}
            </small>
          </span>
        </span>
        <span className="employer-balance">
          <small>Total PF balance</small>
          <strong>{money(employer.balance)}</strong>
          <small className="member">Member ID: {employer.memberId}</small>
        </span>
        <span className="employer-card-end">
          {state && (
            <span className={`request-status ${state.tone}`}>
              {state.label}
            </span>
          )}
          <span className="view-employment">
            View employment <span aria-hidden>→</span>
          </span>
        </span>
      </button>
    </article>
  );
}

function Dashboard({ requests, onLogout, onNavigate, onPassbook }) {
  const combinedBalance = employers.reduce(
    (sum, employer) => sum + employer.balance,
    0,
  );
  const totalServiceMonths = employers.reduce(
    (sum, employer) => sum + employer.serviceMonths,
    0,
  );
  const orderedRequests = sortRequests(requests);
  const actionRequest = orderedRequests.find(
    (request) => requestState(request).tone === "rejected",
  );
  const latestRequests = orderedRequests.slice(0, 2);
  const requestForEmployer = (employerId) =>
    orderedRequests.find((request) => request.employerId === employerId);

  return (
    <>
      <Header
        onLogout={onLogout}
        currentView="dashboard"
        onNavigate={onNavigate}
      />
      <main id="dashboard">
        <div className="welcome">
          <div>
            <p className="eyebrow">MEMBER HOME</p>
            <h1>Good morning, Ananya.</h1>
            <p>
              Start with your balance, then choose an employment when you need
              more detail.
            </p>
          </div>
        </div>
        <section
          className="member-overview overview-simple"
          aria-label="Member overview"
        >
          <div className="total balance-primary">
            <small>Combined PF balance</small>
            <strong>{money(combinedBalance)}</strong>
            <span>Total service · {serviceDuration(totalServiceMonths)}</span>
            <small>UAN ending •••• {uan.slice(-4)}</small>
          </div>
        </section>

        {actionRequest && (
          <section
            className="things-to-do"
            aria-labelledby="things-to-do-title"
          >
            <div>
              <p className="eyebrow">THINGS TO DO</p>
              <h2 id="things-to-do-title">A transfer needs your attention</h2>
              <p>
                Review the field office response before submitting the transfer
                again.
              </p>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() =>
                onNavigate("requests", { requestId: actionRequest.id })
              }
            >
              Review issue
            </button>
          </section>
        )}

        <section className="accounts">
          <div className="accounts-title">
            <div>
              <h2>Your employments</h2>
              <p>Most recent employment first</p>
            </div>
            <span>{employers.length} accounts</span>
          </div>
          {employers.map((employer) => (
            <EmployerCard
              key={employer.id}
              employer={employer}
              request={requestForEmployer(employer.id)}
              onSelect={() =>
                onNavigate("employment", { employerId: employer.id })
              }
            />
          ))}
        </section>

        {latestRequests.length > 0 && (
          <section
            className="recent-requests"
            aria-labelledby="recent-requests-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="recent-requests-title">Recent requests</h2>
                <p>Your latest claim activity</p>
              </div>
              <button
                className="link-button"
                type="button"
                onClick={() => onNavigate("requests")}
              >
                View all requests
              </button>
            </div>
            {latestRequests.map((request) => (
              <RequestSummary
                key={request.id}
                request={request}
                employer={employers.find(
                  (item) => item.id === request.employerId,
                )}
                onTrack={() =>
                  onNavigate("requests", { requestId: request.id })
                }
              />
            ))}
          </section>
        )}

        <button
          id="passbook"
          className="passbook"
          onClick={() => onPassbook(employers[0], true)}
        >
          <span>▤</span>
          <span>
            <strong>View complete passbook</strong>
            <small>All contributions and transactions in one place</small>
          </span>
          <b>→</b>
        </button>
      </main>
    </>
  );
}

function EmploymentDetails({
  employer,
  requests,
  onLogout,
  onNavigate,
  onPassbook,
  onSubmitRequest,
}) {
  const [transferEmployer, setTransferEmployer] = useState(null);
  const [targetEmployer, setTargetEmployer] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [withdrawEmployer, setWithdrawEmployer] = useState(null);
  const [withdrawalForm, setWithdrawalForm] = useState(emptyWithdrawalForm);
  const [showWithdrawalConfirmation, setShowWithdrawalConfirmation] =
    useState(false);
  const employerRequests = sortRequests(
    requests.filter((request) => request.employerId === employer.id),
  );
  const transferRequest = employerRequests.find(
    (request) => request.kind === "transfer",
  );
  const transferCanBeRetried =
    transferRequest && requestState(transferRequest).tone === "rejected";
  const withdrawalRequest = employerRequests.find(
    (request) => request.kind === "withdrawal",
  );

  const cancelTransfer = () => {
    setTransferEmployer(null);
    setTargetEmployer(null);
    setShowConfirmation(false);
  };
  const cancelWithdrawal = () => {
    setWithdrawEmployer(null);
    setWithdrawalForm(emptyWithdrawalForm);
    setShowWithdrawalConfirmation(false);
  };
  const date = () =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

  const submitTransfer = () => {
    const source = transferEmployer;
    const request = {
      id: `transfer-${source.id}-${Date.now()}`,
      kind: "transfer",
      type: "Transfer claim",
      employerId: source.id,
      destinationEmployerId: targetEmployer.id,
      status: "submitted",
      claimStatus: "Submitted",
      progressStep: 0,
      submittedAt: date(),
      statusDates: [date()],
    };
    cancelTransfer();
    onSubmitRequest(request);
  };
  const submitWithdrawal = () => {
    const source = withdrawEmployer;
    const request = {
      id: `withdrawal-${source.id}-${Date.now()}`,
      kind: "withdrawal",
      type: "Withdrawal request",
      employerId: source.id,
      status: "submitted",
      progressStep: 0,
      submittedAt: date(),
      statusDates: [date()],
    };
    cancelWithdrawal();
    onSubmitRequest(request);
  };

  return (
    <>
      <Header
        onLogout={onLogout}
        currentView="employment"
        onNavigate={onNavigate}
      />
      <main className="employment-details-page">
        <button
          className="passbook-back"
          type="button"
          onClick={() => onNavigate("dashboard")}
        >
          <span aria-hidden>←</span> Back to employments
        </button>
        <section className="employment-hero">
          <span className="avatar">{employer.company[0]}</span>
          <div>
            <p className="eyebrow">EMPLOYMENT</p>
            <h1>{employer.company}</h1>
            <p>{employer.dates}</p>
            <strong>Member ID: {employer.memberId}</strong>
          </div>
          <div className="employment-hero-balance">
            <small>Total PF balance</small>
            <strong>{money(employer.balance)}</strong>
            <span>{serviceDuration(employer.serviceMonths)} service</span>
          </div>
        </section>
        <section className="employment-contributions">
          <div className="section-heading">
            <div>
              <h2>Recent contributions</h2>
              <p>Last 3 credited months</p>
            </div>
            <button
              className="contribution-passbook"
              type="button"
              onClick={() => onPassbook(employer, false)}
              aria-label="View complete passbook"
            >
              <span aria-hidden>▤</span>
              <span className="contribution-passbook-label">
                View complete passbook
              </span>
            </button>
          </div>
          <div className="contributions">
            <table>
              <thead>
                <tr>
                  <th>Transaction date</th>
                  <th>Employee share (12%)</th>
                  <th>Employer share (3.67%)</th>
                  <th>Pension share (8.33%)</th>
                </tr>
              </thead>
              <tbody>
                {employer.contributions.map((contribution) => (
                  <tr key={contribution.date}>
                    <th scope="row">{contribution.date}</th>
                    <td>{money(contribution.employee)}</td>
                    <td>{money(contribution.employer)}</td>
                    <td>{money(contribution.pension)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {employerRequests.length > 0 && (
          <section className="employment-requests">
            <div className="section-heading">
              <div>
                <h2>Requests</h2>
                <p>Activity for this employment</p>
              </div>
            </div>
            {employerRequests.map((request) => (
              <RequestSummary
                key={request.id}
                request={request}
                employer={employer}
                onTrack={() =>
                  onNavigate("requests", { requestId: request.id })
                }
              />
            ))}
          </section>
        )}
        <section className="manage-funds" aria-labelledby="manage-funds-title">
          <div>
            <p className="eyebrow">SERVICES</p>
            <h2 id="manage-funds-title">Manage funds</h2>
            <p>Choose a service when you are ready to make a request.</p>
          </div>
          <div className="manage-funds-actions">
            <button
              className="secondary"
              type="button"
              disabled={Boolean(transferRequest) && !transferCanBeRetried}
              onClick={() => setTransferEmployer(employer)}
            >
              {transferCanBeRetried
                ? "Retry transfer"
                : transferRequest
                  ? "Transfer already requested"
                  : "Transfer Amount"}
            </button>
            <button
              className="primary"
              type="button"
              disabled={Boolean(withdrawalRequest)}
              onClick={() => {
                setWithdrawEmployer(employer);
                setWithdrawalForm(emptyWithdrawalForm);
              }}
            >
              {withdrawalRequest
                ? "Withdrawal already requested"
                : "Withdraw Amount"}
            </button>
          </div>
        </section>
      </main>
      {transferEmployer && !showConfirmation && (
        <TransferClaimModal
          employer={transferEmployer}
          targetEmployer={targetEmployer}
          onCancel={cancelTransfer}
          onContinue={() => setShowConfirmation(true)}
          onTargetChange={setTargetEmployer}
        />
      )}
      {transferEmployer && targetEmployer && showConfirmation && (
        <ConfirmationModal
          sourceEmployer={transferEmployer}
          targetEmployer={targetEmployer}
          onNo={() => setShowConfirmation(false)}
          onYes={submitTransfer}
        />
      )}
      {withdrawEmployer && !showWithdrawalConfirmation && (
        <WithdrawalModal
          employer={withdrawEmployer}
          form={withdrawalForm}
          onCancel={cancelWithdrawal}
          onChange={setWithdrawalForm}
          onContinue={() => setShowWithdrawalConfirmation(true)}
        />
      )}
      {withdrawEmployer && showWithdrawalConfirmation && (
        <WithdrawalConfirmationModal
          form={withdrawalForm}
          onNo={() => setShowWithdrawalConfirmation(false)}
          onYes={submitWithdrawal}
        />
      )}
    </>
  );
}

function Requests({ requests, selectedRequestId, onLogout, onNavigate }) {
  const orderedRequests = sortRequests(requests);
  const selectedRequest = requests.find(
    (request) => request.id === selectedRequestId,
  );
  const selectedEmployer =
    selectedRequest &&
    employers.find((employer) => employer.id === selectedRequest.employerId);
  return (
    <>
      <Header
        onLogout={onLogout}
        currentView="requests"
        onNavigate={onNavigate}
      />
      <main className="requests-page">
        <div className="page-heading">
          <p className="eyebrow">REQUESTS</p>
          <h1>Track your requests</h1>
          <p>
            Transfers and withdrawals are kept together, with items needing
            attention shown first.
          </p>
        </div>
        <section className="requests-list" aria-label="Your requests">
          {orderedRequests.length ? (
            orderedRequests.map((request) => (
              <RequestSummary
                key={request.id}
                request={request}
                employer={employers.find(
                  (item) => item.id === request.employerId,
                )}
                onTrack={() =>
                  onNavigate("requests", { requestId: request.id })
                }
              />
            ))
          ) : (
            <div className="empty-state">
              <h2>No requests yet</h2>
              <p>Your transfer and withdrawal requests will appear here.</p>
            </div>
          )}
        </section>
      </main>
      <StatusDetailsModal
        request={selectedRequest}
        employer={selectedEmployer}
        onClose={() => onNavigate("requests")}
      />
    </>
  );
}

function ProfilePage({ onLogout, onNavigate }) {
  const services = ["KYC", "Change phone number", "E-Nomination", "UAN Card"];
  return (
    <>
      <Header
        onLogout={onLogout}
        currentView="profile"
        onNavigate={onNavigate}
      />
      <main className="profile-page">
        <div className="page-heading">
          <p className="eyebrow">PROFILE</p>
          <h1>{memberName}</h1>
          <p>Your member identity and account services.</p>
        </div>
        <section className="profile-identity">
          <span className="avatar">AK</span>
          <div>
            <small>Universal Account Number (UAN)</small>
            <strong>{uan}</strong>
            <span className="verified-pill">
              <span aria-hidden>✓</span> Verified
            </span>
          </div>
        </section>
        <section
          className="profile-services"
          aria-labelledby="profile-services-title"
        >
          <h2 id="profile-services-title">Member services</h2>
          {services.map((service) => (
            <div className="profile-service" key={service}>
              <strong>{service}</strong>
              <span>Coming soon</span>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

function Passbook({
  employer,
  allowEmployerSelection,
  onBack,
  onLogout,
  onNavigate,
}) {
  const { t, formatAmount } = useLanguage();
  const [financialYear, setFinancialYear] = useState(financialYears[0]);
  const [selectedEmployer, setSelectedEmployer] = useState(employer);
  const entries = buildPassbookEntries(selectedEmployer, financialYear);
  const totals = entries.reduce(
    (sum, entry) => ({
      epfWages: sum.epfWages + entry.epfWages,
      epsWages: sum.epsWages + entry.epsWages,
      employeeShare: sum.employeeShare + entry.employeeShare,
      employerShare: sum.employerShare + entry.employerShare,
      pensionShare: sum.pensionShare + entry.pensionShare,
    }),
    {
      epfWages: 0,
      epsWages: 0,
      employeeShare: 0,
      employerShare: 0,
      pensionShare: 0,
    },
  );

  return (
    <>
      <Header
        onLogout={onLogout}
        currentView="passbook"
        onNavigate={onNavigate}
      />
      <main className="passbook-page">
        <button className="passbook-back" onClick={onBack}>
          <span aria-hidden>←</span> Back to employments
        </button>

        <div className="passbook-heading">
          <div>
            <p className="eyebrow">COMPLETE PASSBOOK</p>
            <h1>PF contributions</h1>
            <p>
              Review monthly deposits and annual totals for this employment.
            </p>
          </div>
          <div className="passbook-controls">
            <label className="year-selector">
              <span>Financial year</span>
              <select
                value={financialYear}
                onChange={(event) =>
                  setFinancialYear(Number(event.target.value))
                }
              >
                {financialYears.map((year) => (
                  <option key={year} value={year}>
                    FY {financialYearLabel(year)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="secondary export-passbook"
              type="button"
              onClick={() =>
                downloadPassbookCsv(
                  selectedEmployer,
                  financialYear,
                  entries,
                  totals,
                  t,
                )
              }
            >
              <span aria-hidden>↓</span> Download CSV
            </button>
          </div>
        </div>

        <section className="passbook-employer" aria-label="Selected employer">
          <span className="avatar">{selectedEmployer.company[0]}</span>
          <div className="passbook-employer-details">
            <small>Selected employer</small>
            <strong>{selectedEmployer.company}</strong>
            <span>Member ID: {selectedEmployer.memberId}</span>
          </div>
          {allowEmployerSelection && (
            <label className="employer-selector">
              <span>Choose employer</span>
              <select
                value={selectedEmployer.id}
                onChange={(event) =>
                  setSelectedEmployer(
                    employers.find((item) => item.id === event.target.value),
                  )
                }
              >
                {employers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.company}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        <section
          className="annual-passbook"
          aria-labelledby="annual-table-title"
        >
          <div className="annual-table-heading">
            <div>
              <h2 id="annual-table-title">
                Financial year {financialYearLabel(financialYear)}
              </h2>
              <p>12 contributions from April to March</p>
            </div>
            <span className="entry-count">12 entries</span>
          </div>
          <div className="passbook-table-wrap">
            <table className="passbook-table">
              <thead>
                <tr>
                  <th scope="col">Wage month</th>
                  <th scope="col">Transaction date</th>
                  <th scope="col">EPF wages</th>
                  <th scope="col">EPS wages</th>
                  <th scope="col">Employee share (12%)</th>
                  <th scope="col">Employer share (3.67%)</th>
                  <th scope="col">Pension share (8.33%)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.wageMonth}>
                    <th scope="row">{entry.wageMonth}</th>
                    <td>{entry.transactionDate}</td>
                    <td>{formatAmount(entry.epfWages)}</td>
                    <td>{formatAmount(entry.epsWages)}</td>
                    <td>{formatAmount(entry.employeeShare)}</td>
                    <td>{formatAmount(entry.employerShare)}</td>
                    <td>{formatAmount(entry.pensionShare)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="2" scope="row">
                    Total Contributions for the year (
                    {financialYearLabel(financialYear)})
                  </th>
                  <td>{formatAmount(totals.epfWages)}</td>
                  <td>{formatAmount(totals.epsWages)}</td>
                  <td>{formatAmount(totals.employeeShare)}</td>
                  <td>{formatAmount(totals.employerShare)}</td>
                  <td>{formatAmount(totals.pensionShare)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
function Login({ onVerify }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(false);
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!resendSeconds) return undefined;
    const timer = globalThis.setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => globalThis.clearTimeout(timer);
  }, [resendSeconds]);

  const sendCode = () => {
    setOtp(true);
    setCode("");
    setMessage("A new verification code has been sent.");
    setResendSeconds(30);
  };
  const submit = (e) => {
    e.preventDefault();
    if (!otp) {
      sendCode();
      return;
    }
    if (code.length !== 6) {
      setMessage("Enter the complete six-digit verification code.");
      return;
    }
    onVerify();
  };
  return (
    <main className="login">
      <div className="login-art">
        <a className="brand" href="#">
          {" "}
          <span>e</span> EPFO <b>one</b>
        </a>
        <div>
          <p className="eyebrow">THE MEMBER EXPERIENCE</p>
          <h1>Your PF, simply understood.</h1>
          <p>
            Keep an eye on balances, contributions and claims—without the
            paperwork.
          </p>
        </div>
        <div className="security">
          ⌁ &nbsp; Your information is protected and private.
        </div>
      </div>
      <section className="login-card">
        <LanguageSelector className="login-language-selector" />
        <p className="eyebrow">MEMBER SIGN IN</p>
        <h2>{otp ? "Enter verification code" : "Welcome back"}</h2>
        <p>
          {otp
            ? `We sent a 6-digit code to +91 ${phone}.`
            : "Use your registered mobile number to continue."}
        </p>
        <form onSubmit={submit}>
          {otp ? (
            <label>
              One-time password
              <input
                autoFocus
                inputMode="numeric"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                required
              />
            </label>
          ) : (
            <label>
              Mobile number
              <div className="phone">
                <span>+91</span>
                <input
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </label>
          )}
          <button
            className="primary wide"
            type="submit"
            disabled={otp ? code.length !== 6 : phone.length !== 10}
          >
            {otp ? "Verify & continue" : "Send OTP"} <span>→</span>
          </button>
        </form>
        {message && (
          <p className="login-message" role="status" aria-live="polite">
            {message}
          </p>
        )}
        {otp && (
          <div className="otp-actions">
            <button
              className="link-button resend"
              type="button"
              disabled={resendSeconds > 0}
              onClick={sendCode}
            >
              {resendSeconds > 0
                ? `Resend code in ${resendSeconds}s`
                : "Resend code"}
            </button>
            <button
              className="link-button"
              type="button"
              onClick={() => {
                setOtp(false);
                setCode("");
                setMessage("");
                setResendSeconds(0);
              }}
            >
              Change mobile number
            </button>
          </div>
        )}
        <small className="terms">
          By continuing, you agree to use this service only for your own EPFO
          account.
        </small>
      </section>
    </main>
  );
}

const chatAnswers = [
  {
    keywords: ["balance", "total pf"],
    response:
      "Your combined PF balance is shown at the top of the member dashboard. Open an employment to review its individual balance and contributions.",
  },
  {
    keywords: ["transfer", "claim"],
    response:
      "To transfer PF funds, open the previous employment, go to Manage funds, and select Transfer Amount. Track the submitted request from Requests.",
  },
  {
    keywords: ["withdraw", "advance", "form-31"],
    response:
      "Open an employment, go to Manage funds, and choose Withdraw Amount. After confirmation, track the request from Requests.",
  },
  {
    keywords: ["passbook", "contribution"],
    response:
      "Select View complete passbook to review monthly EPF and EPS wages, employee and employer shares, pension contributions, and financial-year totals.",
  },
  {
    keywords: ["uan", "universal account"],
    response:
      "Your complete Universal Account Number is available in Profile. A masked UAN appears on Home, and the same UAN links your employment member IDs.",
  },
];

function getChatResponse(question) {
  const normalizedQuestion = question.toLowerCase();
  const answer = chatAnswers.find(({ keywords }) =>
    keywords.some((keyword) => normalizedQuestion.includes(keyword)),
  );
  return (
    answer?.response ||
    "I can help with PF balances, contributions, passbooks, transfer claims, withdrawal requests, and UAN details. Try asking about one of these topics."
  );
}

function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hi! I’m the EPFO One assistant. How can I help you today?",
    },
  ]);

  const submitQuestion = (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setMessages((current) => [
      ...current,
      { sender: "user", text: trimmedQuestion },
      { sender: "assistant", text: getChatResponse(trimmedQuestion) },
    ]);
    setQuestion("");
  };

  return (
    <aside className="chat-assistant" aria-label="EPFO One chat assistant">
      {isOpen && (
        <section className="chat-window" aria-label="Chat window">
          <div className="chat-header">
            <div>
              <span className="chat-avatar" aria-hidden>
                e
              </span>
              <div>
                <strong>EPFO One assistant</strong>
                <small>
                  <span aria-hidden /> Online · MVP answers
                </small>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`chat-message ${message.sender}`}
                key={`${message.sender}-${index}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className="chat-form" onSubmit={submitQuestion}>
            <label className="sr-only" htmlFor="chat-question">
              Ask a question
            </label>
            <input
              id="chat-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your PF account…"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Send question"
            >
              <span aria-hidden>➤</span>
            </button>
          </form>
          <small className="chat-disclaimer">
            Mock assistant · Responses are for demonstration only.
          </small>
        </section>
      )}

      <button
        className="chat-bubble"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close EPFO assistant" : "Open EPFO assistant"}
      >
        <span aria-hidden>{isOpen ? "×" : "✦"}</span>
        {!isOpen && <small>Ask EPFO One</small>}
      </button>
    </aside>
  );
}

function App() {
  const { t } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);
  const [view, setView] = useState(viewFromHash);
  const [successMessage, setSuccessMessage] = useState("");
  const [requests, setRequests] = useState(initialRequests);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = globalThis.setTimeout(() => setSuccessMessage(""), 3000);
    return () => globalThis.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(
        requestStorageKey,
        JSON.stringify(requests),
      );
    } catch {
      // The prototype still works when storage is blocked or unavailable.
    }
  }, [requests]);

  useEffect(() => {
    const followBrowserNavigation = () => setView(viewFromHash());
    globalThis.addEventListener?.("hashchange", followBrowserNavigation);
    return () =>
      globalThis.removeEventListener?.("hashchange", followBrowserNavigation);
  }, []);

  const navigate = (name, details = {}) => {
    const nextView = { name, ...details };
    setView(nextView);
    if (globalThis.location) globalThis.location.hash = hashFromView(nextView);
  };
  const logout = () => {
    setSignedIn(false);
    navigate("dashboard");
  };
  const openPassbook = (employer, allowEmployerSelection) =>
    navigate("passbook", {
      employerId: employer.id,
      allowEmployerSelection,
    });
  const submitRequest = (request) => {
    setRequests((current) => [...current, request]);
    setSuccessMessage(
      request.kind === "transfer"
        ? t("request.successTransfer")
        : t("request.successWithdrawal"),
    );
    navigate("requests", { requestId: request.id });
  };

  let page = <Login onVerify={() => setSignedIn(true)} />;
  if (signedIn) {
    if (view.name === "employment") {
      page = (
        <EmploymentDetails
          employer={
            employers.find((employer) => employer.id === view.employerId) ||
            employers[0]
          }
          requests={requests}
          onLogout={logout}
          onNavigate={navigate}
          onPassbook={openPassbook}
          onSubmitRequest={submitRequest}
        />
      );
    } else if (view.name === "requests") {
      page = (
        <Requests
          requests={requests}
          selectedRequestId={view.requestId}
          onLogout={logout}
          onNavigate={navigate}
        />
      );
    } else if (view.name === "profile") {
      page = <ProfilePage onLogout={logout} onNavigate={navigate} />;
    } else if (view.name === "passbook") {
      page = (
        <Passbook
          employer={
            employers.find((employer) => employer.id === view.employerId) ||
            employers[0]
          }
          allowEmployerSelection={view.allowEmployerSelection}
          onBack={() =>
            navigate(view.allowEmployerSelection ? "dashboard" : "employment", {
              employerId: view.employerId,
            })
          }
          onLogout={logout}
          onNavigate={navigate}
        />
      );
    } else {
      page = (
        <Dashboard
          requests={requests}
          onPassbook={openPassbook}
          onLogout={logout}
          onNavigate={navigate}
        />
      );
    }
  }

  return (
    <>
      {page}
      {signedIn && (
        <MobileNavigation currentView={view.name} onNavigate={navigate} />
      )}
      {signedIn && <ChatAssistant />}
      {successMessage && (
        <div className="success-toast" role="status" aria-live="polite">
          <span aria-hidden>✓</span> {successMessage}
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);

// Translation catalogue source copy retained for regression discovery:
// Transfer claim submitted successfully. Withdrawal request submitted successfully.
