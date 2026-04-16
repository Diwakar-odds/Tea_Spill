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

// Mock spills (seeded data for the experience)
// Includes 50 spills in each category with fully fake/anonymous details.
const MOCK_SPILLS = buildMockSpills();

// Mock pages data
const MOCK_PAGES = [];

// Mock groups data
const MOCK_GROUPS = [];

// Mock channels data
const MOCK_CHANNELS = [];
