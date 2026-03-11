import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useNavigate } from 'react-router-dom'

/* ─── FONT INJECTION ─────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
document.head.appendChild(fontLink);

/* ─── GLOBAL STYLES ──────────────────────────────────── */
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #080808; color: #e8e8e8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; cursor: none; }
  @media (max-width: 768px) { body { cursor: auto; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0d0d0d; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  .syne { font-family: 'Syne', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  /* ── LOADER ── */
  @keyframes loaderFadeOut {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.04); }
  }
  @keyframes loaderGridPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }
  @keyframes loaderRingCW  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
  @keyframes loaderRingCCW { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
  @keyframes loaderDotPulse {
    0%,100% { opacity: 0.2; transform: scale(0.8); }
    50%      { opacity: 1;   transform: scale(1.2); }
  }
  @keyframes loaderBrandFlicker {
    0%,100% { opacity: 0.6; }
    50%      { opacity: 1; }
  }

  /* ── BUTTONS ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px;
    background: #fff; color: #080808;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.04em;
    border: none; border-radius: 100px; cursor: none;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
    position: relative; overflow: hidden; white-space: nowrap;
  }
  @media (max-width: 768px) { .btn-primary { cursor: pointer; font-size: 13px; padding: 12px 24px; } }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
    background-size: 200% 100%; background-position: -200% center;
    transition: background-position 0.5s ease;
  }
  .btn-primary:hover { transform: scale(1.04); box-shadow: 0 12px 40px rgba(255,255,255,0.2); }
  .btn-primary:hover::after { background-position: 200% center; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 32px;
    background: transparent; color: #e8e8e8;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.04em;
    border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; cursor: none;
    transition: all 0.3s ease; backdrop-filter: blur(10px); white-space: nowrap;
  }
  @media (max-width: 768px) { .btn-ghost { cursor: pointer; font-size: 13px; padding: 12px 24px; } }
  .btn-ghost:hover { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.06); }

  .card-glass {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    transition: all 0.4s cubic-bezier(.16,1,.3,1);
  }
  .card-glass:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.18);
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  }

  .tag {
    display: inline-block;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: #999;
    padding: 6px 14px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 100px; margin-bottom: 24px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #fff 0%, #999 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .shimmer-text {
    background: linear-gradient(90deg, #888 0%, #fff 40%, #888 60%, #fff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .noise-overlay {
    position: fixed; inset: 0; z-index: 1000; pointer-events: none; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }
  .section-line { width: 48px; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.6), transparent); margin-bottom: 20px; }
  .stat-number {
    font-family: 'Syne', sans-serif; font-size: clamp(36px, 5vw, 64px); font-weight: 800;
    background: linear-gradient(135deg, #fff, #666);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1;
  }

  /* ── RESPONSIVE GRIDS ── */
  .grid-2col    { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .grid-4col    { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .grid-3col    { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .grid-2col-eq { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }

  @media (max-width: 1024px) {
    .grid-4col { grid-template-columns: repeat(2,1fr); }
    .grid-3col { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 768px) {
    .grid-2col    { grid-template-columns: 1fr; gap: 48px; }
    .grid-4col    { grid-template-columns: 1fr 1fr; }
    .grid-3col    { grid-template-columns: 1fr 1fr; }
    .grid-2col-eq { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .grid-4col { grid-template-columns: 1fr; }
    .grid-3col { grid-template-columns: 1fr; }
  }

  .sec-pad { padding: 140px 48px; }
  @media (max-width: 1024px) { .sec-pad { padding: 100px 32px; } }
  @media (max-width: 768px)  { .sec-pad { padding: 80px 20px; } }
  @media (max-width: 480px)  { .sec-pad { padding: 64px 16px; } }

  .inner-wrap { max-width: 1200px; margin: 0 auto; }

  /* ── NAVBAR RESPONSIVE ── */
  .nav-links-desktop { display: flex; }
  .nav-cta-desktop   { display: inline-flex; }
  .nav-hamburger     { display: none; }
  @media (max-width: 768px) {
    .nav-links-desktop { display: none !important; }
    .nav-cta-desktop   { display: none !important; }
    .nav-hamburger     { display: flex !important; }
  }
`;

/* ══════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════ */
function LoadingScreen({ onDone }) {
    const canvasRef = useRef(null);
    const [pct, setPct] = useState(0);
    const [displayPct, setDisplayPct] = useState(0);
    const [exiting, setExiting] = useState(false);

    /* Rising particle canvas */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        const particles = Array.from({ length: 70 }, () => ({
            x: Math.random(), progress: Math.random(),
            size: Math.random() * 1.8 + 0.4,
            speed: Math.random() * 0.004 + 0.002,
            dx: (Math.random() - 0.5) * 0.06,
        }));
        let raf;
        const draw = () => {
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                p.progress += p.speed;
                if (p.progress > 1) { p.progress = 0; p.x = Math.random(); }
                const alpha = p.progress < 0.1 ? p.progress * 10 : p.progress > 0.85 ? (1 - p.progress) / 0.15 : 1;
                const x = (p.x + p.dx * p.progress) * W;
                const y = H * (1 - p.progress);
                ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.22})`; ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    /* Progress milestones */
    useEffect(() => {
        const schedule = [
            [150, 16], [500, 38], [950, 62], [1450, 80], [1950, 92], [2400, 100]
        ];
        const timers = schedule.map(([ms, val]) => setTimeout(() => setPct(val), ms));
        const exitT = setTimeout(() => setExiting(true), 2900);
        const doneT = setTimeout(() => onDone(), 3550);
        return () => { timers.forEach(clearTimeout); clearTimeout(exitT); clearTimeout(doneT); };
    }, []);

    /* Smooth counter */
    useEffect(() => {
        const iv = setInterval(() => setDisplayPct(p => p < pct ? Math.min(p + 1, pct) : p), 16);
        return () => clearInterval(iv);
    }, [pct]);

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9000, background: "#080808",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            animation: exiting ? "loaderFadeOut 0.65s cubic-bezier(.4,0,.2,1) forwards" : "none",
            pointerEvents: exiting ? "none" : "all",
        }}>
            {/* Particle canvas */}
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

            {/* Grid */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(rgba(255,255,255,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.028) 1px,transparent 1px)",
                backgroundSize: "72px 72px",
                animation: "loaderGridPulse 4s ease-in-out infinite",
            }} />

            {/* Radial glow */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 68%)", filter: "blur(30px)", pointerEvents: "none" }} />

            {/* Rotating rings */}
            <div style={{ position: "absolute", width: "min(300px,70vw)", height: "min(300px,70vw)", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", animation: "loaderRingCW 14s linear infinite" }}>
                <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.55)", boxShadow: "0 0 8px rgba(255,255,255,0.4)" }} />
            </div>
            <div style={{ position: "absolute", width: "min(210px,50vw)", height: "min(210px,50vw)", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", animation: "loaderRingCCW 9s linear infinite" }}>
                <div style={{ position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.35)" }} />
            </div>
            <div style={{ position: "absolute", width: "min(140px,34vw)", height: "min(140px,34vw)", borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.06)", animation: "loaderRingCW 6s linear infinite" }} />

            {/* Center content */}
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Logo */}
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: "0 0 40px rgba(255,255,255,0.18)" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#080808", fontFamily: "Syne,sans-serif" }}>K</span>
                </div>

                {/* Brand */}
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "clamp(20px,5vw,30px)", letterSpacing: "-0.02em", color: "#fff", marginBottom: 6, animation: "loaderBrandFlicker 2s ease-in-out infinite" }}>
                    Karo Pitch
                </div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 52, fontFamily: "DM Sans,sans-serif" }}>
                    Powering India's Founders
                </div>

                {/* Progress track */}
                <div style={{ width: "min(300px,68vw)" }}>
                    <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.09)", borderRadius: 1, overflow: "hidden", marginBottom: 14, position: "relative" }}>
                        {/* Glow head */}
                        <div style={{ position: "absolute", top: -1, width: 12, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.9)", filter: "blur(3px)", left: `calc(${pct}% - 6px)`, transition: "left 0.5s cubic-bezier(.4,0,.2,1)" }} />
                        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,rgba(255,255,255,0.25),rgba(255,255,255,0.85))", borderRadius: 1, transition: "width 0.5s cubic-bezier(.4,0,.2,1)", boxShadow: "0 0 6px rgba(255,255,255,0.3)" }} />
                    </div>

                    {/* Bottom row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.45)", animation: `loaderDotPulse 1.2s ease-in-out ${i * 0.22}s infinite` }} />
                            ))}
                            <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginLeft: 8, fontFamily: "DM Sans,sans-serif" }}>Loading</span>
                        </div>
                        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
                            {String(displayPct).padStart(2, "0")}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Corner brackets */}
            {[[{ top: 20, left: 20 }, { borderTop: "1px solid rgba(255,255,255,0.13)", borderLeft: "1px solid rgba(255,255,255,0.13)" }],
            [{ top: 20, right: 20 }, { borderTop: "1px solid rgba(255,255,255,0.13)", borderRight: "1px solid rgba(255,255,255,0.13)" }],
            [{ bottom: 20, left: 20 }, { borderBottom: "1px solid rgba(255,255,255,0.13)", borderLeft: "1px solid rgba(255,255,255,0.13)" }],
            [{ bottom: 20, right: 20 }, { borderBottom: "1px solid rgba(255,255,255,0.13)", borderRight: "1px solid rgba(255,255,255,0.13)" }]
            ].map(([pos, border], i) => (
                <div key={i} style={{ position: "absolute", ...pos, width: 22, height: 22, ...border }} />
            ))}
        </div>
    );
}

/* ─── CUSTOM CURSOR (desktop only) ───────────────────── */
function Cursor() {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const actual = useRef({ x: 0, y: 0 });
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(max-width:768px)").matches) return;
        setShow(true);
        const onMove = e => { pos.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener("mousemove", onMove);
        let raf;
        const loop = () => {
            actual.current.x += (pos.current.x - actual.current.x) * 0.12;
            actual.current.y += (pos.current.y - actual.current.y) * 0.12;
            if (cursorRef.current) { cursorRef.current.style.left = actual.current.x + "px"; cursorRef.current.style.top = actual.current.y + "px"; }
            if (dotRef.current) { dotRef.current.style.left = pos.current.x + "px"; dotRef.current.style.top = pos.current.y + "px"; }
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
    }, []);

    if (!show) return null;
    return (
        <>
            <div ref={cursorRef} style={{ position: "fixed", width: 36, height: 36, border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)", mixBlendMode: "difference" }} />
            <div ref={dotRef} style={{ position: "fixed", width: 4, height: 4, background: "#fff", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)" }} />
        </>
    );
}

/* ─── THREE.JS HERO CANVAS ───────────────────────────── */
function HeroCanvas() {
    const mountRef = useRef(null);
    useEffect(() => {
        const el = mountRef.current; if (!el) return;
        const W = el.clientWidth, H = el.clientHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
        camera.position.set(0, 0, 5);
        const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 4), new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, transparent: true, opacity: 0.4 }));
        scene.add(sphere);
        const inner = new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 64), new THREE.MeshPhongMaterial({ color: 0x111111, emissive: 0x0a0a0a, transparent: true, opacity: 0.9, shininess: 80 }));
        scene.add(inner);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.008, 8, 200), new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 }));
        ring.rotation.x = Math.PI / 2.4; scene.add(ring);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dots = Array.from({ length: 6 }, (_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), dotMat); scene.add(d); return { mesh: d, angle: (i / 6) * Math.PI * 2 }; });
        const pPos = new Float32Array(900); for (let i = 0; i < 900; i++) pPos[i] = (Math.random() - 0.5) * 12;
        const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
        scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x555555, size: 0.025, transparent: true, opacity: 0.6 })));
        scene.add(new THREE.AmbientLight(0x222222));
        const dl1 = new THREE.DirectionalLight(0xffffff, 0.8); dl1.position.set(3, 3, 3); scene.add(dl1);
        const dl2 = new THREE.DirectionalLight(0x4488ff, 0.3); dl2.position.set(-3, -1, 2); scene.add(dl2);
        let mouse = { x: 0, y: 0 }, t = 0, raf;
        const onMouse = e => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2; };
        window.addEventListener("mousemove", onMouse);
        const animate = () => {
            t += 0.005;
            sphere.rotation.y = t * 0.4 + mouse.x * 0.3; sphere.rotation.x = mouse.y * 0.2;
            inner.rotation.y = t * 0.2; ring.rotation.z = t * 0.15;
            dots.forEach(d => { d.angle += 0.008; d.mesh.position.x = Math.cos(d.angle) * 2.4; d.mesh.position.z = Math.sin(d.angle) * 2.4; d.mesh.position.y = Math.sin(d.angle * 0.5) * 0.5; });
            renderer.render(scene, camera); raf = requestAnimationFrame(animate);
        };
        animate();
        const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; camera.aspect = W2 / H2; camera.updateProjectionMatrix(); renderer.setSize(W2, H2); };
        window.addEventListener("resize", onResize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMouse); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
    }, []);
    return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ─── PARTICLE BG ─────────────────────────────────────── */
function ParticleBg() {
    const ref = useRef(null);
    useEffect(() => {
        const c = ref.current, ctx = c.getContext("2d");
        let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
        const pts = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5 }));
        let raf;
        const draw = () => { ctx.clearRect(0, 0, W, H); pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill(); }); raf = requestAnimationFrame(draw); };
        draw();
        const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
        window.addEventListener("resize", onResize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
    }, []);
    return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.4 }} />;
}

/* ─── SCROLL REVEAL ──────────────────────────────────── */
function useReveal() {
    const ref = useRef(null); const [v, setV] = useState(false);
    useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []);
    return [ref, v];
}
function Reveal({ children, delay = 0, style = {} }) {
    const [ref, v] = useReveal();
    return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(40px)", transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}ms,transform .9s cubic-bezier(.16,1,.3,1) ${delay}ms`, ...style }}>{children}</div>;
}

/* ─── NAVBAR ──────────────────────────────────────────── */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
    return (
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: "0 clamp(16px,4vw,48px)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(8,8,8,0.85)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", transition: "all .4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 2 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#080808", fontFamily: "Syne" }}>K</span>
                </div>
                <span className="syne" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Karo Pitch</span>
            </div>
            <div className="nav-links-desktop" style={{ gap: 36 }}>

                <a href="#HowItWorks" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none", fontFamily: "DM Sans", letterSpacing: "0.02em", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>How It Works</a>
                <a href="#Startups" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none", fontFamily: "DM Sans", letterSpacing: "0.02em", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>Startups</a>
                <a href="#Investors" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none", fontFamily: "DM Sans", letterSpacing: "0.02em", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>Investors</a>
                <a href="#About" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none", fontFamily: "DM Sans", letterSpacing: "0.02em", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>About</a>

            </div>
            <a className="btn-primary nav-cta-desktop" href="#ApplyToPitch" style={{ padding: "10px 24px", fontSize: 13,textDecoration:"None" }}>Apply to Pitch →</a>
            <button onClick={() => setOpen(!open)} className="nav-hamburger" style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", flexDirection: "column", gap: 4, zIndex: 2 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 18, height: 1.5, background: "#fff", borderRadius: 1, transition: "all .3s", transform: open ? (i === 0 ? "rotate(45deg) translate(4px,4px)" : i === 2 ? "rotate(-45deg) translate(4px,-4px)" : "scaleX(0)") : "none" }} />)}
            </button>
            {open && (
                <div style={{ position: "absolute", top: 68, left: 0, right: 0, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "24px clamp(16px,4vw,48px) 32px", display: "flex", flexDirection: "column", gap: 20, zIndex: 1 }}>
            <a href="#HowItWorks" onClick={()=>setOpen(false)} style={{ fontSize:16, color:"rgba(255,255,255,0.7)", textDecoration:"none", fontFamily:"DM Sans" }}>How It Works</a>
            <a href="#Startups" onClick={()=>setOpen(false)} style={{ fontSize:16, color:"rgba(255,255,255,0.7)", textDecoration:"none", fontFamily:"DM Sans" }}>Startups</a>
            <a href="#Investors" onClick={()=>setOpen(false)} style={{ fontSize:16, color:"rgba(255,255,255,0.7)", textDecoration:"none", fontFamily:"DM Sans" }}>Investors</a>
            <a href="#About" onClick={()=>setOpen(false)} style={{ fontSize:16, color:"rgba(255,255,255,0.7)", textDecoration:"none", fontFamily:"DM Sans" }}>About</a>

                    <button className="btn-primary" style={{ marginTop: 8, justifyContent: "center", cursor: "pointer" }}>Apply to Pitch →</button>
                </div>
            )}
        </nav>
    );
}

/* ─── HERO ────────────────────────────────────────────── */
function Hero() {
    const navigate=useNavigate()
    return (
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(40,40,40,0.4) 0%,transparent 70%)" }}>
            <HeroCanvas />
            {[0.25, 0.5, 0.75].map(p => <div key={p} style={{ position: "absolute", left: `${p * 100}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.03)", zIndex: 1 }} />)}
            <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", width: "100%", paddingTop: "clamp(100px,15vw,140px)" }}>
                <div style={{ maxWidth: 680 }}>
                    <div className="tag" style={{ animation: "fadeUp .8s both" }}>India's Startup Pitch Platform</div>
                    <h1 className="syne" style={{ fontSize: "clamp(40px,8vw,88px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: 28, animation: "fadeUp .9s 100ms both" }}>
                        Pitch Your<br /><span className="shimmer-text">Startup</span><br />to Investors
                    </h1>
                    <p style={{ fontSize: "clamp(14px,1.6vw,18px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 480, marginBottom: 44, animation: "fadeUp .9s 200ms both" }}>
                        Karo Pitch connects early-stage founders from Tier-2 and Tier-3 cities across India directly with investors — making startup funding accessible to every builder in Bharat.
                    </p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", animation: "fadeUp .9s 300ms both" }}>
                        <a className="btn-primary" href="#ApplyToPitch" style={{textDecoration:"None"}}>Apply to Pitch →</a>
                        <a className="btn-ghost" href="#Startups" style={{textDecoration:"None"}}>Explore Startups</a>
                    </div>
                    <div style={{ display: "flex", gap: "clamp(24px,4vw,48px)", marginTop: 72, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap", animation: "fadeUp .9s 400ms both" }}>
                        {[["5K+", "Stories Published"], ["1M+", "Community Reach"], ["1K+", "Startups Featured"]].map(([n, l]) => (
                            <div key={l}>
                                <div className="syne" style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{n}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2, animation: "fadeIn 1s 1s both" }}>
                <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom,rgba(255,255,255,0.4),transparent)" }} />
            </div>
        </section>
    );
}

/* ─── ABOUT ───────────────────────────────────────────── */
function About() {
    return (
        <section className="sec-pad" id="About" style={{ position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <div className="grid-2col">
                    <Reveal>
                        <div className="section-line" />
                        <div className="tag">What is Karo Pitch?</div>
                        <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 28 }}>
                            Bridging the Gap Between Founders & Capital
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 20, fontSize: 15 }}>
                            Thousands of founders across India are building incredible businesses — from D2C brands and manufacturing startups to innovative tech companies. Yet many struggle to access investors, mentorship, and visibility.
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: 15, marginBottom: 36 }}>
                            Karo Pitch is a curated startup pitching platform where selected founders present their businesses directly to investors. Our mission: make funding accessible to builders across all of Bharat.
                        </p>
                        <button className="btn-ghost">Learn More →</button>
                    </Reveal>
                    <Reveal delay={150}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {[{ icon: "🏙️", label: "Tier-2 & 3 Focus", desc: "Unlocking capital for founders beyond metros" }, { icon: "🤝", label: "Direct Access", desc: "Straight connections to active investors" }, { icon: "📡", label: "Structured Pitching", desc: "Curated live pitch events with panels" }, { icon: "🌱", label: "Ecosystem Growth", desc: "Building India's startup story, together" }].map((c, i) => (
                                <div key={i} className="card-glass" style={{ padding: "28px 24px" }}>
                                    <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                                    <div className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{c.label}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{c.desc}</div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ─── HOW IT WORKS ────────────────────────────────────── */
function HowItWorks() {
    const steps = [{ n: "01", icon: "📄", title: "Apply", desc: "Submit your startup details and pitch deck through our streamlined platform." }, { n: "02", icon: "📊", title: "Get Shortlisted", desc: "Our expert team reviews applications and selects the most promising startups." }, { n: "03", icon: "🎤", title: "Pitch Live", desc: "Shortlisted founders pitch directly to a curated panel of active investors." }, { n: "04", icon: "🚀", title: "Raise Funding", desc: "Connect with investors, receive mentorship, and scale your startup." }];
    return (
        <section className="sec-pad" id="HowItWorks" style={{ background: "linear-gradient(180deg,transparent 0%,rgba(20,20,20,0.5) 50%,transparent 100%)", position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <Reveal style={{ textAlign: "center", marginBottom: 80 }}>
                    <div className="tag" style={{ display: "inline-block" }}>Process</div>
                    <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em" }}>
                        From Idea to Investment <br /><span className="gradient-text">in 4 Steps</span>
                    </h2>
                </Reveal>
                <div className="grid-4col">
                    {steps.map((s, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div className="card-glass" style={{ padding: "36px 28px", height: "100%" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                                    <span style={{ fontFamily: "Syne", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{s.n}</span>
                                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                                </div>
                                <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#fff" }}>{s.title}</h3>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{s.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── WHO CAN APPLY ───────────────────────────────────── */
function WhoCanApply() {
    const sectors = [{ icon: "🛍️", title: "D2C Brands", desc: "Consumer brands building products for modern India." }, { icon: "📱", title: "Consumer Startups", desc: "Apps, platforms, and consumer-focused innovations." }, { icon: "🏭", title: "MSMEs", desc: "Traditional businesses ready to scale with funding." }, { icon: "💻", title: "SaaS Startups", desc: "Technology platforms solving global problems." }, { icon: "⚙️", title: "Manufacturing", desc: "Hardware and industrial innovation from Bharat." }, { icon: "🌾", title: "Bharat Startups", desc: "Solving problems for Tier-2, Tier-3, and rural India." }];
    return (
        <section className="sec-pad" style={{ position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <Reveal style={{ marginBottom: 80 }}>
                    <div className="section-line" />
                    <div className="tag">Who Can Apply</div>
                    <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", maxWidth: 600 }}>
                        Startups From <span className="gradient-text">Every Sector</span> Are Welcome
                    </h2>
                </Reveal>
                <div className="grid-3col">
                    {sectors.map((s, i) => (
                        <Reveal key={i} delay={i * 60}>
                            <div className="card-glass" style={{ padding: "32px 28px" }}>
                                <div style={{ fontSize: 36, marginBottom: 18 }}>{s.icon}</div>
                                <h3 className="syne" style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#fff" }}>{s.title}</h3>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{s.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── INVESTORS ───────────────────────────────────────── */
function Investors() {
    const investors = [{ name: "Arun Mehta", role: "Angel Investor", portfolio: "20+ Startups" }, { name: "Priya Singh", role: "VC Partner", portfolio: "Series A–C" }, { name: "Rahul Kapoor", role: "Founder & Angel", portfolio: "15+ Bets" }, { name: "Venture Fund", role: "Venture Capital", portfolio: "Stage Agnostic" }];
    return (
        <section className="sec-pad" id="Investors" style={{ background: "linear-gradient(180deg,transparent 0%,rgba(15,15,15,0.8) 50%,transparent 100%)", position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <Reveal style={{ textAlign: "center", marginBottom: 80 }}>
                    <div className="tag" style={{ display: "inline-block" }}>Investors</div>
                    <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em" }}>
                        Meet Investors Seeking <br /><span className="gradient-text">The Next Big Startup</span>
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, maxWidth: 500, margin: "20px auto 0" }}>Angel investors, venture capitalists, and strategic partners actively looking to fund promising Indian startups.</p>
                </Reveal>
                <div className="grid-4col">
                    {investors.map((inv, i) => (
                        <Reveal key={i} delay={i * 80}>
                            <div className="card-glass" style={{ padding: "36px 28px", textAlign: "center" }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `hsl(${i * 60},8%,20%)`, border: "1px solid rgba(255,255,255,0.12)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{["🧑‍💼", "👩‍💼", "👨‍💻", "🏢"][i]}</div>
                                <div className="syne" style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#fff" }}>{inv.name}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16, letterSpacing: "0.04em" }}>{inv.role}</div>
                                <div style={{ display: "inline-block", padding: "4px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>{inv.portfolio}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── FEATURED STARTUPS ───────────────────────────────── */
function FeaturedStartups() {
    const startups = [{ name: "Zepto", sector: "Quick Commerce · Grocery", desc: "Ultra-fast grocery delivery startup promising 10-minute deliveries across major Indian cities.", tag: "Featured", color: "#1a2a1a" }, { name: "DeHaat", sector: "AgriTech", desc: "Full-stack agriculture platform providing farmers with inputs, advisory, and market linkages.", tag: "Raising", color: "#1a1a2a" }, { name: "Zetwerk", sector: "Manufacturing", desc: "Global manufacturing marketplace connecting enterprises with verified manufacturing partners.", tag: "Closed", color: "#2a1a1a" }, { name: "HealthifyMe", sector: "HealthTech", desc: "AI-powered digital health platform focused on fitness, nutrition, and lifestyle coaching.", tag: "Pitching", color: "#1a2a2a" }];
    return (
        <section className="sec-pad" id="Startups" style={{ position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, flexWrap: "wrap", gap: 20 }}>
                    <div>
                        <div className="section-line" />
                        <div className="tag">Portfolio</div>
                        <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em" }}>Startups Building <br /><span className="gradient-text">the Future</span></h2>
                    </div>
                    <button className="btn-ghost" style={{ marginBottom: 8 }}>View All →</button>
                </Reveal>
                <div className="grid-2col-eq">
                    {startups.map((s, i) => (
                        <Reveal key={i} delay={i * 80}>
                            <div className="card-glass" style={{ padding: "36px", background: `linear-gradient(135deg,${s.color} 0%,rgba(255,255,255,0.02) 100%)` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <span className="syne" style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{s.name[0]}</span>
                                    </div>
                                    <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{s.tag}</span>
                                </div>
                                <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.name}</h3>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.sector}</div>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{s.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── POWERED BY ──────────────────────────────────────── */
function PoweredBy() {
    const navigate = useNavigate();
    const stats = [{ n: "5000+", l: "Startup Stories" }, { n: "1M+", l: "Community Reach" }, { n: "1000+", l: "Startups Featured" }];
    return (
        <section className="sec-pad" style={{ background: "linear-gradient(180deg,transparent 0%,rgba(18,18,18,0.9) 50%,transparent 100%)", position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <div className="grid-2col">
                    <Reveal>
                        <div className="section-line" />
                        <div className="tag">Powered By</div>
                        <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 28 }}>Powered by <br /><span className="gradient-text">KaroStartup</span></h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>KaroStartup is one of India's fastest-growing startup storytelling platforms, sharing thousands of founder journeys and inspiring entrepreneurs across the country.</p>
                        <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: 15, marginBottom: 36 }}>With Karo Pitch, we're taking the next step — helping founders not just tell their stories, but also raise funding.</p>
                        <a
                            href="https://www.karostartup.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ textDecoration: 'None' }}
                        >
                            Visit KaroStartup →
                        </a>
                    </Reveal>
                    <Reveal delay={150}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {stats.map((s, i) => (
                                <div key={i} style={{ padding: "28px 32px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color .3s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                                    <span className="stat-number">{s.n}</span>
                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ─── CTA ─────────────────────────────────────────────── */
function CTA() {
    return (
        <section className="sec-pad" id="ApplyToPitch" style={{ position: "relative", zIndex: 2 }}>
            <div className="inner-wrap">
                <Reveal>
                    <div style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: "clamp(48px,8vw,100px) clamp(24px,6vw,80px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: "30%", left: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)", filter: "blur(80px)", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: "20%", right: "20%", width: 200, height: 200, borderRadius: "50%", background: "rgba(180,180,255,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
                        <div className="tag" style={{ display: "inline-block", position: "relative", zIndex: 1 }}>Ready to Pitch?</div>
                        <h2 className="syne" style={{ fontSize: "clamp(32px,6vw,72px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: 24, position: "relative", zIndex: 1 }}>
                            Ready to Pitch<br /><span className="shimmer-text">Your Startup?</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(14px,1.4vw,16px)", maxWidth: 460, margin: "0 auto 48px", lineHeight: 1.7, position: "relative", zIndex: 1 }}>
                            Apply now and get the opportunity to present your startup to investors and scale your business across India.
                        </p>
                        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                            <button className="btn-primary" style={{ fontSize: 15, padding: "16px 40px" }}>Apply Now →</button>
                            <button className="btn-ghost" style={{ fontSize: 15, padding: "16px 40px" }}>Partner With Us</button>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ─── FOOTER ──────────────────────────────────────────── */
function Footer() {
    return (
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(24px,4vw,48px) clamp(16px,4vw,48px)", maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#080808", fontFamily: "Syne" }}>K</span>
                </div>
                <span className="syne" style={{ fontSize: 14, fontWeight: 700 }}>Karo Pitch</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>© 2025 KaroStartup. Powering Bharat's Founders.</div>
            <div style={{ display: "flex", gap: 24 }}>
                {["Privacy", "Terms", "Contact"].map(l => (
                    <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.04em", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>{l}</a>
                ))}
            </div>
        </footer>
    );
}

const Home = () => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const s = document.createElement("style");
        s.textContent = globalStyles;
        document.head.appendChild(s);
        return () => document.head.removeChild(s);
    }, []);
    return (
        <div style={{ background: "#080808", minHeight: "100vh", position: "relative" }}>
            {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
            <div style={{ opacity: loaded ? 1 : 0, transition: "opacity .8s ease .1s", pointerEvents: loaded ? "all" : "none" }}>
                <div className="noise-overlay" />
                <ParticleBg />
                <Cursor />
                <Navbar />
                <Hero />
                <About />
                <HowItWorks />
                <WhoCanApply />
                <Investors />
                <FeaturedStartups />
                <PoweredBy />
                <CTA />
                <Footer />
            </div>
        </div>
    )
}

export default Home
