import { clear, el, iconNode, slugify } from "../utils.js";

const CATEGORY_ICONS = {
  "data-science-ml": "nodes",
  "engineering-deployment": "code",
  "advanced-analytics": "globe"
};

function categoryNode(category) {
  return el(
    "article",
    {
      className: "skill-category",
      id: `skill-category-${slugify(category.id)}`
    },
    [
      el("div", { className: "skill-category-head" }, [
        el(
          "span",
          { className: "skill-category-icon", "aria-hidden": "true" },
          [iconNode(CATEGORY_ICONS[category.id] || "layers")]
        ),
        el("h3", { text: category.title })
      ]),
      el("p", { text: category.description }),
      el(
        "div",
        { className: "skill-chips" },
        category.skills.map((skill) =>
          el("span", {
            className: "skill-chip",
            text: skill.name,
            dataset: { tracks: skill.tracks.join(" ") },
            title: `Emphasized in: ${skill.tracks.join(", ")}`
          })
        )
      )
    ]
  );
}

export function renderSkills(categories) {
  const container = document.querySelector("#skills-grid");
  if (!container) return;
  clear(container);

  [...categories]
    .sort((a, b) => a.order - b.order)
    .forEach((category) => {
      container.append(categoryNode(category));
    });
}
