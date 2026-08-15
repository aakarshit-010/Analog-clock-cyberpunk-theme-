import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/* ──────────────── Analog Clock ──────────────── */
function AnalogClock({ time }) {
  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  return (
    <div className="clock-ring">
      <div className="clock-face">
        {/* Minute ticks (60 total) */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className={`tick ${i % 5 === 0 ? "major" : "minor"}`}
            style={{ transform: `rotate(${i * 6}deg)` }}
          />
        ))}
        {/* Numbers: 12, 3, 6, 9 */}
        {[12, 3, 6, 9].map((n, i) => (
          <span
            key={n}
            className="clock-num"
            style={{
              transform: `rotate(${i * 90}deg)`,
              left: "50%",
              top: i === 0 ? "8%" : i === 2 ? "84%" : "50%",
            }}
          >
            {n}
          </span>
        ))}
        {/* Other numbers */}
        <span className="clock-num n1">1</span>
        <span className="clock-num n2">2</span>
        <span className="clock-num n4">4</span>
        <span className="clock-num n5">5</span>
        <span className="clock-num n7">7</span>
        <span className="clock-num n8">8</span>
        <span className="clock-num n10">10</span>
        <span className="clock-num n11">11</span>

        {/* Center glow */}
        <div className="center-glow" />

        {/* Hands */}
        <div className="hand hour-hand" style={{ transform: `rotate(${hourDeg}deg)` }} />
        <div className="hand minute-hand" style={{ transform: `rotate(${minuteDeg}deg)` }} />
        <div className="hand second-hand" style={{ transform: `rotate(${secondDeg}deg)` }} />
        <div className="center-dot" />
      </div>
    </div>
  );
}

/* ──────────────── Digital Clock ──────────────── */
function DigitalClock({ time, mode }) {
  const h = mode === "24"
    ? String(time.getHours()).padStart(2, "0")
    : String(time.getHours() % 12 || 12).padStart(2, "0");
  const m = String(time.getMinutes()).padStart(2, "0");
  const s = String(time.getSeconds()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="digital-panel">
      <div className="digital-time">
        <span className="d-digit">{h}</span>
        <span className="d-colon">:</span>
        <span className="d-digit">{m}</span>
        <span className="d-colon">:</span>
        <span className="d-digit d-sec">{s}</span>
        {mode === "12" && <span className="d-ampm">{ampm}</span>}
      </div>
      <div className="d-date">{dateStr}</div>
    </div>
  );
}

/* ──────────────── Stopwatch ──────────────── */
function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState([]);
  const startRef = useRef(0);
  const rafRef = useRef(null);

  const tick = () => {
    setElapsed(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    startRef.current = Date.now() - elapsed;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps((prev) => [elapsed, ...prev]);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const totalMs = elapsed;
  const totalSec = Math.floor(totalMs / 1000);
  const minutes = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const seconds = String(totalSec % 60).padStart(2, "0");
  const milliseconds = String(Math.floor((totalMs % 1000) / 10)).padStart(2, "0");

  const formatLap = (ms) => {
    const sec = Math.floor(ms / 1000);
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
  };

  return (
    <div className="stopwatch-container">
      <div className="sw-display">
        <span className="sw-digit">{minutes}</span>
        <span className="sw-sep">:</span>
        <span className="sw-digit">{seconds}</span>
        <span className="sw-sep">.</span>
        <span className="sw-digit sw-ms">{milliseconds}</span>
      </div>
      <div className="sw-controls">
        {!running ? (
          <button className="sw-btn start-btn" onClick={start}>▶ Start</button>
        ) : (
          <button className="sw-btn stop-btn" onClick={stop}>■ Stop</button>
        )}
        <button className="sw-btn lap-btn" onClick={lap} disabled={!running}>⏱ Lap</button>
        <button className="sw-btn reset-btn" onClick={reset}>⟳ Reset</button>
      </div>
      {laps.length > 0 && (
        <div className="sw-laps">
          <div className="laps-header">Laps</div>
          {laps.map((l, i) => (
            <div key={i} className="lap-row">
              <span className="lap-num">Lap {laps.length - i}</span>
              <span className="lap-time">{formatLap(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────── App ──────────────── */
function App() {
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState("12");
  const [activeTab, setActiveTab] = useState("analog"); // 'analog' | 'stopwatch'

  useEffect(() => {
    let raf;
    const tick = () => {
      setTime(new Date());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <span className="brand-icon">◈</span>
          <h1>CHRONOSPHERE</h1>
        </div>
        <nav>
          <button
            className={`nav-btn ${activeTab === "analog" ? "active" : ""}`}
            onClick={() => setActiveTab("analog")}
          >
            ◉ Clock
          </button>
          <button
            className={`nav-btn ${activeTab === "stopwatch" ? "active" : ""}`}
            onClick={() => setActiveTab("stopwatch")}
          >
            ◉ Stopwatch
          </button>
        </nav>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-head">VIEWS</p>
            <button
              className={`side-item ${activeTab === "analog" ? "on" : ""}`}
              onClick={() => setActiveTab("analog")}
            >
              <span>🕒</span> Analog
            </button>
            <button
              className={`side-item ${activeTab === "stopwatch" ? "on" : ""}`}
              onClick={() => setActiveTab("stopwatch")}
            >
              <span>⏱</span> Stopwatch
            </button>
          </div>
          <div className="sidebar-section">
            <p className="sidebar-head">DISPLAY</p>
            <button
              className={`side-item ${mode === "12" ? "on" : ""}`}
              onClick={() => setMode("12")}
            >
              12H Format
            </button>
            <button
              className={`side-item ${mode === "24" ? "on" : ""}`}
              onClick={() => setMode("24")}
            >
              24H Format
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === "analog" ? (
            <>
              <AnalogClock time={time} />
              <DigitalClock time={time} mode={mode} />
            </>
          ) : (
            <Stopwatch />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© {time.getFullYear()} Chronosphere • Precision Time Instruments</p>
      </footer>
    </div>
  );
}

export default App;

