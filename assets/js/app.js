import { loadPortfolio } from "./data-loader.js";
import {
  applyTrackToDocument,
  bindTrackSwitch,
  readTrackFromUrl,
  writeTrackToUrl
} from "./track.js";
import { announce, clear, el, iconNode, scrollToTarget, trackLabel } from "./utils.js";
import { renderProfile } from "./render/profile.js";
import { renderExperience } from "./render/experience.js";
import { renderProjects } from "./render/projects.js";
import { renderSkills } from "./render/skills.js";
import { renderBackground } from "./render/background.js";
import { createCommandPalette } from "./search.js";

const state = {
  track: readTrackFromUrl(),
  projectFilter: "all"
};

let data = null;

function renderCurrentProjects() {
  renderProjects(data.projects.projects, state.track, {
    filter: state.projectFilter
  });
}

function resetProjectFilter() {
  state.projectFilter = "all";
  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.projectFilter === "all"));
  });
}

function applyTrack(nextTrack, { updateUrl = true } = {}) {
  state.track = nextTrack;
  if (updateUrl) writeTrackToUrl(nextTrack);
  applyTrackToDocument(nextTrack);

  renderProfile(data.profile, state.track);
  renderCurrentProjects();
  renderBackground(data.profile, state.track);

  document.title = `${data.profile.name} | ${trackLabel(state.track)} Portfolio`;
  announce(`Viewing the ${trackLabel(state.track)} perspective.`);
}

function bindProjectFilters() {
  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.projectFilter = button.dataset.projectFilter || "all";
      renderCurrentProjects();
    });
  });
}

function handleSearchNavigation(item) {
  const currentTrack = state.track;
  if (
    currentTrack !== "balanced" &&
    Array.isArray(item.tracks) &&
    item.tracks.length &&
    !item.tracks.includes(currentTrack)
  ) {
    applyTrack(item.tracks[0]);
  }

  if (item.projectId) {
    resetProjectFilter();
    renderCurrentProjects();
  }

  window.requestAnimationFrame(() => {
    scrollToTarget(item.target);
  });
}

function hydrateStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    const svg = iconNode(node.dataset.icon);
    if (svg) node.replaceChildren(svg);
  });
}

function syncHeaderOffset() {
  const header = document.querySelector(".topbar");
  if (!header) return;
  document.documentElement.style.setProperty(
    "--sticky-header-height",
    `${header.offsetHeight}px`
  );
}

function initReveal() {
  const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!revealItems.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function showLoadError(error) {
  const errorBox = document.querySelector("#load-error");
  if (errorBox) {
    errorBox.hidden = false;
    errorBox.textContent = `The portfolio data could not be loaded. ${error.message}`;
  }

  [
    "#experience-timeline",
    "#project-grid",
    "#skills-grid",
    "#education-list",
    "#credentials-computing-ai-list",
    "#credentials-domain-list",
    "#credentials-other-list"
  ].forEach((selector) => {
    const node = document.querySelector(selector);
    if (!node) return;
    clear(node);
    node.append(
      el("p", {
        className: "error-state",
        text: "This section could not be rendered because a data file failed to load."
      })
    );
  });
}

async function init() {
  document.body.dataset.track = state.track;
  applyTrackToDocument(state.track);
  hydrateStaticIcons();
  syncHeaderOffset();
  const header = document.querySelector(".topbar");
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(syncHeaderOffset).observe(header);
  } else {
    window.addEventListener("resize", syncHeaderOffset, { passive: true });
  }
  window.addEventListener("load", syncHeaderOffset, { once: true });

  try {
    data = await loadPortfolio();
  } catch (error) {
    showLoadError(error);
    return;
  }

  const lastUpdated = document.querySelector("#last-updated");
  if (lastUpdated) {
    lastUpdated.textContent = data.profile.meta.last_updated;
  }

  renderProfile(data.profile, state.track);
  renderExperience(data.experience.roles);
  renderCurrentProjects();
  renderSkills(data.skills.categories);
  renderBackground(data.profile, state.track);

  bindProjectFilters();
  bindTrackSwitch((nextTrack) => {
    applyTrack(nextTrack, { updateUrl: false });
  });

  const palette = createCommandPalette(data, {
    getTrack: () => state.track,
    onTrackChange: (nextTrack) => applyTrack(nextTrack),
    onNavigate: handleSearchNavigation
  });

  window.addEventListener("popstate", () => {
    const nextTrack = readTrackFromUrl();
    if (nextTrack !== state.track) {
      applyTrack(nextTrack, { updateUrl: false });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (!isTyping) {
        event.preventDefault();
        palette.open();
      }
    }
  });

  document.title = `${data.profile.name} | ${trackLabel(state.track)} Portfolio`;
  initReveal();
}

init();
