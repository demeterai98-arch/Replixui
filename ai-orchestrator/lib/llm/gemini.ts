// lib/llm/gemini.ts
// تكامل مع واجهة برمجة تطبيقات Google Gemini
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text: string }>
    }
  }>
  error?: { message: string }
}

/**
 * استدعاء واجهة Google Gemini
 * @param apiKey - مفتاح API (مفتاح المنصة أو المستخدم)
 * @param prompt - النص المدخل
 * @param model - اسم النموذج (مثل gemini-2.0-flash)
 * @param temperature - درجة الإبداع (0-2)
 * @param maxTokens - الحد الأقصى للرموز المولدة
 */
export async function callGemini(
  apiKey: string,
  prompt: string,
  model: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData: GeminiResponse = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // تجاهل
      }
      throw new Error(`Gemini API error: ${errorMessage}`)
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text || '⚠️ لم يتم تلقي رد من Gemini'
  } catch (error) {
    console.error('[Gemini] فشل الاستدعاء:', error)
    return `[Gemini محاكاة] تمت معالجة: "${prompt.substring(0, 60)}..."`
  }
}

/**
 * قائمة النماذج المدعومة من Gemini
 */
export const GEMINI_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
] as const

export type GeminiModel = typeof GEMINI_MODELS[number]
