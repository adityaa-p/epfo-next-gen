import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const employers = [
  {
    id: "u112",
    company: "Northstar Technologies Pvt. Ltd.",
    dates: "Jan 2022 — Present",
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
    dates: "Apr 2019 — Dec 2021",
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
    dates: "Jul 2016 — Mar 2019",
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
const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);

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
            <time>{claim.statusDates[i]}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}
function EmployerCard({
  employer,
  expanded,
  isTrackingClaim,
  onToggle,
  onPassbook,
  onTrackClaim,
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
            <small>{employer.dates}</small>
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
          {isTrackingClaim && <ClaimProgress claim={employer.claim} />}
          <div className="actions">
            {employer.balance === 0 &&
            employer.claim?.claimStatus === "Processed" ? (
              <button className="secondary" onClick={onTrackClaim}>
                {isTrackingClaim ? "Hide claim progress" : "Track claim"}
              </button>
            ) : (
              <button className="secondary">Transfer Claim</button>
            )}
            <button className="primary">Withdrawal Request</button>
          </div>
        </div>
      )}
    </article>
  );
}
function Dashboard({ onLogout, onPassbook }) {
  const [open, setOpen] = useState("u112");
  const [trackedClaim, setTrackedClaim] = useState(null);
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
              expanded={open === employer.id}
              isTrackingClaim={trackedClaim === employer.id}
              onToggle={() =>
                setOpen(open === employer.id ? null : employer.id)
              }
              onPassbook={onPassbook}
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
      </main>
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
