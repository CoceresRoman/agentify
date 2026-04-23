export type ScanResult = {
  safe: boolean;
  warnings: string[];
};

const SHELL_INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /curl\s+[^|]+\|\s*(ba)?sh/i, label: 'curl pipe to shell' },
  { pattern: /wget\s+[^|]+\|\s*(ba)?sh/i, label: 'wget pipe to shell' },
  { pattern: /eval\s*\$\(/i, label: 'eval with command substitution' },
  { pattern: /base64\s+-d[^|]*\|\s*(ba)?sh/i, label: 'base64 decode pipe to shell' },
  { pattern: /python\d*\s+-c\s+["']import\s+os/i, label: 'python os command execution' },
  { pattern: /rm\s+-rf\s+[\/~]/i, label: 'recursive force delete on root or home' },
  { pattern: /chmod\s+[0-7]*7[0-7]*\s+\//, label: 'chmod world-writable on system path' },
];

const PROMPT_INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /ignore\s+(all\s+)?previous\s+instructions/i, label: 'ignore instructions' },
  { pattern: /disregard\s+(all\s+)?previous/i, label: 'disregard previous' },
  { pattern: /you\s+are\s+now\s+(?!claude)/i, label: 'persona override' },
  { pattern: /override\s+your\s+(previous\s+)?instructions/i, label: 'override instructions' },
  { pattern: /\bDAN\b/, label: 'DAN jailbreak pattern' },
  { pattern: /do\s+anything\s+now/i, label: 'DAN variant' },
  { pattern: /system\s+prompt\s*:/i, label: 'system prompt manipulation' },
];

const EXFILTRATION_PATTERNS: { pattern: RegExp; label: string }[] = [
  {
    pattern: /https?:\/\/[^\s"']+\?[^\s"']*(?:token|key|secret|password|auth|api_key)[^\s"']*/i,
    label: 'URL with sensitive query params',
  },
  {
    pattern: /\$\{?(?:HOME|USER|API_KEY|SECRET|TOKEN|PASSWORD|AWS_|GITHUB_TOKEN)\}?/,
    label: 'sensitive environment variable access',
  },
];

export function scanSkill(content: string): ScanResult {
  const warnings: string[] = [];

  for (const { pattern, label } of SHELL_INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(`Shell injection risk: ${label}`);
    }
  }

  for (const { pattern, label } of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(`Prompt injection risk: ${label}`);
    }
  }

  for (const { pattern, label } of EXFILTRATION_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(`Exfiltration risk: ${label}`);
    }
  }

  return { safe: warnings.length === 0, warnings };
}
