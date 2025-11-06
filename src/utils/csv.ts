import { Task } from '@/types';

export function toCSV(tasks: ReadonlyArray<Task>): string {
  // BUG FIX : Use stable, hard-coded headers
  // The original code `Object.keys((tasks[0] as any) ?? {})` was unstable.
  // If the first task was missing 'notes', the header would be missing.
  // Using a static array ensures the headers are always correct and in order.
  const headers = [
    'id',
    'title',
    'revenue',
    'timeTaken',
    'priority',
    'status',
    'notes',
    'createdAt',
    'completedAt',
  ];

  const rows = tasks.map(t => [
    escapeCsv(t.id), // Apply escaping to all string fields as there may be commas, quotes, or newlines
    escapeCsv(t.title),
    String(t.revenue), 
    String(t.timeTaken), 
    escapeCsv(t.priority),
    escapeCsv(t.status),
    escapeCsv(t.notes ?? ''),
    escapeCsv(t.createdAt ?? ''), // Handle potential undefined
    escapeCsv(t.completedAt ?? ''), // Handle potential undefined
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
  Escapes a string for use in a CSV field.
  BUG FIX 2: This function is now RFC 4180 compliant.
  The original bug only quoted fields with newlines and didn't handle
  commas or internal double-quotes, which would break the CSV.
 
  Rules=>
  If the value contains a comma, a newline, or a double-quote,
  it must be enclosed in double-quotes.
  If the value is enclosed in double-quotes, any double-quotes
  within the value must be escaped by doubling them (e.g., " -> "").
 */
function escapeCsv(v: string): string {
  if (v === null || v === undefined) {
    return '';
  }
  
  const str = String(v);
  
  // Regex to check if we need to quote:
  // - Contains a comma
  // - Contains a double-quote
  // - Contains a newline or carriage return
  const needsQuotes = /("|,|\n|\r)/.test(str);
  
  if (!needsQuotes) {
    return str;
  }
  
  // Replace all existing double-quotes (") with two double-quotes ("") so that if one exist wrapping below with two double-quotes doesnot cause error 
  const escapedValue = str.replace(/"/g, '""');
  
  //Wrap the entire escaped value in double-quotes
  return `"${escapedValue}"`;
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}