export async function askChatGPT(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY não definida');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Erro na API OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Resposta da OpenAI:', data);
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}