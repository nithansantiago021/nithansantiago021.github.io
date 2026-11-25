import { clear, el, iconNode } from "../utils.js";

function bulletGroup(label, track, bullets) {
  return el("div", { className: "bullet-group", dataset: { bullets: track } }, [
    el("span", { className: "bullet-label", text: label }),
    el(
      "ul",
      {},
      bullets.map((bullet) => el("li", { text: bullet }))
    )
  ]);
}

function milestoneNode(milestone) {
  return el("span", { className: "milestone", dataset: { tracks: milestone.tracks.join(" ") } }, [
    el("strong", { text: milestone.date }),
    milestone.label
  ]);
}

function stackNode(stack) {
  return el(
    "div",
    { className: "timeline-stack" },
    stack.map((item) => el("span", { className: "stack-chip", text: item }))
  );
}

function roleNode(role, index) {
  const summary = el(
    "summary",
    {},
    [
      el("div", {}, [
        el("div", { className: "timeline-period", text: role.period.display }),
        el("h3", { text: role.role }),
        el("p", {
          className: "timeline-org",
          text: `${role.organization} / ${role.location}`
        })
      ]),
      el("span", { className: "timeline-chevron", "aria-hidden": "true" }, [iconNode("chevron")])
    ]
  );

  const bodyChildren = [
    el("div", { className: "bullet-grid" }, [
      bulletGroup("AI/ML", "aiml", role.bullets.aiml),
      bulletGroup("Domain", "domain", role.bullets.domain)
    ])
  ];

  if (role.milestones && role.milestones.length) {
    bodyChildren.push(
      el(
        "div",
        { className: "milestone-row", "aria-label": "Milestones" },
        role.milestones.map(milestoneNode)
      )
    );
  }

  if (role.stack && role.stack.length) {
    bodyChildren.push(stackNode(role.stack));
  }

  if (role.artifact_project_id) {
    bodyChildren.push(
      el("div", { className: "timeline-stack" }, [
        el(
          "a",
          {
            className: "btn btn--small btn--ghost",
            href: `#project-${role.artifact_project_id}`
          },
          ["View related project", iconNode("arrow")]
        )
      ])
    );
  }

  return el(
    "details",
    {
      className: "timeline-item",
      id: `experience-${role.id}`,
      open: index === 0 ? "" : undefined
    },
    [summary, el("div", { className: "timeline-body" }, bodyChildren)]
  );
}

export function renderExperience(roles) {
  const container = document.querySelector("#experience-timeline");
  if (!container) return;
  clear(container);

  [...roles]
    .sort((a, b) => {
      const startA = a.period.start || "";
      const startB = b.period.start || "";
      return startB.localeCompare(startA);
    })
    .forEach((role, index) => {
      container.append(roleNode(role, index));
    });
}
