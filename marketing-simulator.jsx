import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
//  CONFIG — modifier ici les valeurs par défaut par canal/secteur
// ═══════════════════════════════════════════════════════════
const CFG = {
  channels: {
    "google-ads": {
      label: "Google Ads", color: "#3B82F6",
      funnel: ["Impressions", "Clics", "Leads"],
      cpcLabel: "CPC (€)", ctrLabel: "CTR (%)", ctrMax: 15, cpcMax: 20, cpcStep: 0.1,
      sectors: {
        saas:      { cpc: 8.5,  ctr: 3.2, conv: 4.5, budget: 5000 },
        industrie: { cpc: 4.8,  ctr: 2.5, conv: 3.2, budget: 3000 },
        finance:   { cpc: 12.0, ctr: 2.8, conv: 3.8, budget: 8000 },
        immo:      { cpc: 7.2,  ctr: 3.5, conv: 2.8, budget: 4000 },
        rh:        { cpc: 5.5,  ctr: 3.0, conv: 3.5, budget: 3500 },
        ecom:      { cpc: 3.2,  ctr: 4.5, conv: 5.2, budget: 2000 },
        conseil:   { cpc: 9.0,  ctr: 2.2, conv: 3.0, budget: 6000 },
      },
    },
    meta: {
      label: "Meta Ads", color: "#818CF8",
      funnel: ["Impressions", "Clics", "Leads"],
      cpcLabel: "CPC (€)", ctrLabel: "CTR (%)", ctrMax: 10, cpcMax: 15, cpcStep: 0.1,
      sectors: {
        saas:      { cpc: 4.2, ctr: 1.8, conv: 3.2, budget: 4000 },
        industrie: { cpc: 2.8, ctr: 1.5, conv: 2.5, budget: 2000 },
        finance:   { cpc: 6.5, ctr: 1.6, conv: 2.8, budget: 5000 },
        immo:      { cpc: 5.0, ctr: 2.2, conv: 3.5, budget: 3500 },
        rh:        { cpc: 3.5, ctr: 2.0, conv: 2.8, budget: 2500 },
        ecom:      { cpc: 1.8, ctr: 3.2, conv: 4.5, budget: 1500 },
        conseil:   { cpc: 4.8, ctr: 1.4, conv: 2.2, budget: 3500 },
      },
    },
    linkedin: {
      label: "LinkedIn Ads", color: "#06B6D4",
      funnel: ["Impressions", "Clics", "Leads"],
      cpcLabel: "CPC (€)", ctrLabel: "CTR (%)", ctrMax: 5, cpcMax: 25, cpcStep: 0.5,
      sectors: {
        saas:      { cpc: 12.0, ctr: 0.8, conv: 6.5, budget: 8000 },
        industrie: { cpc: 8.5,  ctr: 0.7, conv: 5.0, budget: 5000 },
        finance:   { cpc: 15.0, ctr: 0.9, conv: 7.0, budget: 10000 },
        immo:      { cpc: 10.0, ctr: 0.8, conv: 5.5, budget: 7000 },
        rh:        { cpc: 9.0,  ctr: 1.0, conv: 6.0, budget: 6000 },
        ecom:      { cpc: 7.5,  ctr: 0.7, conv: 4.5, budget: 4500 },
        conseil:   { cpc: 13.0, ctr: 0.9, conv: 7.5, budget: 9000 },
      },
    },
    seo: {
      label: "SEO", color: "#10B981",
      funnel: ["Impressions", "Visiteurs", "Leads"],
      cpcLabel: null, ctrLabel: "CTR (%)", ctrMax: 20, cpcMax: 0, cpcStep: 0,
      sectors: {
        saas:      { cpc: 0, ctr: 3.5, conv: 2.8, budget: 2000 },
        industrie: { cpc: 0, ctr: 2.8, conv: 2.2, budget: 1500 },
        finance:   { cpc: 0, ctr: 2.5, conv: 2.5, budget: 2500 },
        immo:      { cpc: 0, ctr: 4.0, conv: 3.2, budget: 1800 },
        rh:        { cpc: 0, ctr: 3.2, conv: 2.8, budget: 1800 },
        ecom:      { cpc: 0, ctr: 5.0, conv: 3.5, budget: 1200 },
        conseil:   { cpc: 0, ctr: 2.2, conv: 2.0, budget: 2000 },
      },
    },
    email: {
      label: "Cold Email", color: "#F59E0B",
      funnel: ["Envois", "Ouvertures", "Réponses"],
      cpcLabel: "Coût/email (€)", ctrLabel: "Taux d'ouverture (%)", ctrMax: 60, cpcMax: 0.5, cpcStep: 0.01,
      sectors: {
        saas:      { cpc: 0.08, ctr: 35, conv: 4.5, budget: 800 },
        industrie: { cpc: 0.06, ctr: 28, conv: 3.8, budget: 600 },
        finance:   { cpc: 0.10, ctr: 30, conv: 4.0, budget: 1000 },
        immo:      { cpc: 0.07, ctr: 32, conv: 4.2, budget: 700 },
        rh:        { cpc: 0.06, ctr: 38, conv: 5.0, budget: 600 },
        ecom:      { cpc: 0.05, ctr: 25, conv: 3.2, budget: 500 },
        conseil:   { cpc: 0.09, ctr: 28, conv: 3.5, budget: 900 },
      },
    },
  },
  sectors: {
    saas:      "SaaS / Tech",
    industrie: "Industrie",
    finance:   "Finance / Banque",
    immo:      "Immobilier",
    rh:        "RH / Recrutement",
    ecom:      "E-commerce",
    conseil:   "Conseil / Services",
  },
};

// ─── Animated counter ────────────────────────────────────────
function useCountUp(target, ms = 600) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  const raf = useRef(null);
  useEffect(() => {
    const from = prev.current;
    const diff = target - from;
    if (!diff) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(from + diff * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else { setVal(target); prev.current = target; }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);
  return val;
}

function Num({ value, fmt }) {
  const v = useCountUp(value);
  if (fmt === "eur")  return <>{Math.round(v).toLocaleString("fr-FR")} €</>;
  if (fmt === "pct")  return <>{v.toFixed(2)} %</>;
  if (fmt === "pctS") return <>{v.toFixed(1)} %</>;
  return <>{Math.round(v).toLocaleString("fr-FR")}</>;
}

// ─── SVG Funnel ──────────────────────────────────────────────
function Funnel({ stages, color }) {
  const W = 240, rowH = 66, H = rowH * 3 + 4;
  const max = Math.max(stages[0]?.value || 1, 1);
  const MIN = 52;
  const widths = stages.map(s => MIN + (W - MIN) * Math.sqrt(Math.max(s.value, 0) / max));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      {stages.map((s, i) => {
        const y = i * rowH;
        const w = widths[i];
        const wN = i < 2 ? widths[i + 1] : w * 0.6;
        const x1 = (W - w) / 2, x2 = (W + w) / 2;
        const x3 = (W + wN) / 2, x4 = (W - wN) / 2;
        const op = 1 - i * 0.22;
        const ratio = i > 0 && stages[i - 1].value > 0
          ? ((s.value / stages[i - 1].value) * 100).toFixed(1) : null;
        return (
          <g key={i}>
            <polygon points={`${x1},${y} ${x2},${y} ${x3},${y + rowH} ${x4},${y + rowH}`}
              fill={color} fillOpacity={op} />
            <text x={W / 2} y={y + rowH * 0.36} textAnchor="middle"
              fill="rgba(255,255,255,0.65)" fontSize="9.5" fontWeight="500">{s.label}</text>
            <text x={W / 2} y={y + rowH * 0.7} textAnchor="middle"
              fill="white" fontSize="13" fontWeight="700">
              {Math.round(s.value).toLocaleString("fr-FR")}
            </text>
            {ratio && (
              <text x={W - 4} y={y + 11} textAnchor="end"
                fill={color} fontSize="8.5" fontWeight="600" opacity="0.9">↓ {ratio}%</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Range slider with colored track ─────────────────────────
function Slider({ label, value, min, max, step, onChange, accent, display }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: accent }}>{display}</span>
      </div>
      <div style={{ position: "relative", height: 16, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", width: "100%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 2 }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", width: "100%", opacity: 0, cursor: "pointer", height: "100%", margin: 0 }} />
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────
function KCard({ label, sub, value, fmt, accent, highlight }) {
  return (
    <div style={{
      background: highlight ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
      borderRadius: 10, padding: "14px 16px",
      border: `1px solid ${highlight ? accent + "55" : "rgba(255,255,255,0.06)"}`,
    }}>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: highlight ? 30 : 21, letterSpacing: "-0.03em", lineHeight: 1, color: highlight ? accent : "#DDD8CE" }}>
        <Num value={value} fmt={fmt} />
      </div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.27)", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────
export default function Simulator() {
  const [channel, setChannel] = useState("google-ads");
  const [sector, setSector]   = useState("saas");
  const [mode, setMode]       = useState("budget");
  const [budget, setBudget]   = useState(5000);
  const [tLeads, setTLeads]   = useState(50);
  const [cpc, setCpc]         = useState(8.5);
  const [ctr, setCtr]         = useState(3.2);
  const [conv, setConv]       = useState(4.5);
  const [prospect, setProspect] = useState("");
  const [logo, setLogo]       = useState(null);
  const [shareId, setShareId] = useState(null);
  const [copied, setCopied]   = useState(false);

  const ch     = CFG.channels[channel];
  const accent = ch.color;

  // Reset defaults when channel/sector changes
  useEffect(() => {
    const d = ch.sectors[sector];
    if (d) { setCpc(d.cpc); setCtr(d.ctr); setConv(d.conv); setBudget(d.budget); }
  }, [channel, sector]);

  // ── Funnel computation ────────────────────────────────────
  let impr = 0, clicks = 0, leads = 0, cpl = 0, budgetOut = 0;
  const safeDiv = (a, b) => b > 0 ? a / b : 0;

  if (mode === "budget") {
    if (channel === "seo") {
      impr   = Math.round(budget * 80);
      clicks = Math.round(impr * ctr / 100);
      leads  = Math.round(clicks * conv / 100);
    } else if (channel === "email") {
      impr   = Math.round(safeDiv(budget, cpc));
      clicks = Math.round(impr * ctr / 100);
      leads  = Math.round(clicks * conv / 100);
    } else {
      clicks = Math.round(safeDiv(budget, cpc));
      impr   = Math.round(safeDiv(clicks, ctr / 100));
      leads  = Math.round(clicks * conv / 100);
    }
    budgetOut = budget;
  } else {
    leads = tLeads;
    if (channel === "seo") {
      clicks    = Math.round(safeDiv(leads, conv / 100));
      impr      = Math.round(safeDiv(clicks, ctr / 100));
      budgetOut = Math.round(impr / 80);
    } else if (channel === "email") {
      clicks    = Math.round(safeDiv(leads, conv / 100));
      impr      = Math.round(safeDiv(clicks, ctr / 100));
      budgetOut = Math.round(impr * cpc);
    } else {
      clicks    = Math.round(safeDiv(leads, conv / 100));
      impr      = Math.round(safeDiv(clicks, ctr / 100));
      budgetOut = Math.round(clicks * cpc);
    }
  }
  cpl = leads > 0 ? safeDiv(mode === "budget" ? budget : budgetOut, leads) : 0;

  const stages = [
    { label: ch.funnel[0], value: impr },
    { label: ch.funnel[1], value: clicks },
    { label: ch.funnel[2], value: leads },
  ];

  // ── Share ─────────────────────────────────────────────────
  const handleShare = async () => {
    const id = Math.random().toString(36).slice(2, 9);
    try {
      await window.storage?.set(`sim:${id}`, JSON.stringify({ channel, sector, mode, budget, tLeads, cpc, ctr, conv, prospect }));
    } catch (_) {}
    setShareId(id);
    try { await navigator.clipboard.writeText(`https://sim.agence.io/${id}`); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const logoRef = useRef();
  const handleLogo = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setLogo(ev.target.result);
    r.readAsDataURL(f);
  };

  // Inject Google Fonts
  useEffect(() => {
    if (document.getElementById("sim-gf")) return;
    const el = document.createElement("link");
    el.id = "sim-gf"; el.rel = "stylesheet";
    el.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(el);
  }, []);

  const cpcDisplay = channel === "email"
    ? `${cpc.toFixed(2)} €`
    : `${cpc.toFixed(1)} €`;

  const S = {
    root: { minHeight: "100vh", background: "#07090F", fontFamily: "'DM Sans',sans-serif", color: "#DDD8CE", position: "relative" },
    grid: { backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "44px 44px", position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 },
    wrap: { position: "relative", zIndex: 1 },
    header: { borderBottom: "1px solid rgba(255,255,255,0.055)", padding: "14px 28px", background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
    inner: { maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px" },
    label: { fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 10 },
    pill: (active, color) => ({ padding: "6px 13px", borderRadius: 20, fontSize: 11, cursor: "pointer", transition: "all 0.14s", background: active ? "rgba(255,255,255,0.1)" : "transparent", border: `1px solid ${active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`, color: active ? "#fff" : "rgba(255,255,255,0.38)" }),
    chBtn: (active, color) => ({ padding: "7px 15px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.14s", background: active ? color : "rgba(255,255,255,0.04)", border: `1px solid ${active ? color : "rgba(255,255,255,0.07)"}`, color: active ? "#fff" : "rgba(255,255,255,0.42)" }),
    panel: { background: "rgba(255,255,255,0.03)", borderRadius: 11, padding: "16px", border: "1px solid rgba(255,255,255,0.06)" },
    modeBtn: (active, color) => ({ flex: 1, padding: "8px 6px", borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: "pointer", background: active ? color : "transparent", border: "none", color: active ? "#fff" : "rgba(255,255,255,0.36)", transition: "all 0.18s" }),
  };

  return (
    <div style={S.root}>
      <div style={S.grid} />
      <div style={S.wrap}>
        {/* Header */}
        <header style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div onClick={() => logoRef.current?.click()} style={{
              width: 34, height: 34, borderRadius: 7, overflow: "hidden",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              {logo
                ? <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              }
            </div>
            <input type="file" ref={logoRef} accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
            <div>
              <input value={prospect} onChange={e => setProspect(e.target.value)} placeholder="Nom du prospect…"
                style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#DDD8CE", width: 200 }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", marginTop: 1 }}>
                {CFG.sectors[sector]} · {ch.label}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {shareId && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>sim.agence.io/{shareId}</span>}
            <button onClick={handleShare} style={{
              padding: "7px 16px", borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
              background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.09)"}`,
              color: copied ? "#10B981" : "rgba(255,255,255,0.55)", transition: "all 0.2s"
            }}>
              {copied ? "✓ Lien copié" : "Générer lien"}
            </button>
          </div>
        </header>

        <div style={S.inner}>
          {/* Selectors row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div>
              <div style={S.label}>Canal d'acquisition</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {Object.entries(CFG.channels).map(([k, c]) => (
                  <button key={k} onClick={() => setChannel(k)} style={S.chBtn(channel === k, c.color)}>{c.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={S.label}>Secteur d'activité</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {Object.entries(CFG.sectors).map(([k, l]) => (
                  <button key={k} onClick={() => setSector(k)} style={S.pill(sector === k)}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Main 2-col layout */}
          <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 18, alignItems: "start" }}>

            {/* LEFT — Controls */}
            <div>
              {/* Mode toggle */}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: 4, display: "flex", marginBottom: 14, border: "1px solid rgba(255,255,255,0.07)" }}>
                {[["budget", "Budget → Leads"], ["leads", "Leads → Budget"]].map(([m, l]) => (
                  <button key={m} onClick={() => setMode(m)} style={S.modeBtn(mode === m, accent)}>{l}</button>
                ))}
              </div>

              {/* Primary input */}
              <div style={{ ...S.panel, padding: "18px 18px 14px", marginBottom: 12, background: "rgba(255,255,255,0.04)" }}>
                {mode === "budget" ? (
                  <>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginBottom: 5 }}>Budget mensuel (€)</div>
                    <input type="number" value={budget} onChange={e => setBudget(Math.max(1, Number(e.target.value)))}
                      style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 34, color: "#fff", letterSpacing: "-0.03em", width: "100%" }} />
                    <input type="range" min={100} max={50000} step={100} value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      style={{ width: "100%", marginTop: 10, accentColor: accent }} />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginBottom: 5 }}>Objectif leads / mois</div>
                    <input type="number" value={tLeads} onChange={e => setTLeads(Math.max(1, Number(e.target.value)))}
                      style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 34, color: "#fff", letterSpacing: "-0.03em", width: "100%" }} />
                    <input type="range" min={1} max={500} step={1} value={tLeads}
                      onChange={e => setTLeads(Number(e.target.value))}
                      style={{ width: "100%", marginTop: 10, accentColor: accent }} />
                  </>
                )}
              </div>

              {/* Sliders */}
              <div style={S.panel}>
                <div style={{ ...S.label, marginBottom: 14 }}>Paramètres du canal</div>
                {ch.cpcLabel && (
                  <Slider label={ch.cpcLabel} value={cpc} min={0.01} max={ch.cpcMax}
                    step={ch.cpcStep} onChange={setCpc} accent={accent} display={cpcDisplay} />
                )}
                <Slider label={ch.ctrLabel} value={ctr} min={0.1} max={ch.ctrMax}
                  step={0.1} onChange={setCtr} accent={accent} display={`${ctr.toFixed(1)} %`} />
                <Slider label="Taux de conversion (%)" value={conv} min={0.1} max={20}
                  step={0.1} onChange={setConv} accent={accent} display={`${conv.toFixed(1)} %`} />
              </div>

              {/* Channel note */}
              {channel === "seo" && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(16,185,129,0.06)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.15)", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                  SEO — Impressions estimées à partir du budget mensuel (contenu + netlinking). Pas de CPC direct.
                </div>
              )}
            </div>

            {/* RIGHT — Results */}
            <div>
              {/* 6 KPI cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                <KCard label={mode === "budget" ? "Leads générés" : "Objectif leads"} value={leads} fmt="int"
                  sub={`CPL · ${Math.round(cpl).toLocaleString("fr-FR")} €`} accent={accent} highlight />
                <KCard label={mode === "budget" ? "Coût par lead" : "Budget requis"} value={mode === "budget" ? cpl : budgetOut} fmt="eur"
                  sub={mode === "budget" ? "par lead qualifié" : "investissement mensuel"} accent={accent} />
                <KCard label={ch.funnel[1]} value={clicks} fmt="int"
                  sub={`${ctr.toFixed(1)}% de taux`} accent={accent} />
                <KCard label={ch.funnel[0]} value={impr} fmt="int"
                  sub="volume estimé" accent={accent} />
                <KCard label="Taux global" value={impr > 0 ? (leads / impr * 100) : 0} fmt="pct"
                  sub={`${ch.funnel[0]} → ${ch.funnel[2]}`} accent={accent} />
                <KCard label="Taux de clics → leads" value={clicks > 0 ? (leads / clicks * 100) : 0} fmt="pctS"
                  sub={`${ch.funnel[1]} → ${ch.funnel[2]}`} accent={accent} />
              </div>

              {/* Funnel + bar visualization */}
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "22px 14px 22px 22px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                  <Funnel stages={stages} color={accent} />
                </div>
                <div style={{ padding: "22px 22px" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 18, color: "#DDD8CE" }}>
                    Entonnoir de conversion
                  </div>
                  {stages.map((s, i) => {
                    const pct = stages[0].value > 0 ? Math.min(s.value / stages[0].value * 100, 100) : 0;
                    const stepConv = i > 0 && stages[i - 1].value > 0
                      ? ((s.value / stages[i - 1].value) * 100).toFixed(1) : null;
                    return (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.42)" }}>{s.label}</span>
                            {stepConv && (
                              <span style={{ fontSize: 9, background: accent + "1A", color: accent, padding: "1px 6px", borderRadius: 10 }}>
                                ↓ {stepConv}%
                              </span>
                            )}
                          </div>
                          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#DDD8CE" }}>
                            {Math.round(s.value).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                          <div style={{ height: "100%", borderRadius: 2, background: accent, opacity: 1 - i * 0.2, width: `${pct}%`, transition: "width 0.55s cubic-bezier(0.34,1.56,0.64,1)" }} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary strip */}
                  <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 0 }}>
                    {[
                      { l: "Budget", v: `${(mode === "budget" ? budget : budgetOut).toLocaleString("fr-FR")} €` },
                      { l: "CPL", v: `${Math.round(cpl).toLocaleString("fr-FR")} €` },
                      { l: "Taux global", v: `${impr > 0 ? (leads / impr * 100).toFixed(3) : "0.000"} %` },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.27)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{s.l}</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: accent }}>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  {shareId && (
                    <div style={{ marginTop: 14, padding: "9px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", marginBottom: 3 }}>LIEN · NOINDEX</div>
                      <div style={{ fontSize: 11, color: accent, fontFamily: "monospace" }}>https://sim.agence.io/{shareId}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
