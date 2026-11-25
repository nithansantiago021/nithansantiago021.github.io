const DATA_FILES = {
  profile: "data/profile.json",
  experience: "data/experience.json",
  projects: "data/projects.json",
  skills: "data/skills.json"
};

async function fetchJson(path) {
  const url = new URL(path, document.baseURI);
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`);
  }
  return response.json();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validate(data) {
  assert(data.profile && data.profile.name, "profile.json is missing a name");
  assert(data.profile.location, "profile.json is missing a location");
  assert(Array.isArray(data.profile.languages), "profile.json is missing languages");
  assert(data.profile.hero && data.profile.hero.balanced, "profile.json is missing hero copy");
  assert(
    Array.isArray(data.profile.education),
    "profile.json is missing the education array"
  );
  assert(
    Array.isArray(data.profile.credentials_and_achievements),
    "profile.json is missing credentials_and_achievements"
  );

  const credentialGroups = ["computing_ai", "domain", "other"];
  data.profile.credentials_and_achievements.forEach((credential) => {
    assert(
      credentialGroups.includes(credential.group),
      `credential ${credential.id} has an invalid group`
    );
  });
  assert(
    data.experience && Array.isArray(data.experience.roles),
    "experience.json is missing roles"
  );
  assert(
    data.projects && Array.isArray(data.projects.projects),
    "projects.json is missing projects"
  );
  assert(
    data.skills && Array.isArray(data.skills.categories),
    "skills.json is missing categories"
  );
  assert(
    data.skills.categories.length === 3,
    "skills.json must contain exactly three categories"
  );

  const categoryTitles = data.skills.categories.map((category) => category.title);
  const requiredCategories = [
    "Data Science & ML",
    "Engineering & Deployment",
    "Advanced Analytics"
  ];
  requiredCategories.forEach((title) => {
    assert(categoryTitles.includes(title), `skills.json is missing the ${title} category`);
  });

  data.experience.roles.forEach((role) => {
    assert(role.id && role.role && role.organization, "experience role is missing required fields");
    assert(role.bullets && role.bullets.aiml && role.bullets.domain, `experience role ${role.id} is missing dual-track bullets`);
  });

  data.projects.projects.forEach((project) => {
    assert(project.id && project.title && project.type, "project is missing required fields");
    assert(project.tracks && project.priority, `project ${project.id} is missing tracks or priority`);

    if (project.live_url !== undefined && project.live_url !== null) {
      assert(
        typeof project.live_url === "string",
        `project ${project.id} has an invalid live_url`
      );
    }
    if (project.repo_url !== undefined && project.repo_url !== null) {
      assert(
        typeof project.repo_url === "string",
        `project ${project.id} has an invalid repo_url`
      );
    }
    if (project.notebooks !== undefined) {
      assert(
        Array.isArray(project.notebooks),
        `project ${project.id} has invalid notebooks`
      );
      project.notebooks.forEach((notebook, index) => {
        assert(
          notebook && typeof notebook.label === "string" && typeof notebook.url === "string",
          `project ${project.id} notebook ${index} is missing a label or url`
        );
      });
    }
  });
}

export async function loadPortfolio() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, path]) => [key, await fetchJson(path)])
  );

  const data = Object.fromEntries(entries);
  validate(data);
  return data;
}
