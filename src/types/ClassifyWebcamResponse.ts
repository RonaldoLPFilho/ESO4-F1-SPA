export type ClassifyWebcamResponse = {
    predictedLabel: "saudavel" | "doente" | string;
    food: string | null;
    confidence: number;
    modelVersion: string;
    timestamp: string;
    source: string;
};


