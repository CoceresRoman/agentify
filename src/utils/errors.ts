export class AgentifyError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AgentifyError';
  }
}

export class DetectionError extends AgentifyError {
  constructor(message: string) {
    super(message, 'DETECTION_ERROR');
  }
}

export class FileSystemError extends AgentifyError {
  constructor(message: string, public path: string) {
    super(message, 'FS_ERROR');
  }
}

export class TemplateError extends AgentifyError {
  constructor(message: string, public template: string) {
    super(message, 'TEMPLATE_ERROR');
  }
}
