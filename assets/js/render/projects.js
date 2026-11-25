import { clear, el, iconNode, priorityFor } from "../utils.js";

const FILTERS = [
  "all",
  "deployed_app",
  "notebook",
  "analytical_notebook",
  "etl_pipeline",
  "other"
];
const NOTEBOOK_TYPES = ["notebook", "analytical_notebook"];

function hasNotebooks(project) {
  return Array.isArray(project.notebooks) && project.notebooks.length > 0;
}

function matchesFilter(project, filter) {
  if (filter === "all") return true;
  if (NOTEBOOK_TYPES.includes(filter)) {
    return NOTEBOOK_TYPES.includes(project.type) || hasNotebooks(project);
  }
  if (filter === "other") {
    return !["deployed_app", ...NOTEBOOK_TYPES, "etl_pipeline"].includes(project.type);
  }
  return project.type === filter;
}

function actionLink(url, label) {
  if (!url) return null;
  const isExternal = /^https?:\/\//i.test(url);
  return el(
    "a",
    {
      href: url,
      target: isExternal ? "_blank" : undefined,
      rel: isExternal ? "noopener noreferrer" : undefined
    },
    [label, iconNode(isExternal ? "external" : "arrow")]
  );
}

function projectLinks(project) {
  const liveLabel =
    project.live_url && !/^https?:\/\//i.test(project.live_url)
      ? "Open study"
      : "Live demo";

  return [
    actionLink(project.live_url, liveLabel),
    actionLink(project.repo_url, "Code repository"),
    ...(Array.isArray(project.notebooks)
      ? project.notebooks.map((notebook) =>
          actionLink(notebook.url, notebook.label || "Notebook")
        )
      : [])
  ].filter(Boolean);
}

function projectNode(project, track) {
  const category = project.category[track] || project.category.balanced || project.type_label;
  const summary = project.summary[track] || project.summary.balanced;
  const isCrossTrack = track !== "balanced" && !project.tracks.includes(track);
  const links = projectLinks(project);
  const linkRow = el("div", { className: "project-links" }, links);

  if (!links.length) {
    linkRow.append(
      el("span", {
        className: "link-note",
        text: project.link_note || "Private or internal project; no public link."
      })
    );
  }

  return el(
    "article",
    {
      className: `project-card reveal is-visible${isCrossTrack ? " is-cross-track" : ""}`,
      id: `project-${project.id}`,
      dataset: {
        type: project.type,
        tracks: project.tracks.join(" "),
        priority: String(priorityFor(project, track))
      }
    },
    [
      el("div", { className: "project-topline" }, [
        el("span", { className: "project-cat", text: category }),
        el("span", { className: "project-type", text: project.type_label })
      ]),
      el("h3", { text: project.title }),
      el("p", { text: summary }),
      el(
        "div",
        { className: "tag-row" },
        project.stack.map((item) => el("span", { className: "tag", text: item }))
      ),
      linkRow
    ]
  );
}

export function renderProjects(projects, track, options = {}) {
  const container = document.querySelector("#project-grid");
  const count = document.querySelector("#project-count");
  if (!container) return;

  const filter = FILTERS.includes(options.filter) ? options.filter : "all";
  clear(container);

  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.projectFilter === filter));
  });

  const ordered = [...projects].sort((a, b) => {
    const priorityDelta = priorityFor(a, track) - priorityFor(b, track);
    if (priorityDelta !== 0) return priorityDelta;
    return a.title.localeCompare(b.title);
  });

  const visible = ordered.filter((project) => matchesFilter(project, filter));

  if (!visible.length) {
    container.append(
      el("p", {
        className: "project-empty",
        text: "No projects match this filter yet."
      })
    );
  } else {
    visible.forEach((project) => {
      container.append(projectNode(project, track));
    });
  }

  if (count) {
    const label = visible.length === 1 ? "project" : "projects";
    count.textContent = `${visible.length} ${label}`;
  }
}
