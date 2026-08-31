export interface ToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    timestamp: string;
    affected_files?: string[];
  };
}

export interface JournalConfig {
  journalPathTemplate: string;
  journalActivitySection: string;
  journalFileTemplate: string;
  /** IANA timezone (e.g. "America/Los_Angeles") for entry timestamps and the {{date}} in paths; defaults to UTC */
  journalTimezone?: string;
}
