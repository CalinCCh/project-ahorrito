import { generateText } from '@/app/services/gemini/gemini-generate';
import { categorizeTransactionByPayee } from '@/app/services/gemini/gemini-service';
import { Hono } from 'hono';

const app = new Hono();

app.post('/', async (c) => {
    const { prompt } = await c.req.json();
    if (!prompt) {
        return c.json({ error: 'Prompt requerido' }, 400);
    }
    try {
        const text = await categorizeTransactionByPayee(prompt);
        return c.json({ text });
    } catch (error) {
        return c.json({ error: 'Error generando texto' }, 500);
    }
});

app.post('/generate', async (c) => {
    const { prompt, maxTokens, temperature } = await c.req.json();
    if (!prompt) {
        return c.json({ error: 'Prompt requerido' }, 400);
    }
    try {
        const text = await generateText({ prompt, maxTokens, temperature });
        return c.json({ text });
    } catch (error) {
        return c.json({ error: 'Error generando texto' }, 500);
    }
});

export default app; 