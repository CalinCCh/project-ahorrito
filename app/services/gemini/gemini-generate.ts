import { model } from "./gemini-model";

interface GenerateTextOptions {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}

export async function generateText({
    prompt,
    maxTokens = 256,
    temperature = 0.7,
}: GenerateTextOptions): Promise<string> {
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
        },
    });
    return result.response.text();
}