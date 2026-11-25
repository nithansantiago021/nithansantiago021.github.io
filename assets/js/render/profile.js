import { clear, el, iconNode, trackLabel } from "../utils.js";

function splitHeadline(headline) {
  const words = headline.trim().split(/\s+/);
  if (words.length < 4) return [headline, ""];
  const accentCount = words.length > 6 ? 3 : 2;
  return [words.slice(0, -accentCount).join(" "), words.slice(-accentCount).join(" ")];
}

function renderHeadline(node, headline) {
  clear(node);
  const [lead, accent] = splitHeadline(headline);
  node.append(document.createTextNode(lead));
  if (accent) {
    node.append(document.createTextNode(" "));
    node.append(el("span", { className: "accent-text", text: accent }));
  }
}

function socialLink(href, label, iconName) {
  return el(
    "a",
    {
      className: "social-btn",
      href,
      target: href.startsWith("http") ? "_blank" : undefined,
      rel: href.startsWith("http") ? "noopener noreferrer" : undefined
    },
    [el("span", { "aria-hidden": "true" }, [iconNode(iconName)]), label]
  );
}

function resumeLink(profile, track, label, className = "btn btn--small btn--solid") {
  const href = profile.links.resume[track];
  return el(
    "a",
    {
      className,
      href,
      target: "_blank",
      rel: "noopener",
      "aria-label": label
    },
    [iconNode("download"), label]
  );
}

function renderResumeSlot(profile, track) {
  const slot = document.querySelector("#resume-slot");
  if (!slot) return;
  clear(slot);

  if (track === "balanced") {
    const summary = el(
      "summary",
      { className: "btn btn--small btn--ghost", "aria-label": "Choose a resume" },
      [iconNode("download"), "Resume", iconNode("chevron")]
    );
    const panel = el("div", { className: "resume-menu-panel" }, [
      resumeLink(profile, "aiml", "AI/ML resume", "btn btn--small btn--ghost"),
      resumeLink(profile, "domain", "Domain resume", "btn btn--small btn--ghost")
    ]);
    slot.append(el("details", { className: "resume-menu" }, [summary, panel]));
    return;
  }

  slot.append(resumeLink(profile, track, `${trackLabel(track)} resume`));
}

export function renderProfile(profile, track) {
  const hero = profile.hero[track] || profile.hero.balanced;

  const eyebrow = document.querySelector("#hero-eyebrow");
  const title = document.querySelector("#hero-title");
  const sub = document.querySelector("#hero-sub");
  const focus = document.querySelector("#hero-focus");
  const socials = document.querySelector("#hero-socials");
  const resumeActions = document.querySelector("#hero-resume-actions");
  const perspective = document.querySelector("#hero-perspective");
  const location = document.querySelector("#hero-location");
  const languages = document.querySelector("#hero-languages");

  if (eyebrow) eyebrow.textContent = hero.eyebrow;
  if (title) renderHeadline(title, hero.headline);
  if (sub) sub.textContent = hero.subheadline;

  if (focus) {
    clear(focus);
    hero.focus.forEach((item) => {
      focus.append(el("span", { className: "focus-pill", text: item }));
    });
  }

  if (socials) {
    clear(socials);
    socials.append(
      socialLink(profile.links.linkedin, "LinkedIn", "linkedin"),
      socialLink(profile.links.github, "GitHub", "github"),
      socialLink(profile.links.huggingface, "Hugging Face", "huggingface"),
      socialLink(`mailto:${profile.links.email}`, "Email", "mail")
    );
  }

  if (resumeActions) {
    clear(resumeActions);
    if (track === "balanced") {
      resumeActions.append(
        resumeLink(profile, "aiml", "AI/ML resume"),
        resumeLink(profile, "domain", "Domain resume", "btn btn--small btn--ghost")
      );
    } else {
      resumeActions.append(resumeLink(profile, track, hero.resume_label));
    }
  }

  if (perspective) perspective.textContent = `${trackLabel(track)} perspective`;
  if (location) location.textContent = profile.location;
  if (languages) languages.textContent = profile.languages.join(" / ");

  renderResumeSlot(profile, track);
}
