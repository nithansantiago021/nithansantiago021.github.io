import { announce, trackLabel } from "./utils.js";

export const TRACKS = ["balanced", "aiml", "domain"];

export function readTrackFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("track");
  return value === "aiml" || value === "domain" ? value : "balanced";
}

export function writeTrackToUrl(track) {
  const url = new URL(window.location.href);
  if (track === "balanced") {
    url.searchParams.delete("track");
  } else {
    url.searchParams.set("track", track);
  }
  window.history.replaceState({ track }, "", `${url.pathname}${url.search}${url.hash}`);
}

export function applyTrackToDocument(track) {
  document.body.dataset.track = track;
  document.querySelectorAll("[data-track-button]").forEach((button) => {
    const isActive = button.dataset.trackButton === track;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

export function bindTrackSwitch(onChange) {
  document.querySelectorAll("[data-track-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTrack = button.dataset.trackButton;
      if (!TRACKS.includes(nextTrack)) return;
      writeTrackToUrl(nextTrack);
      applyTrackToDocument(nextTrack);
      onChange(nextTrack);
      announce(`Viewing the ${trackLabel(nextTrack)} perspective.`);
    });
  });
}
