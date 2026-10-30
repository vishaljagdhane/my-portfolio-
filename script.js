/* ============================================================
   Vishal Jagdhane — Portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- THEME ---------------- */
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem("vj-theme"); } catch (e) { return null; } })();
  if (saved) root.setAttribute("data-theme", saved);

  $("#themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("vj-theme", next); } catch (e) { /* private mode */ }
  });

  /* ---------------- PRELOADER ---------------- */
  const preloader = $("#preloader");
  const loadBar = $("#loadBar");
  const loadPct = $("#loadPct");
  let pct = 0;

  const tick = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 14 + 4);
    loadBar.style.width = pct + "%";
    loadPct.textContent = Math.floor(pct) + "%";
    if (pct >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        preloader.classList.add("is-done");
        splitName();
        startTyping();
      }, 350);
    }
  }, 110);

  /* ---------------- HERO NAME SPLIT ---------------- */
  function splitName() {
    const el = $("[data-split]");
    if (!el || reduced) return;
    const text = el.textContent.trim();
    el.textContent = "";
    text.split("").forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch === " " ? " " : ch;
      s.style.animationDelay = i * 0.045 + "s";
      el.appendChild(s);
    });
  }

  /* ---------------- TYPING ---------------- */
  const ROLES = [
    "Full Stack Developer",
    "AI Engineer",
    "React.js & Next.js Developer",
    "Python & FastAPI Developer",
    "LLM / RAG / Agentic AI Builder"
  ];
  function startTyping() {
    const out = $("#typed");
    if (!out) return;
    if (reduced) { out.textContent = ROLES[0]; return; }

    let i = 0, j = 0, erasing = false;
    (function loop() {
      const word = ROLES[i];
      out.textContent = word.slice(0, j);

      let delay = erasing ? 40 : 85;
      if (!erasing && j === word.length) { erasing = true; delay = 1700; }
      else if (erasing && j === 0) { erasing = false; i = (i + 1) % ROLES.length; delay = 350; }
      else { j += erasing ? -1 : 1; }

      setTimeout(loop, delay);
    })();
  }

  /* ---------------- CUSTOM CURSOR ---------------- */
  const dot = $("#cursorDot"), ring = $("#cursorRing");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add("cursor-on");
      dot.style.transform = `translate(${mx - 3.5}px, ${my - 3.5}px)`;
    });
    addEventListener("mouseleave", () => document.body.classList.remove("cursor-on"));

    (function follow() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx - 19}px, ${ry - 19}px)`;
      requestAnimationFrame(follow);
    })();

    const hot = "a, button, [data-cursor='link'], .soft__chips span, .proj, .filter";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hot)) document.body.classList.add("cursor-hot");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hot)) document.body.classList.remove("cursor-hot");
    });
  }

  /* ---------------- PARTICLE BACKGROUND ---------------- */
  const canvas = $("#bgCanvas");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let w, h, particles = [], mouse = { x: -999, y: -999 };

    function size() {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      const count = Math.min(90, Math.floor(w / 18));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, .55)";
        ctx.fill();

        for (let k = i + 1; k < particles.length; k++) {
          const q = particles[k];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 118) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.16 * (1 - d / 118)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 * (1 - dm / 160)})`;
          ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    }

    addEventListener("resize", size);
    addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener("mouseout", () => { mouse.x = mouse.y = -999; });
    size();
    draw();
  }

  /* ---------------- REVEAL ON SCROLL ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);

      // stagger children of the same parent
      const sibs = $$(".reveal", entry.target.parentElement).filter((n) => !n.classList.contains("is-in"));
      sibs.forEach((n, i) => setTimeout(() => n.classList.add("is-in"), (i + 1) * 90));

      $$(".skill", entry.target).forEach((s, i) => {
        setTimeout(() => { $("i", $(".bar", s)).style.width = s.dataset.p + "%"; }, i * 130);
      });
      $$(".count", entry.target.parentElement).forEach(countUp);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -40px" });

  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------- COUNTERS ---------------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const to = parseInt(el.dataset.to, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const dur = 1500;
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------------- HEADER / SCROLLSPY / PROGRESS ---------------- */
  const header = $("#header");
  const scrollBar = $("#scrollBar");
  const toTop = $("#toTop");
  const links = $$(".nav__link");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  function onScroll() {
    const y = scrollY;
    header.classList.toggle("is-stuck", y > 40);
    toTop.classList.toggle("is-on", y > 600);

    const max = document.documentElement.scrollHeight - innerHeight;
    scrollBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    let current = sections[0];
    sections.forEach((s) => { if (y >= s.offsetTop - 140) current = s; });
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current.id));
  }

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

  /* ---------------- MOBILE NAV ---------------- */
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest(".nav__link")) {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------- 3D NAV TILT ---------------- */
  if (!reduced && window.matchMedia("(min-width: 1025px)").matches) {
    nav.addEventListener("mousemove", (e) => {
      const r = nav.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      nav.style.transform = `rotateX(${y * -12}deg) rotateY(${x * 10}deg) translateZ(6px)`;
    });
    nav.addEventListener("mouseleave", () => { nav.style.transform = ""; });
  }

  /* ---------------- PROJECT FILTERS ---------------- */
  const projects = $$(".proj");
  $$(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filter").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || p.dataset.cat.split(" ").includes(f);
        p.classList.remove("is-shown");
        p.classList.toggle("is-hidden", !show);
        if (show) {
          void p.offsetWidth;        // restart the entry animation
          p.classList.add("is-shown");
        }
      });
    });
  });

  /* ---------------- CARD SPOTLIGHT + TILT ---------------- */
  projects.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (reduced) return;
      const rx = ((y / r.height) - 0.5) * -7;
      const ry = ((x / r.width) - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  /* ---------------- MAGNETIC BUTTONS ---------------- */
  if (!reduced) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------- CONTACT FORM ---------------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate(input) {
    const field = input.closest(".field");
    const msg = $("small", field);
    let err = "";

    if (!input.value.trim()) err = "This field is required.";
    else if (input.type === "email" && !EMAIL_RE.test(input.value.trim())) err = "Enter a valid email address.";
    else if (input.id === "cMsg" && input.value.trim().length < 10) err = "Message should be at least 10 characters.";

    field.classList.toggle("is-bad", !!err);
    msg.textContent = err;
    return !err;
  }

  $$("#contactForm input, #contactForm textarea").forEach((input) => {
    input.addEventListener("blur", () => validate(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("is-bad")) validate(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = $$("#contactForm input, #contactForm textarea");
    const ok = inputs.map(validate).every(Boolean);

    if (!ok) {
      note.textContent = "Please fix the highlighted fields.";
      note.classList.add("is-bad");
      return;
    }

    const name = $("#cName").value.trim();
    const email = $("#cEmail").value.trim();
    const subject = $("#cSubject").value.trim();
    const message = $("#cMsg").value.trim();

    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    window.location.href = `mailto:vishal.jagdhane72@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    note.classList.remove("is-bad");
    note.textContent = "Opening your mail app — thanks for reaching out!";
    form.reset();
  });

  /* ---------------- MISC ---------------- */
  $("#year").textContent = new Date().getFullYear();

  // Smooth-scroll for in-page anchors (respects reduced motion)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + scrollY - (innerWidth > 768 ? 70 : 60);
      scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    });
  });
})();
