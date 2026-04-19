export type DetectionResult = {
  stack: string;
  confidence: number;
  evidence: string[];
  metadata?: Record<string, unknown>;
};

export type DetectorFunction = (
  projectRoot: string
) => Promise<DetectionResult | null>;
