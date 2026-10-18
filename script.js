const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const menu = document.getElementById("navLinks");
const progress = document.getElementById("progress");

function onScroll() {
  if (window.scrollY > 10) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }

  const max = document.body.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? (window.scrollY / max) * 100 + "%" : "0";
}

window.addEventListener("scroll", onScroll);
onScroll();

navToggle.onclick = function () {
  menu.classList.toggle("open");
  navToggle.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", menu.classList.contains("open"));
};

menu.onclick = function (e) {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    navToggle.classList.remove("open");
  }
};

const sections = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = "#" + entry.target.id;
    navAnchors.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === id);
    });
  });
}, { rootMargin: "-40% 0px -55% 0px" });

sections.forEach((section) => spy.observe(section));

function copyText(text, button) {
  const hint = button.querySelector(".copy-hint");

  function showCopied() {
    const old = hint.textContent;
    hint.textContent = "copied!";
    button.classList.add("copied");
    setTimeout(function () {
      hint.textContent = old;
      button.classList.remove("copied");
    }, 1500);
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(showCopied);
  } else {
    const field = document.createElement("textarea");
    field.value = text;
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    document.body.removeChild(field);
    showCopied();
  }
}

const copyButtons = document.querySelectorAll(".js-copy");

copyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    copyText(button.dataset.copy, button);
  });
});

const terminal = document.getElementById("terminal");

if (terminal) {
  const termBody = terminal.querySelector(".term-body");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lines = [
    { cmd: "whoami", out: "alexander, 17, minecraft server developer" },
    { cmd: "ls ~/work", out: "client/  moonprac/  plugins/  configs/" },
    { cmd: "cat status.txt", out: "open to work", ok: true }
  ];

  const cursor = document.createElement("span");
  cursor.className = "cursor";

  function addLine(extra) {
    const line = document.createElement("div");
    line.className = extra ? "term-line " + extra : "term-line";
    termBody.appendChild(line);
    line.appendChild(cursor);
    return line;
  }

  function typeCommand(text, done) {
    const line = addLine();
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "$ ";
    const cmd = document.createElement("span");
    cmd.className = "cmd";
    line.insertBefore(prompt, cursor);
    line.insertBefore(cmd, cursor);

    let i = 0;
    function step() {
      cmd.textContent = text.slice(0, i + 1);
      i++;
      if (i < text.length) {
        setTimeout(step, 55 + Math.random() * 45);
      } else {
        setTimeout(done, 280);
      }
    }
    step();
  }

  function addOutput(text, ok, done) {
    const line = addLine("out" + (ok ? " ok" : ""));
    line.insertBefore(document.createTextNode(text), cursor);
    setTimeout(done, 160);
  }

  function run() {
    const line = lines.shift();
    if (!line) return;
    typeCommand(line.cmd, function () {
      addOutput(line.out, line.ok, run);
    });
  }

  if (reduceMotion) {
    termBody.appendChild(cursor);
  } else {
    termBody.innerHTML = "";
    setTimeout(run, 350);
  }
}

const watcher = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    watcher.unobserve(entry.target);
  });
}, { threshold: 0.12 });

const revealTargets = document.querySelectorAll(
  ".section .container > *, .project-card, .testimonial, .stats li"
);

revealTargets.forEach((el) => {
  el.classList.add("reveal");
  watcher.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();
