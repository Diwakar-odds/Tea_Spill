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

// Mock spills (seeded data for the experience)
const MOCK_SPILLS = [
  {
    id: "s1",
    title: "Our professor literally walked out of class mid-sentence today",
    body: "So we're in the middle of a Data Structures lecture and Prof. Sharma is explaining binary trees. Someone's phone rings with the loudest ringtone — it's literally the theme from some Bollywood movie. Instead of scolding the student, Prof just stops mid-sentence, stares into the void for about 10 seconds, says 'I also need a break from this tree,' picks up his bag, and WALKS OUT. The entire class was shook. We sat there for 20 minutes waiting before someone went to check — turns out he went to the canteen for chai. Legend behavior honestly. He came back after 30 minutes like nothing happened and continued from the exact word he left off at. This man is operating on a different plane of existence.",
    collegeId: "iitb",
    department: "CSE",
    section: "2025 A",
    category: "professor",
    alias: "Midnight Phoenix",
    aliasEmoji: "🦅",
    reactions: { sip: 234, fire: 189, shook: 312, dead: 156, cap: 12 },
    comments: [
      { alias: "Neon Cobra", emoji: "🐍", body: "Bro this is so IIT Bombay it hurts 😂", time: "2h ago" },
      { alias: "Shadow Tiger", emoji: "🐱", body: "Prof Sharma supremacy. The man is a whole mood.", time: "1h ago" },
      { alias: "Crystal Wolf", emoji: "🐺", body: "We need more professors with this energy tbh", time: "45m ago" }
    ],
    timeAgo: "3h ago",
    selfDestruct: false
  },
  {
    id: "s2",
    title: "The hostel ghost story that turned out to be the warden sneaking biryani at 2AM",
    body: "Okay so for the past three weeks, people in Block C have been hearing weird sounds at 2 AM. Footsteps in the corridor, metal clanging sounds, the whole horror movie setup. People were genuinely scared — one guy even put garlic outside his door (yes, really). Last night, three of us decided to investigate. We set up our phones to record and waited in the common room. At exactly 2:15 AM, we hear the footsteps. We slowly creep towards the sound and... it's our WARDEN. Sneaking into the kitchen. Heating up biryani in the hostel kitchen at 2 AM. He saw us, froze like a deer in headlights, and just said 'This never happened.' We all agreed. But now we know the ghost of Block C was just a man and his midnight biryani cravings. 🍗",
    collegeId: "vit",
    department: "ECE",
    section: "2024 B",
    category: "hostel",
    alias: "Stealth Ninja",
    aliasEmoji: "🥷",
    reactions: { sip: 456, fire: 234, shook: 178, dead: 567, cap: 23 },
    comments: [
      { alias: "Electric Raven", emoji: "🦉", body: "Block C warden is a whole cinematic universe 💀", time: "5h ago" },
      { alias: "Thunder Dragon", emoji: "🐉", body: "The garlic part sent me 😂😂😂", time: "4h ago" },
      { alias: "Velvet Fox", emoji: "🦊", body: "Can't blame him honestly, hostel biryani hits different at 2AM", time: "3h ago" },
      { alias: "Cosmic Eagle", emoji: "🦅", body: "Someone promote this warden", time: "2h ago" }
    ],
    timeAgo: "6h ago",
    selfDestruct: false
  },
  {
    id: "s3",
    title: "I accidentally submitted a love letter instead of my assignment and the TA graded it 💀",
    body: "I wish I was making this up. So I've been writing this letter to my crush (yes, people still do that, don't judge me). It was saved as 'final_draft.docx' on my desktop. My Operating Systems assignment was also named 'OS_final_draft.docx'. You can probably see where this is going. I submitted the WRONG FILE to the portal at 11:58 PM, two minutes before the deadline. I didn't realize until the next morning when the TA emails me back and says, and I quote: 'Your analysis of scheduling algorithms was... unconventional, but I appreciate the passion. Also, Priya deserves to know how you feel. B+ for effort.' I have never wanted to disappear more in my life. The TA was chill about it though and let me resubmit. But now he gives me this knowing look every class. I am NOT okay.",
    collegeId: "bits",
    department: "CSE",
    section: "2025 A",
    category: "confession",
    alias: "Crimson Ghost",
    aliasEmoji: "👻",
    reactions: { sip: 890, fire: 345, shook: 456, dead: 1023, cap: 45 },
    comments: [
      { alias: "Mystic Shark", emoji: "🦊", body: "This is peak engineering student behavior", time: "8h ago" },
      { alias: "Golden Lion", emoji: "🦁", body: "Did you talk to Priya though? 👀", time: "7h ago" },
      { alias: "Frosty Owl", emoji: "🦉", body: "The TA is the real MVP here", time: "5h ago" },
      { alias: "Wild Storm", emoji: "⚡", body: "B+ FOR EFFORT 😭😭😭 I'M DEAD", time: "4h ago" },
      { alias: "Neon Wolf", emoji: "🐺", body: "Name the assignment 'love_letter.docx' next time to avoid confusion 💀", time: "2h ago" }
    ],
    timeAgo: "10h ago",
    selfDestruct: false
  },
  {
    id: "s4",
    title: "PLACEMENT UPDATE: Someone asked the HR 'What is your company's return policy?' thinking it was an e-commerce company",
    body: "This happened during yesterday's placement drive. Company ABC (not naming for obvious reasons) came for campus recruitment. During the HR round, this guy from our batch — absolute madlad — asked the HR, 'So what is your return and refund policy?' with complete confidence. The HR was confused. The guy DOUBLED DOWN and asked about COD options. Turns out he confused the company with an e-commerce startup that has a similar name. The HR couldn't stop laughing and said 'We don't sell products, we build enterprise software.' The guy turned red, mumbled something about 'returning to his studies,' and walked out. He didn't get the offer but honestly he got something better — a legendary story. The HR apparently told the next batch about it as an icebreaker. 💼😂",
    collegeId: "nitt",
    department: "CSE",
    section: "2024",
    category: "placement",
    alias: "Azure Falcon",
    aliasEmoji: "🦅",
    reactions: { sip: 567, fire: 298, shook: 345, dead: 789, cap: 34 },
    comments: [
      { alias: "Phantom Tiger", emoji: "🐱", body: "This is why you research the company before the interview 😭", time: "12h ago" },
      { alias: "Silver Panther", emoji: "🕶️", body: "He'll never live this down lmaooo", time: "10h ago" }
    ],
    timeAgo: "14h ago",
    selfDestruct: false
  },
  {
    id: "s5",
    title: "The canteen uncle remembered my order after 3 years and I almost cried",
    body: "I graduated from Delhi University 3 years ago. Went back to campus today for some paperwork. Walked into the old canteen just for nostalgia. The same uncle is there behind the counter. I start to open my mouth to order and he goes 'Ek cutting chai, kam sugar, ek samosa with extra chutney.' That was literally my order for 4 years. He remembered. After THREE YEARS. I didn't even remember my own college roll number but this man remembered my chai preference. I genuinely teared up. He smiled and said 'Beta, I remember all my regulars.' We talked for an hour. He asked about my job, my family. This man has been serving 500+ students daily for 20 years and he remembers individual orders. Canteen uncles are the real MVPs of Indian college life. If you're reading this, go say hi to yours before you graduate. You'll miss it. 🥺☕",
    collegeId: "du",
    department: "BA",
    section: "Alumni",
    category: "wholesome",
    alias: "Golden Chai",
    aliasEmoji: "☕",
    reactions: { sip: 2345, fire: 567, shook: 234, dead: 123, cap: 5 },
    comments: [
      { alias: "Velvet Phoenix", emoji: "🔮", body: "Who's cutting onions in here 🥺", time: "1d ago" },
      { alias: "Cosmic Ninja", emoji: "🥷", body: "Canteen uncles really are the unsung heroes", time: "1d ago" },
      { alias: "Electric Bear", emoji: "⚡", body: "Mine remembers too. 'Double egg maggi wala' he calls me 😂❤️", time: "20h ago" },
      { alias: "Stealth Raven", emoji: "🦉", body: "BRB going to my canteen to hug the uncle", time: "18h ago" }
    ],
    timeAgo: "1d ago",
    selfDestruct: false
  },
  {
    id: "s6",
    title: "Someone hacked the college WiFi and renamed it to 'Exam Answers Inside' during mid-sems 😂",
    body: "Mid-semester exams just started and someone — absolute genius — hacked into the college WiFi settings and renamed the network from 'CollegeNet_5G' to 'Mid_Sem_Answers_Inside_Click_Here.' The password was changed to 'nicetrybro123.' Half the campus tried to connect during the exam thinking there were actual answers. The IT department went into full panic mode trying to fix it. They had to shut down WiFi entirely for 2 hours. The best part? During those 2 hours with no WiFi, everyone actually studied for once. The administration still hasn't found who did it and there's a ₹5000 reward for information. Nobody's snitching though. Whoever you are, you're a legend. 🫡",
    collegeId: "manipal",
    department: "IT",
    section: "2026",
    category: "memes",
    alias: "Pixel Cobra",
    aliasEmoji: "🐍",
    reactions: { sip: 678, fire: 890, shook: 456, dead: 345, cap: 67 },
    comments: [
      { alias: "Turbo Hawk", emoji: "🦅", body: "'nicetrybro123' 💀💀💀", time: "2d ago" },
      { alias: "Savage Dragon", emoji: "🐉", body: "Not all heroes wear capes, some rename WiFi networks", time: "2d ago" },
      { alias: "Chill Storm", emoji: "🌙", body: "The fact that people actually tried connecting during an exam says a lot about us 😂", time: "1d ago" }
    ],
    timeAgo: "2d ago",
    selfDestruct: false
  },
  {
    id: "s7",
    title: "Our entire class bunked to watch the cricket World Cup final in the common room",
    body: "India vs Australia. World Cup Final. The match starts at 2 PM. Our Digital Signal Processing lecture is at 2 PM. Every single student — all 120 of us — collectively decided to bunk. Not even a WhatsApp group discussion, no planning, just an unspoken agreement. We all showed up in the hostel common room instead. The professor apparently walked into an empty classroom, waited 5 minutes, then came to the common room himself and sat down to watch with us. When India hit a six, he screamed louder than any of us. When someone asked about the missed lecture, he said 'Some signals are more important than digital ones.' Sir, you are a national treasure. We lost the match but won a core memory. 🏏",
    collegeId: "iitk",
    department: "ECE",
    section: "2025",
    category: "wholesome",
    alias: "Thunder Lion",
    aliasEmoji: "🦁",
    reactions: { sip: 1567, fire: 890, shook: 234, dead: 178, cap: 12 },
    comments: [
      { alias: "Lucky Fox", emoji: "🦊", body: "'Some signals are more important than digital ones' — this professor gets it", time: "3d ago" },
      { alias: "Dark Panther", emoji: "🕶️", body: "120/120 attendance in the common room > lecture hall", time: "3d ago" }
    ],
    timeAgo: "3d ago",
    selfDestruct: false
  },
  {
    id: "s8",
    title: "RANT: The library AC has been broken for 2 months and administration says it's 'building character'",
    body: "I am LOSING MY MIND. It's May. In Chennai. 42°C outside. The library AC has been broken since March. MARCH. Every week someone complains. The admin's response? 'Adjusting to uncomfortable conditions builds character and resilience.' SIR, I am not trying to build character, I am trying to build my GPA before finals. The only thing being built in that library right now is a sauna. People are bringing personal fans, ice packs, one guy brought a literal kiddie pool (he was removed). We started a petition — 500 signatures. Admin response? 'We appreciate the initiative and leadership skills demonstrated through this petition. AC repair is under consideration.' UNDER CONSIDERATION. I am under cardiac arrest from heat stroke. Fix. The. AC. 😤🔥",
    collegeId: "anna",
    department: "ME",
    section: "2025",
    category: "rant",
    alias: "Neon Tiger",
    aliasEmoji: "🐱",
    reactions: { sip: 432, fire: 678, shook: 234, dead: 345, cap: 8 },
    comments: [
      { alias: "Midnight Shark", emoji: "🔮", body: "The kiddie pool guy is my spirit animal 😭", time: "4d ago" },
      { alias: "Crystal Storm", emoji: "⚡", body: "Every Chennai college student felt this in their soul", time: "4d ago" },
      { alias: "Wild Owl", emoji: "🦉", body: "'Building character' is admin code for 'we spent the budget on something else'", time: "3d ago" }
    ],
    timeAgo: "5d ago",
    selfDestruct: false
  }
];

// Mock pages data
const MOCK_PAGES = [
  { id: "p1", name: "Placement Horror Stories", icon: "💼", desc: "The interviews that haunt us forever. Rejections, bloopers, and come-back stories.", followers: 12400, posts: 342 },
  { id: "p2", name: "Hostel Life India", icon: "🏠", desc: "Midnight maggi, warden encounters, and roommate wars — the complete hostel experience.", followers: 28900, posts: 890 },
  { id: "p3", name: "Engineering Memes HQ", icon: "😂", desc: "If you can't laugh at your 3 AM assignment submissions, are you even an engineer?", followers: 45200, posts: 2340 },
  { id: "p4", name: "Campus Love Stories", icon: "💘", desc: "From library glances to convocation confessions — real love stories from real campuses.", followers: 18700, posts: 567 },
  { id: "p5", name: "Professor Legends", icon: "👨‍🏫", desc: "Documenting the most iconic professors across Indian colleges. The legends that shaped us.", followers: 9800, posts: 234 },
  { id: "p6", name: "Exam Survival Guide", icon: "📝", desc: "Last-minute tips, study hacks, and the eternal question: 'Is this in the syllabus?'", followers: 31500, posts: 678 }
];

// Mock groups data
const MOCK_GROUPS = [
  { id: "g1", name: "2025 Batch — VIT Vellore", icon: "🎓", desc: "Official group for the 2025 graduating batch. Spill responsibly!", members: 3400, type: "public" },
  { id: "g2", name: "IIT Bombay Confidential", icon: "🤫", desc: "What happens in IIT-B stays in IIT-B. Unless it's spilled here.", members: 1200, type: "private" },
  { id: "g3", name: "Night Owls Study Group", icon: "🦉", desc: "For those who peak at 3 AM. Share resources, cry together, repeat.", members: 8900, type: "public" },
  { id: "g4", name: "Startup Gossip India", icon: "🚀", desc: "Who's funding who? Which startup is secretly failing? We know.", members: 5600, type: "public" },
  { id: "g5", name: "Girls Hostel Chronicles", icon: "💅", desc: "The untold stories from girls hostels across India.", members: 15200, type: "private" },
  { id: "g6", name: "BITS Pilani Underground", icon: "🕳️", desc: "The real BITS experience they don't put in the brochure.", members: 2100, type: "secret" }
];

// Mock channels data
const MOCK_CHANNELS = [
  { id: "c1", name: "Daily Tea Roundup ☕", icon: "📰", desc: "Your daily dose of the hottest campus tea from across India. Published every evening.", subscribers: 22400 },
  { id: "c2", name: "Placement Alerts 🔔", icon: "💼", desc: "Real-time updates on placement drives, offers, and package reveals.", subscribers: 45600 },
  { id: "c3", name: "Best of Tea Spill", icon: "🏆", desc: "Weekly compilation of the most viral, funniest, and most heartwarming spills.", subscribers: 34200 },
  { id: "c4", name: "College News India", icon: "📢", desc: "Breaking news from Indian colleges — policy changes, events, controversies.", subscribers: 18900 }
];
