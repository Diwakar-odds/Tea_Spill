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
const MOCK_SPILLS = [];

// Mock pages data
const MOCK_PAGES = [];

// Mock groups data
const MOCK_GROUPS = [];

// Mock channels data
const MOCK_CHANNELS = [];
