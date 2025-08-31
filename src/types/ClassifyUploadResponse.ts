export type ClassifyUploadResponse = {
    id: string;
    imageName: string;
    predictedLabel: "saudavel" | "doente" | string;
    confidence: number;
    modelVersion: string;
    timestamp: string;
    source: string;
}

