import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

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

function Header({ onLogout }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header>
      <a className="brand" href="#dashboard" aria-label="EPFO One home">
        <span>e</span> EPFO <b>one</b>
      </a>
      <div className="profile-menu-wrap">
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
                <small>UAN · {uan}</small>
              </div>
            </div>
            <div className="profile-menu-options">
              <button
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <span aria-hidden>◉</span> Profile
              </button>
              <button
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <span aria-hidden>✓</span> KYC
              </button>
              <button
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <span aria-hidden>⌕</span> Change phone no
              </button>
              <button
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <span aria-hidden>♧</span> E-Nomination
              </button>
              <button
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
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
    </header>
  );
}
function ClaimProgress({ claim }) {
  return (
    <section className="claim" aria-label={`${claim.type} status`}>
      <div className="claim-title">
        <span className="status-dot" /> Claim status
      </div>
      <ol className="progress">
        {steps.map((step, i) => (
          <li
            key={step}
            className={i <= claim.progressStep ? "complete" : ""}
            style={{ "--step": i }}
          >
            <span>{i <= claim.progressStep ? "✓" : i + 1}</span>
            <small>{step}</small>
            {claim.statusDates[i] && <time>{claim.statusDates[i]}</time>}
          </li>
        ))}
      </ol>
    </section>
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

function EmployerCard({
  employer,
  claim,
  withdrawalRequest,
  expanded,
  isTrackingClaim,
  isTrackingWithdrawal,
  onToggle,
  onPassbook,
  onTrackClaim,
  onTransferClaim,
  onTrackWithdrawal,
  onWithdrawalRequest,
}) {
  return (
    <article className={`employer ${expanded ? "open" : ""}`}>
      <button
        className="employer-summary"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className="company">
          <span className="avatar">{employer.company[0]}</span>
          <span>
            <strong>{employer.company}</strong>
            <small className="employment-dates">{employer.dates}</small>
            <small className="row-service">
              Total service: {serviceDuration(employer.serviceMonths)}
            </small>
          </span>
        </div>
        <div className="balance">
          <small>Total PF balance</small>
          <strong>{money(employer.balance)}</strong>
          <small className="member">Member ID: {employer.memberId}</small>
        </div>
        <span className="chevron" aria-hidden>
          ⌄
        </span>
      </button>
      {expanded && (
        <div className="detail">
          <div className="section-heading">
            <div>
              <h3>Recent contributions</h3>
              <p>Last 3 credited months</p>
            </div>
            <button
              className="contribution-passbook"
              onClick={onPassbook}
              aria-label="View complete passbook"
            >
              <span className="contribution-passbook-icon" aria-hidden>
                ▤
              </span>
              <span className="contribution-passbook-label">
                View complete passbook
              </span>
            </button>
          </div>
          <div className="contributions">
            <table>
              <thead>
                <tr>
                  <th scope="col">Transaction date</th>
                  <th scope="col">Employee share (12%)</th>
                  <th scope="col">Employer share (3.67%)</th>
                  <th scope="col">Pension share (8.33%)</th>
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
          {isTrackingClaim && <ClaimProgress claim={claim} />}
          {isTrackingWithdrawal && (
            <WithdrawalProgress request={withdrawalRequest} />
          )}
          <div className="actions">
            {claim ? (
              <button className="secondary" onClick={onTrackClaim}>
                {isTrackingClaim ? "Hide claim progress" : "Track claim"}
              </button>
            ) : (
              <button className="secondary" onClick={onTransferClaim}>
                Transfer Amount
              </button>
            )}
            {withdrawalRequest ? (
              <button className="primary" onClick={onTrackWithdrawal}>
                {isTrackingWithdrawal
                  ? "Hide request progress"
                  : "Track request progress"}
              </button>
            ) : (
              <button className="primary" onClick={onWithdrawalRequest}>
                Withdraw Amount
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
function Dashboard({ onLogout, onPassbook }) {
  const [open, setOpen] = useState("u112");
  const [trackedClaim, setTrackedClaim] = useState(null);
  const [trackedWithdrawal, setTrackedWithdrawal] = useState(null);
  const [submittedClaims, setSubmittedClaims] = useState({});
  const [withdrawalRequests, setWithdrawalRequests] = useState({});
  const [transferEmployer, setTransferEmployer] = useState(null);
  const [targetEmployer, setTargetEmployer] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [withdrawEmployer, setWithdrawEmployer] = useState(null);
  const [withdrawalForm, setWithdrawalForm] = useState(emptyWithdrawalForm);
  const [showWithdrawalConfirmation, setShowWithdrawalConfirmation] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const combinedBalance = employers.reduce(
    (sum, employer) => sum + employer.balance,
    0,
  );
  const totalServiceMonths = employers.reduce(
    (sum, employer) => sum + employer.serviceMonths,
    0,
  );
  const totalYears = Math.floor(totalServiceMonths / 12);
  const remainingMonths = totalServiceMonths % 12;

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = globalThis.setTimeout(() => setSuccessMessage(""), 3000);
    return () => globalThis.clearTimeout(timeout);
  }, [successMessage]);

  const cancelTransfer = () => {
    setTransferEmployer(null);
    setTargetEmployer(null);
    setShowConfirmation(false);
  };

  const submitTransferClaim = () => {
    const submissionDate = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
    const claim = {
      type: "Transfer claim",
      claimStatus: "Submitted",
      progressStep: 0,
      statusDates: [submissionDate],
      targetEmployerId: targetEmployer.id,
    };

    setSubmittedClaims((claims) => ({
      ...claims,
      [transferEmployer.id]: claim,
    }));
    setTrackedClaim(transferEmployer.id);
    setSuccessMessage("Transfer claim submitted successfully.");
    cancelTransfer();
  };

  const cancelWithdrawal = () => {
    setWithdrawEmployer(null);
    setWithdrawalForm(emptyWithdrawalForm);
    setShowWithdrawalConfirmation(false);
  };

  const submitWithdrawalRequest = () => {
    const submissionDate = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
    setWithdrawalRequests((requests) => ({
      ...requests,
      [withdrawEmployer.id]: {
        type: "Withdrawal request",
        progressStep: 0,
        statusDates: [submissionDate],
      },
    }));
    setTrackedWithdrawal(withdrawEmployer.id);
    setSuccessMessage("Withdrawal request submitted successfully.");
    cancelWithdrawal();
  };

  return (
    <>
      <Header onLogout={onLogout} />
      <main id="dashboard">
        <div className="welcome">
          <div>
            <p className="eyebrow">MEMBER HOME</p>
            <h1>Good morning, Ananya.</h1>
            <p>Here’s a clear view of your provident fund accounts.</p>
          </div>
        </div>
        <section className="member-overview" aria-label="Member overview">
          <div className="overview-metrics">
            <div className="total">
              <small>Combined balance</small>
              <strong>{money(combinedBalance)}</strong>
            </div>
            <div className="total experience">
              <small>Total experience</small>
              <strong>
                {totalYears} years {remainingMonths} months
              </strong>
            </div>
          </div>
          <div className="overview-uan">
            <div className="overview-uan-icon" aria-hidden>
              U
            </div>
            <div>
              <small>Universal Account Number (UAN)</small>
              <strong>{uan}</strong>
            </div>
            <span className="verified-pill">
              <span aria-hidden>✓</span> Verified
            </span>
          </div>
        </section>
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
              claim={submittedClaims[employer.id] || employer.claim}
              withdrawalRequest={withdrawalRequests[employer.id]}
              expanded={open === employer.id}
              isTrackingClaim={trackedClaim === employer.id}
              isTrackingWithdrawal={trackedWithdrawal === employer.id}
              onToggle={() =>
                setOpen(open === employer.id ? null : employer.id)
              }
              onPassbook={() => onPassbook(employer, false)}
              onTransferClaim={() => {
                setTransferEmployer(employer);
                setTargetEmployer(null);
                setShowConfirmation(false);
              }}
              onWithdrawalRequest={() => {
                setWithdrawEmployer(employer);
                setWithdrawalForm(emptyWithdrawalForm);
                setShowWithdrawalConfirmation(false);
              }}
              onTrackWithdrawal={() =>
                setTrackedWithdrawal(
                  trackedWithdrawal === employer.id ? null : employer.id,
                )
              }
              onTrackClaim={() =>
                setTrackedClaim(
                  trackedClaim === employer.id ? null : employer.id,
                )
              }
            />
          ))}
        </section>
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
        {successMessage && (
          <div className="success-toast" role="status" aria-live="polite">
            <span aria-hidden>✓</span> {successMessage}
          </div>
        )}
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
          onYes={submitTransferClaim}
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
          onYes={submitWithdrawalRequest}
        />
      )}
    </>
  );
}
function Passbook({ employer, allowEmployerSelection, onBack, onLogout }) {
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
      <Header onLogout={onLogout} />
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
          <label className="year-selector">
            <span>Financial year</span>
            <select
              value={financialYear}
              onChange={(event) => setFinancialYear(Number(event.target.value))}
            >
              {financialYears.map((year) => (
                <option key={year} value={year}>
                  FY {financialYearLabel(year)}
                </option>
              ))}
            </select>
          </label>
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
                    <td>{money(entry.epfWages)}</td>
                    <td>{money(entry.epsWages)}</td>
                    <td>{money(entry.employeeShare)}</td>
                    <td>{money(entry.employerShare)}</td>
                    <td>{money(entry.pensionShare)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="2" scope="row">
                    Total Contributions for the year (
                    {financialYearLabel(financialYear)})
                  </th>
                  <td>{money(totals.epfWages)}</td>
                  <td>{money(totals.epsWages)}</td>
                  <td>{money(totals.employeeShare)}</td>
                  <td>{money(totals.employerShare)}</td>
                  <td>{money(totals.pensionShare)}</td>
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
  const submit = (e) => {
    e.preventDefault();
    otp ? code.length === 6 && onVerify() : setOtp(true);
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
          <button className="primary wide" type="submit">
            {otp ? "Verify & continue" : "Send OTP"} <span>→</span>
          </button>
        </form>
        {otp && (
          <button className="link-button resend" onClick={() => setCode("")}>
            Resend code
          </button>
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
      "Your combined PF balance is shown at the top of the member dashboard. Expand an employer to review its individual balance and contributions.",
  },
  {
    keywords: ["transfer", "claim"],
    response:
      "To transfer PF funds, expand the previous employer, select Transfer Amount, choose the destination employer, and confirm the request. You can track it from the same row after submission.",
  },
  {
    keywords: ["withdraw", "advance", "form-31"],
    response:
      "Expand an employer and choose Withdraw Amount. Complete the PF Advance form, review the eligible amount, and confirm the submission. A tracking action appears after it is submitted.",
  },
  {
    keywords: ["passbook", "contribution"],
    response:
      "Select View complete passbook to review monthly EPF and EPS wages, employee and employer shares, pension contributions, and financial-year totals.",
  },
  {
    keywords: ["uan", "universal account"],
    response:
      "Your verified Universal Account Number is displayed prominently at the top of the dashboard. The same UAN links your employment member IDs.",
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
  const [signedIn, setSignedIn] = useState(false);
  const [passbookView, setPassbookView] = useState(null);
  let page = <Login onVerify={() => setSignedIn(true)} />;

  if (signedIn && passbookView) {
    page = (
      <Passbook
        employer={passbookView.employer}
        allowEmployerSelection={passbookView.allowEmployerSelection}
        onBack={() => setPassbookView(null)}
        onLogout={() => setSignedIn(false)}
      />
    );
  } else if (signedIn) {
    page = (
      <Dashboard
        onPassbook={(employer, allowEmployerSelection) =>
          setPassbookView({ employer, allowEmployerSelection })
        }
        onLogout={() => setSignedIn(false)}
      />
    );
  }

  return (
    <>
      {page}
      <ChatAssistant />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
