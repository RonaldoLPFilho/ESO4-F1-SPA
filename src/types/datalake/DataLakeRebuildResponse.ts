export interface DataLakeRebuildResponse {
  root: string;
  rebuiltAt: string;
  bronzeRecordsExported: number;
  silverFilesWritten: number;
  goldFilesWritten: number;
  summary: Record<string, number>;
}
