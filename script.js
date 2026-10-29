const nav = document.getElementById("nav");
const progress = document.getElementById("progress");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const main = document.getElementById("main");
const footer = document.querySelector(".footer");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopQuery = window.matchMedia("(min-width: 861px)");

let scrollTicking = false;

function updateScrollState() {
  nav.classList.toggle("scrolled", window.scrollY > 8);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  progress.style.width = ratio * 100 + "%";

  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  function () {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollState);
  },
  { passive: true }
);

window.addEventListener("resize", updateScrollState);
updateScrollState();

let menuOpen = false;

function setMenu(open, restoreFocus = true) {
  menuOpen = open;
  mobileMenu.classList.toggle("open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.inert = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
  main.inert = open;
  footer.inert = open;

  if (open) {
    const firstLink = mobileMenu.querySelector("a, button");
    window.setTimeout(function () {
      if (firstLink) firstLink.focus();
    }, 60);
  } else if (restoreFocus) {
    menuToggle.focus();
  }
}

mobileMenu.inert = true;

menuToggle.addEventListener("click", function () {
  setMenu(!menuOpen);
});

mobileMenu.addEventListener("click", function (event) {
  if (event.target.closest("a")) {
    setMenu(false, false);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && menuOpen) {
    setMenu(false);
  }
});

desktopQuery.addEventListener("change", function (event) {
  if (event.matches && menuOpen) {
    setMenu(false, false);
  }
});

const sections = Array.from(document.querySelectorAll("main section[id]"));
const navAnchors = Array.from(document.querySelectorAll(".nav-links a, .mobile-links a"));

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const target = "#" + entry.target.id;

        navAnchors.forEach(function (link) {
          const isActive = link.getAttribute("href") === target;
          link.classList.toggle("active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-32% 0px -58% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    spy.observe(section);
  });
}

const toast = document.getElementById("toast");
const resetTimers = new WeakMap();
let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(function () {
    toast.classList.remove("show");
  }, 2400);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "-1000px";
  document.body.appendChild(field);
  field.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  field.remove();
  return copied;
}

document.querySelectorAll(".copy-btn").forEach(function (button) {
  const label = button.querySelector(".copy-label");
  const originalLabel = label.textContent;
  const short = button.classList.contains("copy-btn--text");

  button.addEventListener("click", async function () {
    try {
      const copied = await copyText(button.dataset.copy || "oku8");
      if (!copied) throw new Error("copy failed");

      button.classList.add("is-copied");
      label.textContent = short ? "Copied" : "Copied: oku8";
      showToast("Discord handle copied: oku8");

      window.clearTimeout(resetTimers.get(button));
      resetTimers.set(
        button,
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          label.textContent = originalLabel;
        }, 2400)
      );
    } catch (error) {
      showToast("Couldn't copy. My Discord is oku8");
    }
  });
});

const panel = document.getElementById("topology");

if (panel) {
  const tabs = Array.from(panel.querySelectorAll('[role="tab"]'));
  const detailPanel = document.getElementById("node-detail");
  const detailKicker = document.getElementById("detailKicker");
  const detailText = document.getElementById("detailText");

  const layers = {
    edge: {
      kicker: "LAYER 01 / EDGE",
      text: "Where players land. Proxy routing, fallback, and the handoff into queue."
    },
    queue: {
      kicker: "LAYER 02 / QUEUE",
      text: "Where matches are made. Queues, parties, and the rules that keep pairing fair."
    },
    arena: {
      kicker: "LAYER 03 / ARENA",
      text: "Where the game runs. Instances, kits, death handling, and the tick budget."
    },
    state: {
      kicker: "LAYER 04 / STATE",
      text: "Where nothing is lost. Stats, loadouts, and configs that survive a restart."
    }
  };

  function activateTab(tab, focusTab) {
    const key = tab.dataset.node;
    if (!layers[key]) return;

    tabs.forEach(function (candidate) {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });

    panel.dataset.active = key;
    detailKicker.textContent = layers[key].kicker;
    detailText.textContent = layers[key].text;
    detailPanel.setAttribute("aria-labelledby", tab.id);

    if (focusTab) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activateTab(tab, false);
    });

    tab.addEventListener("focus", function () {
      activateTab(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;

      event.preventDefault();
      let next = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;

      activateTab(tabs[next], true);
    });
  });
}

const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach(function (target) {
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach(function (target) {
    target.classList.add("is-visible");
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
