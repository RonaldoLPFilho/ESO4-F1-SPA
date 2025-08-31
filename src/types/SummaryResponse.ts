import type { ExportItemDTO } from "./ExportItemDTO";

export type SummaryResponse = {
    countsByLabel: Record<string, number>;
    avgConfidence: number,
    metrics? : {
        modelVersion: string | null;
        accuracy: number | null;
        precision: number | null;
        recall: number | null;
        f1: number | null;
        testedAt: string | null;
    } | null;
    last: ExportItemDTO[]
}