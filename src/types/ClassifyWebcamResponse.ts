export type ClassifyWebcamResponse = {
    predictedLabel: "saudavel" | "doente" | string;
    confidence: number;
    modelVersion: string;
    timestamp: string;
    source: string;
};


