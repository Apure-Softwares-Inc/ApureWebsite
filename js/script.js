const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function initCursorOrb() {
  const orb = document.querySelector("[data-cursor-orb]");
  if (!orb || window.matchMedia("(hover: none), (pointer: coarse)").matches || reducedMotion) return;

  let pointerX = -100;
  let pointerY = -100;
  let orbX = -100;
  let orbY = -100;

  const render = () => {
    orbX += (pointerX - orbX) * 0.16;
    orbY += (pointerY - orbY) * 0.16;
    orb.style.transform = `translate3d(${orbX - orb.offsetWidth / 2}px, ${orbY - orb.offsetHeight / 2}px, 0)`;
    window.requestAnimationFrame(render);
  };

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    orb.classList.add("is-visible");
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, input, select, textarea, summary")) {
      orb.classList.add("is-active");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button, input, select, textarea, summary")) {
      orb.classList.remove("is-active");
    }
  });

  render();
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.13 },
  );

  items.forEach((item) => observer.observe(item));
}

function initTrustSlider() {
  const slider = document.querySelector("[data-trust-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-trust-track]");
  const slides = Array.from(slider.querySelectorAll("[data-trust-slide]"));
  const previous = document.querySelector("[data-trust-previous]");
  const next = document.querySelector("[data-trust-next]");
  const status = document.querySelector("[data-trust-status]");
  if (!track || !slides.length || !previous || !next) return;

  let index = 0;

  const update = () => {
    const slide = slides[index];
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const offset = index * (slide.getBoundingClientRect().width + gap);
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    slides.forEach((item, slideIndex) => {
      const isActive = slideIndex === index;
      item.setAttribute("aria-hidden", String(!isActive));
      item.querySelectorAll("a, button").forEach((control) => {
        control.tabIndex = isActive ? 0 : -1;
      });
    });
    if (status) status.textContent = `Project ${index + 1} of ${slides.length}`;
  };

  previous.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  next.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    update();
  });

  window.addEventListener("resize", update);
  update();
}

function initMotionRails() {
  document.querySelectorAll("[data-motion-rail]").forEach((rail) => {
    const originalItems = Array.from(rail.children);
    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      rail.appendChild(clone);
    });
  });
}

function initServiceNavigation() {
  const links = Array.from(document.querySelectorAll("[data-service-link]"));
  const sections = Array.from(document.querySelectorAll("[data-service-section]"));
  if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

  const linkById = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.remove("is-active"));
      const active = linkById.get(visible.target.id);
      if (active) {
        active.classList.add("is-active");
        active.scrollIntoView({ inline: "center", block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
      }
    },
    { rootMargin: "-24% 0px -58% 0px", threshold: [0.08, 0.2, 0.4] },
  );

  sections.forEach((section) => observer.observe(section));
}

function initPackageSelection() {
  const packageField = document.querySelector("#package");
  if (!packageField) return;

  const params = new URLSearchParams(window.location.search);
  const selectedPackage = params.get("package");
  if (selectedPackage && Array.from(packageField.options).some((option) => option.value === selectedPackage)) {
    packageField.value = selectedPackage;
  }

  if (params.get("intent") === "quote") {
    const intentField = document.querySelector("#intent");
    if (intentField) intentField.value = "fixed-price-quote";
  }
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const email = form.dataset.mailto || "NOruche@apure.ca";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const subject = `Apure' project inquiry: ${data.get("package") || data.get("intent") || "New project"}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Organization: ${data.get("organization") || "Not provided"}`,
      `Project type: ${data.get("package") || "Not sure yet"}`,
      `Budget: ${data.get("budget") || "Not provided"}`,
      `Timeline: ${data.get("timeline") || "Not provided"}`,
      "",
      "Project details:",
      data.get("message"),
    ].join("\n");

    if (status) status.textContent = "Opening your email app with the project details ready.";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

function initYear() {
  document.querySelectorAll("[data-current-year]").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
}

initNavigation();
initCursorOrb();
initReveals();
initTrustSlider();
initMotionRails();
initServiceNavigation();
initPackageSelection();
initContactForm();
initYear();
