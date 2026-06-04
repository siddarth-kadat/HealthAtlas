import Groq from 'groq-sdk';

export const handleChat = async (req, res) => {
  try {
    const { message, context } = req.body;

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ msg: 'AI API Key is not configured on the server.' });
    }

    const groq = new Groq({ apiKey });

    let systemPrompt = "You are the HealthAtlas Assistant, a professional yet conversational health data expert. Your goal is to provide clear, easy-to-understand, and communicable answers about global health trends.";
    
    if (context) {
      systemPrompt += `
        Current Global Context from Database:
        - Countries Tracked: ${context.countriesTracked || 0}
        - Diseases Monitored: ${context.diseasesTracked || 0}
        - Average Risk Score: ${context.avgRiskScore || 0}%
      `;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const text = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    res.json({ text });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ msg: 'Failed to process AI request: ' + (err.message || 'Unknown error') });
  }
};
