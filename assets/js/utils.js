const ICONS = {
  search:
    '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
  download:
    '<path d="M12 3v11"></path><path d="m7.5 10 4.5 4.5 4.5-4.5"></path><path d="M5 20h14"></path>',
  external:
    '<path d="M14 4h6v6"></path><path d="m20 4-9 9"></path><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"></path>',
  chevron:
    '<path d="m6 9 6 6 6-6"></path>',
  close:
    '<path d="M6 6l12 12"></path><path d="M18 6 6 18"></path>',
  layers:
    '<path d="m12 3 9 5-9 5-9-5 9-5Z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 16 9 5 9-5"></path>',
  map:
    '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>',
  nodes:
    '<circle cx="6" cy="6" r="2.5"></circle><circle cx="18" cy="6" r="2.5"></circle><circle cx="12" cy="18" r="2.5"></circle><path d="M8.5 6h7"></path><path d="m7.3 8.2 3.4 7.3"></path><path d="m16.7 8.2-3.4 7.3"></path>',
  mail:
    '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>',
  pin:
    '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
  globe:
    '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path>',
  cap:
    '<path d="m2 9 10-5 10 5-10 5L2 9Z"></path><path d="M6 11v5c3 2 9 2 12 0v-5"></path><path d="M22 9v6"></path>',
  award:
    '<circle cx="12" cy="8" r="5"></circle><path d="m8.5 12-1.5 9 5-3 5 3-1.5-9"></path>',
  code:
    '<path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path>',
  github:
    '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3"></path><path d="M15 22v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V22"></path>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
  huggingface:
    '<circle cx="12" cy="12" r="9"></circle><path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M8.5 14.5c1 1.2 2.1 1.8 3.5 1.8s2.5-.6 3.5-1.8"></path>',
  arrow:
    '<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>',
  filter:
    '<path d="M4 6h16"></path><path d="M7 12h10"></path><path d="M10 18h4"></path>'
};

export function icon(name, className = "") {
  const path = ICONS[name];
  if (!path) return "";
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

export function iconNode(name, className = "") {
  const markup = icon(name, className);
  if (!markup) return null;
  const template = document.createElement("template");
  template.innerHTML = markup;
  return template.content.firstElementChild;
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === "className") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key === "html") {
      node.innerHTML = value;
    } else if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        if (dataValue !== undefined && dataValue !== null) {
          node.dataset[dataKey] = dataValue;
        }
      });
    } else if (key === "style") {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        node.style[styleKey] = styleValue;
      });
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  });

  const childList = Array.isArray(children) ? children : [children];
  childList.forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    if (child instanceof Node) {
      node.append(child);
    } else if (typeof child === "string" && /^\s*<(svg|path|circle|rect)\b/i.test(child)) {
      const template = document.createElement("template");
      template.innerHTML = child;
      node.append(...Array.from(template.content.childNodes));
    } else {
      node.append(document.createTextNode(String(child)));
    }
  });

  return node;
}

export function clear(node) {
  if (!node) return;
  node.replaceChildren();
}

export function trackLabel(track) {
  if (track === "aiml") return "AI/ML";
  if (track === "domain") return "Domain";
  return "Balanced";
}

export function isTrackMatch(item, track) {
  if (track === "balanced") return true;
  return Array.isArray(item.tracks) && item.tracks.includes(track);
}

export function priorityFor(item, track) {
  if (item.priority && Number.isFinite(item.priority[track])) {
    return item.priority[track];
  }
  if (item.priority && Number.isFinite(item.priority.balanced)) {
    return item.priority.balanced;
  }
  return 99;
}

export function sortedByPriority(items, track) {
  return [...items].sort((a, b) => {
    const priorityDelta = priorityFor(a, track) - priorityFor(b, track);
    if (priorityDelta !== 0) return priorityDelta;
    return a.title.localeCompare(b.title);
  });
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function scrollToTarget(target) {
  const node = typeof target === "string" ? document.querySelector(target) : target;
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.remove("is-flash");
  window.requestAnimationFrame(() => {
    node.classList.add("is-flash");
    window.setTimeout(() => node.classList.remove("is-flash"), 1600);
  });
}

export function announce(message) {
  const live = document.querySelector("#live-region");
  if (!live) return;
  live.textContent = "";
  window.requestAnimationFrame(() => {
    live.textContent = message;
  });
}

export function safeLink(url, label, className = "") {
  if (!url) return null;
  const isExternal = /^https?:\/\//i.test(url);
  return el(
    "a",
    {
      href: url,
      className,
      target: isExternal ? "_blank" : undefined,
      rel: isExternal ? "noopener noreferrer" : undefined
    },
    [label, iconNode("external")]
  );
}
