const phrases = [
  "Gestão financeira, processos e decisões no dia a dia da operação.",
  "Fluxo de caixa, conciliação e indicadores com precisão.",
  "Proativa, resiliente e pronta para novos desafios."
];

const tagline = document.querySelector("#tagline");
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
  if (!tagline) return;
  const current = phrases[phraseIndex];
  tagline.innerHTML = `${current.slice(0, charIndex)}<span class="cursor"></span>`;

  if (!deleting && charIndex < current.length) {
    charIndex += 1;
    setTimeout(typeEffect, 42);
    return;
  }

  if (!deleting && charIndex === current.length) {
    deleting = true;
    setTimeout(typeEffect, 1600);
    return;
  }

  if (deleting && charIndex > 0) {
    charIndex -= 1;
    setTimeout(typeEffect, 22);
    return;
  }

  deleting = false;
  phraseIndex = (phraseIndex + 1) % phrases.length;
  setTimeout(typeEffect, 280);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        entry.target.querySelectorAll(".bar span").forEach((bar) => {
          bar.style.width = bar.dataset.level;
        });
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal, .lang-row").forEach((el) => observer.observe(el));

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

function highlightNav() {
  const fromTop = window.scrollY + 120;
  sections.forEach((section) => {
    const id = section.getAttribute("id");
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (!link) return;
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    link.classList.toggle("active", fromTop >= top && fromTop < bottom);
  });
}

window.addEventListener("scroll", highlightNav);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const id = anchor.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    const offset = 76;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", id);
  });
});

const photo = document.querySelector(".photo-frame");
document.querySelector(".hero")?.addEventListener("mousemove", (event) => {
  if (!photo) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 12;
  const y = (event.clientY / window.innerHeight - 0.5) * 12;
  photo.style.transform = `translate(${x}px, ${y}px)`;
});

function prepareA4Layout() {
  document.documentElement.classList.add("a4-mode");
  document.body.classList.add("exporting");
  document.querySelectorAll(".reveal, .job").forEach((el) => el.classList.add("visible"));
  if (tagline) tagline.textContent = phrases[0];
  if (photo) photo.style.transform = "none";
  window.scrollTo(0, 0);
}

function restoreA4Layout(originalTagline) {
  document.documentElement.classList.remove("a4-mode");
  document.body.classList.remove("exporting");
  if (tagline && originalTagline !== undefined) tagline.innerHTML = originalTagline;
}

document.querySelector("#print-cv")?.addEventListener("click", () => window.print());

window.addEventListener("beforeprint", prepareA4Layout);
window.addEventListener("afterprint", () => restoreA4Layout());

async function exportPdf() {
  const buttons = document.querySelectorAll("[data-export]");
  const content = document.querySelector("#cv-content");
  if (!content) return;

  if (typeof html2pdf === "undefined") {
    document.querySelector("#print-cv")?.click();
    return;
  }

  const previousLabels = [];
  buttons.forEach((button) => {
    previousLabels.push(button.innerHTML);
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...';
  });

  const originalTagline = tagline ? tagline.innerHTML : "";
  prepareA4Layout();

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 400));

    await html2pdf()
      .set({
        margin: [6, 6, 6, 6],
        filename: "Priscila_Rios_de_Souza_Curriculo.pdf",
        image: { type: "jpeg", quality: 0.94 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#f6f3ee",
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      })
      .from(content)
      .save();
  } catch (error) {
    console.error(error);
    window.print();
  } finally {
    restoreA4Layout(originalTagline);
    buttons.forEach((button, index) => {
      button.disabled = false;
      button.innerHTML = previousLabels[index];
    });
  }
}

document.querySelectorAll("[data-export]").forEach((button) => {
  button.addEventListener("click", exportPdf);
});

typeEffect();
highlightNav();
