/* =========================================================================
   TESTIMONIALS
   Fill in a quote and a name below. A testimonial only appears on the site
   once both `quote` and `name` are filled in. As long as none are filled in,
   the whole Testimonials section and its menu link stay hidden.
   ========================================================================= */
const TESTIMONIALS = [
  {
    quote: "",            // e.g. "Jonas was the one we could always count on to..."
    name: "",             // e.g. "Jane Doe"
    role: "Former manager",
    company: "SpectralBot",
  },
  {
    quote: "",
    name: "",
    role: "Internship supervisor",
    company: "Siemens",
  },
];

/* ========================================================================= */

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  renderTestimonials();
  setupNav();
  setupReveal();
  setupBackground();
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
});

function renderTestimonials() {
  const filled = TESTIMONIALS.filter((t) => t.quote.trim() && t.name.trim());
  if (!filled.length) return;
  const wrap = document.querySelector("[data-testimonials]");
  for (const t of filled) {
    const fig = document.createElement("figure");
    fig.className = "quote";
    const q = document.createElement("blockquote");
    q.textContent = t.quote.trim();
    const cap = document.createElement("figcaption");
    const name = document.createElement("strong");
    name.textContent = t.name.trim();
    cap.append(name, [t.role, t.company].filter(Boolean).join(" · "));
    fig.append(q, cap);
    wrap.append(fig);
  }
  document.getElementById("testimonials").hidden = false;
  document.querySelectorAll("[data-testimonials-link]").forEach((a) => (a.hidden = false));
}

function setupNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.getElementById("nav-links");
  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => e.target.closest("a") && close());
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* Background: a perspective grid floor plus drifting network nodes
   (a nod to both XR and AV-over-IP). */
function setupBackground() {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, dpr, nodes, t = 0, running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(46, (w * h) / 28000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.7,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    }));
  }

  function drawGrid() {
    const horizon = h * 0.62, cx = w / 2;
    ctx.lineWidth = 1;
    for (let i = -14; i <= 14; i++) {
      const a = 0.05 * (1 - Math.abs(i) / 15);
      ctx.strokeStyle = `rgba(124,140,255,${a})`;
      ctx.beginPath(); ctx.moveTo(cx + i * 6, horizon); ctx.lineTo(cx + i * w * 0.18, h); ctx.stroke();
    }
    for (let j = 0; j < 14; j++) {
      const p = ((j + (t * 0.004) % 1) / 14);
      const y = horizon + (h - horizon) * p * p;
      ctx.strokeStyle = `rgba(94,230,208,${0.08 * p})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  function drawNodes() {
    const max = 150;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < max) {
          ctx.strokeStyle = `rgba(94,230,208,${0.12 * (1 - d / max)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(180,240,230,0.5)";
    for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2); ctx.fill(); }
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    drawGrid();
    drawNodes();
    if (reduced) return;
    running = !document.hidden;
    t++;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h * 0.7) n.vy *= -1;
    }
    if (!document.hidden) requestAnimationFrame(frame);
  }

  resize();
  frame();
  window.addEventListener("resize", () => { resize(); if (reduced) frame(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduced && !running) { running = true; requestAnimationFrame(frame); } });
}
