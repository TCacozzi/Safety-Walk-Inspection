import type { Lesson } from '../types';

export const lessons: Lesson[] = [
  {
    id: 'day1',
    day: 1,
    title: 'Pronouns + AM / IS / ARE',
    description: 'Learn personal pronouns and present tense of "to be"',
    content: `
      <h3>Personal Pronouns</h3>
      <p><strong>I</strong> = eu | <strong>You</strong> = você | <strong>He</strong> = ele | <strong>She</strong> = ela</p>
      <p><strong>It</strong> = ele/ela (para coisa ou animal) | <strong>We</strong> = nós | <strong>They</strong> = eles/elas</p>

      <h3>Simple Rule</h3>
      <ul>
        <li><strong>I →</strong> AM (I am happy)</li>
        <li><strong>He / She / It →</strong> IS (She is my friend)</li>
        <li><strong>You / We / They →</strong> ARE (They are at school)</li>
      </ul>
    `,
    questions: [
      {
        id: 'd1-q1',
        type: 'multiple-choice',
        context: '',
        question: 'Complete: I _____ happy today.',
        options: ['am', 'is', 'are'],
        answer: 'am',
        explanation: 'Use "am" with "I"',
        points: 10,
      },
      {
        id: 'd1-q2',
        type: 'multiple-choice',
        context: '',
        question: 'Complete: She _____ my teacher.',
        options: ['am', 'is', 'are'],
        answer: 'is',
        explanation: 'Use "is" with "She"',
        points: 10,
      },
      {
        id: 'd1-q3',
        type: 'multiple-choice',
        context: '',
        question: 'Complete: They _____ at school.',
        options: ['am', 'is', 'are'],
        answer: 'are',
        explanation: 'Use "are" with "They"',
        points: 10,
      },
      {
        id: 'd1-q4',
        type: 'fill-blank',
        context: '',
        question: 'I _____ a student.',
        answer: 'am',
        explanation: 'Personal pronoun "I" uses "am"',
        points: 15,
      },
      {
        id: 'd1-q5',
        type: 'true-false',
        context: '',
        question: 'True or False: "He are happy" is correct.',
        answer: 'false',
        explanation: 'False. "He" uses "is": He is happy.',
        points: 10,
      },
    ],
  },
  {
    id: 'day2',
    day: 2,
    title: 'Present vs Past: IS/ARE × WAS/WERE',
    description: 'Learn present and past tense of "to be"',
    content: `
      <h3>Present vs Past</h3>
      <p><strong>IS / ARE</strong> = agora, hoje</p>
      <p><strong>WAS / WERE</strong> = passado, ontem</p>

      <h3>Rules</h3>
      <ul>
        <li><strong>He / She / It →</strong> WAS (He was happy)</li>
        <li><strong>You / We / They →</strong> WERE (They were at the zoo)</li>
      </ul>
    `,
    questions: [
      {
        id: 'd2-q1',
        type: 'multiple-choice',
        context: '',
        question: 'She _____ at school today. (present)',
        options: ['is', 'was', 'are'],
        answer: 'is',
        explanation: 'Use "is" for present with "She"',
        points: 10,
      },
      {
        id: 'd2-q2',
        type: 'multiple-choice',
        context: '',
        question: 'She _____ at the zoo yesterday. (past)',
        options: ['is', 'was', 'are'],
        answer: 'was',
        explanation: 'Use "was" for past with "She"',
        points: 10,
      },
      {
        id: 'd2-q3',
        type: 'multiple-choice',
        context: '',
        question: 'They _____ at the park yesterday.',
        options: ['are', 'were', 'is'],
        answer: 'were',
        explanation: 'Use "were" for past with "They"',
        points: 10,
      },
      {
        id: 'd2-q4',
        type: 'true-false',
        context: '',
        question: 'True or False: "I am at home yesterday" is correct.',
        answer: 'false',
        explanation: 'False. For past: "I was at home yesterday"',
        points: 10,
      },
    ],
  },
  {
    id: 'day3',
    day: 3,
    title: 'Helping Verbs: CAN / HAVE',
    description: 'Learn modal verb CAN and verb HAVE',
    content: `
      <h3>CAN = poder / conseguir fazer algo</h3>
      <p>I can swim. = Eu consigo nadar.</p>
      <p>They can ride a bike. = Eles conseguem andar de bicicleta.</p>

      <h3>HAVE = ter</h3>
      <p>I have a book. = Eu tenho um livro.</p>
      <p>We have homework. = Nós temos lição de casa.</p>
    `,
    questions: [
      {
        id: 'd3-q1',
        type: 'multiple-choice',
        context: '',
        question: 'I _____ ride a bike.',
        options: ['can', 'have', 'am'],
        answer: 'can',
        explanation: '"can" means "conseguir" or "poder fazer"',
        points: 10,
      },
      {
        id: 'd3-q2',
        type: 'multiple-choice',
        context: '',
        question: 'We _____ two books.',
        options: ['can', 'have', 'are'],
        answer: 'have',
        explanation: '"have" means "ter" (to have)',
        points: 10,
      },
      {
        id: 'd3-q3',
        type: 'fill-blank',
        context: '',
        question: 'They _____ play soccer.',
        answer: 'can',
        explanation: '"can" expresses ability',
        points: 15,
      },
    ],
  },
  {
    id: 'day4',
    day: 4,
    title: 'MUST / MUSTN\'T',
    description: 'Learn obligation and prohibition',
    content: `
      <h3>MUST = TEM QUE / DEVE</h3>
      <p>I must study. = Eu tenho que estudar.</p>
      <p>We must respect our teachers. = Nós devemos respeitar nossos professores.</p>

      <h3>MUSTN'T = NÃO PODE</h3>
      <p>You mustn't run in the classroom. = Você não pode correr na sala.</p>
      <p>We mustn't throw trash on the floor. = Não podemos jogar lixo no chão.</p>
    `,
    questions: [
      {
        id: 'd4-q1',
        type: 'multiple-choice',
        context: '',
        question: 'I _____ do my homework.',
        options: ['must', "mustn't", 'can'],
        answer: 'must',
        explanation: '"must" expresses obligation',
        points: 10,
      },
      {
        id: 'd4-q2',
        type: 'multiple-choice',
        context: '',
        question: 'You _____ run in the classroom.',
        options: ['must', "mustn't", 'can'],
        answer: "mustn't",
        explanation: '"mustn\'t" means prohibition',
        points: 10,
      },
      {
        id: 'd4-q3',
        type: 'fill-blank',
        context: '',
        question: 'We _____ respect our teachers.',
        answer: 'must',
        explanation: '"must" for obligations',
        points: 15,
      },
    ],
  },
  {
    id: 'day5',
    day: 5,
    title: 'Suffix -ABLE',
    description: 'Learn adjectives with -able suffix',
    content: `
      <h3>What does -ABLE mean?</h3>
      <p>The suffix -able helps form words that mean "que pode ser..." or a characteristic.</p>
      <ul>
        <li><strong>read + able</strong> = readable → que pode ser lido / fácil de ler</li>
        <li><strong>comfort + able</strong> = comfortable → confortável</li>
        <li><strong>change + able</strong> = changeable → que pode mudar</li>
        <li><strong>fix + able</strong> = fixable → que pode ser consertado</li>
      </ul>
    `,
    questions: [
      {
        id: 'd5-q1',
        type: 'multiple-choice',
        context: '',
        question: 'This book is very _____.',
        options: ['readable', 'reading', 'read'],
        answer: 'readable',
        explanation: '-able makes adjectives meaning "que pode ser..."',
        points: 10,
      },
      {
        id: 'd5-q2',
        type: 'multiple-choice',
        context: '',
        question: 'The chair is _____.',
        options: ['comfortable', 'comfort', 'comforting'],
        answer: 'comfortable',
        explanation: '-able adjective for comfort',
        points: 10,
      },
      {
        id: 'd5-q3',
        type: 'fill-blank',
        context: '',
        question: 'My bike is broken, but it is _____. (fix + able)',
        answer: 'fixable',
        explanation: 'fix + able = fixable',
        points: 15,
      },
    ],
  },
  {
    id: 'day6',
    day: 6,
    title: 'Sentence Building',
    description: 'Learn how to build correct sentences',
    content: `
      <h3>Simple Formula</h3>
      <p><strong>WHO + IMPORTANT WORD + ACTION/INFO</strong></p>
      <ul>
        <li>I + must + study. → <strong>I must study.</strong></li>
        <li>She + is + happy. → <strong>She is happy.</strong></li>
        <li>They + can + swim. → <strong>They can swim.</strong></li>
      </ul>
    `,
    questions: [
      {
        id: 'd6-q1',
        type: 'order-words',
        context: '',
        question: 'Put in correct order: must / I / study',
        answer: 'I must study',
        explanation: 'Correct order: subject + verb + object',
        points: 15,
      },
      {
        id: 'd6-q2',
        type: 'order-words',
        context: '',
        question: 'Put in correct order: is / She / happy',
        answer: 'She is happy',
        explanation: 'Subject + "to be" + adjective',
        points: 15,
      },
      {
        id: 'd6-q3',
        type: 'order-words',
        context: '',
        question: 'Put in correct order: can / They / swim',
        answer: 'They can swim',
        explanation: 'Subject + can + verb',
        points: 15,
      },
    ],
  },
  {
    id: 'day7',
    day: 7,
    title: 'Review + Mock Test',
    description: 'Review everything and take the mock test',
    content: `
      <h3>Quick Review</h3>
      <ul>
        <li><strong>I →</strong> am</li>
        <li><strong>He / She / It →</strong> is (present) | was (past)</li>
        <li><strong>You / We / They →</strong> are (present) | were (past)</li>
        <li><strong>must</strong> = deve / tem que | <strong>mustn't</strong> = não pode</li>
        <li><strong>can</strong> = consegue / pode</li>
        <li><strong>-able</strong> appears in words like readable, comfortable, fixable</li>
      </ul>
    `,
    questions: [
      {
        id: 'd7-q1',
        type: 'multiple-choice',
        context: '',
        question: 'She _____ my friend.',
        options: ['am', 'is', 'are'],
        answer: 'is',
        explanation: 'Use "is" with "She"',
        points: 10,
      },
      {
        id: 'd7-q2',
        type: 'multiple-choice',
        context: '',
        question: 'They _____ at the zoo yesterday.',
        options: ['was', 'were', 'are'],
        answer: 'were',
        explanation: 'Use "were" for past with "They"',
        points: 10,
      },
      {
        id: 'd7-q3',
        type: 'multiple-choice',
        context: '',
        question: 'I _____ do my homework.',
        options: ['must', "mustn't", 'can'],
        answer: 'must',
        explanation: 'Obligation uses "must"',
        points: 10,
      },
      {
        id: 'd7-q4',
        type: 'multiple-choice',
        context: '',
        question: 'This chair is very _____.',
        options: ['comfort', 'comfortable', 'comforting'],
        answer: 'comfortable',
        explanation: '-able adjective',
        points: 10,
      },
    ],
  },
];
