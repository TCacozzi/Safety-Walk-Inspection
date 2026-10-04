import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import * as db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Manda Bem! <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY não configurada. Crie um arquivo .env com ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

if (!RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY não configurada. O envio de e-mails ficará desativado até você configurá-la.');
}

if (!db.dbEnabled) {
  console.warn('⚠️  SUPABASE_URL / SUPABASE_SERVICE_KEY não configuradas. As rotas de dados (usuários, matérias, progresso) ficarão indisponíveis até você configurá-las.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const ExercisesSchema = z.object({
  summary: z.string(),
  topics: z.array(z.string()),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.literal('multiple-choice'),
      context: z.string(),
      question: z.string(),
      options: z.array(z.string()),
      answer: z.string(),
      explanation: z.string(),
      points: z.number(),
    })
  ),
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

function requireDb(req, res, next) {
  if (!db.dbEnabled) {
    return res.status(503).json({ error: 'Banco de dados não configurado no servidor (SUPABASE_URL / SUPABASE_SERVICE_KEY ausentes).' });
  }
  next();
}

function asyncHandler(fn) {
  return (req, res) => {
    fn(req, res).catch((error) => {
      console.error('❌ Erro na rota:', error.message);
      res.status(500).json({ error: 'Erro no servidor', details: error.message });
    });
  };
}

app.post('/api/generate-exercises', async (req, res) => {
  try {
    const { imageBase64, fileExtension, textReference } = req.body;

    console.log('📥 Requisição recebida');

    const instructions = 'Você é um professor de inglês preparando uma prova de revisão para um aluno. Leia e entenda cuidadosamente TODO o conteúdo fornecido (é uma prova/material de inglês) antes de criar as perguntas.\n\n' +
      'Gere NO MÍNIMO 30 exercícios de múltipla escolha, todos diretamente correlacionados ao conteúdo fornecido (vocabulário, gramática, textos, diálogos, exercícios que aparecem no material). Não invente temas que não estejam no material. Varie o foco das perguntas (vocabulário, gramática, compreensão de texto, tradução) sempre com base no que está no conteúdo.\n\n';

    const fieldGuide = 'O campo "summary" é um resumo geral e curto do material, em português. O campo "topics" é uma lista (4 a 10 itens) dos temas/assuntos que aparecem no material, em português, cada item combinando o nome do tema com uma breve explicação do que será cobrado sobre ele (ex: "Verbo TO BE no presente: usar am/is/are com os pronomes corretos"). O campo "type" de cada pergunta deve ser sempre EXATAMENTE a string "multiple-choice". O campo "context" é um texto curto (1 a 3 frases) mostrado ANTES da pergunta, explicando a regra gramatical, vocabulário ou trecho do texto relacionado àquela pergunta especifica. O campo "explanation" é mostrado DEPOIS que o aluno responde, justificando a resposta correta. O campo "answer" deve ser EXATAMENTE igual a uma das strings em "options". Gere no mínimo 30 perguntas.';

    const messages = [];

    if (imageBase64) {
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
            text: instructions + fieldGuide,
          },
        ],
      });
    } else if (textReference) {
      console.log('📝 Processando texto');
      messages.push({
        role: 'user',
        content: `${instructions}Conteúdo:\n${textReference}\n\n${fieldGuide}`,
      });
    } else {
      console.log('❌ Sem imagem ou texto');
      return res.status(400).json({ error: 'Imagem ou texto é obrigatório' });
    }

    console.log('🚀 Enviando para API Claude...');

    const response = await anthropic.messages.parse({
      model: 'claude-haiku-4-5',
      max_tokens: 16000,
      messages,
      output_config: { format: zodOutputFormat(ExercisesSchema) },
    });

    if (!response.parsed_output) {
      console.error('❌ Resposta não pôde ser estruturada. stop_reason:', response.stop_reason);
      return res.status(502).json({
        error: 'A IA não conseguiu gerar os exercícios nesse formato. Tente novamente ou use um texto mais curto.',
      });
    }

    console.log('✅ Sucesso! Resposta da API recebida.');
    res.json(response.parsed_output);
  } catch (error) {
    console.error('❌ Server Error:', error.message);
    if (error instanceof Anthropic.APIError) {
      return res.status(error.status || 500).json({ error: 'Erro na API Claude', details: error.message });
    }
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

// --- Users ---

app.get('/api/users', requireDb, asyncHandler(async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
}));

app.post('/api/users', requireDb, asyncHandler(async (req, res) => {
  const { username, password, email, parentPassword, approved } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username e password são obrigatórios' });
  }
  if (await db.usernameExists(username)) {
    return res.status(409).json({ error: 'Já existe uma conta com esse usuário' });
  }
  const user = await db.createUser({
    id: `user_${Date.now()}`,
    username,
    password,
    email: email || '',
    parentPassword: parentPassword || '',
    approved: !!approved,
  });
  res.status(201).json(user);
}));

app.post('/api/users/login', requireDb, asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await db.findUserByCredentials(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos' });
  }
  res.json(user);
}));

app.post('/api/users/:id/approve', requireDb, asyncHandler(async (req, res) => {
  const user = await db.approveUserById(req.params.id);
  res.json(user);
}));

app.delete('/api/users/:id', requireDb, asyncHandler(async (req, res) => {
  await db.removeUserById(req.params.id);
  res.json({ removed: true });
}));

app.post('/api/users/:id/validate-parent-password', requireDb, asyncHandler(async (req, res) => {
  const valid = await db.validateParentPasswordFor(req.params.id, req.body.password);
  res.json({ valid });
}));

app.put('/api/users/:id/password', requireDb, asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'password é obrigatório' });
  }
  await db.updateUserPassword(req.params.id, password);
  res.json({ saved: true });
}));

app.post('/api/users/forgot-password', requireDb, asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email é obrigatório' });
  }

  const user = await db.findUserByEmail(email);
  if (user) {
    if (!resend) {
      console.warn('⚠️  Pedido de redefinição de senha ignorado: RESEND_API_KEY não configurada.');
    } else {
      const token = await db.createPasswordResetToken(user.id);
      const resetLink = `${FRONTEND_URL}/?reset_token=${token}`;
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Redefinir sua senha - Manda Bem!',
        html: `
          <h2>Olá, ${user.username}!</h2>
          <p>Recebemos um pedido para redefinir a senha da sua conta no <strong>Manda Bem!</strong>.</p>
          <p><a href="${resetLink}">Clique aqui para escolher uma nova senha</a></p>
          <p>Esse link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail.</p>
        `,
      });
      if (error) {
        console.error('❌ Erro ao enviar e-mail de redefinição:', error);
      }
    }
  }

  // Sempre responde com a mesma mensagem, exista ou não o e-mail cadastrado,
  // para não revelar quais contas existem no sistema.
  res.json({ ok: true });
}));

app.post('/api/users/reset-password', requireDb, asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'token e newPassword são obrigatórios' });
  }

  const result = await db.consumePasswordResetToken(token);
  if (!result) {
    return res.status(400).json({ error: 'Link inválido ou expirado. Peça um novo e-mail de redefinição.' });
  }

  await db.updateUserPassword(result.userId, newPassword);
  res.json({ ok: true });
}));

// --- Admin passcode ---

app.get('/api/admin-passcode', requireDb, asyncHandler(async (req, res) => {
  const status = await db.getAdminPasscodeStatus();
  res.json(status);
}));

app.post('/api/admin-passcode/validate', requireDb, asyncHandler(async (req, res) => {
  const result = await db.validateAdminPasscode(req.body.passcode);
  res.json(result);
}));

app.post('/api/admin-passcode', requireDb, asyncHandler(async (req, res) => {
  if (!/^\d{6}$/.test(req.body.passcode || '')) {
    return res.status(400).json({ error: 'A senha deve ter exatamente 6 números' });
  }
  await db.setAdminPasscode(req.body.passcode);
  res.json({ saved: true });
}));

// --- Subjects ---

app.get('/api/subjects', requireDb, asyncHandler(async (req, res) => {
  const subjects = await db.getSubjects();
  res.json(subjects);
}));

app.post('/api/subjects', requireDb, asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name é obrigatório' });
  }
  const subject = await db.createSubject({ id: `subject_${Date.now()}`, name });
  res.status(201).json(subject);
}));

app.put('/api/subjects/:id', requireDb, asyncHandler(async (req, res) => {
  const subject = await db.updateSubjectById(req.params.id, req.body);
  res.json(subject);
}));

app.delete('/api/subjects/:id', requireDb, asyncHandler(async (req, res) => {
  await db.removeSubjectById(req.params.id);
  res.json({ removed: true });
}));

// --- Student profile ---

app.get('/api/profiles/:userId', requireDb, asyncHandler(async (req, res) => {
  const profile = await db.getProfile(req.params.userId);
  res.json(profile);
}));

app.put('/api/profiles/:userId', requireDb, asyncHandler(async (req, res) => {
  await db.saveProfile(req.params.userId, req.body);
  res.json({ saved: true });
}));

// --- User progress ---

app.get('/api/progress/:userId', requireDb, asyncHandler(async (req, res) => {
  const progress = await db.getProgress(req.params.userId);
  res.json(progress);
}));

app.put('/api/progress/:userId', requireDb, asyncHandler(async (req, res) => {
  await db.saveProgress(req.params.userId, req.body);
  res.json({ saved: true });
}));

// --- Quiz progress ---

app.get('/api/quiz-progress/:userId/:subjectId', requireDb, asyncHandler(async (req, res) => {
  const progress = await db.getQuizProgress(req.params.userId, req.params.subjectId);
  res.json(progress);
}));

app.put('/api/quiz-progress/:userId/:subjectId', requireDb, asyncHandler(async (req, res) => {
  await db.saveQuizProgress(req.params.userId, req.params.subjectId, req.body);
  res.json({ saved: true });
}));

app.delete('/api/quiz-progress/:userId/:subjectId', requireDb, asyncHandler(async (req, res) => {
  await db.clearQuizProgress(req.params.userId, req.params.subjectId);
  res.json({ removed: true });
}));

app.listen(PORT, () => {
  console.log(`\n✅ API Proxy rodando em http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/generate-exercises\n`);
});
