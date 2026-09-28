document.documentElement.classList.add("js");
document.querySelectorAll("[data-count]").forEach((b)=>(b.textContent="0"));
// 1. Efek mengetik
const kata = ["Pengembangan Perangkat Lunak dan Gim", "Belajar Coding. Bangun Aplikasi.", "Ciptakan Gim Impianmu!"];
const el = document.getElementById("typing");
let k = 0, i = 0, hapus = false;
function ketik() {
  const t = kata[k];
  el.textContent = t.slice(0, i);
  if (!hapus && i === t.length) { hapus = true; return setTimeout(ketik, 1500); }
  if (hapus && i === 0) { hapus = false; k = (k + 1) % kata.length; }
  i += hapus ? -1 : 1;
  setTimeout(ketik, hapus ? 35 : 75);
}
ketik();

// 2. Muncul saat di-scroll + hitung angka
const hitung = (b) => {
  const target = +b.dataset.count; let n = 0;
  const t = setInterval(() => { b.textContent = ++n; if (n >= target) clearInterval(t); }, 200);
};
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("show");
      e.target.querySelectorAll("[data-count]").forEach(hitung);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((r) => io.observe(r));

// 3. Progress bar scroll
const bar = document.getElementById("progress");
addEventListener("scroll", () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
});

// 4. Menu aktif sesuai posisi scroll
const links = document.querySelectorAll("#menu a");
const targets = [...links].map((a) => document.querySelector(a.getAttribute("href")));
const nio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
targets.forEach((t) => t && nio.observe(t));

// 5. Efek 3D tilt pada kartu
document.querySelectorAll(".tilt").forEach((c) => {
  c.addEventListener("mousemove", (e) => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-4px)`;
  });
  c.addEventListener("mouseleave", () => (c.style.transform = ""));
});

// 6. Menu mobile + tahun otomatis
const menu = document.getElementById("menu");
document.getElementById("burger").onclick = () => menu.classList.toggle("open");
links.forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
document.getElementById("year").textContent = new Date().getFullYear();

// 7. Kursor halus + trail
(function () {
  if (!matchMedia("(any-pointer:fine)").matches && !matchMedia("(hover:hover)").matches) return;
  document.documentElement.classList.add("custom-cursor");
  const dot = document.createElement("div"); dot.className = "cursor-dot";
  const ring = document.createElement("div"); ring.className = "cursor-ring";
  const cvs = document.createElement("canvas"); cvs.id = "trail";
  document.body.append(cvs, ring, dot);
  const ctx = cvs.getContext("2d");
  let W, H;
  const resize = () => {
    const d = devicePixelRatio || 1;
    W = innerWidth; H = innerHeight;
    cvs.width = W * d; cvs.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  resize(); addEventListener("resize", resize);

  let mx = W / 2, my = H / 2, rx = mx, ry = my, tx = mx, ty = my;
  const pts = [], MAX = 32;
  const A = [47, 128, 237], B = [255, 159, 67];

  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.opacity = ring.style.opacity = 1; });
  document.addEventListener("mouseleave", () => (dot.style.opacity = ring.style.opacity = 0));
  addEventListener("mousedown", () => ring.classList.add("down"));
  addEventListener("mouseup", () => ring.classList.remove("down"));
  document.addEventListener("mouseover", (e) => {
    const on = !!e.target.closest("a,button,.card,.chips span");
    ring.classList.toggle("hover", on); dot.classList.toggle("hover", on);
  });

  (function loop() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;   // ring mengikuti halus
    tx += (mx - tx) * 0.32; ty += (my - ty) * 0.32;   // titik trail
    dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;

    const last = pts[pts.length - 1];
    if (!last || Math.hypot(tx - last.x, ty - last.y) > 0.6) pts.push({ x: tx, y: ty });
    else if (pts.length) pts.shift();               // diam -> trail memudar
    while (pts.length > MAX) pts.shift();

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "butt"; ctx.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;
      const c = A.map((a, k) => Math.round(a + (B[k] - a) * t));
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${t * 0.85})`;
      ctx.lineWidth = t * 10;
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
    requestAnimationFrame(loop);
  })();
})();