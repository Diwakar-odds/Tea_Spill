/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — College Database & Mock Data
   ═══════════════════════════════════════════════════ */

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry"
];

const DEPARTMENTS = [
  "CSE","ECE","ME","CE","EE","IT","BBA","MBA","BSc","BCom","BA","Law","Medical","Pharmacy","Architecture","Design","Other"
];

const CATEGORIES = [
  { id: "crush", emoji: "💘", name: "Crush & Dating" },
  { id: "hostel", emoji: "🏠", name: "Hostel Life" },
  { id: "professor", emoji: "👨‍🏫", name: "Professors" },
  { id: "exam", emoji: "📝", name: "Exams & Grades" },
  { id: "placement", emoji: "💼", name: "Placements" },
  { id: "canteen", emoji: "🍛", name: "Canteen & Food" },
  { id: "festival", emoji: "🎉", name: "Festivals" },
  { id: "confession", emoji: "💌", name: "Confessions" },
  { id: "hacks", emoji: "💡", name: "Hacks & Tips" },
  { id: "memes", emoji: "😂", name: "Memes" },
  { id: "rant", emoji: "😤", name: "Rants" },
  { id: "wholesome", emoji: "🥰", name: "Wholesome" }
];

const REACTIONS = [
  { id: "sip", emoji: "☕", label: "Sip" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "shook", emoji: "😱", label: "Shook" },
  { id: "dead", emoji: "💀", label: "Dead" },
  { id: "cap", emoji: "🧢", label: "Cap" }
];

const ALIASES_ADJECTIVES = [
  "Shadow","Midnight","Phantom","Silent","Cosmic","Neon","Velvet","Electric",
  "Mystic","Crystal","Stealth","Golden","Silver","Crimson","Azure","Frosty",
  "Thunder","Wild","Secret","Dark","Pixel","Turbo","Lucky","Chill","Savage"
];
const ALIASES_NOUNS = [
  "Chai","Ghost","Panther","Ninja","Phoenix","Tiger","Falcon","Cobra","Raven",
  "Wolf","Bear","Dragon","Eagle","Owl","Viper","Hawk","Fox","Lion","Shark","Storm"
];
const ALIAS_EMOJIS = ["👻","🐱","🦊","🐺","🦅","🐍","🦉","🔮","⚡","🌙","🎭","🕶️","🥷","🐉","🦁"];

const DAILY_CHALLENGES = [
  "What's the most unbelievable thing that happened in your college this week?",
  "Spill the tea about your college canteen's worst dish ever 🍛",
  "Confess something your batchmates don't know about you 💌",
  "What's the funniest thing a professor has said in class? 👨‍🏫",
  "Tell us about the biggest hostel drama you've witnessed 🏠",
  "Share your most embarrassing college moment 😳",
  "What's the wildest placement interview story you've heard? 💼",
  "Describe your college in exactly 3 words ✨",
  "What's the one rule every fresher should know at your college?",
  "Rate your college love story potential: 1-10 💘"
];

// Pre-loaded colleges (top Indian institutions)
const DEFAULT_COLLEGES = [
  { id: "iitb", name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", icon: "🏛️", verified: true },
  { id: "iitd", name: "IIT Delhi", city: "New Delhi", state: "Delhi", icon: "🏛️", verified: true },
  { id: "iitm", name: "IIT Madras", city: "Chennai", state: "Tamil Nadu", icon: "🏛️", verified: true },
  { id: "iitk", name: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh", icon: "🏛️", verified: true },
  { id: "iitkgp", name: "IIT Kharagpur", city: "Kharagpur", state: "West Bengal", icon: "🏛️", verified: true },
  { id: "iith", name: "IIT Hyderabad", city: "Hyderabad", state: "Telangana", icon: "🏛️", verified: true },
  { id: "iitr", name: "IIT Roorkee", city: "Roorkee", state: "Uttarakhand", icon: "🏛️", verified: true },
  { id: "iitg", name: "IIT Guwahati", city: "Guwahati", state: "Assam", icon: "🏛️", verified: true },
  { id: "nitw", name: "NIT Warangal", city: "Warangal", state: "Telangana", icon: "🎓", verified: true },
  { id: "nitt", name: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", icon: "🎓", verified: true },
  { id: "nitk", name: "NIT Karnataka", city: "Surathkal", state: "Karnataka", icon: "🎓", verified: true },
  { id: "bits", name: "BITS Pilani", city: "Pilani", state: "Rajasthan", icon: "⚡", verified: true },
  { id: "bitsh", name: "BITS Hyderabad", city: "Hyderabad", state: "Telangana", icon: "⚡", verified: true },
  { id: "bitsg", name: "BITS Goa", city: "Goa", state: "Goa", icon: "⚡", verified: true },
  { id: "vit", name: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", icon: "🏫", verified: true },
  { id: "srm", name: "SRM University", city: "Chennai", state: "Tamil Nadu", icon: "🏫", verified: true },
  { id: "manipal", name: "Manipal University", city: "Manipal", state: "Karnataka", icon: "🏫", verified: true },
  { id: "amity", name: "Amity University", city: "Noida", state: "Uttar Pradesh", icon: "🏫", verified: true },
  { id: "du", name: "Delhi University", city: "New Delhi", state: "Delhi", icon: "📚", verified: true },
  { id: "mu", name: "Mumbai University", city: "Mumbai", state: "Maharashtra", icon: "📚", verified: true },
  { id: "pu", name: "Pune University", city: "Pune", state: "Maharashtra", icon: "📚", verified: true },
  { id: "bu", name: "Bangalore University", city: "Bangalore", state: "Karnataka", icon: "📚", verified: true },
  { id: "jnu", name: "JNU", city: "New Delhi", state: "Delhi", icon: "📚", verified: true },
  { id: "bhu", name: "BHU", city: "Varanasi", state: "Uttar Pradesh", icon: "📚", verified: true },
  { id: "anna", name: "Anna University", city: "Chennai", state: "Tamil Nadu", icon: "📚", verified: true },
  { id: "iiser", name: "IISER Pune", city: "Pune", state: "Maharashtra", icon: "🔬", verified: true },
  { id: "iiitb", name: "IIIT Bangalore", city: "Bangalore", state: "Karnataka", icon: "💻", verified: true },
  { id: "iiith", name: "IIIT Hyderabad", city: "Hyderabad", state: "Telangana", icon: "💻", verified: true },
  { id: "nsut", name: "NSUT Delhi", city: "New Delhi", state: "Delhi", icon: "🎓", verified: true },
  { id: "dtu", name: "DTU", city: "New Delhi", state: "Delhi", icon: "🎓", verified: true },
  { id: "jadavpur", name: "Jadavpur University", city: "Kolkata", state: "West Bengal", icon: "📚", verified: true },
  { id: "lpu", name: "LPU", city: "Jalandhar", state: "Punjab", icon: "🏫", verified: true },
  { id: "christu", name: "Christ University", city: "Bangalore", state: "Karnataka", icon: "🏫", verified: true },
  { id: "sj", name: "St. Joseph's College", city: "Bangalore", state: "Karnataka", icon: "🏫", verified: true },
  { id: "loyola", name: "Loyola College", city: "Chennai", state: "Tamil Nadu", icon: "🏫", verified: true },
  { id: "stephens", name: "St. Stephen's College", city: "New Delhi", state: "Delhi", icon: "📚", verified: true },
  { id: "lsr", name: "Lady Shri Ram College", city: "New Delhi", state: "Delhi", icon: "📚", verified: true },
  { id: "nlu", name: "NLU Delhi", city: "New Delhi", state: "Delhi", icon: "⚖️", verified: true },
  { id: "aiims", name: "AIIMS Delhi", city: "New Delhi", state: "Delhi", icon: "🏥", verified: true },
  { id: "thapar", name: "Thapar University", city: "Patiala", state: "Punjab", icon: "🎓", verified: true }
];

// Generic anonymous source pools used for seeded mock spills.
// These keep the demo content free from real college/school/company details.
const ANONYMOUS_SOURCE_POOLS = {
  campus: [
    { id: 'campus-anon-1', name: 'Anonymous Campus Circle A', city: 'Undisclosed', state: 'Private', icon: '🎓', verified: true },
    { id: 'campus-anon-2', name: 'Anonymous Campus Circle B', city: 'Undisclosed', state: 'Private', icon: '🎓', verified: true },
    { id: 'campus-anon-3', name: 'Anonymous Campus Circle C', city: 'Undisclosed', state: 'Private', icon: '🎓', verified: true }
  ],
  company: [
    { id: 'company-anon-1', name: 'Workplace Whisper Hub A', city: 'Confidential', state: 'Private', icon: '🏢', verified: true },
    { id: 'company-anon-2', name: 'Workplace Whisper Hub B', city: 'Confidential', state: 'Private', icon: '🏢', verified: true },
    { id: 'company-anon-3', name: 'Workplace Whisper Hub C', city: 'Confidential', state: 'Private', icon: '🏢', verified: true }
  ]
};

const SEEDED_SOURCES = [
  ...ANONYMOUS_SOURCE_POOLS.campus,
  ...ANONYMOUS_SOURCE_POOLS.company
];

DEFAULT_COLLEGES.push(...SEEDED_SOURCES);

const MOCK_SPILLS_PER_CATEGORY = 50;

const MOCK_FAKE_REFERENCES = [
  'Pantry Ledger #P-11',
  'Noticeboard Snapshot #N-04',
  'Anonymous Memo #A-27',
  'Unofficial Desk Note #D-13',
  'Breakroom Chat Log #B-21',
  'Late-Night Thread #L-08'
];

const MOCK_COMMENT_LINES = [
  'This sounds dramatic but very believable.',
  'Peak chaos. Please post part 2.',
  'The timing makes this even funnier.',
  'Not naming names was the right move.',
  'I can confirm this vibe without details.',
  'This is exactly why anonymous tea exists.'
];

const CATEGORY_STORY_PARTS = {
  crush: {
    title: [
      'Caught Feelings During a Random Shift',
      'Anonymous Crush, Maximum Confusion',
      'One Eye Contact, Full Day Destroyed',
      'Not a Situationship, but Almost'
    ],
    setup: [
      'An anonymous person kept dropping small kind gestures in shared spaces.',
      'A subtle inside joke started showing up in common chats every day.',
      'Two people kept meeting at the exact same coffee timer without planning it.',
      'Someone quietly left encouraging notes before stressful deadlines.'
    ],
    twist: [
      'Then an old ex suddenly reappeared in the same circle and reset everything.',
      'Then one misunderstood message made things awkward for a full week.',
      'Then both sides pretended nothing happened and became extra formal.',
      'Then a friend group guessed the story and chaos multiplied.'
    ],
    ending: [
      'No names shared. Just saying the tension was very real.',
      'Still anonymous, still confused, still smiling randomly.',
      'Outcome unknown, tea level high.',
      'Zero identity clues, only emotional masala.'
    ]
  },
  hostel: {
    title: [
      'Midnight Corridor Became a Comedy Show',
      'Room Swap Triggered Total Chaos',
      'Shared Kitchen Incident Went Viral Offline',
      'Weekend Hostel Plot Twist Nobody Expected'
    ],
    setup: [
      'A normal night turned loud when someone started a fake talent contest.',
      'A harmless room arrangement experiment became a full social event.',
      'The shared snack shelf mysteriously emptied within minutes.',
      'An anonymous playlist battle started between two floors.'
    ],
    twist: [
      'The person who complained ended up becoming the event host.',
      'Security arrived, laughed, and asked for one more song.',
      'A surprise power cut made everyone continue using phone flashlights.',
      'The strictest person there was the one coordinating everything.'
    ],
    ending: [
      'No one exposed, but the memory is permanent.',
      'No personal details, only shared laughter.',
      'Anonymous chaos, wholesome ending.',
      'Officially terrible for sleep, excellent for stories.'
    ]
  },
  professor: {
    title: [
      'Legendary One-Liner in Session',
      'Strict Mentor Turned Unexpectedly Funny',
      'Classroom Rule Broken, Wisdom Delivered',
      'Most Unexpected Academic Plot Twist'
    ],
    setup: [
      'A difficult topic was explained with a meme-level analogy.',
      'A routine discussion suddenly became a life lesson.',
      'A surprise question round started with zero warning.',
      'A serious session changed tone after one honest response.'
    ],
    twist: [
      'The toughest critic appreciated a wild but correct answer.',
      'A fake example accidentally matched a real ongoing issue.',
      'The final comment sounded like a motivational reel caption.',
      'Everyone expected scolding but received encouragement instead.'
    ],
    ending: [
      'No identities shared. Respect increased.',
      'Anonymous but unforgettable.',
      'Humor plus wisdom equals elite tea.',
      'Even the backbench stayed quiet after that.'
    ]
  },
  exam: {
    title: [
      'Paper Looked Easy Until Page Two',
      'Preparation vs Reality: Tragic Edition',
      'Exam Hall Produced Instant Philosophy',
      'Everyone Left With the Same Thousand-Yard Stare'
    ],
    setup: [
      'The first section created false confidence in under two minutes.',
      'Half the room started writing before understanding the question style.',
      'A familiar topic appeared with a completely unfamiliar angle.',
      'Time looked sufficient until the long answers arrived.'
    ],
    twist: [
      'One tiny instruction line changed everything at the end.',
      'The optional question was harder than the mandatory ones.',
      'People discovered an extra page in the final ten minutes.',
      'The easiest-looking question had the deepest trap.'
    ],
    ending: [
      'No names, only survival stories.',
      'Collective panic, collective healing.',
      'A horrible experience but great future joke material.',
      'Result unknown, tea confirmed.'
    ]
  },
  placement: {
    title: [
      'Interview Day Was Pure Plot Twists',
      'Group Discussion Became Stand-Up Comedy',
      'Recruitment Drive: Stress and Snacks',
      'Offer Rumors Spread Faster Than Wi-Fi'
    ],
    setup: [
      'Candidates practiced serious answers while the waiting area stayed chaotic.',
      'A scheduling delay made everyone overthink every possible question.',
      'The pre-round briefing sounded simple but hid tricky details.',
      'People were calm outside and panicking silently inside.'
    ],
    twist: [
      'An unexpected puzzle question changed the mood instantly.',
      'The easiest round became the biggest elimination filter.',
      'A technical glitch forced everyone to restart from scratch.',
      'A calm candidate gave the funniest accidental answer and still recovered.'
    ],
    ending: [
      'No names, no companies revealed, only fake-coded references.',
      'Anonymous account of a very long day.',
      'Terrible stress, decent lessons.',
      'Future batches: stay hydrated and breathe.'
    ]
  },
  canteen: {
    title: [
      'Mystery Menu Item Defied Logic',
      'Lunch Queue Drama of the Week',
      'Snack Counter Delivered Unexpected Comedy',
      'Tea Break Became Social Experiment'
    ],
    setup: [
      'A newly named dish appeared with no clear description.',
      'Two queues formed for one counter and nobody knew why.',
      'A small discount rumor changed everyone’s lunch plan.',
      'People gathered for tea and ended up debating food rankings.'
    ],
    twist: [
      'The plain option sold out first, surprising everyone.',
      'A person doing a taste test became the unofficial reviewer.',
      'The spicy warning turned out to be accurate for once.',
      'The longest queue was actually for dessert, not the main meal.'
    ],
    ending: [
      'No personal details. Only foodie tea.',
      'Anonymous and mildly chaotic.',
      'Fun incident, zero casualties.',
      'Review pending, memes approved.'
    ]
  },
  festival: {
    title: [
      'Event Night Went Off Script',
      'Backstage Chaos, Frontstage Magic',
      'Festival Day Produced Elite Memories',
      'One Performance Changed the Vibe'
    ],
    setup: [
      'Decor setup started late but energy stayed high.',
      'Volunteers were running between tasks at full speed.',
      'The crowd arrived early and expectations were huge.',
      'A simple opening became unexpectedly emotional.'
    ],
    twist: [
      'The backup plan ended up outperforming the original lineup.',
      'A mic failure became a crowd sing-along moment.',
      'One joke from stage became the event catchphrase.',
      'A delayed segment turned into the most loved part.'
    ],
    ending: [
      'Anonymous report, maximum nostalgia.',
      'No names leaked, only vibes.',
      'Messy planning, excellent memories.',
      'Masala level: premium.'
    ]
  },
  confession: {
    title: [
      'Anonymous Confession Time',
      'Kept This Secret Too Long',
      'I Need to Admit Something',
      'Confession with Zero Name Drops'
    ],
    setup: [
      'I acted unbothered in public while overthinking everything in private.',
      'I judged a situation too quickly and realized it much later.',
      'I gave advice I could not follow myself.',
      'I pretended to understand a process and learned it the hard way.'
    ],
    twist: [
      'The truth came out during a random casual chat.',
      'An old ex-related memory suddenly made everything make sense.',
      'The person I avoided turned out to be kind and patient.',
      'The worst-case scenario in my head never actually happened.'
    ],
    ending: [
      'Keeping this anonymous and detail-free for everyone’s privacy.',
      'No identifiers, just honesty.',
      'A terrible overthinking phase, now better.',
      'Posting this as fictionalized tea for release.'
    ]
  },
  hacks: {
    title: [
      'Low-Effort Hack That Saved Time',
      'Simple Trick, Huge Relief',
      'Productivity Hack from Shared Chaos',
      'Tiny Workflow Change, Big Win'
    ],
    setup: [
      'People were repeating the same mistake in weekly tasks.',
      'A boring routine kept wasting time for everyone.',
      'Too many updates were getting lost in long chat threads.',
      'Common confusion kept showing up during deadline crunches.'
    ],
    twist: [
      'One short template solved most back-and-forth instantly.',
      'A shared checklist reduced last-minute panic.',
      'A simple naming pattern made files easy to track.',
      'A 10-minute prep habit prevented hours of cleanup.'
    ],
    ending: [
      'Anonymous tip, fake references included.',
      'No personal details, practical value only.',
      'Works in both campus and workplace setups.',
      'Use, adapt, improve.'
    ]
  },
  memes: {
    title: [
      'Today’s Situation Was a Meme Template',
      'Live Reaction: Entire Group at Once',
      'This Incident Deserves a Sticker Pack',
      'Peak Comedy, Zero Context Needed'
    ],
    setup: [
      'A routine update was phrased in the most dramatic way possible.',
      'Someone sent a serious message and attached the wrong file.',
      'A quiet room burst into laughter after one line.',
      'A tiny typo changed the meaning completely.'
    ],
    twist: [
      'The correction made it even funnier than the original.',
      'Everyone replied with memes instead of text for 20 minutes.',
      'The incident became the day’s running joke.',
      'Even the strictest person reacted with a laugh emoji.'
    ],
    ending: [
      'Anonymous comedy archive entry.',
      'No names harmed in this meme.',
      'Pure fun, no personal details.',
      'This one will age well.'
    ]
  },
  rant: {
    title: [
      'Need to Vent About This Workflow',
      'Small Issue, Big Frustration',
      'Rant: Why Is This Still a Thing?',
      'Please Fix This System Already'
    ],
    setup: [
      'A basic process keeps breaking at the worst possible time.',
      'People keep getting conflicting instructions from different channels.',
      'An avoidable delay repeats every single week.',
      'A simple approval step takes way longer than necessary.'
    ],
    twist: [
      'Everyone agrees it is broken, but nobody owns the fix.',
      'The workaround has become more complicated than the task itself.',
      'A tiny policy detail creates huge confusion.',
      'The so-called quick fix introduced a second problem.'
    ],
    ending: [
      'Anonymous rant, zero identity clues.',
      'Not targeting anyone, just the process.',
      'Terrible experience, hoping for better.',
      'Thanks for reading this masala vent.'
    ]
  },
  wholesome: {
    title: [
      'Unexpected Kindness in a Busy Week',
      'Small Gesture, Huge Impact',
      'Humanity Restored Today',
      'Wholesome Moment Worth Sharing'
    ],
    setup: [
      'Someone quietly helped without asking for credit.',
      'A group stayed late to help another person finish urgent work.',
      'A stressful day changed because one person checked in kindly.',
      'People shared resources with zero competition energy.'
    ],
    twist: [
      'The person who received help paid it forward immediately.',
      'A simple thank-you note started a chain of kindness.',
      'The quietest person became the strongest support for others.',
      'The moment reminded everyone to be softer with each other.'
    ],
    ending: [
      'Anonymous, private, and heartwarming.',
      'No details exposed, only good energy.',
      'This is the kind of tea we need more of.',
      'Wholesome masala unlocked.'
    ]
  }
};

function seededPick(arr, seed) {
  return arr[seed % arr.length];
}

function seededInt(seed, min, max) {
  const span = max - min + 1;
  return min + ((seed * 37 + 11) % span);
}

function buildMockAlias(seed) {
  const adjective = seededPick(ALIASES_ADJECTIVES, seed + 3);
  const noun = seededPick(ALIASES_NOUNS, seed + 9);
  const suffix = String(seededInt(seed + 17, 11, 99));
  return `${adjective}${noun}${suffix}`;
}

function buildMockComments(seed) {
  const count = seededInt(seed + 5, 0, 3);
  const comments = [];

  for (let i = 0; i < count; i++) {
    const cSeed = seed + i * 13;
    comments.push({
      id: `mock-comment-${seed}-${i + 1}`,
      alias: `Anon${seededInt(cSeed, 100, 999)}`,
      alias_emoji: seededPick(ALIAS_EMOJIS, cSeed + 1),
      body: seededPick(MOCK_COMMENT_LINES, cSeed + 2),
      time: `${seededInt(cSeed + 3, 1, 22)}h ago`
    });
  }

  return comments;
}

function buildTimeAgo(seed) {
  const mode = seed % 4;
  if (mode === 0) return `${seededInt(seed + 1, 3, 58)}m ago`;
  if (mode === 1) return `${seededInt(seed + 2, 1, 23)}h ago`;
  if (mode === 2) return `${seededInt(seed + 3, 1, 6)}d ago`;
  return `${seededInt(seed + 4, 1, 3)}w ago`;
}

function buildCategorySpill(category, categoryIndex, indexInCategory) {
  const seed = categoryIndex * 1000 + indexInCategory;
  const sourceType = indexInCategory % 2 === 0 ? 'company' : 'campus';
  const sourcePool = ANONYMOUS_SOURCE_POOLS[sourceType];
  const source = seededPick(sourcePool, seed + 7);
  const story = CATEGORY_STORY_PARTS[category.id] || CATEGORY_STORY_PARTS.confession;

  const titleRoot = seededPick(story.title, seed + 10);
  const title = `${titleRoot} (${indexInCategory + 1}/50)`;

  const body = [
    seededPick(story.setup, seed + 20),
    seededPick(story.twist, seed + 30),
    seededPick(story.ending, seed + 40),
    `Fake reference: ${seededPick(MOCK_FAKE_REFERENCES, seed + 50)}.`,
    `Context: ${sourceType === 'company' ? 'Company employees anonymous circle' : 'Campus anonymous circle'}.`,
    'Mock content notice: Fully fictional, anonymized, and generated for platform seeding.'
  ].join('\n\n');

  return {
    id: `mock-${category.id}-${String(indexInCategory + 1).padStart(2, '0')}`,
    userId: null,
    title,
    body,
    category: category.id,
    collegeId: source.id,
    collegeName: source.name,
    department: sourceType === 'company' ? 'Anonymous Team' : 'Anonymous Department',
    section: sourceType === 'company' ? 'Confidential Shift' : 'Anonymous Year',
    sourceType,
    sourceLabel: source.name,
    alias: buildMockAlias(seed + 60),
    aliasEmoji: seededPick(ALIAS_EMOJIS, seed + 70),
    mediaUrls: [],
    reactions: {
      sip: seededInt(seed + 80, 20, 440),
      fire: seededInt(seed + 90, 10, 380),
      shook: seededInt(seed + 100, 5, 240),
      dead: seededInt(seed + 110, 4, 210),
      cap: seededInt(seed + 120, 0, 120)
    },
    comments: buildMockComments(seed + 130),
    timeAgo: buildTimeAgo(seed + 140),
    selfDestruct: seed % 11 === 0,
    createdAt: Date.now() - seededInt(seed + 150, 1, 45) * 3600000
  };
}

function buildMockSpills() {
  const all = [];

  CATEGORIES.forEach((category, categoryIndex) => {
    for (let i = 0; i < MOCK_SPILLS_PER_CATEGORY; i++) {
      all.push(buildCategorySpill(category, categoryIndex, i));
    }
  });

  return all;
}

const COMMUNITY_ITEMS_PER_CONTAINER = 20;
const CHANNEL_BROADCASTS_PER_CHANNEL = 20;

// Internet-inspired Gen Z trend topics used in seeded community content.
// Sources: recurring themes from social trends coverage (short-form video,
// creator authenticity, AI tools, sustainability, side hustles, etc.).
const GENZ_TRENDING_TOPICS = [
  { id: 'short-form-content', label: 'Short-form video edits', focus: 'fast visual storytelling on reels, clips, and shorts' },
  { id: 'creator-authenticity', label: 'Creator authenticity checks', focus: 'transparent takes and no-filter opinions from creators' },
  { id: 'ai-tool-hacks', label: 'AI tool hacks', focus: 'using AI assistants for study, work, and daily productivity' },
  { id: 'digital-detox', label: 'Digital detox windows', focus: 'intentional breaks from doom-scrolling and notification fatigue' },
  { id: 'micro-communities', label: 'Micro-community circles', focus: 'tight private chat groups and niche online communities' },
  { id: 'meme-remix', label: 'Meme remix culture', focus: 'rapid meme remixes, reaction formats, and running inside jokes' },
  { id: 'thrift-upcycle', label: 'Thrift and upcycle style', focus: 'resale fashion, upcycling, and low-waste outfit trends' },
  { id: 'sustainability-receipts', label: 'Sustainability receipts', focus: 'calling out greenwashing and sharing practical eco habits' },
  { id: 'side-hustles', label: 'Side hustle diaries', focus: 'small creator-led income experiments and freelance gigs' },
  { id: 'situationship-stories', label: 'Situationship storytelling', focus: 'relationship confusion stories told through anonymous tea posts' },
  { id: 'mental-health-checkins', label: 'Mental health check-ins', focus: 'open conversations around stress, burnout, and soft boundaries' },
  { id: 'social-commerce', label: 'Social commerce drops', focus: 'shopping through creator recommendations and short-form demos' }
];

const PAGE_BLUEPRINTS = [
  { id: 'page-ai-masala-lab', name: 'AI Masala Lab', icon: '🤖', tech: true, topicId: 'ai-tool-hacks', desc: 'Anonymous tea on prompts, bots, and workflow hacks.' },
  { id: 'page-code-chaos-board', name: 'Code Chaos Board', icon: '💻', tech: true, topicId: 'micro-communities', desc: 'Debug stories, launch panic, and tech team gossips.' },
  { id: 'page-creator-tea-radar', name: 'Creator Tea Radar', icon: '🎬', tech: false, topicId: 'creator-authenticity', desc: 'Trend drama, creator receipts, and audience reactions.' },
  { id: 'page-meme-economics', name: 'Meme Economics', icon: '😂', tech: false, topicId: 'meme-remix', desc: 'Where every chaotic update becomes meme material.' },
  { id: 'page-side-hustle-signals', name: 'Side Hustle Signals', icon: '💸', tech: false, topicId: 'side-hustles', desc: 'Freelance wins, payment fails, and hustle lessons.' },
  { id: 'page-thrift-flip-diaries', name: 'Thrift Flip Diaries', icon: '♻️', tech: false, topicId: 'thrift-upcycle', desc: 'Resale finds, upcycle hacks, and fit-check tea.' },
  { id: 'page-situationship-central', name: 'Situationship Central', icon: '💘', tech: false, topicId: 'situationship-stories', desc: 'Anonymous relationship chaos and confession drops.' },
  { id: 'page-soft-life-reset', name: 'Soft Life Reset', icon: '🌿', tech: false, topicId: 'mental-health-checkins', desc: 'Burnout recovery, healthy boundaries, and calm routines.' },
  { id: 'page-digital-detox-club', name: 'Digital Detox Club', icon: '📵', tech: false, topicId: 'digital-detox', desc: 'Offline experiments and screen-time reality checks.' },
  { id: 'page-short-loop-trends', name: 'Short Loop Trends', icon: '📱', tech: false, topicId: 'short-form-content', desc: 'Viral formats, sound loops, and trend cycle tea.' }
];

const GROUP_BLUEPRINTS = [
  { id: 'group-dev-night-owls', name: 'Dev Night Owls', icon: '🛠️', tech: true, topicId: 'ai-tool-hacks', type: 'public', desc: 'Late-night debugging confessions and release-night tea.' },
  { id: 'group-ai-toolbox-lounge', name: 'AI Toolbox Lounge', icon: '🧠', tech: true, topicId: 'ai-tool-hacks', type: 'private', desc: 'Prompt tricks, automation experiments, and AI fails.' },
  { id: 'group-reels-reaction-room', name: 'Reels Reaction Room', icon: '🎞️', tech: false, topicId: 'short-form-content', type: 'public', desc: 'Realtime reactions to short-form trends and edits.' },
  { id: 'group-sidequest-syndicate', name: 'Sidequest Syndicate', icon: '🎯', tech: false, topicId: 'side-hustles', type: 'private', desc: 'Anonymous side hustle wins, flops, and ideas.' },
  { id: 'group-meme-forensics', name: 'Meme Forensics', icon: '🕵️', tech: false, topicId: 'meme-remix', type: 'public', desc: 'Who started the meme and why it exploded.' },
  { id: 'group-thrift-upcycle-squad', name: 'Thrift Upcycle Squad', icon: '🧵', tech: false, topicId: 'thrift-upcycle', type: 'public', desc: 'Upcycle hacks and chaos from style experiments.' },
  { id: 'group-detox-checkin-room', name: 'Detox Check-In Room', icon: '🧘', tech: false, topicId: 'digital-detox', type: 'private', desc: 'Digital reset logs and no-phone challenge updates.' },
  { id: 'group-green-receipts', name: 'Green Receipts', icon: '🌍', tech: false, topicId: 'sustainability-receipts', type: 'public', desc: 'Sustainability claims, fact checks, and practical eco tips.' },
  { id: 'group-soft-boundary-circle', name: 'Soft Boundary Circle', icon: '💚', tech: false, topicId: 'mental-health-checkins', type: 'private', desc: 'Stress vents, burnout stories, and supportive tea.' },
  { id: 'group-secret-chaos-cabinet', name: 'Secret Chaos Cabinet', icon: '🔒', tech: false, topicId: 'micro-communities', type: 'secret', desc: 'Invite-only anonymous chaos archive.' }
];

const CHANNEL_BLUEPRINTS = [
  { id: 'channel-tech-spillwire', name: 'Tech Spillwire', icon: '📡', tech: true, topicId: 'ai-tool-hacks', desc: 'Broadcast alerts on tech drama and product chaos.' },
  { id: 'channel-code-red-alerts', name: 'Code Red Alerts', icon: '🚨', tech: true, topicId: 'micro-communities', desc: 'Shipping incidents, bug stories, and deadline tea.' },
  { id: 'channel-creator-algorithm-watch', name: 'Creator Algorithm Watch', icon: '📊', tech: false, topicId: 'creator-authenticity', desc: 'Creator trend shifts and audience sentiment snapshots.' },
  { id: 'channel-short-loop-bulletin', name: 'Short Loop Bulletin', icon: '🌀', tech: false, topicId: 'short-form-content', desc: 'Daily pulse on short-form viral content waves.' },
  { id: 'channel-meme-news-desk', name: 'Meme News Desk', icon: '🗞️', tech: false, topicId: 'meme-remix', desc: 'Breaking meme formats and reaction trend updates.' },
  { id: 'channel-side-hustle-feed', name: 'Side Hustle Feed', icon: '💼', tech: false, topicId: 'side-hustles', desc: 'Freelance tea, hustle playbooks, and quick lessons.' },
  { id: 'channel-thrift-radar', name: 'Thrift Radar', icon: '🛍️', tech: false, topicId: 'thrift-upcycle', desc: 'Resale spikes, style flips, and closet hacks.' },
  { id: 'channel-detox-pulse', name: 'Detox Pulse', icon: '🌙', tech: false, topicId: 'digital-detox', desc: 'Screen-time reset motivation and offline challenge notes.' },
  { id: 'channel-soft-checkins', name: 'Soft Check-Ins', icon: '🫶', tech: false, topicId: 'mental-health-checkins', desc: 'Mental wellness prompts and calm routine tea.' },
  { id: 'channel-social-commerce-signal', name: 'Social Commerce Signal', icon: '🛒', tech: false, topicId: 'social-commerce', desc: 'Creator-led shopping trends and trust-signal watch.' }
];

const COMMUNITY_STORY_LINES = [
  'A harmless incident escalated into full group-chat speculation within minutes',
  'An old ex mention triggered a chain of jokes and awkward silence',
  'A terrible misunderstanding became a funny lesson after context dropped',
  'A workplace and campus crossover story turned into peak masala',
  'A tiny typo became the most discussed update of the day',
  'An anonymous rant unexpectedly helped others feel less alone'
];

const CHANNEL_BROADCAST_HEADLINES = [
  'Trend Pulse',
  'Hot Topic Alert',
  'Masala Watch',
  'Community Signal',
  'Daily Spill Brief',
  'Viral Topic Check'
];

function resolveTrendTopic(topicId, seed) {
  return GENZ_TRENDING_TOPICS.find(t => t.id === topicId) || seededPick(GENZ_TRENDING_TOPICS, seed);
}

function buildMockPages() {
  return PAGE_BLUEPRINTS.map((blueprint, index) => {
    const seed = 200000 + index * 67;
    const topic = resolveTrendTopic(blueprint.topicId, seed + 1);

    return {
      id: blueprint.id,
      name: blueprint.name,
      desc: `${blueprint.desc} Trending topic: ${topic.label.toLowerCase()}.`,
      icon: blueprint.icon,
      followers: seededInt(seed + 2, 2800, 98000),
      posts: COMMUNITY_ITEMS_PER_CONTAINER,
      tags: [topic.id, blueprint.tech ? 'tech' : 'culture']
    };
  });
}

function buildGroupMessages(group, groupIndex) {
  const messages = [];

  for (let i = 0; i < 6; i++) {
    const seed = 260000 + groupIndex * 90 + i;
    const topic = resolveTrendTopic(group.topicId, seed + 1);
    messages.push({
      alias: `Anon${seededInt(seed + 2, 100, 999)}`,
      emoji: seededPick(ALIAS_EMOJIS, seed + 3),
      body: `${seededPick(COMMUNITY_STORY_LINES, seed + 4)} around ${topic.label.toLowerCase()}.`,
      time: buildTimeAgo(seed + 5)
    });
  }

  return messages;
}

function buildMockGroups() {
  return GROUP_BLUEPRINTS.map((blueprint, index) => {
    const seed = 300000 + index * 73;
    const topic = resolveTrendTopic(blueprint.topicId, seed + 1);

    return {
      id: blueprint.id,
      name: blueprint.name,
      desc: `${blueprint.desc} Theme: ${topic.label.toLowerCase()}.`,
      icon: blueprint.icon,
      type: blueprint.type,
      members: seededInt(seed + 2, 900, 32000),
      messages: buildGroupMessages(blueprint, index),
      tags: [topic.id, blueprint.tech ? 'tech' : 'community']
    };
  });
}

function buildChannelBroadcast(channel, channelIndex, broadcastIndex) {
  const seed = 360000 + channelIndex * 160 + broadcastIndex;
  const topic = resolveTrendTopic(channel.topicId, seed + 1);

  return {
    title: `${seededPick(CHANNEL_BROADCAST_HEADLINES, seed + 2)}: ${topic.label}`,
    body: [
      `${topic.focus}.`,
      `${seededPick(COMMUNITY_STORY_LINES, seed + 3)}.`,
      `Fake reference: ${seededPick(MOCK_FAKE_REFERENCES, seed + 4)}.`,
      'Mock broadcast notice: fictional, anonymized seed content only.'
    ].join(' '),
    time: buildTimeAgo(seed + 5)
  };
}

function buildChannelBroadcasts(channel, channelIndex) {
  const broadcasts = [];

  for (let i = 0; i < CHANNEL_BROADCASTS_PER_CHANNEL; i++) {
    broadcasts.push(buildChannelBroadcast(channel, channelIndex, i));
  }

  return broadcasts;
}

function buildMockChannels() {
  return CHANNEL_BLUEPRINTS.map((blueprint, index) => {
    const seed = 420000 + index * 83;
    const topic = resolveTrendTopic(blueprint.topicId, seed + 1);

    return {
      id: blueprint.id,
      name: blueprint.name,
      desc: `${blueprint.desc} Focus: ${topic.label.toLowerCase()}.`,
      icon: blueprint.icon,
      subscribers: seededInt(seed + 2, 1800, 76000),
      broadcasts: buildChannelBroadcasts(blueprint, index),
      tags: [topic.id, blueprint.tech ? 'tech' : 'signal']
    };
  });
}

function buildCommunitySpill(containerType, community, containerIndex, itemIndex) {
  const seed = 500000 + containerIndex * 200 + itemIndex;
  const sourceType = itemIndex % 2 === 0 ? 'company' : 'campus';
  const sourcePool = ANONYMOUS_SOURCE_POOLS[sourceType];
  const source = seededPick(sourcePool, seed + 1);
  const category = seededPick(CATEGORIES, seed + 2);
  const topic = resolveTrendTopic(community.topicId, seed + 3);

  const titlePrefix = containerType === 'page' ? 'Page Spill' : 'Group Spill';
  const body = [
    `${containerType === 'page' ? 'Page context' : 'Group context'}: ${community.name}.`,
    `Trend topic: ${topic.label} (${topic.focus}).`,
    `${seededPick(COMMUNITY_STORY_LINES, seed + 4)}.`,
    `Fake reference: ${seededPick(MOCK_FAKE_REFERENCES, seed + 5)}.`,
    `Source blend: ${sourceType === 'company' ? 'Company employees anonymous circle' : 'Campus anonymous circle'}.`,
    'Mock content notice: fictional, anonymous, and generated for seeding only.'
  ].join('\n\n');

  return {
    id: `mock-${containerType}-${community.id}-${String(itemIndex + 1).padStart(2, '0')}`,
    userId: null,
    title: `${titlePrefix}: ${topic.label} #${itemIndex + 1}`,
    body,
    category: category.id,
    collegeId: source.id,
    collegeName: source.name,
    department: sourceType === 'company' ? 'Anonymous Team' : 'Anonymous Department',
    section: sourceType === 'company' ? 'Confidential Shift' : 'Anonymous Year',
    sourceType,
    sourceLabel: source.name,
    alias: buildMockAlias(seed + 6),
    aliasEmoji: seededPick(ALIAS_EMOJIS, seed + 7),
    mediaUrls: [],
    reactions: {
      sip: seededInt(seed + 8, 12, 260),
      fire: seededInt(seed + 9, 8, 210),
      shook: seededInt(seed + 10, 4, 130),
      dead: seededInt(seed + 11, 2, 100),
      cap: seededInt(seed + 12, 0, 70)
    },
    comments: buildMockComments(seed + 13),
    timeAgo: buildTimeAgo(seed + 14),
    selfDestruct: seed % 17 === 0,
    createdAt: Date.now() - seededInt(seed + 15, 1, 60) * 3600000,
    ...(containerType === 'page' ? { pageId: community.id } : { groupId: community.id })
  };
}

function buildCommunitySpills(pages, groups) {
  const spills = [];

  pages.forEach((page, pageIndex) => {
    for (let i = 0; i < COMMUNITY_ITEMS_PER_CONTAINER; i++) {
      spills.push(buildCommunitySpill('page', page, pageIndex, i));
    }
  });

  groups.forEach((group, groupIndex) => {
    for (let i = 0; i < COMMUNITY_ITEMS_PER_CONTAINER; i++) {
      spills.push(buildCommunitySpill('group', group, groupIndex + pages.length, i));
    }
  });

  return spills;
}

// Mock spills (seeded data for the experience)
// Includes 50 spills in each category with fully fake/anonymous details.
const MOCK_SPILLS = buildMockSpills();

// Mock pages data
const MOCK_PAGES = buildMockPages();

// Mock groups data
const MOCK_GROUPS = buildMockGroups();

// Mock channels data
const MOCK_CHANNELS = buildMockChannels();

// Seed page and group community spills (20 each) into global mock feed.
MOCK_SPILLS.push(...buildCommunitySpills(MOCK_PAGES, MOCK_GROUPS));
