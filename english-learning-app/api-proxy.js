import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Resend } from 'resend';

const app = express();
const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Manda Bem! <onboarding@resend.dev>';

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY não configurada. Crie um arquivo .env com ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

if (!RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY não configurada. O envio de e-mails ficará desativado até você configurá-la.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-exercises', async (req, res) => {
  try {
    const { imageBase64, fileExtension, textReference } = req.body;

    console.log('📥 Requisição recebida');

    const instructions = 'Você é um professor de inglês preparando uma prova de revisão para um aluno. Leia e entenda cuidadosamente TODO o conteúdo fornecido (é uma prova/material de inglês) antes de criar as perguntas.\n\n' +
      'Gere NO MÍNIMO 30 exercícios de múltipla escolha, todos diretamente correlacionados ao conteúdo fornecido (vocabulário, gramática, textos, diálogos, exercícios que aparecem no material). Não invente temas que não estejam no material. Varie o foco das perguntas (vocabulário, gramática, compreensão de texto, tradução) sempre com base no que está no conteúdo.\n\n';

    let prompt = instructions;
    const messages = [];

    if (imageBase64) {
      prompt = instructions;

      const ext = (fileExtension || 'jpeg').toLowerCase();
      const mediaTypeMap = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
      };
      const mediaType = mediaTypeMap[ext] || 'image/jpeg';

      console.log(`📷 Processando imagem: tipo=${mediaType}, extensão=${ext}`);

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
  "summary": "Um parágrafo curto (2 a 4 frases) resumindo, em português, o que esse material/prova aborda no geral",
  "topics": ["Tema 1 estudado no material: breve explicação de 1 frase do que é cobrado", "Tema 2 estudado no material: breve explicação de 1 frase", "..."],
  "questions": [
    {
      "id": "1",
      "type": "multiple-choice",
      "context": "Breve texto explicando o conceito/trecho do material antes da pergunta, para o aluno entender o que será cobrado",
      "question": "Pergunta aqui?",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "answer": "A) Opção 1",
      "explanation": "Breve explicação de por que essa é a resposta correta",
      "points": 10
    }
  ]
}
O campo "summary" é um resumo geral e curto do material, em português. O campo "topics" é uma lista (4 a 10 itens) dos temas/assuntos que aparecem no material, em português, cada item combinando o nome do tema com uma breve explicação do que será cobrado sobre ele (ex: "Verbo TO BE no presente: usar am/is/are com os pronomes corretos"). O campo "type" deve ser sempre "multiple-choice". O campo "context" é um texto curto (1 a 3 frases) mostrado ANTES da pergunta, explicando a regra gramatical, vocabulário ou trecho do texto relacionado àquela pergunta especifica. O campo "explanation" é mostrado DEPOIS que o aluno responde, justificando a resposta correta. O campo "answer" deve ser EXATAMENTE igual a uma das strings em "options". Gere no mínimo 30 perguntas no array "questions".`,
          },
        ],
      });
    } else if (textReference) {
      console.log('📝 Processando texto');
      messages.push({
        role: 'user',
        content: prompt + `Conteúdo:\n${textReference}\n\nRetorne APENAS um JSON válido com esta estrutura:
{
  "summary": "Um parágrafo curto (2 a 4 frases) resumindo, em português, o que esse material/prova aborda no geral",
  "topics": ["Tema 1 estudado no material: breve explicação de 1 frase do que é cobrado", "Tema 2 estudado no material: breve explicação de 1 frase", "..."],
  "questions": [
    {
      "id": "1",
      "type": "multiple-choice",
      "context": "Breve texto explicando o conceito/trecho do material antes da pergunta, para o aluno entender o que será cobrado",
      "question": "Pergunta aqui?",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "answer": "A) Opção 1",
      "explanation": "Breve explicação de por que essa é a resposta correta",
      "points": 10
    }
  ]
}
O campo "summary" é um resumo geral e curto do material, em português. O campo "topics" é uma lista (4 a 10 itens) dos temas/assuntos que aparecem no material, em português, cada item combinando o nome do tema com uma breve explicação do que será cobrado sobre ele (ex: "Verbo TO BE no presente: usar am/is/are com os pronomes corretos"). O campo "type" deve ser sempre "multiple-choice". O campo "context" é um texto curto (1 a 3 frases) mostrado ANTES da pergunta, explicando a regra gramatical, vocabulário ou trecho do texto relacionado àquela pergunta especifica. O campo "explanation" é mostrado DEPOIS que o aluno responde, justificando a resposta correta. O campo "answer" deve ser EXATAMENTE igual a uma das strings em "options". Gere no mínimo 30 perguntas no array "questions".`,
      });
    } else {
      console.log('❌ Sem imagem ou texto');
      return res.status(400).json({ error: 'Imagem ou texto é obrigatório' });
    }

    console.log('🚀 Enviando para API Claude...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error Response:', error);
      return res.status(response.status).json({ error: 'Erro na API Claude', details: error });
    }

    const data = await response.json();
    console.log('✅ Sucesso! Resposta da API recebida.');
    res.json(data);
  } catch (error) {
    console.error('❌ Server Error:', error.message);
    res.status(500).json({ error: 'Erro no servidor', details: error.message });
  }
});

const EMAIL_TEMPLATES = {
  pending: (username) => ({
    subject: 'Cadastro recebido - Manda Bem!',
    html: `
      <h2>Olá, ${username}!</h2>
      <p>Seu cadastro no <strong>Manda Bem!</strong> foi recebido com sucesso.</p>
      <p>Sua conta está <strong>aguardando liberação</strong> do administrador. Assim que for aprovada, você receberá um novo e-mail e já poderá acessar as matérias.</p>
      <p>Até breve! 📚</p>
    `,
  }),
  approved: (username) => ({
    subject: 'Sua conta foi liberada! - Manda Bem!',
    html: `
      <h2>Boas notícias, ${username}!</h2>
      <p>Sua conta no <strong>Manda Bem!</strong> foi aprovada pelo administrador.</p>
      <p>Você já pode entrar na plataforma e começar a estudar. 🎉</p>
    `,
  }),
};

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, type, username } = req.body;

    if (!to || !type || !username) {
      return res.status(400).json({ error: 'to, type e username são obrigatórios' });
    }

    const template = EMAIL_TEMPLATES[type];
    if (!template) {
      return res.status(400).json({ error: `Tipo de e-mail inválido: ${type}` });
    }

    if (!resend) {
      console.warn(`⚠️  Envio de e-mail (${type}) ignorado: RESEND_API_KEY não configurada.`);
      return res.json({ sent: false, reason: 'RESEND_API_KEY não configurada no servidor' });
    }

    const { subject, html } = template(username);
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return res.status(502).json({ sent: false, error: error.message });
    }

    console.log(`✅ E-mail "${type}" enviado para ${to}`);
    res.json({ sent: true });
  } catch (error) {
    console.error('❌ Server Error (send-email):', error.message);
    res.status(500).json({ error: 'Erro no servidor', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ API Proxy rodando em http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/generate-exercises\n`);
});
