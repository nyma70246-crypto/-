import { OpenAI } from 'openai';

// Initialize OpenAI client
// Note: In production, use environment variables for API key
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

export interface AIResponse {
  message: string;
  suggestions?: string[];
  workerRecommendations?: Array<{
    id: string;
    name: string;
    profession: string;
    reason: string;
  }>;
}

/**
 * Get AI response for user query
 */
export async function getAIResponse(userMessage: string, context?: string): Promise<AIResponse> {
  try {
    const systemPrompt = `أنت مساعد ذكي متخصص في منصة تواصل العمال المحترفين. 
    تساعد المستخدمين في:
    1. البحث عن العمال المناسبين
    2. الإجابة على الأسئلة حول الخدمات
    3. تقديم نصائح حول اختيار العامل المناسب
    4. الإجابة على الأسئلة الشائعة
    
    تحدث باللغة العربية بشكل احترافي وودود.
    ${context ? `السياق الإضافي: ${context}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const message = response.choices[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة على سؤالك.';

    return {
      message,
      suggestions: extractSuggestions(message),
    };
  } catch (error) {
    console.error('[AI Assistant] Error:', error);
    return {
      message: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة لاحقاً.',
    };
  }
}

/**
 * Get worker recommendations based on user needs
 */
export async function getWorkerRecommendations(
  userNeeds: string,
  availableWorkers: Array<{ id: string; name: string; profession: string; rating: number }>
): Promise<AIResponse> {
  try {
    const workersInfo = availableWorkers
      .map((w) => `${w.name} (${w.profession}, تقييم: ${w.rating})`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `أنت خبير في توصية العمال المناسبين. 
          حلل احتياجات المستخدم وأوصِ بأفضل العمال من القائمة المتاحة.
          قدم تفسيراً واضحاً لكل توصية.`,
        },
        {
          role: 'user',
          content: `احتياجاتي: ${userNeeds}\n\nالعمال المتاحون:\n${workersInfo}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const message = response.choices[0]?.message?.content || 'لم أتمكن من تقديم توصيات.';

    return {
      message,
      workerRecommendations: parseWorkerRecommendations(message, availableWorkers),
    };
  } catch (error) {
    console.error('[AI Assistant] Recommendation error:', error);
    return {
      message: 'عذراً، لم أتمكن من تقديم التوصيات. يرجى المحاولة لاحقاً.',
    };
  }
}

/**
 * Translate message using AI
 */
export async function translateMessage(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `أنت مترجم احترافي. ترجم النص المعطى إلى ${targetLanguage} مع الحفاظ على المعنى والسياق.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('[AI Assistant] Translation error:', error);
    return text;
  }
}

/**
 * Get answer for frequently asked questions
 */
export async function getFAQAnswer(question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `أنت مساعد خدمة عملاء متخصص في منصة تواصل العمال.
          أجب على الأسئلة الشائعة بشكل واضح وموجز.
          استخدم اللغة العربية.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    return response.choices[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة على سؤالك.';
  } catch (error) {
    console.error('[AI Assistant] FAQ error:', error);
    return 'عذراً، حدث خطأ في معالجة السؤال.';
  }
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(message: string): string[] {
  const suggestions: string[] = [];
  const lines = message.split('\n');

  for (const line of lines) {
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      const suggestion = line.trim().replace(/^[-•]\s*/, '');
      if (suggestion.length > 0 && suggestion.length < 100) {
        suggestions.push(suggestion);
      }
    }
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

/**
 * Parse worker recommendations from AI response
 */
function parseWorkerRecommendations(
  message: string,
  availableWorkers: Array<{ id: string; name: string; profession: string; rating: number }>
) {
  const recommendations = [];

  for (const worker of availableWorkers) {
    if (message.includes(worker.name)) {
      recommendations.push({
        id: worker.id,
        name: worker.name,
        profession: worker.profession,
        reason: extractReasonForWorker(message, worker.name),
      });
    }
  }

  return recommendations;
}

/**
 * Extract reason for recommending a specific worker
 */
function extractReasonForWorker(message: string, workerName: string): string {
  const lines = message.split('\n');
  let foundWorker = false;

  for (const line of lines) {
    if (line.includes(workerName)) {
      foundWorker = true;
    } else if (foundWorker && line.trim().length > 0) {
      return line.trim();
    }
  }

  return 'عامل موصى به';
}
