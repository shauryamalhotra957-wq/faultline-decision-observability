"use client";

import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  contradictionEdges,
  decisionSignals,
  evidenceCorpus,
} from "../lib/demo-data";
import { rankEvidence, simulateDecision } from "../lib/engine";
import type {
  RetrievalResult,
  SimulationInput,
  SimulationResult,
} from "../lib/types";

const defaultInput: SimulationInput = {
  adoption: 67,
  priceDelta: 8,
  capacity: 88,
  retention: 91,
};

type PersistedDecision = {
  id: string;
  title: string;
  owner: string;
  domain: string;
  confidence: number;
  status: string;
  decisionHash?: string;
  createdAt: string;
};

const navItems = [
  ["radar", "01", "Fault radar"],
  ["lab", "02", "Scenario lab"],
  ["evidence", "03", "Evidence mesh"],
  ["ledger", "04", "Decision ledger"],
] as const;

function formatMoney(value: number) {
  const sign = value < 0 ? "−" : "+";
  return `${sign}$${Math.abs(value).toFixed(1)}M`;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function FaultlineApp() {
  const [input, setInput] = useState(defaultInput);
  const [simulation, setSimulation] = useState<SimulationResult>(() =>
    simulateDecision(defaultInput),
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanVersion, setScanVersion] = useState(41);
  const [query, setQuery] = useState("What blocks a safe EMEA launch?");
  const [retrieval, setRetrieval] = useState<RetrievalResult[]>(() =>
    rankEvidence("EMEA security launch", evidenceCorpus, 3),
  );
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [savedDecisions, setSavedDecisions] = useState<PersistedDecision[]>([]);
  const [apiState, setApiState] = useState<"checking" | "connected" | "local">("checking");

  useEffect(() => {
    let active = true;
    fetch("/api/decisions")
      .then(async (response) => {
        if (!response.ok) throw new Error("Persistence unavailable");
        return (await response.json()) as { decisions: PersistedDecision[] };
      })
      .then((payload) => {
        if (!active) return;
        setSavedDecisions(payload.decisions);
        setApiState("connected");
      })
      .catch(() => active && setApiState("local"));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const strongestFault = decisionSignals[0];
  const evidenceCoverage = useMemo(
    () =>
      Math.round(
        decisionSignals.reduce((sum, item) => sum + item.evidenceCoverage, 0) /
          decisionSignals.length,
      ),
    [],
  );

  function updateInput(key: keyof SimulationInput, value: number) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function runSimulation() {
    setIsSimulating(true);
    const optimistic = simulateDecision(input, 71071 + scanVersion);
    setSimulation(optimistic);
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, seed: 71071 + scanVersion }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { result: SimulationResult };
        setSimulation(payload.result);
      }
      setToast("5,000 counterfactual paths resolved");
    } catch {
      setToast("Simulation completed locally");
    } finally {
      setIsSimulating(false);
    }
  }

  function runScan() {
    setIsScanning(true);
    window.setTimeout(() => {
      setScanVersion((version) => version + 1);
      setIsScanning(false);
      setToast("14,208 belief edges rescanned · 4 fault lines active");
    }, 1050);
  }

  async function retrieveEvidence(event?: FormEvent) {
    event?.preventDefault();
    if (query.trim().length < 2) return;
    setIsRetrieving(true);
    try {
      const response = await fetch("/api/retrieve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error("Retrieval failed");
      const payload = (await response.json()) as { results: RetrievalResult[] };
      setRetrieval(payload.results);
      setToast(`${payload.results.length} evidence packets reranked`);
    } catch {
      const results = rankEvidence(query, evidenceCorpus, 4);
      setRetrieval(results);
      setToast("Evidence mesh searched locally");
    } finally {
      setIsRetrieving(false);
    }
  }

  async function commitDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      context: form.get("context"),
      owner: form.get("owner"),
      domain: form.get("domain"),
      confidence: Number(form.get("confidence")),
    };
    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        decision?: PersistedDecision;
        error?: string;
      };
      if (!response.ok || !result.decision) {
        throw new Error(result.error || "Commit failed");
      }
      setSavedDecisions((current) => [result.decision!, ...current]);
      setApiState("connected");
      setModalOpen(false);
      setToast(`Decision ${result.decision.id} sealed to the ledger`);
    } catch {
      setToast("Persistent ledger is unavailable in this runtime");
    }
  }

  function closeModal(event: MouseEvent<HTMLDivElement>) {
    if (event.currentTarget === event.target) setModalOpen(false);
  }

  return (
    <main className="app-shell">
      <header className="command-bar">
        <button className="brand-lockup" onClick={() => scrollToSection("top")} aria-label="Faultline home">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span>FAULTLINE</span>
          <small>DECISION OBSERVABILITY</small>
        </button>
        <div className="system-strip" aria-label="System status">
          <span><i className="status-dot" />SYSTEM NOMINAL</span>
          <span className="desktop-only">GRAPH <b>14,208</b> EDGES</span>
          <span className="desktop-only">SCAN <b>V.{scanVersion}</b></span>
          <span className={`persistence-state ${apiState}`}>
            {apiState === "connected" ? "D1 LIVE" : apiState === "checking" ? "SYNCING" : "DEMO MODE"}
          </span>
        </div>
        <button className="primary-button compact" onClick={() => setModalOpen(true)}>
          <span>COMMIT DECISION</span><b>↗</b>
        </button>
      </header>

      <aside className="side-rail" aria-label="Primary navigation">
        <nav>
          {navItems.map(([id, number, label]) => (
            <button key={id} onClick={() => scrollToSection(id)}>
              <span>{number}</span>{label}
            </button>
          ))}
        </nav>
        <div className="rail-footer">
          <span>TEAM CALIBRATION</span>
          <strong>0.82</strong>
          <div className="calibration-track"><i style={{ width: "82%" }} /></div>
          <small>↑ 6.4% / 90D</small>
        </div>
      </aside>

      <div className="main-canvas" id="top">
        <section className="hero-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span>NEW CATEGORY</span> DECISION OBSERVABILITY</div>
            <h1 id="hero-title">Find the fault line <em>before</em> the company breaks.</h1>
            <p>
              FAULTLINE maps what your organization believes, catches contradictions as reality shifts,
              and stress-tests consequential decisions against evidence—not confidence theater.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => scrollToSection("radar")}>
                ENTER CONTROL ROOM <b>↘</b>
              </button>
              <button className="text-button" onClick={() => scrollToSection("lab")}>
                RUN COUNTERFACTUAL <span>→</span>
              </button>
            </div>
            <div className="hero-proof">
              <div><strong>14,208</strong><span>belief edges tracked</span></div>
              <div><strong>4</strong><span>active contradictions</span></div>
              <div><strong>72%</strong><span>evidence coverage</span></div>
            </div>
          </div>

          <div className={`seismic-card ${isScanning ? "scanning" : ""}`}>
            <div className="panel-kicker">
              <span>LIVE FAULT SCAN</span>
              <span>07:22:16 IST</span>
            </div>
            <div className="seismic-field" aria-label="Belief contradiction map">
              <div className="scan-beam" />
              <div className="axis-label axis-y">CONTRADICTION</div>
              <div className="axis-label axis-x">BUSINESS IMPACT →</div>
              <span className="grid-coordinate x1">10</span><span className="grid-coordinate x2">50</span><span className="grid-coordinate x3">90</span>
              <div className="link-line line-one" /><div className="link-line line-two" /><div className="link-line line-three" />
              <button className="signal-node critical-node" onClick={() => scrollToSection("radar")} aria-label="EMEA launch critical signal">
                <i /><span>EMEA LAUNCH</span><b>92</b>
              </button>
              <div className="signal-node watch-node"><i /><span>PRICING</span><b>74</b></div>
              <div className="signal-node ops-node"><i /><span>SUPPORT</span><b>61</b></div>
              <div className="signal-node stable-node"><i /><span>INFERENCE</span><b>31</b></div>
              <div className="epicenter-ring ring-one" /><div className="epicenter-ring ring-two" />
            </div>
            <div className="scan-footer">
              <div><span>PEAK TENSION</span><strong>92 / 100</strong></div>
              <div><span>DRIFT VELOCITY</span><strong className="risk-text">+18%</strong></div>
              <button onClick={runScan} disabled={isScanning}>{isScanning ? "SCANNING…" : "RESCAN GRAPH"}</button>
            </div>
          </div>
        </section>

        <section className="metric-ribbon" aria-label="Decision system summary">
          <div><span>PORTFOLIO AT RISK</span><strong>$18.7M</strong><small>3 high-impact decisions</small></div>
          <div><span>ASSUMPTION DRIFT</span><strong className="risk-text">+12.4%</strong><small>past 30 days</small></div>
          <div><span>EVIDENCE COVERAGE</span><strong>{evidenceCoverage}%</strong><small>↑ 9 points this cycle</small></div>
          <div><span>CALIBRATION SCORE</span><strong>0.82</strong><small>top decile / operators</small></div>
          <div className="ribbon-action"><button onClick={() => scrollToSection("ledger")}>VIEW SYSTEM LEDGER ↗</button></div>
        </section>

        <section className="workspace-section" id="radar">
          <div className="section-heading">
            <div><span>01 / FAULT RADAR</span><h2>Where strategy and reality diverge.</h2></div>
            <div className="heading-meta"><span>LAST INGEST</span><b>6 min ago</b><span>SOURCES</span><b>83 verified</b></div>
          </div>
          <div className="radar-layout">
            <div className="fault-stack">
              {decisionSignals.map((signal, index) => (
                <article className={`fault-row ${signal.status}`} key={signal.id}>
                  <div className="fault-rank">0{index + 1}</div>
                  <div className="fault-main">
                    <div className="fault-tags"><span>{signal.id}</span><span>{signal.domain}</span><span>{signal.status}</span></div>
                    <h3>{signal.title}</h3>
                    <p>{signal.summary}</p>
                    <div className="fault-owner"><span className="avatar">{signal.owner.split(" ").map((word) => word[0]).join("")}</span>{signal.owner}<i />DECISION IN {signal.due}</div>
                  </div>
                  <div className="fault-metrics">
                    <div className="tension-gauge" style={{ "--value": `${signal.tension * 3.6}deg` } as CSSProperties}>
                      <strong>{signal.tension}</strong><span>TENSION</span>
                    </div>
                    <div className="micro-metrics">
                      <span>EVIDENCE <b>{signal.evidenceCoverage}%</b></span>
                      <span>DRIFT <b className={signal.drift > 0 ? "risk-text" : "safe-text"}>{signal.drift > 0 ? "+" : ""}{signal.drift}%</b></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="decision-brief">
              <div className="panel-kicker"><span>FAULT BRIEF / {strongestFault.id}</span><span>CRITICAL</span></div>
              <div className="brief-score"><span>RECOMMENDED POSTURE</span><strong>DELAY FULL COMMIT</strong><p>Advance only with an EU-isolated pilot and a signed residency gate.</p></div>
              <div className="brief-block">
                <span>THE CONTRADICTION</span>
                <p>Revenue planning assumes an October launch. Seven of eleven design partners cannot enter production until EU-only processing is certified.</p>
              </div>
              <div className="belief-matrix" aria-label="Belief tension matrix">
                {Array.from({ length: 48 }, (_, index) => <i key={index} className={index % 9 === 0 || index === 22 || index === 31 ? "hot" : index % 5 === 0 ? "warm" : ""} />)}
              </div>
              <div className="brief-block compact-block">
                <span>CHEAPEST NEXT EVIDENCE</span>
                <strong>Secure a written DPA decision from the top three pipeline accounts.</strong>
                <small>Est. cost $4.2K · uncertainty reduction 31%</small>
              </div>
              <button className="full-button" onClick={() => scrollToSection("evidence")}>OPEN EVIDENCE CHAIN <b>→</b></button>
            </aside>
          </div>
        </section>

        <section className="workspace-section lab-section" id="lab">
          <div className="section-heading inverse-heading">
            <div><span>02 / SCENARIO LAB</span><h2>Rehearse the decision before reality does.</h2></div>
            <div className="simulation-badge"><i />DETERMINISTIC MONTE CARLO · 5,000 PATHS</div>
          </div>
          <div className="lab-grid">
            <div className="controls-panel">
              <div className="panel-kicker"><span>VARIABLE DECK</span><span>MODEL FLT-CF/7</span></div>
              <label className="slider-control">
                <span><b>ADOPTION, 12 MONTH</b><strong>{input.adoption}%</strong></span>
                <input type="range" min="20" max="100" value={input.adoption} onChange={(event) => updateInput("adoption", Number(event.target.value))} />
                <small><i>20%</i><i>BASE 61%</i><i>100%</i></small>
              </label>
              <label className="slider-control">
                <span><b>PRICE DELTA</b><strong>{input.priceDelta > 0 ? "+" : ""}{input.priceDelta}%</strong></span>
                <input type="range" min="-20" max="30" value={input.priceDelta} onChange={(event) => updateInput("priceDelta", Number(event.target.value))} />
                <small><i>−20%</i><i>BASE +5%</i><i>+30%</i></small>
              </label>
              <label className="slider-control">
                <span><b>DELIVERY CAPACITY</b><strong>{input.capacity}</strong></span>
                <input type="range" min="40" max="140" value={input.capacity} onChange={(event) => updateInput("capacity", Number(event.target.value))} />
                <small><i>40</i><i>BASE 82</i><i>140</i></small>
              </label>
              <label className="slider-control">
                <span><b>LOGO RETENTION</b><strong>{input.retention}%</strong></span>
                <input type="range" min="65" max="99" value={input.retention} onChange={(event) => updateInput("retention", Number(event.target.value))} />
                <small><i>65%</i><i>BASE 89%</i><i>99%</i></small>
              </label>
              <button className="simulate-button" onClick={runSimulation} disabled={isSimulating}>
                <span>{isSimulating ? "RESOLVING PATHS…" : "RUN COUNTERFACTUAL"}</span><b>{isSimulating ? "···" : "▶"}</b>
              </button>
            </div>

            <div className="outcome-panel">
              <div className="panel-kicker"><span>OUTCOME DISTRIBUTION</span><span>SEED {71071 + scanVersion}</span></div>
              <div className="outcome-summary">
                <div><span>EXPECTED VALUE</span><strong>{formatMoney(simulation.expectedValue)}</strong></div>
                <div><span>DOWNSIDE / P95</span><strong className={simulation.downsideP95 < 0 ? "risk-text" : ""}>{formatMoney(simulation.downsideP95)}</strong></div>
                <div><span>SUCCESS PROB.</span><strong>{simulation.successProbability}%</strong></div>
              </div>
              <div className="distribution-chart" aria-label="Simulated outcome distribution">
                <div className="chart-threshold"><span>SUCCESS THRESHOLD</span></div>
                {simulation.distribution.map((height, index) => <i key={index} style={{ height: `${Math.max(4, height)}%` }} className={index > 11 ? "positive" : ""} />)}
              </div>
              <div className="chart-axis"><span>−$4M</span><span>$0</span><span>+$8M</span><span>+$16M</span></div>
              <div className="model-verdict">
                <span>MODEL VERDICT / {simulation.confidence}% CONFIDENCE</span>
                <h3>{simulation.recommendation}</h3>
                <p><b>PRIMARY RISK</b> {simulation.primaryRisk}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="workspace-section" id="evidence">
          <div className="section-heading">
            <div><span>03 / EVIDENCE MESH</span><h2>Every claim earns its confidence.</h2></div>
            <div className="heading-meta"><span>RETRIEVAL</span><b>Hybrid + rerank</b><span>PROVENANCE</span><b>100% linked</b></div>
          </div>
          <div className="evidence-grid">
            <div className="search-console">
              <form onSubmit={retrieveEvidence} className="evidence-search">
                <span aria-hidden="true">⌕</span>
                <label className="sr-only" htmlFor="evidence-query">Search the evidence mesh</label>
                <input id="evidence-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Interrogate the evidence mesh…" maxLength={240} />
                <button type="submit" disabled={isRetrieving}>{isRetrieving ? "RERANKING…" : "RETRIEVE ↵"}</button>
              </form>
              <div className="retrieval-meta"><span>QUERY PLAN</span><code>lexical → semantic expansion → reliability → recency</code><b>{retrieval.length} packets</b></div>
              <div className="evidence-results">
                {retrieval.map((item, index) => (
                  <article key={item.id}>
                    <div className="evidence-number">0{index + 1}</div>
                    <div className="evidence-content">
                      <div className="evidence-topline"><span>{item.id}</span><span className={`stance ${item.stance}`}>{item.stance}</span><span>{item.matchReason}</span></div>
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                      <div className="source-line"><span>{item.source}</span><b>RELIABILITY {item.reliability}%</b><time>{item.publishedAt}</time></div>
                    </div>
                    <strong className="match-score">{item.score.toFixed(1)}<small>MATCH</small></strong>
                  </article>
                ))}
              </div>
            </div>

            <aside className="contradiction-panel">
              <div className="panel-kicker"><span>CONTRADICTION GRAPH</span><span>4 ACTIVE</span></div>
              <h3>Beliefs that cannot all be true.</h3>
              <div className="edge-list">
                {contradictionEdges.map((edge) => (
                  <div key={edge.from}>
                    <span>{edge.from}</span><i><b style={{ width: `${edge.severity}%` }} /></i><span>{edge.to}</span><strong>{edge.severity}</strong><small>{edge.label}</small>
                  </div>
                ))}
              </div>
              <div className="integrity-note"><span>INTEGRITY RULE</span><p>Confidence cannot exceed the reliability-weighted coverage of its supporting evidence.</p></div>
            </aside>
          </div>
        </section>

        <section className="workspace-section ledger-section" id="ledger">
          <div className="section-heading">
            <div><span>04 / DECISION LEDGER</span><h2>Memory with consequences.</h2></div>
            <button className="outline-button" onClick={() => setModalOpen(true)}>+ NEW DECISION</button>
          </div>
          <div className="ledger-table" role="table" aria-label="Decision ledger">
            <div className="ledger-head" role="row"><span>ID / SEALED</span><span>DECISION</span><span>OWNER</span><span>CONFIDENCE</span><span>STATE</span><span>INTEGRITY</span></div>
            {savedDecisions.map((decision) => (
              <div className="ledger-row" role="row" key={decision.id}>
                <span><b>{decision.id}</b><small>{new Date(decision.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</small></span>
                <span><strong>{decision.title}</strong><small>{decision.domain}</small></span>
                <span>{decision.owner}</span>
                <span><b>{decision.confidence}%</b></span>
                <span><i className="ledger-state" />{decision.status}</span>
                <span><code>{decision.decisionHash?.slice(0, 10) || "pending"}</code></span>
              </div>
            ))}
            {[
              ["FLT-041", "Stage EMEA launch behind residency gate", "M. Chen", "78%", "active", "9f2ca17edd"],
              ["FLT-036", "Adopt dual-vendor inference routing", "I. Nwosu", "86%", "tracking", "b810e64a22"],
              ["FLT-029", "Hold usage pricing for regulated tier", "J. Bell", "71%", "review", "4d6c97bf10"],
              ["FLT-018", "Keep human escalation through day 45", "L. Kim", "89%", "calibrated", "0a98c2f701"],
            ].map((row) => (
              <div className="ledger-row" role="row" key={row[0]}>
                <span><b>{row[0]}</b><small>JUL 2026</small></span>
                <span><strong>{row[1]}</strong><small>STRATEGIC COMMIT</small></span>
                <span>{row[2]}</span><span><b>{row[3]}</b></span>
                <span><i className="ledger-state" />{row[4]}</span><span><code>{row[5]}</code></span>
              </div>
            ))}
          </div>
          <div className="ledger-footer">
            <div><span>WHY THIS EXISTS</span><p>Most companies remember what they chose. FAULTLINE preserves what they believed, what evidence existed, and whether their confidence deserved to survive contact with reality.</p></div>
            <button className="primary-button" onClick={() => setModalOpen(true)}>COMMIT A DECISION <b>↗</b></button>
          </div>
        </section>

        <footer className="site-footer">
          <div className="footer-brand"><span className="brand-mark" aria-hidden="true"><i /><i /></span><strong>FAULTLINE</strong></div>
          <p>Decision observability for teams operating under uncertainty.</p>
          <div><span>DETERMINISTIC SIMULATION</span><span>PROVENANCE-FIRST RAG</span><span>D1 EVENT LEDGER</span></div>
          <small>BUILD 2026.07 / RESEARCH PROTOTYPE</small>
        </footer>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={closeModal} role="presentation">
          <section className="decision-modal" role="dialog" aria-modal="true" aria-labelledby="decision-modal-title">
            <div className="modal-header"><div><span>NEW DECISION COMMIT</span><h2 id="decision-modal-title">Seal the belief state.</h2></div><button onClick={() => setModalOpen(false)} aria-label="Close dialog">×</button></div>
            <form onSubmit={commitDecision}>
              <label><span>DECISION</span><input name="title" required minLength={4} maxLength={160} placeholder="What are you committing to?" autoFocus /></label>
              <label><span>CONTEXT / ASSUMPTIONS</span><textarea name="context" maxLength={2000} placeholder="State what must be true for this decision to work…" rows={5} /></label>
              <div className="form-row">
                <label><span>ACCOUNTABLE OWNER</span><input name="owner" maxLength={80} placeholder="Name" /></label>
                <label><span>DOMAIN</span><select name="domain" defaultValue="Strategy"><option>Strategy</option><option>Revenue</option><option>Platform</option><option>Operations</option><option>People</option></select></label>
              </div>
              <label className="confidence-input"><span>CONFIDENCE BEFORE OUTCOME</span><input name="confidence" type="range" min="1" max="99" defaultValue="70" /><small>Record the probability now. FAULTLINE will score calibration when the outcome resolves.</small></label>
              <div className="integrity-warning"><b>IMMUTABLE PRE-COMMIT</b><p>A SHA-256 integrity digest will bind the decision, assumptions, owner, and timestamp.</p></div>
              <button className="simulate-button" type="submit"><span>SEAL TO LEDGER</span><b>↗</b></button>
            </form>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><i />{toast}</div>}
    </main>
  );
}
