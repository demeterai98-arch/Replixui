// lib/llm/anthropic.ts
// تكامل مع واجهة برمجة تطبيقات Anthropic Claude
interface AnthropicResponse {
  content: Array<{ text: string }>
  error?: { message: string }
}

/**
 * استدعاء واجهة Anthropic Claude
 * @param apiKey - مفتاح API (إما مفتاح المستخدم أو مفتاح المنصة)
 * @param prompt - النص المدخل
 * @param model - اسم النموذج (مثل claude-3-sonnet-20240229)
 * @param temperature - درجة الإبداع (0-1)
 * @param maxTokens - الحد الأقصى للرموز المولدة
 */
export async function callAnthropic(
  apiKey: string,
  prompt: string,
  model: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData: AnthropicResponse = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // تجاهل خطأ تحليل JSON
      }
      throw new Error(`Anthropic API error: ${errorMessage}`)
    }

    const data: AnthropicResponse = await response.json()
    return data.content?.[0]?.text || '⚠️ لم يتم تلقي رد من Anthropic'
  } catch (error) {
    console.error('[Anthropic] فشل الاستدعاء:', error)
    // في حالة الخطأ، نعيد رسالة وهمية للتطوير
    return `[Anthropic محاكاة] تمت معالجة: "${prompt.substring(0, 60)}..."`
  }
}

/**
 * قائمة النماذج المدعومة من Anthropic
 */
export const ANTHROPIC_MODELS = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
  'claude-2.1',
] as const

export type AnthropicModel = typeof ANTHROPIC_MODELS[number]
