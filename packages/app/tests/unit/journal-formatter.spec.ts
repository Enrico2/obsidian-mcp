import { describe, it, expect } from 'vitest';
import { formatJournalEntry, formatJournalDate } from '@/services/journal-formatter';

describe('formatJournalEntry', () => {
  it('formats the entry with headings, tags, and optional fields', () => {
    const timestamp = new Date('2024-03-20T18:30:00Z');

    const output = formatJournalEntry({
      timestamp,
      activityType: 'development',
      summary: 'Shipped the new search feature.',
      keyTopics: ['TypeScript', 'Vitest'],
      outputs: ['tests/behavior/files.spec.ts'],
      project: 'Projects/Testing Strategy',
    });

    expect(output).toContain('### 6:30 PM - Development');
    expect(output).toContain('**Topics:** #typescript #vitest');
    expect(output).toContain('**Outputs:** tests/behavior/files.spec.ts');
    expect(output).toContain('**Project:** [[Projects/Testing Strategy]]');
  });

  it('formats the entry time in the configured timezone', () => {
    // 2024-03-20 is during DST, so America/Los_Angeles is UTC-7
    const timestamp = new Date('2024-03-20T18:30:00Z');

    const output = formatJournalEntry({
      timestamp,
      timezone: 'America/Los_Angeles',
      activityType: 'development',
      summary: 'Shipped the new search feature.',
      keyTopics: ['TypeScript'],
    });

    expect(output).toContain('### 11:30 AM - Development');
  });
});

describe('formatJournalDate', () => {
  it('defaults to the UTC date', () => {
    expect(formatJournalDate(new Date('2024-06-15T01:00:00Z'))).toBe('2024-06-15');
  });

  it('uses the date in the configured timezone', () => {
    // 01:00 UTC is still the previous evening in Los Angeles
    expect(formatJournalDate(new Date('2024-06-15T01:00:00Z'), 'America/Los_Angeles')).toBe(
      '2024-06-14',
    );
  });
});
