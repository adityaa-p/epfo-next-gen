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
  return (
    <header>
      <a className="brand" href="#dashboard" aria-label="EPFO One home">
        <span>e</span> EPFO <b>one</b>
      </a>
      <button className="profile" onClick={onLogout} aria-label="Log out">
        AK
      </button>
    </header>
  );
}
function ClaimProgress({ claim }) {
  return (
    <section className="claim" aria-label={`${claim.type} status`}>
      <div className="claim-title">
        <span className="status-dot" /> {claim.type}
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
    requestedAmount <= eligibleAmount &&
    form.address.trim() &&
    form.state &&
    form.district;
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
              value={form.amount}
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
            disabled={!isComplete}
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
  expanded,
  isTrackingClaim,
  onToggle,
  onPassbook,
  onTrackClaim,
  onTransferClaim,
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
          <div className="detail-passbook-row">
            <button className="detail-passbook" onClick={onPassbook}>
              <span aria-hidden>▤</span> View complete passbook{" "}
              <span aria-hidden>→</span>
            </button>
          </div>
          {isTrackingClaim && <ClaimProgress claim={claim} />}
          <div className="actions">
            {claim ? (
              <button className="secondary" onClick={onTrackClaim}>
                {isTrackingClaim ? "Hide claim progress" : "Track claim"}
              </button>
            ) : (
              <button className="secondary" onClick={onTransferClaim}>
                Transfer Claim
              </button>
            )}
            <button className="primary" onClick={onWithdrawalRequest}>
              Withdrawal Request
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
function Dashboard({ onLogout, onPassbook }) {
  const [open, setOpen] = useState("u112");
  const [trackedClaim, setTrackedClaim] = useState(null);
  const [submittedClaims, setSubmittedClaims] = useState({});
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
    setSuccessMessage("Withdrawal request submitted successfully.");
    cancelWithdrawal();
  };

  return (
    <>
      <Header onLogout={onLogout} />
      <main id="dashboard">
        <section className="uan-banner" aria-label="Universal Account Number">
          <div>
            <small>Universal Account Number (UAN)</small>
            <strong>{uan}</strong>
          </div>
          <span>
            <span aria-hidden>✓</span> Verified
          </span>
        </section>
        <div className="welcome">
          <div>
            <p className="eyebrow">MEMBER HOME</p>
            <h1>Good morning, Ananya.</h1>
            <p>Here’s a clear view of your provident fund accounts.</p>
          </div>
          <div className="dashboard-summary">
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
        </div>
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
              expanded={open === employer.id}
              isTrackingClaim={trackedClaim === employer.id}
              onToggle={() =>
                setOpen(open === employer.id ? null : employer.id)
              }
              onPassbook={onPassbook}
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
              onTrackClaim={() =>
                setTrackedClaim(
                  trackedClaim === employer.id ? null : employer.id,
                )
              }
            />
          ))}
        </section>
        <button id="passbook" className="passbook" onClick={onPassbook}>
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
function Passbook({ onBack, onLogout }) {
  return (
    <>
      <Header onLogout={onLogout} />
      <main className="placeholder">
        <p className="eyebrow">PASSBOOK</p>
        <h1>Your complete passbook</h1>
        <p>
          This is where every contribution, transfer and withdrawal transaction
          will appear.
        </p>
        <div className="placeholder-icon">▤</div>
        <button className="secondary" onClick={onBack}>
          ← Back to employments
        </button>
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
function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [passbook, setPassbook] = useState(false);
  if (!signedIn) return <Login onVerify={() => setSignedIn(true)} />;
  return passbook ? (
    <Passbook
      onBack={() => setPassbook(false)}
      onLogout={() => setSignedIn(false)}
    />
  ) : (
    <Dashboard
      onPassbook={() => setPassbook(true)}
      onLogout={() => setSignedIn(false)}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);
