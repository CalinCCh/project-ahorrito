export async function fetchGeminiText(prompt: string) {
    const res = await fetch("/api/gemini/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
    });
    console.log('[Gemini] Response status:', res.status);
    let data;
    try {
        data = await res.json();
        console.log('[Gemini] Response JSON:', data);
    } catch (err) {
        console.error('[Gemini] Error parsing JSON:', err);
        throw new Error("Error parsing Gemini response");
    }
    if (!res.ok) {
        throw new Error(data?.error || "Error calling Gemini");
    }
    return data.text;
} 