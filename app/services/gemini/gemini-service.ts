import { model } from "./gemini-model";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const generationConfig = {
  temperature: 0.4,
  topK: 1,
  topP: 0.9,
  maxOutputTokens: 2048, // Suficiente para lotes grandes
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

interface CategorizationResult {
  category: string;
  emoji: string;
}

interface BatchTransaction {
  payee: string;
  amount?: number;
  date?: string;
  description?: string;
}

interface BatchCategorizationResult {
  index: number;
  category: string;
  emoji: string;
}

export async function categorizeTransactionsBatch(
  transactions: BatchTransaction[],
  predefinedCategories: string[]
): Promise<BatchCategorizationResult[]> {
  if (!transactions.length) return [];
  // Limitar a 150 por lote
  const batch = transactions.slice(0, 150);
  const txList = batch
    .map((tx, i) =>
      `{
  "index": ${i},
  "payee": "${tx.payee.replace(/"/g, '')}",
  "amount": ${typeof tx.amount === 'number' ? tx.amount : 'null'},
  "date": "${tx.date || ''}",
  "description": "${tx.description || ''}"
}`
    )
    .join(',\n');

  const prompt = `Eres un asistente experto en finanzas personales. Tu tarea es categorizar cada transacción del array JSON que te paso.

IMPORTANTE: Usa SOLO una de las siguientes categorías exactamente como están escritas, sin modificaciones: [${predefinedCategories.join(", ")}].

REGLAS CLAVE:
- Usa "Groceries" solo para supermercados, hipermercados, tiendas de alimentación general (ej: LIDL, ALDI, Walmart, Carrefour, Tesco, PRIMAPRIX, DIA, HIPER CHINA, LUPA si es supermercado).
- Usa "Food" solo para restaurantes, bares, cafeterías, comida rápida, panaderías, pastelerías, pizzerías, kebabs, cafeterías, etc. (ej: McDonald's, Starbucks, Burger King, Telepizza, Sushisom, Panadería La Espiga).
- Usa "Shopping" para compras generales (ropa, tecnología, Amazon, El Corte Inglés, Media Markt, Apple Store, Zara, IKEA, Decathlon, tiendas de electrónica, jugueterías, librerías, etc.) que no sean alimentación ni restauración.
- Usa "Subscriptions" para servicios recurrentes (ej: YouTube Premium, Netflix, Spotify, Amazon Prime, Dropbox, periódicos digitales, gimnasios, etc.).
- Usa "Vehicle" solo para gasolineras, talleres, parkings, peajes, alquiler de coches, lavado de autos, etc. (ej: Shell, Repsol, Cepsa, Hertz, Parking SABA).
- Usa "Health" solo para farmacias, médicos, dentistas, ópticas, seguros médicos, clínicas veterinarias, etc. (ej: Farmacia Central, Clínica Dental Sonrisa, Sanitas, Affinity Petcare).
- Usa "Entertainment" para ocio (cine, conciertos, bares de copas, discotecas, juegos, casinos, parques de atracciones, museos, boleras, etc.).
- NUNCA uses la categoría "Income" para ninguna transacción, aunque parezca un ingreso. "Income" se asigna automáticamente en otro proceso.
- Si no estás seguro, elige la categoría más probable de la lista proporcionada. NO uses "Other" ni ninguna categoría que no esté en la lista.

EJEMPLOS:
- "LIDL", "ALDI", "Walmart", "Carrefour", "Tesco", "PRIMAPRIX", "DIA", "HIPER CHINA", "SUPERMERCADO", "Mercadona", "Whole Foods" → "Groceries"
- "McDonald's", "Starbucks", "Burger King", "Telepizza", "Sushisom", "Panadería La Espiga", "Café Central", "KFC", "Pastelería Dulce" → "Food"
- "AMAZON", "MEDIA MARKT", "EL CORTE INGLES", "Apple Store", "Zara", "IKEA", "Decathlon", "Fnac", "Juguetería Toy Planet", "Librería Gandhi" → "Shopping"
- "GOOGLE*YOUTUBEPREMIUM", "NETFLIX", "Spotify", "Amazon Prime", "Gimnasio Basic-Fit", "El País Digital" → "Subscriptions"
- "PETROPRIX", "CEPSA", "Shell", "Repsol", "Parking SABA", "Hertz", "Peaje AP-7", "Lavado Rápido" → "Vehicle"
- "FARMACIA", "CLINICA DENTAL", "Sanitas", "Affinity Petcare", "Óptica Lux", "Hospital General" → "Health"
- "STEAMGAMES.COM", "PAYPAL *ITUNESAPPST AP", "Cinesa", "Teatro Real", "Museo del Prado", "Casino Gran Madrid", "Bowling Center", "Parque Warner" → "Entertainment"

Devuelve un array JSON con este formato exacto: [{"index": 0, "category": "...", "emoji": "..."}, ...].
No expliques nada, solo el array JSON.

Transacciones:
[${txList}]

Respuesta:`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch && jsonMatch[0]) {
      const parsed = JSON.parse(jsonMatch[0]) as BatchCategorizationResult[];
      return parsed;
    } else {
      console.error("No se pudo extraer el array JSON de la respuesta:", responseText);
      return [];
    }
  } catch (error) {
    console.error("Error en categorización batch:", error);
    return [];
  }
}

export async function categorizeTransactionByPayee(payee: string): Promise<CategorizationResult | null> {
  if (!payee.trim()) {
    console.warn("Payee is empty, skipping categorization.");
    return null;
  }

  const prompt = `
  Categoriza la transacción solo por el nombre del comercio o persona (payee).
  Responde solo con un JSON: {"category": "...", "emoji": "..."} (máx 3 palabras en español, 1 emoji relevante).
  Payee: "${payee}"
  JSON:
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    console.log(`Categorization response for payee "${payee}":`, responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
      const parsed = JSON.parse(jsonMatch[0]) as CategorizationResult;
      if (parsed.category && parsed.emoji) {
        return parsed;
      } else {
        console.error("Parsed JSON does not contain expected properties:", parsed);
        return null;
      }
    } else {
      console.error("Could not extract JSON from response:", responseText);
      return null;
    }

  } catch (error) {
    console.error(`Error categorizing payee "${payee}":`, error);
    return null;
  }
}

export async function categorizeTransactionWithPredefinedCategories(payee: string, predefinedCategories: string[], opts?: { amount?: number, date?: string, description?: string }): Promise<string | null> {
  if (!payee.trim() || !predefinedCategories.length) return null;
  const extra = [];
  if (opts?.amount !== undefined) extra.push(`Amount: ${opts.amount / 100}`); // Show in standard units
  if (opts?.date) extra.push(`Date: ${opts.date}`);
  if (opts?.description) extra.push(`Description: "${opts.description}"`);
  const prompt = `You are an expert finance categorization assistant. Your task is to categorize the transaction below with the *most specific and accurate* category from the provided list ONLY.
List of allowed categories: [${predefinedCategories.join(", ")}]

Transaction Details:
Payee: "${payee}"
${extra.join('\n')}

Instructions:
1. Analyze the Payee and Description carefully.
2. Choose the *single best matching category* from the list above.
3. If unsure, pick the most plausible category from the list.
4. **Reply with ONLY the category name from the list.** Do not add explanations or extra text.

Chosen Category:`;
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    const responseText = result.response.text().trim();
    const found = predefinedCategories.find(cat => responseText.toLowerCase().includes(cat.toLowerCase()));
    return found || null;
  } catch (error) {
    console.error(`Error categorizing payee "${payee}":`, error);
    return null;
  }
}

