const GITHUB_API = 'https://api.github.com';
const REPO = 'anthropics/skills';
const RAW_BASE = 'https://raw.githubusercontent.com/anthropics/skills/main';

export type RemoteSkill = {
  name: string;
  description: string;
  license?: string;
};

let cache: RemoteSkill[] | null = null;

export async function listSkills(): Promise<RemoteSkill[]> {
  if (cache) return cache;

  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/skills`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const dirs = (await res.json()) as { name: string; type: string }[];
  const skillDirs = dirs.filter((d) => d.type === 'dir');

  const skills = await Promise.all(
    skillDirs.map(async (dir) => {
      try {
        const raw = await fetchSkillContent(dir.name);
        const description = extractFrontmatterField(raw, 'description') ?? 'No description available';
        const license = extractFrontmatterField(raw, 'license');
        return { name: dir.name, description, license };
      } catch {
        return { name: dir.name, description: 'No description available' };
      }
    })
  );

  cache = skills;
  return skills;
}

export async function fetchSkillContent(name: string): Promise<string> {
  const res = await fetch(`${RAW_BASE}/skills/${name}/SKILL.md`);
  if (!res.ok) throw new Error(`Skill "${name}" not found in registry`);
  return res.text();
}

export function clearCache(): void {
  cache = null;
}

function extractFrontmatterField(content: string, field: string): string | undefined {
  const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim();
}
