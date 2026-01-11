
import { Story } from './types';

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: '顶级投行生存指南',
    tagline: '在这个充斥着金钱与欲望的曼哈顿，智慧是唯一的通行证。',
    genre: '职场逆袭',
    coverImage: 'https://picsum.photos/seed/finance/800/600',
    // Fix: Added missing 'dateAdded' property to satisfy Story interface
    dateAdded: '2024-01-01T00:00:00Z',
    immersionContent: [
      { type: 'text', content: '当林薇踏入华尔街那栋璀璨的摩天大楼时，她感到一种前所未有的 ' },
      { type: 'word', content: 'apprehension', wordId: 'w1' },
      { type: 'text', content: '。作为新晋的 ' },
      { type: 'word', content: 'associate', wordId: 'w2' },
      { type: 'text', content: '，她必须在那些 ' },
      { type: 'word', content: 'ruthless', wordId: 'w3' },
      { type: 'text', content: ' 的资深合伙人面前证明自己的价值。' }
    ],
    blindContent: "As Lin Wei stepped into the glittering Manhattan skyscraper, she felt a profound sense of apprehension. As the newly appointed associate, she had to prove her worth to those ruthless senior partners.",
    vocabulary: [
      {
        id: 'w1',
        word: 'apprehension',
        phonetic: '/ˌæp.rɪˈhen.ʃən/',
        definition: 'Anxiety or fear that something bad or unpleasant will happen.',
        example: 'He felt a sick feeling of apprehension as he stepped into the office.',
        translation: '忧虑，恐惧',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band8'
      },
      {
        id: 'w2',
        word: 'associate',
        phonetic: '/əˈsoʊ.ʃi.eɪt/',
        definition: 'A partner or colleague in business or at work.',
        example: 'The managing director works closely with his junior associates.',
        translation: '同事，合伙人',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band7'
      },
      {
        id: 'w3',
        word: 'ruthless',
        phonetic: '/ˈuːθ.ləs/',
        definition: 'Having or showing no pity or compassion for others.',
        example: 'In the world of high finance, you have to be ruthless to succeed.',
        translation: '无情的，冷酷的',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band8'
      }
    ]
  },
  {
    id: 'story-2',
    title: '伦敦社交季：灰姑娘的逆袭',
    tagline: '繁花似锦的庄园背后，是权力与地位的精密博弈。',
    genre: '时代情感',
    coverImage: 'https://picsum.photos/seed/london/800/600',
    // Fix: Added missing 'dateAdded' property to satisfy Story interface
    dateAdded: '2024-01-02T00:00:00Z',
    immersionContent: [
      { type: 'text', content: '舞厅里的水晶灯投射下 ' },
      { type: 'word', content: 'opulent', wordId: 'w4' },
      { type: 'text', content: ' 的光芒。苏菲亚知道，她的出身虽然 ' },
      { type: 'word', content: 'modest', wordId: 'w5' },
      { type: 'text', content: '，但她的见识足以让这些 ' },
      { type: 'word', content: 'aristocratic', wordId: 'w6' },
      { type: 'text', content: ' 名流们 ' },
      { type: 'word', content: 'scrutinize', wordId: 'w7' },
      { type: 'text', content: ' 自己的每一个动作。' }
    ],
    blindContent: "The chandeliers in the ballroom cast an opulent glow. Sophia knew that while her background was modest, her intellect was enough to make these aristocratic socialites scrutinize her every move.",
    vocabulary: [
      {
        id: 'w4',
        word: 'opulent',
        phonetic: '/ˈɒp.jə.lənt/',
        definition: 'Ostentatiously rich and luxurious or lavish.',
        example: 'The palace was decorated in an opulent style with gold leaf and velvet.',
        translation: '豪华的，富裕的',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band9'
      },
      {
        id: 'w5',
        word: 'modest',
        phonetic: '/ˈmɒd.ɪst/',
        definition: 'Unassuming or moderate in the estimation of one\'s abilities or achievements.',
        example: 'Despite her success, she remained modest about her achievements.',
        translation: '谦虚的，朴素的',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band7'
      },
      {
        id: 'w6',
        word: 'aristocratic',
        phonetic: '/ˌær.ɪ.stəˈkræt.ɪk/',
        definition: 'Of, belonging to, or characteristic of the aristocracy.',
        example: 'The family claimed an aristocratic lineage dating back centuries.',
        translation: '贵族的，排外的',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band9'
      },
      {
        id: 'w7',
        word: 'scrutinize',
        phonetic: '/ˈskruː.tɪ.naɪz/',
        definition: 'Examine or inspect closely and thoroughly.',
        example: 'Customers were warned to scrutinize the small print of the contract.',
        translation: '详细检查，细读',
        // Fix: Added missing 'level' property to satisfy VocabularyWord interface
        level: 'Band8'
      }
    ]
  }
];
