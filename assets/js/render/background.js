import { clear, el, iconNode, isTrackMatch, slugify } from "../utils.js";

const CREDENTIAL_GROUPS = [
  {
    key: "computing_ai",
    selector: "#credentials-computing-ai-list",
    empty: "No computing and AI credentials in this perspective."
  },
  {
    key: "domain",
    selector: "#credentials-domain-list",
    empty: "No domain credentials in this perspective."
  },
  {
    key: "other",
    selector: "#credentials-other-list",
    empty: "No additional qualifications in this perspective."
  }
];

let domainGroup = null;

function getDomainGroup() {
  if (domainGroup && domainGroup.isConnected) return domainGroup;
  const list = document.querySelector("#credentials-domain-list");
  if (list) domainGroup = list.closest(".credential-group");
  return domainGroup || null;
}

function syncCredentialLayout(track) {
  const group = getDomainGroup();
  if (!group) return;

  const otherGroup = document.querySelector(".credential-group--other");
  if (track === "aiml") {
    group.remove();
  } else if (!group.isConnected && otherGroup?.parentElement) {
    otherGroup.parentElement.insertBefore(group, otherGroup);
  }
}

function educationNode(item) {
  return el(
    "article",
    {
      className: "education-card",
      id: `education-${slugify(item.id)}`
    },
    [
      el("h4", { text: item.degree }),
      el("p", {
        className: "education-meta",
        text: `${item.institution} / ${item.period}`
      }),
      item.score ? el("p", { text: item.score }) : null,
      item.details ? el("p", { text: item.details }) : null
    ]
  );
}

function credentialNode(item, { compact = false } = {}) {
  return el(
    "article",
    {
      className: `credential-card${compact ? " credential-card--compact" : ""}`,
      id: `credential-${slugify(item.id)}`,
      dataset: {
        tracks: item.tracks.join(" "),
        category: item.category,
        group: item.group
      }
    },
    [
      el("h4", { text: item.title }),
      el("p", {
        className: "credential-meta",
        text: `${item.issuer} / ${item.period}`
      }),
      !compact && item.details
        ? el("p", { className: "credential-details", text: item.details })
        : null
    ]
  );
}

function setBlockIcon(selector, name) {
  const node = document.querySelector(selector);
  const svg = iconNode(name);
  if (node && svg) node.replaceChildren(svg);
}

export function renderBackground(profile, track = "balanced") {
  syncCredentialLayout(track);

  const educationList = document.querySelector("#education-list");
  if (educationList) {
    clear(educationList);
    profile.education.forEach((item) => educationList.append(educationNode(item)));
  }

  const credentials = profile.credentials_and_achievements || [];
  CREDENTIAL_GROUPS.forEach((group) => {
    const container = document.querySelector(group.selector);
    if (!container) return;

    clear(container);
    const matches = credentials.filter(
      (item) => item.group === group.key && isTrackMatch(item, track)
    );

    if (!matches.length) {
      container.append(
        el("p", { className: "credential-empty", text: group.empty })
      );
      return;
    }

    matches.forEach((item) => {
      container.append(credentialNode(item, { compact: group.key === "other" }));
    });
  });

  setBlockIcon("#credentials-icon", "award");
  setBlockIcon("#education-icon", "cap");
}
