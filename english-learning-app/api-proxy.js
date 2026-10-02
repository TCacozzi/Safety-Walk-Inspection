import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-exercises', async (req, res) => {
  try {
    const { imageBase64, fileExtension, textReference, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key é obrigatória' });
    }

    let prompt = 'Analise este conteúdo educacional e gere 10 exercícios de múltipla escolha em JSON.\n\n';
    const messages = [];

    if (imageBase64) {
      prompt = 'Analise esta imagem do livro/material de estudo e gere 10 exercícios de múltipla escolha em JSON.\n\n';

      // Detectar tipo de imagem pela extensão do arquivo
      const ext = (fileExtension || 'jpeg').toLowerCase();
      const mediaTypeMap = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
      };
      const mediaType = mediaTypeMap[ext] || 'image/jpeg';

      console.log(`Processando imagem: tipo=${mediaType}, extensão=${ext}`);

      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt + `Retorne APENAS um JSON válido com esta estrutura:
{
  "questions": [
    {
      "id": 1,
      "question": "Pergunta aqui?",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "answer": "A",
      "points": 10
    }
  ]
}`,
          },
        ],
      });
    } else if (textReference) {
      messages.push({
        role: 'user',
        content: prompt + `Conteúdo:\n${textReference}\n\nRetorne APENAS um JSON válido com esta estrutura:
{
  "questions": [
    {
      "id": 1,
      "question": "Pergunta aqui?",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "answer": "A",
      "points": 10
    }
  ]
}`,
      });
    } else {
      return res.status(400).json({ error: 'Imagem ou texto é obrigatório' });
    }

    console.log('Enviando para API Claude...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error Response:', error);
      return res.status(response.status).json({ error: 'Erro na API Claude', details: error });
    }

    const data = await response.json();
    console.log('Sucesso! Resposta da API recebida.');
    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Erro no servidor', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ API Proxy rodando em http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/generate-exercises\n`);
});
