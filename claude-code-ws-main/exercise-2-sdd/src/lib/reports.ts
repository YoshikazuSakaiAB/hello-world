import type { Report, ReportFilter } from "./types";

export function sortByDateDesc(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function filterReports(reports: Report[], filter: ReportFilter): Report[] {
  return reports.filter((r) => {
    if (filter.dateFrom && r.date < filter.dateFrom) return false;
    if (filter.dateTo && r.date > filter.dateTo) return false;
    if (filter.category && r.category !== filter.category) return false;
    if (filter.name && !r.name.includes(filter.name.trim())) return false;
    return true;
  });
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function truncateContent(content: string, max = 100): string {
  return content.length > max ? content.slice(0, max) : content;
}
