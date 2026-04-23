const GITHUB_API = 'https://api.github.com';
const SKILL_TOPICS = ['claude-skill', 'claude-code-skill'];
const RAW_BASE = 'https://raw.githubusercontent.com';

export type CommunitySkill = {
  repo: string;
  description: string;
  stars: number;
  url: string;
  defaultBranch: string;
};

type GitHubRepo = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  default_branch: string;
};

export async function searchSkills(query: string): Promise<CommunitySkill[]> {
  const results = await Promise.all(
    SKILL_TOPICS.map((topic) => searchByTopic(topic, query))
  );

  const seen = new Set<string>();
  const merged: CommunitySkill[] = [];

  for (const batch of results) {
    for (const skill of batch) {
      if (!seen.has(skill.repo)) {
        seen.add(skill.repo);
        merged.push(skill);
      }
    }
  }

  return merged.sort((a, b) => b.stars - a.stars).slice(0, 20);
}

async function searchByTopic(topic: string, query: string): Promise<CommunitySkill[]> {
  const q = query
    ? `${encodeURIComponent(query)}+topic:${topic}`
    : `topic:${topic}`;

  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=${q}&sort=stars&order=desc&per_page=20`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  );

  if (!res.ok) {
    if (res.status === 403) throw new Error('GitHub API rate limit reached. Try again in a minute.');
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = (await res.json()) as { total_count: number; items: GitHubRepo[] };

  return data.items.map((item) => ({
    repo: item.full_name,
    description: item.description ?? 'No description',
    stars: item.stargazers_count,
    url: item.html_url,
    defaultBranch: item.default_branch,
  }));
}

export async function fetchCommunitySkillContent(repo: string): Promise<string> {
  const branches = await resolveDefaultBranch(repo);

  for (const branch of branches) {
    const res = await fetch(`${RAW_BASE}/${repo}/${branch}/SKILL.md`);
    if (res.ok) return res.text();
  }

  throw new Error(`No SKILL.md found in "${repo}". Not a valid skill repository.`);
}

async function resolveDefaultBranch(repo: string): Promise<string[]> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (res.ok) {
      const data = (await res.json()) as { default_branch: string };
      const defaultBranch = data.default_branch;
      const fallbacks = ['main', 'master'].filter((b) => b !== defaultBranch);
      return [defaultBranch, ...fallbacks];
    }
  } catch {
    // fall through to defaults
  }
  return ['main', 'master'];
}

export function isCommunityRepo(input: string): boolean {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(input);
}
