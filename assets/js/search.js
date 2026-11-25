import { clear, el, iconNode } from "./utils.js";

const TYPE_ORDER = ["Project", "Experience", "Skill", "Credential", "Education", "Action"];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function itemScore(item, query) {
  if (!query) return 0;
  const title = normalize(item.title);
  const meta = normalize(item.meta);
  const keywords = normalize(item.keywords);
  if (title.startsWith(query)) return 100;
  if (title.includes(query)) return 80;
  if (keywords.includes(query)) return 55;
  if (meta.includes(query)) return 35;
  return -1;
}

function resultNode(item, index, activeIndex, onActivate) {
  const node = el(
    "button",
    {
      type: "button",
      className: "command-item",
      role: "option",
      id: `command-option-${index}`,
      "aria-selected": String(index === activeIndex)
    },
    [
      el("span", { className: "command-type", text: item.typeLabel }),
      el("span", { className: "command-copy" }, [
        el("strong", { text: item.title }),
        el("span", { text: item.meta })
      ]),
      el("span", { className: "command-arrow", "aria-hidden": "true" }, [iconNode("arrow")])
    ]
  );
  node.addEventListener("click", () => onActivate(item));
  return node;
}

export function createCommandPalette(data, options = {}) {
  const dialog = document.querySelector("#command-palette");
  const input = document.querySelector("#command-input");
  const results = document.querySelector("#command-results");
  const trigger = document.querySelector("#command-trigger");
  const closeButton = document.querySelector("#command-close");

  const projects = data.projects.projects;
  const roles = data.experience.roles;
  const categories = data.skills.categories;
  const profile = data.profile;

  const items = [];

  projects.forEach((project) => {
    items.push({
      type: "Project",
      typeLabel: "Project",
      title: project.title,
      meta: `${project.type_label} / ${project.stack.slice(0, 4).join(", ")}`,
      keywords: [
        project.title,
        project.type_label,
        project.category.aiml,
        project.category.domain,
        project.category.balanced,
        project.summary.aiml,
        project.summary.domain,
        project.summary.balanced,
        ...project.stack
      ].join(" "),
      target: `#project-${project.id}`,
      tracks: project.tracks,
      projectId: project.id
    });
  });

  roles.forEach((role) => {
    items.push({
      type: "Experience",
      typeLabel: "Experience",
      title: role.role,
      meta: `${role.organization} / ${role.period.display}`,
      keywords: [
        role.role,
        role.organization,
        role.location,
        ...role.bullets.aiml,
        ...role.bullets.domain,
        ...(role.stack || []),
        ...(role.milestones || []).map((milestone) => milestone.label)
      ].join(" "),
      target: `#experience-${role.id}`,
      tracks: role.tracks
    });
  });

  categories.forEach((category) => {
    category.skills.forEach((skill) => {
      items.push({
        type: "Skill",
        typeLabel: "Skill",
        title: skill.name,
        meta: category.title,
        keywords: [skill.name, category.title, ...(skill.aliases || [])].join(" "),
        target: `#skill-category-${category.id}`,
        tracks: skill.tracks
      });
    });
  });

  profile.credentials_and_achievements.forEach((credential) => {
    items.push({
      type: "Credential",
      typeLabel: "Credential",
      title: credential.title,
      meta: `${credential.issuer} / ${credential.period}`,
      keywords: [
        credential.title,
        credential.issuer,
        credential.details || "",
        credential.category,
        credential.period
      ].join(" "),
      target: `#credential-${credential.id}`,
      tracks: credential.tracks
    });
  });

  profile.education.forEach((education) => {
    items.push({
      type: "Education",
      typeLabel: "Education",
      title: education.degree,
      meta: `${education.institution} / ${education.period}`,
      keywords: [
        education.degree,
        education.institution,
        education.details,
        education.score
      ].join(" "),
      target: `#education-${education.id}`,
      tracks: education.tracks
    });
  });

  const actions = [
    {
      title: "Switch to Balanced perspective",
      meta: "Show both AI/ML and domain framing",
      keywords: "balanced both perspective switch track",
      action: () => options.onTrackChange?.("balanced")
    },
    {
      title: "Switch to AI/ML perspective",
      meta: "Prioritize RAG, agents, OCR, and engineering",
      keywords: "ai ml aiml perspective switch track",
      action: () => options.onTrackChange?.("aiml")
    },
    {
      title: "Switch to Domain perspective",
      meta: "Prioritize climate, GIS, ESG, and biodiversity",
      keywords: "domain perspective switch track climate gis esg",
      action: () => options.onTrackChange?.("domain")
    },
    {
      title: "Download AI/ML resume",
      meta: "Open the AI/ML PDF resume",
      keywords: "resume pdf aiml ai ml download",
      action: () => window.open(profile.links.resume.aiml, "_blank", "noopener")
    },
    {
      title: "Download Domain resume",
      meta: "Open the domain PDF resume",
      keywords: "resume pdf domain climate esg download",
      action: () => window.open(profile.links.resume.domain, "_blank", "noopener")
    }
  ];

  actions.forEach((action) => {
    items.push({
      type: "Action",
      typeLabel: "Action",
      title: action.title,
      meta: action.meta,
      keywords: action.keywords,
      action: action.action,
      tracks: ["aiml", "domain"]
    });
  });

  let activeIndex = 0;
  let currentResults = [];

  function currentTrack() {
    return options.getTrack ? options.getTrack() : "balanced";
  }

  function rankItems(query) {
    const track = currentTrack();
    const normalizedQuery = normalize(query.trim());

    return items
      .map((item) => {
        const score = normalizedQuery ? itemScore(item, normalizedQuery) : 0;
        if (normalizedQuery && score < 0) return null;
        const trackBoost =
          track !== "balanced" && item.tracks && item.tracks.includes(track) ? 16 : 0;
        return { item, score: score + trackBoost };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const typeDelta = TYPE_ORDER.indexOf(a.item.type) - TYPE_ORDER.indexOf(b.item.type);
        if (typeDelta !== 0) return typeDelta;
        return a.item.title.localeCompare(b.item.title);
      })
      .map((entry) => entry.item)
      .slice(0, 48);
  }

  function activate(item) {
    close();
    if (item.action) {
      item.action();
      return;
    }
    options.onNavigate?.(item);
  }

  function setActive(nextIndex) {
    if (!currentResults.length) return;
    activeIndex = (nextIndex + currentResults.length) % currentResults.length;
    const optionsNodes = results.querySelectorAll(".command-item");
    optionsNodes.forEach((node, index) => {
      const isActive = index === activeIndex;
      node.setAttribute("aria-selected", String(isActive));
      if (isActive) node.scrollIntoView({ block: "nearest" });
    });
    input.setAttribute("aria-activedescendant", `command-option-${activeIndex}`);
  }

  function render(query = "") {
    if (!results) return;
    currentResults = rankItems(query);
    activeIndex = 0;
    clear(results);

    if (!currentResults.length) {
      results.append(
        el("p", {
          className: "command-empty",
          text: "No matching projects, skills, experience, or credentials."
        })
      );
      input.removeAttribute("aria-activedescendant");
      return;
    }

    let currentType = "";
    currentResults.forEach((item, index) => {
      if (item.type !== currentType) {
        currentType = item.type;
        results.append(
          el("div", { className: "command-group-label", text: item.typeLabel })
        );
      }
      results.append(resultNode(item, index, activeIndex, activate));
    });

    input.setAttribute("aria-activedescendant", "command-option-0");
  }

  function open() {
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    render(input ? input.value : "");
    window.requestAnimationFrame(() => {
      input?.focus();
      input?.select();
    });
  }

  function close() {
    if (dialog?.open) dialog.close();
  }

  if (trigger) trigger.addEventListener("click", open);
  if (closeButton) closeButton.addEventListener("click", close);

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
  }

  if (input) {
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (currentResults[activeIndex]) activate(currentResults[activeIndex]);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog?.open) close();
      else open();
    }
  });

  return { open, close, render };
}
