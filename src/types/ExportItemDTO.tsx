export type ExportItemDTO = {
    timestamp: string;
    imageName: string;
    source: string;
    predictedLabel: string;
    confidence: number;
    modelVersion: string;
    requestId: string;
}