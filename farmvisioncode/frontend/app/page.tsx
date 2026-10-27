import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Observe",
    description: "Bring farm and sensor observations into one clear view.",
  },
  {
    number: "02",
    title: "Understand",
    description: "Review transparent alerts with the measurements behind them.",
  },
  {
    number: "03",
    title: "Decide",
    description: "Use practical, human-reviewed prompts to guide next steps.",
  },
];

export default function Page() {
  return (
    <main className="landing-page">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FarmVision<span className="brand-ai"> AI</span></span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-login" href="/login">Sign in</Link>
          <Link className="primary-button nav-register" href="/register">Create account</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span /> AGRICULTURAL INTELLIGENCE</p>
          <h1>Better farm decisions start with <em>clearer signals.</em></h1>
          <p className="hero-description">
            FarmVision brings farm records and sensor observations together,
            helping farmers understand what is happening and decide what to
            check next.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/register">Get started <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/login">I already have an account</Link>
          </div>
          <p className="hero-note">Designed for farmers · Transparent prototype insights · Human-led decisions</p>
        </div>

        <div className="hero-visual" aria-label="Illustration of connected farm observations">
          <div className="visual-sun" />
          <div className="visual-hill hill-back" />
          <div className="visual-hill hill-front" />
          <div className="visual-card">
            <div className="visual-card-heading">
              <span className="status-dot" />
              <span>Farm snapshot</span>
              <span className="snapshot-label">DEMO VIEW</span>
            </div>
            <div className="snapshot-metrics">
              <div><span>Feed level</span><strong>Observation</strong><small>Review latest reading</small></div>
              <div><span>Water supply</span><strong>Observation</strong><small>Check source device</small></div>
            </div>
            <div className="snapshot-footer"><span>Signals inform decisions</span><span aria-hidden="true">↗</span></div>
          </div>
          <div className="visual-stem stem-one" />
          <div className="visual-stem stem-two" />
          <div className="visual-stem stem-three" />
        </div>
      </section>

      <section className="capabilities-section">
        <div className="section-heading">
          <p className="eyebrow">A PRACTICAL STARTING POINT</p>
          <h2>From observation to informed action</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article className="capability-card" key={capability.number}>
              <span>{capability.number}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
        <p className="prototype-disclaimer">
          FarmVision is under active development. Sensor thresholds and recommendations are prototypes,
          not validated agronomic or veterinary guidance; no device actions are executed automatically.
        </p>
      </section>

      <footer className="site-footer">
        <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">F</span><span>FarmVision AI</span></Link>
        <span>Agricultural intelligence, built around the farmer.</span>
      </footer>
    </main>
  );
}
