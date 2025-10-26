const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function generateRecommendations(userPerformance) {
  try {
    const prompt = `Based on the following user performance data: ${JSON.stringify(userPerformance)}, 
                   suggest personalized learning recommendations.`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error in AI service:', error);
    throw new Error('Failed to generate recommendations');
  }
}

module.exports = { generateRecommendations };