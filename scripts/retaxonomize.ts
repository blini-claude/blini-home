/**
 * Full taxonomy rewrite — categorize AND subcategory-tag every product.
 *
 * Runs keyword rules in priority order (specific → general).
 * The first matching rule wins. Also ensures collection membership
 * matches each product's category, adds a "Mobilje" collection,
 * and rebuilds tag list per product.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

// A rule maps keyword matches to a {category, subcategory} pair.
// Rules are evaluated in the order defined here — specific rules MUST come first.
type Rule = {
  name: string;
  category: string;
  subcategory: string;
  // keywords are lowercase. "regex:" prefix enables full regex; otherwise plain substring match.
  match: string[];
};

const RULES: Rule[] = [
  // ────────────────────────── GAMING (highest priority — PS5/Xbox must not fall into Sport)
  { name: "gaming-console", category: "Teknologji", subcategory: "Gaming & Konzola", match: [
    "playstation", "ps4", "ps5", "ps3", "sony ps", "-ps4", "-ps5", "– ps4", "– ps5",
    "xbox", "nintendo", "switch console", "controller", "kontroller", "joystick",
    "gamepad", "dualshock", "dualsense", "gaming console", "console", "fc 24", "fc 25",
    "fc 26", "fifa ", "gta ", "grand theft auto", "call of duty", "mortal kombat",
    "ea sports", "assassin", "nba 2k", "ride 5", "ride 4", "motogp ", "minecraft",
    "final fantasy", "need for speed", "god of war", "spider-man", "elden ring",
    "tekken", "mk11", "uncharted", "horizon ", "resident evil", "cyberpunk",
    "witcher", "the last of us", "crew motorfest", "cd ps4", "cd ps5", "cd game",
    "gaming chair", "kufje gaming", "mouse gaming", "gaming mouse", "gaming keyboard",
    "redragon",
  ]},

  // ────────────────────────── MOBILJE (furniture — before tools/tables)
  { name: "mobilje-shtrat", category: "Mobilje", subcategory: "Shtretër & Dyshek", match: [
    "shtrat dyfishe", "shtrat dyshek", "krevat", "shtret fëmij", "shtret femij",
    "dyshek ortoped", "dyshek sfungjer", "dyshek pranges", "dyshek spring",
    "dyshek memory", "dyshek bebe", "bed frame",
  ]},
  { name: "mobilje-rafte", category: "Mobilje", subcategory: "Rafte & Dollap", match: [
    "dollap rrobash", "dollap kuzhine", "dollap dekor", "dollap modular",
    "raft libri", "raft bukur", "raft dekor", "raft muri", "raft kuzhine",
    "wardrobe", "bookshelf", "komodin", "etazhere", "komo",
  ]},
  { name: "mobilje-karrige", category: "Mobilje", subcategory: "Karrige", match: [
    "karrige zyre", "karrige gaming", "karrige kompjuteri", "karrige sallonit",
    "karrige e rehatshme", "karrige oborri", "stol prej druri",
    "karrige ngrenjes", "karrige televizori", "karrige plazhi", "shezlong",
    "office chair", "armchair", "ulëse", "ulese",
  ]},
  { name: "mobilje-tavolin", category: "Mobilje", subcategory: "Tavolina", match: [
    "tavolinë kafeje", "tavoline kafeje", "tavolinë ngrënie", "tavoline ngrenje",
    "tavolinë zyre", "tavoline zyre", "tavolinë tv", "tavolinë oborri",
    "tavolinë prej druri", "tavolinë dekor", "tavoline gaming", "tavolinë gaming",
    "coffee table", "dining table",
  ]},
  { name: "mobilje-oborr", category: "Mobilje", subcategory: "Mobilje Oborri", match: [
    "mobilje oborri", "set oborri", "garden furniture", "patio set",
  ]},

  // ────────────────────────── BEBE + FEMIJE + LODRA
  { name: "femije-baby-monitor", category: "Fëmijë & Lodra", subcategory: "Baby Monitor", match: [
    "baby monitor", "video baby monitor",
  ]},
  { name: "femije-karroca-dubak", category: "Fëmijë & Lodra", subcategory: "Karrocat & Dubak", match: [
    "karroc", "karrocë", "dubak", "shezlong bebe", "baby walker", "bouncer bebe",
    "stroller", "car seat bebe", "tavolinë ushqimi",
  ]},
  { name: "femije-bebe", category: "Fëmijë & Lodra", subcategory: "Bebe (0-2)", match: [
    "biberon", "pelena", "diaper", "pacifier", "gize", "neonate",
    "shishe bebe", "ushqim bebe", "karrige bebe", "shtrat bebe",
    "baby bottle", "per bebe", "për bebe", "momcozy",
  ]},
  { name: "femije-lodra", category: "Fëmijë & Lodra", subcategory: "Lodra", match: [
    "lodër", "lodra", "loder ", "lego", "plush", "pupë", "pupa", "puppy toy",
    "puzzle", "stuffed", "peluche", "rubberduck", "kukulla", "kukull",
    "robot lodër", "set lodra", "lodra druri", "lodra edukative",
    "toy ", "toys ", "mini car", "toy car",
  ]},

  // ────────────────────────── BUKURI
  { name: "bukuri-makeup", category: "Bukuri & Kujdes", subcategory: "Makeup", match: [
    "maskara", "eyeliner", "lipstick", "ruj", "ruz ", "fondatin", "palette make",
    "makeup", "make-up", "make up", "pallete ngjyrash", "bronzer",
    "highlighter", "blush", "brush makeup", "brush.*makeup", "sheglam", "iparah makeup",
  ]},
  { name: "bukuri-parfume", category: "Bukuri & Kujdes", subcategory: "Parfume", match: [
    "parfum", "cologne", "eau de", "dezodorant", "deodorant",
  ]},
  { name: "bukuri-depilim", category: "Bukuri & Kujdes", subcategory: "Depilim & Rroje", match: [
    "makine rroje", "makinë rroje", "rroje elektrik", "vgr v-0", "vgr v-9", "vgr v-6",
    "vgr v-5", "vgr-", "epilator", "trimmer", "shaver", "depilator", "cera",
    "depilim", "grooming",
  ]},
  { name: "bukuri-floke", category: "Bukuri & Kujdes", subcategory: "Flokë (Hair)", match: [
    "makinë qethje", "makine qethje", "qethj", "tharese flok", "tharëse flok",
    "tharese floke", "tharëse floke", "dredhues flok", "drejtues flok", "drejtuese flok",
    "piastr flok", "piastrë flok", "hair dryer", "curler", "straightener",
    "hair styl", "shampo", "balzam flok", "sheglam flok", "shampon", "iparah",
    "shampon hemani",
  ]},
  { name: "bukuri-lekure", category: "Bukuri & Kujdes", subcategory: "Lëkurë", match: [
    "krem fytyre", "krem për fytyr", "serum", "locion", "kujdes lëkur", "kujdes fytyr",
    "face cream", "skincare", "moisturizer", "toner",
  ]},
  { name: "bukuri-thonj", category: "Bukuri & Kujdes", subcategory: "Thonjë & Manikyr", match: [
    "manikyr", "nail", "thonj", "ngjitës thonj", "mbledhës pluhuri për thonj",
    "easy max metallic",
  ]},
  { name: "bukuri-kujdes-personal", category: "Bukuri & Kujdes", subcategory: "Kujdes Personal", match: [
    "masazhues", "masazh", "massage gun", "ultragun", "pistolet masazh",
    "peshore digjital", "analizuese trup", "peshore për peshë",
    "furc dhemb", "furçë dhëmb", "dental water", "irrigator",
  ]},

  // ────────────────────────── TEKNOLOGJI
  { name: "tek-smartwatch", category: "Teknologji", subcategory: "Smartwatch & Fitness Tracker", match: [
    "smart watch", "smartwatch", "watch hw", "watch s8", "watch s9", "apple watch",
    "fitness tracker", "fitness band",
  ]},
  { name: "tek-telefon-tablet", category: "Teknologji", subcategory: "Telefona & Tablet", match: [
    "telefon mobil", "telefonit", "iphone ", "iphone-", "galaxy s", "galaxy a",
    "galaxy note", "galaxy tab", "xiaomi redmi", "xiaomi mi", "huawei mate",
    "oppo ", "realme ", "honor ", "pixel ", "oneplus ",
    "tablet ", "tablet-", "samsung tab", "ipad", "modio m", "lenovo tab",
  ]},
  { name: "tek-laptop", category: "Teknologji", subcategory: "Laptop & Kompjuter", match: [
    "laptop", "notebook pc", "macbook", "desktop pc", "mini pc", "nuc ",
  ]},
  { name: "tek-tv-projektor", category: "Teknologji", subcategory: "TV & Projektor", match: [
    "led tv", "smart tv", "televizor", " tv ", "tv box", "android tv",
    "projektor", "projector", "mini projektor", "h96 max", "hy300",
  ]},
  { name: "tek-kamera", category: "Teknologji", subcategory: "Kamera & Sigurie", match: [
    "kamer", "camera", "kamera sigurie", "kamera sigurije", "kamerë",
    "cctv", "v380", "ptz", "wifi cam", "dash cam", "dashcam", "gopro", "action cam",
  ]},
  { name: "tek-audio", category: "Teknologji", subcategory: "Audio & Kufje", match: [
    "altoparlant", "speaker", "bluetooth speaker", "kufje", "headphone",
    "earphone", "earbuds", "airpods", "mikrofon", "microphone", "karaoke",
    "ndr-", "ndr 915", "zmadhues zëri", "zmadhues zeri", "openrun",
    "soundbar", "home theatre",
  ]},
  { name: "tek-drone", category: "Teknologji", subcategory: "Dronë", match: [
    "drone ", "dron ", "drone-", "dron-", "quadcopter",
  ]},
  { name: "tek-scooter-hover", category: "Teknologji", subcategory: "Scooter & Hoverboard", match: [
    "hoverboard", "scooter elektrik", "electric scooter", "trotinet elektrik",
    "segway", "pllak trotinet", "pllakë trotinet",
  ]},
  { name: "tek-aksesore", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "karikues", "charger", "power adapter", "power bank", "powerbank",
    "cable ", "kabell", "usb ", "usb-", " usb", "hdmi", "adapter ",
    "otg ", "convert", "splitter", "hub usb", "dock station",
    "bateri litium", "bateri 36v", "bateri 18v", "bateri telefoni",
    "mbajtës telefon", "mbajtes telefon", "mbajtëse telefon", "mbajtese telefon",
    "ring light", "tripod", "gimbal", "selfie stick", "stativ",
  ]},
  { name: "tek-smart-home", category: "Teknologji", subcategory: "Smart Home & Rrjet", match: [
    "router ", "modem ", "wifi extender", "repeater wifi", "range extender",
    "smart bulb", "smart plug", "alexa", "google home",
  ]},

  // ────────────────────────── VEGLA & AUTO
  { name: "vegla-elektrike", category: "Shtëpi", subcategory: "Vegla Elektrike", match: [
    "trapan", "drill", "stërvitëse", "stervitese", "vidhosëse", "vidhosese",
    "makinë goditëse", "makine goditese", "makina goditëse", "makina goditese",
    "kositëse bari", "kositese bari", "kositëse", "kositese", "brush cutter",
    "sharrë", "sharre", "sharr elektrik", "chainsaw", "sharra", "sharrë elektrike",
    "gërshërë elektrike", "spiralash konike", "spirale",
    "grinder ", "angle grinder", "rotary hammer", "sds-plus",
    "presore", "pompe", "hidrofor", "aspirator plehrash",
    "pistol ajri", "ajrosje",
  ]},
  { name: "vegla-dore", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "çelës", "celes", "kaçavid", "kacavid", "tornavid", "çekiç", "cekic",
    "pincë", "pince ", "grabujitse", "grebujitse", "çelës i rregullueshëm",
    "metër rrethor", "shirit metr", "nivel ", "level bubble",
    "set veglash", "set spiralash", "set ", "set çelësash", "komplet veglash",
    "total ", "emtop", "würth", "wurth",
    "spatulë", "spatule", "putty", "bricks trowel", "kaçavid total",
    "gërshërë ", "gershere ", "scissors",
  ]},
  { name: "auto", category: "Shtëpi", subcategory: "Aksesore Makine", match: [
    "carplay", "apple carplay", "smart carplay", "dashcam", "gps navig",
    "mbajtëse magnetike telefoni", "mbajtese magnetike telefoni",
    "gom makin", "gomë makine", "goma makine", "shampo per makine",
    "mbrojtëse volani", "për makinë", "per makine", "auto pjese",
    "jump starter", "charger makine", "inverter 12v",
  ]},
  { name: "sanitari", category: "Shtëpi", subcategory: "Sanitari & Ujë", match: [
    "bojler", "bojler elektrik", "ariston pro", "dushi ", "dush set", "set dushi",
    "rubinet", "lavaman", "bateri kuzhine", "bateri dushi", "valvul",
    "tub dushi", "tub fleksibil", "sifon", "wc ",
  ]},
  { name: "kopshti", category: "Shtëpi", subcategory: "Kopshti & Oborr", match: [
    "fara ", "farë ", "farerat", "lule dekor", "vaz lule", "vazo lule",
    "kopsht", "oborr ", "tub kopshti", "tub uji", "hose", "sprinkler",
    "pompe uji", "pompë uji",
  ]},

  // ────────────────────────── KUZHINE
  { name: "kuzhine-pajisje", category: "Kuzhinë", subcategory: "Pajisje Elektrike", match: [
    "mikser", "blender ", "blendr", "tost", "toaster", "air fryer", "airfryer",
    "furrë elektrike", "furre elektrike", "furnele", "aspirator kuzhine",
    "frigorifer", "frigorifer mini", "pjekëse", "pjekese", "hekur",
    "kafshore", "kafshore kafeje", "kafemakine", "coffee maker",
    "mulli kafe", "gril elektrik", "multicooker", "slow cooker", "pressure cooker",
    "pajisje për përpunim ushqimi", "food processor", "chopper",
    "tharese rrobash", "tharëse rrobash", "makinë larëse", "makine larese",
  ]},
  { name: "kuzhine-ene", category: "Kuzhinë", subcategory: "Enë Gatimi", match: [
    "tenxhere", "tigan", "set tiganësh", "set tigani", "set pjatash",
    "thik kuzhine", "thik ", "set thika", "bisturi kuzhine",
    "pjat ", "pjata ", "gotë ", "gota ", "filxhan", "çajnik", "cajnik", "teapot",
    "kupa ", "kupe kafeje", "set gota", "lugë ", "pirun ", "luga ",
    "set takëm", "takëm", "plateau", "board cutting",
  ]},
  { name: "kuzhine-akses", category: "Kuzhinë", subcategory: "Aksesore Kuzhine", match: [
    "bordure kuzhine", "rroba kuzhine", "dorez kuzhine", "dorëz kuzhine",
    "peshore kuzhine", "hekurosje", "shfryrëse", "shfryrese",
    "shirit ngjit", "kapëse", "kapese", "tape ngjitës",
  ]},

  // ────────────────────────── SHTEPI (NON-MOBILJE)
  { name: "shtepi-pastrim", category: "Shtëpi", subcategory: "Pastrim", match: [
    "fshesë", "fshese ", "fshese elektrik", "mopp", "moppe", "lavatore",
    "detergjent", "sapun pastrim", "pastrim", "aspirator pluhuri", "vacuum cleaner",
    "robot pastrim", "steam cleaner", "kosh plehrash", "kosh për plehra",
    "kosh metalik", "cleaning",
  ]},
  { name: "shtepi-dekor", category: "Shtëpi", subcategory: "Dekor", match: [
    "vazo dekor", "kuadro ", "tablo ", "dekor shtëpie", "kornizë",
    "qiri ", "qirinj", "candle ", "home decor", "mandalë",
    "shkop ngjitës dekor", "statuj dekor",
  ]},
  { name: "shtepi-ndricim", category: "Shtëpi", subcategory: "Ndriçim", match: [
    "llambë ", "llamba ", "llambushka", "dritë led", "led strip", "led light",
    "spotlight", "pendant light", "ceiling light", "lamp ", "lampë",
    "drite magnetik", "dritë magnetike", "lantern", "fener",
  ]},
  { name: "shtepi-organizim", category: "Shtëpi", subcategory: "Organizim", match: [
    "kuti ruajtje", "kuti plastike", "organizues", "organizer", "mbajtës",
    "mbajtes ", "rafta modulare", "panier ruajtje", "kuti ngjyrash",
    "kuti mjetesh", "storage box", "storage bag",
  ]},
  { name: "shtepi-tekstil", category: "Shtëpi", subcategory: "Tekstil Shtëpie", match: [
    "jastëk", "jastek", "mbulojë krevat", "mbuloj dyshek", "kover ",
    "peshqir", "peshqir dushi", "carcaf", "çarçaf", "tekstil shtëpie",
    "perde ", "rrip perde", "curtain", "blanket", "duvet",
  ]},
  { name: "shtepi-kafshe", category: "Shtëpi", subcategory: "Kafshë Shtëpie", match: [
    "qen ", "mace ", "peshq ", "dog food", "cat food", "shtrat qeni",
    "aquarium", "kafshë shtëpie", "ushqim qeni", "ushqim mace",
    "ushqim kafshe", "ushqim per qen", "ushqim për qen",
  ]},

  // ────────────────────────── SPORTE
  { name: "sporte-fitnes", category: "Sporte & Fitness", subcategory: "Fitness & Gym", match: [
    "fitnes", "fitness", " gym ", "palestr ", "dumbbell", "pesha ushtrime",
    "kettlebell", "hantel", "resistance band", "yoga ", "yoga mat", "pilates",
    "fitball", "litar pesh", "pompa krahu",
  ]},
  { name: "sporte-biciklet", category: "Sporte & Fitness", subcategory: "Biçikleta & Trotinet", match: [
    "biciklet", "biçiklet", "bicycle", "trotinet ", "trotineti fëmij",
    "bmx", "mtb", "helmet biciklet",
  ]},
  { name: "sporte-camp", category: "Sporte & Fitness", subcategory: "Kampirim & Outdoor", match: [
    "çadër kampi", "cader kampi", "tent camping", " çadër ",
    "çantë shpin", "cante shpin", "backpack", "rucksack", "hiking",
    "kamp ", "camping", "sleeping bag", "thermos ",
  ]},
  { name: "sporte-ekipim", category: "Sporte & Fitness", subcategory: "Ekipim Sportiv", match: [
    "top futboll", "top futbolli", "top basket", "top volejboll", "top volley",
    "reketa ", "tenis ", "ping pong", "ping-pong", "net sports",
    "mbrojtëse sportive", "mbrojtese sportive", "mbrojtës për portier",
    "mbrojtese per portier", "gjuajtje stërvitje",
    "çantë gym", "çantë magnetike për gym", "çantë multifunksionale magnetike për gym",
  ]},

  // ────────────────────────── VESHJE & AKSESORE
  { name: "veshje-femije", category: "Veshje & Aksesore", subcategory: "Veshje Fëmijësh", match: [
    "xhupë sportive për djem", "xhup djem", "veshje fëmijë",
    "pijama fëmijë", "pijama bebe", "pallto fëmijë", "xhup fëmij",
  ]},
  { name: "veshje-burra-gra", category: "Veshje & Aksesore", subcategory: "Veshje", match: [
    "xhupë", "xhupe", "xhup ", "jakë", "jake ", "pallto", "fustan",
    "pantallona", "xhinse", "jeans", "bluze", "këmish", "kemish",
    "t-shirt", "t shirt", "shirt ", "pulover", "mbathje", "çorape",
    "corape", "uniform", "tute ",
  ]},
  { name: "veshje-kepuce", category: "Veshje & Aksesore", subcategory: "Këpucë", match: [
    "këpuc", "kepuc", "shoes", "sneaker", "çizm", "cizm", "boots ",
    "sandale", "sandali", "pantofla",
  ]},
  { name: "veshje-cant", category: "Veshje & Aksesore", subcategory: "Çanta & Valixhe", match: [
    "çantë dore", "cante dore", "valixh", "valixhe ", "kuletë", "kulet ",
    "çantë shkolle", "cante shkolle", "handbag", "backpack modë",
  ]},
  { name: "veshje-ore-bizhuteri", category: "Veshje & Aksesore", subcategory: "Orë & Bizhuteri", match: [
    "orë dore", "ore dore", "orë muri", "ore muri", "watch wall",
    "byzylyk", "bracelet", "vathë", "vath ", "gjerdan", "unazë",
    "syze dielli", "syze elegante", "kapele ", "kapel ", "shall ",
    "kravat", "aksesore mode",
  ]},

  // ────────────────────────── USHQIME
  { name: "ushqime", category: "Ushqime", subcategory: "Ushqime", match: [
    "kafe ", "çaj ", "caj ", "çokollat", "cokolat", "sheqer ", "miell ",
    "kripë ", "kripe ", "djath", "gjalp", "vaj ulliri", "olive oil",
    "qumësht", "supply food",
  ]},

  // ═══════════════════════ SECOND-PASS RULES (lower priority fallbacks)

  // BEBE extras
  { name: "femije-bebe2", category: "Fëmijë & Lodra", subcategory: "Bebe (0-2)", match: [
    "babybeshik", "babyfon", "pomp gjir", "pompë gjir", "pompe gjir",
    "shtres për maksikoz", "shtres per maksikoz", "maksikoz",
    "inkubator", "triciklet", "triçiklet",
  ]},
  { name: "femije-kostum", category: "Fëmijë & Lodra", subcategory: "Lodra", match: [
    "kostum me spider", "kostum me super", "kostum batman", "kostum spider",
    "kostum karnaval", "maska lodre",
  ]},

  // TEKNOLOGJI extras
  { name: "tek-telefon-xiaomi", category: "Teknologji", subcategory: "Telefona & Tablet", match: [
    "xiaomi 13", "xiaomi 12", "xiaomi 14", "xiaomi note", "redmi note",
    "kufer xiaomi", "smart phone", "dual sim",
  ]},
  { name: "tek-kamera-foto", category: "Teknologji", subcategory: "Kamera & Sigurie", match: [
    "canon eos", "aparat fotografik", "dslr", "mirrorless", "lens ",
    "zoom lens", "kamera foto", "nikon d", "sony alpha",
  ]},
  { name: "tek-aksesore2", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "earldom ", "card reader", "fm modulator", "splitter", "hub audio",
    "bateri varta", "bateri lithium", "bateri cr20", "bateri aa", "bateri aaa",
    "prize 6-dalëse", "prizë 6-dalëse", "priz 6-", "prizë shumëfishe",
    "prize shumefishe", "zgjatues rryme", "extender tp-link", "extender wifi",
    "stabilizator tensioni", "avr ", "ups 1000", "ups 650",
    "led video light", "ring light", "video light", "difuzer",
    "carplay", "tp-link ", "wa850", "wa830",
  ]},

  // VEGLA extras
  { name: "vegla-elektrike2", category: "Shtëpi", subcategory: "Vegla Elektrike", match: [
    "kompresor ajri", "pompë ajri", "pompe ajri", "air blow gun", "pistoletë silikoni",
    "pistolet silikoni", "pistol gozhd", "armë për gozhd", "arme per gozhd",
    "kokë shpimi", "koke shpimi", "pajisje per saldim", "welding ", "saldim",
    "generator", "gjenerator", "motor elektrik", "dhëndër inverter",
    "fryr gjeth", "fryrës gjeth", "leaf blower",
    "dritë pune", "drit pune", "drit punë", "dritë punë", "work light led",
    "ngarkues bater", "karikues bater",
  ]},
  { name: "vegla-boje", category: "Shtëpi", subcategory: "Bojë & Ndërtim", match: [
    "cosmoslac", "sibax", "bojë akrilik", "boje akrilik", "acrylic paint",
    "spray bojë", "spray boje", "spraj bojë", "spraj boje", "ral ",
    "mastikë", "mastike", "mbushës dru", "mbushes dru", "wood filler",
    "izolim fug", "mbyllje fug", "shirit izolim",
    "fugator", "brrokë", "mbush çarj", "silikon ndërtimi",
    "ciment ", "allçi", "gips ", "suvatim",
  ]},
  { name: "vegla-dore2", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "doreza pune", "doreza gome", "doreza punetori", "doreza sigurie",
    "pince ", "pincë ", "qelës ", "qelës goditës", "qelës pneumatik",
    "qelës total", "pinca total", "çelës total", "bricks trowel",
  ]},
  { name: "sanitari2", category: "Shtëpi", subcategory: "Sanitari & Ujë", match: [
    "dush dor", "doreja e dushit", "dorë dushi", "zorrë uji", "zorre uji",
    "zorrë fleksib", "zorre fleksib", "lidhëse këndore tub", "lidhese kendore tub",
    "tuba pe", "tubal ", "rubin ",
  ]},

  // SHTEPI - HEATING (new bucket under Shtëpi)
  { name: "shtepi-ngrohje", category: "Shtëpi", subcategory: "Ngrohje & Ajrim", match: [
    "ngrohës elektrik", "ngrohes elektrik", "ngrohëse elektrik", "ngrohese elektrik",
    "home heater", "htr44", "radiator ", "paneli ngrohj",
    "ventilator ", "ventilator me ngroh", "ajër të kondic", "kondicioner",
    "klimatiz",
  ]},

  // BUKURI extras
  { name: "bukuri-depilim2", category: "Bukuri & Kujdes", subcategory: "Depilim & Rroje", match: [
    "pajisje për heqjen e qimeve", "pajisje per heqjen e qimeve",
    "pajisje heqje qim", "heqje qim",
  ]},
  { name: "bukuri-difuzer", category: "Bukuri & Kujdes", subcategory: "Parfume", match: [
    "difuzer", "air freshener", "lattafa", "aroma makine",
  ]},
  { name: "bukuri-vgr", category: "Bukuri & Kujdes", subcategory: "Depilim & Rroje", match: [
    "vgr v‑", "vgr v-", "vgr-", "vgr 5", "vgr 6", "vgr 7", "vgr 8", "vgr 9", "vgr 1",
  ]},

  // KOPSHTI extras (already in Shtëpi)
  { name: "kopshti2", category: "Shtëpi", subcategory: "Kopshti & Oborr", match: [
    "vazo plastik", "vazo dekor", "vazo për bim", "vazo per bim",
    "bimë dekorative", "plant pot", "fryr gjeth", "fryrës gjeth",
  ]},

  // VESHJE Aksesore
  { name: "aksesore-elegant", category: "Veshje & Aksesore", subcategory: "Bizhuteri & Aksesore", match: [
    "aksesor elegant", "fjongo saten", "fjongo e mod", "saten perla",
    "perla eleganc", "capeli ", "kapëse flok",
  ]},
  { name: "veshje-cant2", category: "Veshje & Aksesore", subcategory: "Çanta & Valixhe", match: [
    "qantë ", "qantë shkoll", "qantë për kozmet", "qantë për kozm",
    "qant ", "qantë për mesh", "qantë për meshk",
    "çantë shkoll", "çantë kozmet", "çantë mesh", "çantë model",
    "dorez gome kuzhin",
  ]},
  { name: "veshje-dorez", category: "Veshje & Aksesore", subcategory: "Dorëza & Shalle", match: [
    "dorez mode", "doreza mode", "doreza krem", "doreza gëzof", "doreza gezof",
    "doreza pambuk", "doreza dimri",
  ]},

  // AUTO extras
  { name: "auto2", category: "Shtëpi", subcategory: "Aksesore Makine", match: [
    "citycoco", "city coco", "dorez gazi", "dorëz gazi", "fanare led makine",
    "moto accessor", "motorr citycoco", "motor scooter",
    "car holder", "adblue", "lëng larës", "leng lares xham", "leng lares per",
    "pastrues makin", "cleaner makine",
  ]},

  // ═══════════════════════ THIRD-PASS RULES (fill gaps)

  // Kosova-specific bebe car seat
  { name: "bebe-autokarrik", category: "Fëmijë & Lodra", subcategory: "Karrocat & Dubak", match: [
    "auto karrik", "autokarrik", "car seat", "mbulesë për autokarrik",
    "mbuloj autokarrik", "kengur per fem", "kengur për fem",
    "aspirator hundë", "aspirator hunde", "inhalator",
    "brek synet", "shpikoz", "doreza për fëmijë",
    "mjet edukativ", "mjet për fëmij",
  ]},
  { name: "bebe-pishine", category: "Fëmijë & Lodra", subcategory: "Lodra", match: [
    "pishinë për fëmij", "pishine per femij", "pishin bebe",
    "kompleti i lojës", "komplet loje", "komplete loje", "set loje fem",
  ]},
  { name: "femije-mobilje", category: "Fëmijë & Lodra", subcategory: "Mobilje Fëmijësh", match: [
    "karrige ushqimi", "karrige për fëmij", "karrige per femij",
    "karrige fëmij", "karrige femij", "raft fëmij", "shtrat fëmij",
    "tavolinë për fëmij", "tavoline per femij",
  ]},

  // Pastrim extras
  { name: "shtepi-pastrim2", category: "Shtëpi", subcategory: "Pastrim", match: [
    "robot vacuum", "aspirator pa tela", "aspirator pluhur", "vacuum ",
    "vacuum.cleaner", "pastrues me presion", "pastrues presion",
    "high-pressure washer", "pressure washer", "thasë për mbeturina",
    "thase per mbeturina", "fryrëse ", "fryrese ",
  ]},

  // Vegla - cutting/grinding
  { name: "vegla-prerje", category: "Shtëpi", subcategory: "Vegla Elektrike", match: [
    "prerëse metali", "prerese metali", "disk prerës", "disk prerese",
    "makinë elektrike për lëmim", "makine per lemim", "makinë lëmim",
    "pistoletë spërkatëse", "pistolet sperk", "spray gun",
    "furçë rul bojë", "furç rul boj", "rul për bojë", "rul per boje",
    "mjet prerës", "mjet preper", "mjet për prerje", "mjet preper",
    "mjet prepres", "mjet për saldim", "heqës barërash",
  ]},

  // Objektivi sportiv / Shooting
  { name: "sporte-gjuaj", category: "Sporte & Fitness", subcategory: "Ekipim Sportiv", match: [
    "objektivi i gjuaj", "objektiv gjuaj", "rrip taktik", "vest taktik",
    "pompa intex", "fryrëse bazen", "bazent", "bazeni per fem", "bazeni fem",
    "shtrat me ajer", "shtrat ajri", "air mattress",
  ]},

  // Kopshti — gardening tools
  { name: "kopshti3", category: "Shtëpi", subcategory: "Kopshti & Oborr", match: [
    "lopatë", "lopate ", "lopatë e shkurtër", "tabakë për rritje", "tabakë fidan",
    "mjet për mbledhjen e frutave", "mjet mbledh fruta", "heqës bar",
    "kontrollues ujitje", "timer ujitje", "spërkatës rrot", "spërkatës me bateri",
    "sperkatese 16l", "sprinkler ", "qepë", "fara perim", "farat ", "fruta arr",
    "frutat ",
  ]},

  // TEK — broader aksesore
  { name: "tek-aksesore3", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "wireless charging", "wireless charger", "charging stand", "charging pad",
    "aux audio", "aux adapter", "mp3 player", "printer termal", "printer ",
    "mini tastier", "tastier ", "tastierë ", "keyboard ", "mouse gaming",
    "maus gaming", "mauswireless", "bluetooth mouse", "mouse bluetooth",
    "pirg prizash", "pirge prizash", "prize me usb",
    "bateri multifunk", "power bank", "hf98-",
  ]},

  // SHTEPI — misc
  { name: "shtepi-misc", category: "Shtëpi", subcategory: "Organizim", match: [
    "arkë kursimi", "arke kursimi", "piggy bank", "kasafort",
    "stol plastik", "stol i palosshëm", "stol palosshëm",
    "raft këndor", "raft kendor", "raft për kpuce", "raft per kpuce",
    "raft për këpuc", "raft per kepuc", "mbajtës për këpuc",
  ]},
  { name: "shtepi-mobilje-extras", category: "Mobilje", subcategory: "Shtretër & Dyshek", match: [
    "shtrat luksoz", "shtrat modern", "shtrat prej dru", "shtrat çift",
    "shtrat dyfish",
  ]},

  // Maska mbrojtëse / safety
  { name: "siguri-pune", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "maskë mbrojtëse", "mask mbrojtëse", "maska mbrojtese", "respirator",
    "syze mbrojtese", "helmet pune", "sigurie pune", "këpuc sigurie",
  ]},

  // VESHJE extras
  { name: "veshje-xhaket-femra", category: "Veshje & Aksesore", subcategory: "Veshje", match: [
    "xhaketë e zezë për vajza", "xhaketë për vajza", "xhaketë me peliçe",
    "jakë me peliç", "pallto vajza",
  ]},

  // BUKURI - additional
  { name: "bukuri-skincare2", category: "Bukuri & Kujdes", subcategory: "Lëkurë", match: [
    "dr. rashel", "dr rashel", "collagen serum", "skin collagen",
    "sekreti i rinisë", "anti-aging", "anti aging",
  ]},
  { name: "bukuri-ngjyre-flok", category: "Bukuri & Kujdes", subcategory: "Flokë (Hair)", match: [
    "ngjyrë për flokë", "ngjyre per flok", "hair dye", "hair color",
    "stilues i flok", "stilues flok", "stilues floke", "gemmy-",
    "collagen 8.", "collagen hair",
  ]},
  { name: "bukuri-esthetician", category: "Bukuri & Kujdes", subcategory: "Kujdes Personal", match: [
    "esthetician light", "ambitful ", "beauty lamp", "lamp beauty",
    "ring light makeup",
  ]},

  // Ushqime - expand
  { name: "ushqime2", category: "Ushqime", subcategory: "Ushqime", match: [
    "qepe ", "qepë ", "fara bime", "chandler", "arrë ",
  ]},

  // ═══════════════════════ FOURTH-PASS RULES

  // MOBILJE extras
  { name: "mobilje-dollap", category: "Mobilje", subcategory: "Rafte & Dollap", match: [
    "dollap", "raft tharje", "raft rrobash", "raft zyre", "raft modern",
    "raft minimalist", "tavolinë mesi", "tavoline mesi", "tavolin mesi",
    "komod ", "komodine",
  ]},

  // VEGLA extras
  { name: "vegla-total", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "total", "emtop", " tol ", "spatull", "spatulë", "mjet ", "mengene",
    "metër matës", "meter matës", "metër fib", "meter fib", "metri fib",
    "thikë dore", "thike dore", "pinç ", "pinc ", "fije shënjuese",
    "fije shenjuese", "pluhur shkumës", "pluhur shkumes", "makinë për gozhd",
    "makine per gozhd", "eica star",
  ]},
  { name: "vegla-boje2", category: "Shtëpi", subcategory: "Bojë & Ndërtim", match: [
    "sitolor", "spray yara", "bojë radiat", "boje radiat", "spray khamrah",
    "ngjitës poliuretan", "ngjites poliuretan", "silikon poliuretan",
    "bojë gloss", "boje gloss", "acrylic ", "polyurethane", "ngjites silikon",
  ]},
  { name: "vegla-siguri2", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "doreza pune", "dorëza pune", "xhaketë pune reflektues", "xhaket pune",
    "helmetë mbrojtëse", "helmet mbrojtese", "helmet pune", "mbrojtëse fytyre",
    "mbrojtese fytyre", "maske respirator", "syze sigurie", "kpuce sigurie",
  ]},
  { name: "vegla-gershere", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "gërshërë/prerëse tub", "gershere prerse tub", "gershere tub",
    "prerëse tub", "prerese tub", "prerese tubash", "prerëse tubash",
  ]},

  // KUZHINE extras
  { name: "kuzhine-pajisje2", category: "Kuzhinë", subcategory: "Pajisje Elektrike", match: [
    "resho elektrik", "reshoja elektrike", "grill elektrik", "grill rotit",
    "sterilizues", "ngroh shisheve", "ngrohëse shisheve", "steamer ",
  ]},
  { name: "kuzhine-termos", category: "Kuzhinë", subcategory: "Aksesore Kuzhine", match: [
    "termos ", "kutia e madhe për ruajtjen e ushqim", "kuti per ushqim",
    "kutia për ushqim", "kuti plastike ushqim",
  ]},

  // AUTO extras
  { name: "auto-kanic", category: "Shtëpi", subcategory: "Aksesore Makine", match: [
    "kanic për vaj motor", "kanic per vaj motor", "kanic vaj", "vaj motori",
    "oil container", "bojler makin", "fanar makin",
  ]},

  // TEK extras
  { name: "tek-kamera2", category: "Teknologji", subcategory: "Kamera & Sigurie", match: [
    "mi smart outdoor", "outdoor cam", "xiaomi camera", "mi camera",
    "cw300", "walkie talkie", "walkie-talkie", "radiolidhje",
    "baofeng",
  ]},
  { name: "tek-drone2", category: "Teknologji", subcategory: "Dronë", match: [
    "lf632", "lf635", "mini drone", "dronë kamerash", "drone hd",
  ]},
  { name: "tek-stabilizator2", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "stabilizator 220", "stabilizator tension", "avr 1kva", "ups inverter",
    "travelpod", "travel pod", "powerpack", "power pack", "5-in-1 power",
  ]},
  { name: "tek-ndricim-industrial", category: "Shtëpi", subcategory: "Ndriçim", match: [
    "led industrial", "led industri", "reflektor led", "reflektor industr",
    "drit profesional", "dritë profesional", "plokama", "spotlight 100w",
    "spotlight 200w", "spotlight 300w", "dritë 200w", "projektor led",
  ]},

  // BEBE extras
  { name: "bebe-baby-beshik", category: "Fëmijë & Lodra", subcategory: "Bebe (0-2)", match: [
    "baby beshik", "babybeshik", "vask paluese", "vask palosëse", "vask palosese",
    "vask per femij", "vask bebe", "thes gjumi", "thes i gjumit",
    "dyshek rrjetë 3", "dyshek rrjet", "mbrojtës i skajeve", "mbrojtes i skajeve",
    "furça dhëmb", "furc dhemb", "furçë dhëmb", "furche dhemb",
    "meme për fruta", "meme per fruta",
  ]},
  { name: "lodra-extras", category: "Fëmijë & Lodra", subcategory: "Lodra", match: [
    "loder ", "loder", "mini fotball", "labubu", "gjoker palu", "luhatese per fem",
    "luhatëse për fëm", "luhatese bebe", "kostum pierre cardin", "komplete pierre cardin",
    "komplete fem", "komplet fem", "shezlong fem",
    "shirit kok", "shirit për kokë", "kapelë fëm",
  ]},

  // SHTEPI — water/organizim
  { name: "shtepi-rezervar", category: "Shtëpi", subcategory: "Organizim", match: [
    "rezervar uji", "rezervar ujë", "rezervar i ujit", "water tank", "depozit uji",
    "raft për tharjen e rrobave", "raft tharj rrobash", "raft i tharjes",
  ]},
  { name: "shtepi-kositje", category: "Shtëpi", subcategory: "Kopshti & Oborr", match: [
    "kositje moderne", "kositje bari", "prerëse bari", "kositese bari moderne",
    "lawn mower", "kositese pa zhur",
  ]},

  // BUKURI extras
  { name: "bukuri-makine-qim", category: "Bukuri & Kujdes", subcategory: "Depilim & Rroje", match: [
    "makinë për heqjen e qimeve", "makine per heqjen e qimeve", "epilator elek",
    "heqje qimesh elektrik",
  ]},
  { name: "bukuri-figaro", category: "Bukuri & Kujdes", subcategory: "Depilim & Rroje", match: [
    "figaro rrotullues", "figaro flok", "figaro profesional", "figaro vgr",
  ]},

  // VESHJE extras
  { name: "veshje-perlat", category: "Veshje & Aksesore", subcategory: "Bizhuteri & Aksesore", match: [
    "varëse multifunks", "varese multifunk", "varëse elegante", "varese elegante",
    "perla elegante", "perlat elegante", "fjongo bizhut",
  ]},
  { name: "veshje-kompleti", category: "Veshje & Aksesore", subcategory: "Veshje", match: [
    "kompleti pierre", "komplete pierre", "pierre cardin", "xhaketë pierre",
    "pantallona pierre",
  ]},

  // ═══════════════════════ FIFTH-PASS RULES
  { name: "tek-monitor", category: "Teknologji", subcategory: "Laptop & Kompjuter", match: [
    "monitor ", "monitor xiaomi", "monitor 60hz", "monitor 144hz", "monitor gaming",
    "display trotineti", "oled monitor",
  ]},
  { name: "tek-smart-glasses", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "smart glasses", "bv100", "vr glasses", "vr headset", "glass smart",
    "stabilizues profesional për telefon", "stabilizer q09", "stabilizer telefoni",
    "mini gimbal", "stabilizer l09", "multi-function flashlight", "led flashlight",
  ]},
  { name: "tek-akumulator", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "akkumulator", "akumulator ", "bateri 12v", "bateri 24v", "bateri 48v",
    "vesna diesel", "kbk longlife", "ups i vogël", "ups kompakt",
    "stabilizator i voltazh", "stabilizator tension",
  ]},
  { name: "tek-wireless-rx", category: "Teknologji", subcategory: "Aksesore Teknologjike", match: [
    "wireles receiver", "wireless receiver", "br04",
  ]},
  { name: "tek-mini-klim", category: "Shtëpi", subcategory: "Ngrohje & Ajrim", match: [
    "mini klim", "mini kondicioner", "klim i vog", "portable ac",
  ]},

  // BEBE + bebe accessories
  { name: "bebe-bassinet", category: "Fëmijë & Lodra", subcategory: "Karrocat & Dubak", match: [
    "baby bassinet", "bassinet", "kove për vask", "kove per vask", "shtres vask",
    "shtres per vask", "mbulesë vaske", "mbulese vaske", "hyram", "iron per bebe",
    "hekur për bebe", "hekur bebe", "karrocat bebe", "karroca bebe",
  ]},
  { name: "bebe-peluche", category: "Fëmijë & Lodra", subcategory: "Lodra", match: [
    "pelush", "peluche", "peluch", "stitch pelush", "plush lodër",
    "traka për fëmij", "traka per femij",
  ]},
  { name: "bebe-mbrojtes-shkall", category: "Fëmijë & Lodra", subcategory: "Bebe (0-2)", match: [
    "mbrojtëse për shkallë", "mbrojtese per shkalle", "baby gate", "porta sigur",
    "mbrojtes sobe", "mbrojtes kend",
  ]},

  // LODRA
  { name: "lodra-sport", category: "Fëmijë & Lodra", subcategory: "Lodra", match: [
    "loja e basketboll", "basketboll plastik", "loja plastike", "set basketbolli",
    "targe futbolli", "futboll plastik",
  ]},

  // GAMING (second wave)
  { name: "gaming-games", category: "Teknologji", subcategory: "Gaming & Konzola", match: [
    "terminator 2d", "day one edition", "playstation game", "cd xbox",
    "playstation-", "sony game", "xbox one ", "xbox series",
  ]},

  // KUZHINE extras
  { name: "kuzhine-tava", category: "Kuzhinë", subcategory: "Enë Gatimi", match: [
    "tavë për petulla", "tave per petulla", "pancake pan",
    "tavë pjekje", "tave pjekje", "pan ", "pan pizza",
    "prerës ushqim", "prerës perim", "prerese perim", "prerese ushqim",
    "vegetable cutter", "food processor manual", "spice grinder",
  ]},
  { name: "kuzhine-org", category: "Kuzhinë", subcategory: "Aksesore Kuzhine", match: [
    "organizator kuzhin", "organizues kuzhin", "mbajtës enësh", "kitchen rack",
    "mbajtese erza", "erzes organizator",
  ]},
  { name: "kuzhine-vaj", category: "Kuzhinë", subcategory: "Aksesore Kuzhine", match: [
    "vaj guri", "vaj per kuzh", "vaj gatim", "sugar organizer", "kripe organizues",
  ]},

  // VEGLA - furce, bit, koka, ultratip
  { name: "vegla-furce-bit", category: "Shtëpi", subcategory: "Vegla Dore", match: [
    "furç kup", "furçë kup", "furc kupe", "furçë boje", "furc boje",
    "furcë me dorezë", "furce me dor", "furçë 50", "furçë 60",
    "bit diamanti", "bit shpimi", "kokë shpimi", "koka shpimi",
    "cordless tools", "ultratip", "ultrathin p",
    "grabitës metalik", "grebitës metalik", "grabitese metalike",
    "patruese laminat", "laminat kap", "rrotë matëse", "rrote matese",
    "yndyr lubri", "yndyrë lubri", "vaj lubrifikant",
    "stuko akrilik", "stuko ndertim", "silikon akrilik",
    "izolim lidhje", "izolim tub",
  ]},

  // SHTEPI - decor pushi
  { name: "shtepi-kapuc-per-fem", category: "Fëmijë & Lodra", subcategory: "Bebe (0-2)", match: [
    "mbrojtëse veshësh prej pushi", "mbrojtes veshes pushi", "kapuç për bebe",
    "mbrojtëse veshësh për fëmij", "mbrojtes veshes per fem",
  ]},

  // BUKURI - various
  { name: "bukuri-ruj-shtyp", category: "Bukuri & Kujdes", subcategory: "Flokë (Hair)", match: [
    "shtypëse e flokëve", "shtypese e flokeve", "shtypës flokë",
    "makinë për premjen e flokëve", "makine per premjen e flokeve",
    "makinë premje flok", "makine premje flok", "flokë premje", "flok premje",
    "premje flokesh",
  ]},
  { name: "bukuri-depilim3", category: "Bukuri & Kujdes", subcategory: "Depilim & Rroje", match: [
    "depilues", "depilatore", "epilatore", "iparah depilues", "shaver set",
  ]},
  { name: "bukuri-spray-parf", category: "Bukuri & Kujdes", subcategory: "Parfume", match: [
    "spray asad", "spray eclaire", "spray ameerat", "spray khamrah",
    "spray diamond", "al-rehab concentrated", "spray pashmin",
    "parfum spray",
  ]},
  { name: "bukuri-snore", category: "Bukuri & Kujdes", subcategory: "Kujdes Personal", match: [
    "mini pajisje kundër gërhat", "mini pajisje gerhat", "snore pajisje",
    "kundër gërhat", "anti-snore",
  ]},

  // VESHJE extras - jelek, jakete, kapuc
  { name: "veshje-jelek-dimer", category: "Veshje & Aksesore", subcategory: "Veshje", match: [
    "jelek pune", "jelek dimri", "jelek termo", "jelek profesional",
    "kapuç dimror", "kapuce dimerore", "kapuça dimërore", "kapuca dimerore",
    "pallto dimerore", "trenerka komplet", "trenerka poshtme", "trenerka per fem",
    "qeshme ", "qeshme hi", "qeshme kl",
  ]},
  { name: "veshje-cadra", category: "Veshje & Aksesore", subcategory: "Bizhuteri & Aksesore", match: [
    "çadër klasike", "çadër për shi", "cader per shi", "çadër shi",
    "umbrella", "ombrell",
  ]},
  { name: "veshje-cant-fin", category: "Veshje & Aksesore", subcategory: "Çanta & Valixhe", match: [
    "çantë shpin", "cante shpin", "çantë 3n1", "cante 3n1",
    "çantë wes polo", "wes polo", "çantë profesional", "cant me rrota",
    "çantë me rrota", "rrota me çantë",
  ]},
  { name: "veshje-ore2", category: "Veshje & Aksesore", subcategory: "Orë & Bizhuteri", match: [
    "daniel klein", "daniel.klein", "orë dk", "orë louder", "smart watch",
    "watch louder",
  ]},

  // MOBILJE extras - kabinet, divan
  { name: "mobilje-divan", category: "Mobilje", subcategory: "Karrige", match: [
    "divan seksional", "divan i fryrë", "divan i fryr", "sofa i fryr",
    "divan luksoz", "karrige fryr", "inflatable sofa",
  ]},
  { name: "mobilje-kabinet", category: "Mobilje", subcategory: "Rafte & Dollap", match: [
    "kabinet palosës", "kabinet palos", "kabinet rrob", "kabinet dek",
    "kabinet minimal", "cabinet folding",
  ]},

  // AUTO extras
  { name: "auto-reflektor", category: "Shtëpi", subcategory: "Aksesore Makine", match: [
    "reflektor rrugor", "reflektor led 150", "reflektor led 100", "reflektor 200w",
    "motorr elektrik", "motor elektrik", "mini pomp makine",
  ]},

  // KOPSHTI - insects
  { name: "kopshti-insekt", category: "Shtëpi", subcategory: "Kopshti & Oborr", match: [
    "kurth për insekt", "kurth insekt", "kundër insekt", "shkelg mushkonj",
    "insect killer", "mosquito killer", "fly killer", "tavolinë insekt",
  ]},

  // SHTEPI - pastrues avulli
  { name: "shtepi-avull", category: "Shtëpi", subcategory: "Pastrim", match: [
    "pastrues avulli", "steam cleaner", "steam mop", "avullore",
  ]},

  // VEGLA - krasitje / elektrike
  { name: "vegla-krasitje", category: "Shtëpi", subcategory: "Vegla Elektrike", match: [
    "gërshërë elektrike për krasit", "gershere elektrike per krasit",
    "krasitje", "prerës për pllaka", "prerese per pllaka",
    "3y5p", "tile cutter",
  ]},

  // TOPFINE
  { name: "vegla-topfine", category: "Shtëpi", subcategory: "Vegla Elektrike", match: [
    "topfine ", "topfine fryr", "fryrës ajri me manometër",
    "air inflator", "oil gauge",
  ]},
];

// ────────────────────────── CATEGORY → COLLECTION SLUGS
const CATEGORY_TO_COLLECTIONS: Record<string, string[]> = {
  "Shtëpi": ["shtepi-kuzhine"],
  "Kuzhinë": ["shtepi-kuzhine", "kuzhine"],
  "Mobilje": ["mobilje"],
  "Teknologji": ["teknologji"],
  "Fëmijë & Lodra": ["femije-lodra"],
  "Bukuri & Kujdes": ["bukuri-kujdes"],
  "Sporte & Fitness": ["sporte-aktivitete", "sporte-fitness"],
  "Veshje & Aksesore": ["veshje-aksesore"],
  "Ushqime": ["ushqime"],
  "Të përgjithshme": [],
};

function matchRule(title: string): Rule | null {
  const lower = title.toLowerCase();
  for (const rule of RULES) {
    for (const kw of rule.match) {
      if (lower.includes(kw)) return rule;
    }
  }
  return null;
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  console.log("→ Ensuring collections exist...");
  const ensureCollection = async (slug: string, title: string, sortOrder: number) => {
    await db.collection.upsert({
      where: { slug },
      update: { title, sortOrder, isActive: true },
      create: { slug, title, sortOrder, isActive: true },
    });
  };

  await ensureCollection("mobilje", "Mobilje", 55);
  await ensureCollection("kuzhine", "Kuzhinë", 58);
  await ensureCollection("sporte-fitness", "Sporte & Fitness", 85);
  await ensureCollection("ushqime", "Ushqime", 120);

  console.log("→ Loading products...");
  const products = await db.product.findMany({
    select: { id: true, title: true, category: true, price: true, tags: true },
  });
  console.log(`  loaded ${products.length} products`);

  const catCounts: Record<string, number> = {};
  const subcatCounts: Record<string, number> = {};
  let changedCount = 0;

  console.log("→ Applying rules and updating products...");
  for (const p of products) {
    const rule = matchRule(p.title);
    // Fallback: anything unmatched goes to "Shtëpi" (likely home-good) rather than Të përgjithshme,
    // since we've covered most non-home categories with specific rules.
    const newCategory = rule?.category ?? "Shtëpi";
    const subcategory = rule?.subcategory ?? "Të tjera";

    const newTags = [subcategory];

    const catChanged = p.category !== newCategory;
    const tagsChanged =
      p.tags.length !== newTags.length ||
      p.tags.some((t, i) => t !== newTags[i]);

    if (catChanged || tagsChanged) {
      await db.product.update({
        where: { id: p.id },
        data: { category: newCategory, tags: newTags },
      });
      changedCount++;
    }

    catCounts[newCategory] = (catCounts[newCategory] || 0) + 1;
    if (subcategory) subcatCounts[subcategory] = (subcatCounts[subcategory] || 0) + 1;
  }

  console.log(`\n✓ Updated ${changedCount}/${products.length} products`);
  console.log("\nCategory breakdown:");
  for (const [cat, c] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${c}`);
  }

  console.log("\nTop 25 subcategories:");
  for (const [sc, c] of Object.entries(subcatCounts).sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    console.log(`  ${sc}: ${c}`);
  }

  // ────────────────────────── Collection membership
  console.log("\n→ Rebuilding collection memberships...");
  const collections = await db.collection.findMany();
  const collMap = new Map(collections.map((c) => [c.slug, c.id]));

  // Wipe all non-curated collection memberships for category-driven collections
  // (preserve: te-rejat, me-te-shitura, dhurata, ide-per-dhurata, nen-10, oferta)
  const curatedSlugs = new Set(["te-rejat", "me-te-shitura", "dhurata", "ide-per-dhurata", "nen-10", "oferta"]);
  const categoryDrivenColls = collections.filter((c) => !curatedSlugs.has(c.slug));
  for (const c of categoryDrivenColls) {
    const n = await db.productCollection.deleteMany({ where: { collectionId: c.id } });
    if (n.count > 0) console.log(`  cleared ${c.slug}: ${n.count}`);
  }

  // Re-assign based on category
  const refreshed = await db.product.findMany({
    select: { id: true, category: true, price: true },
  });

  let assigned = 0;
  for (const p of refreshed) {
    const slugs = CATEGORY_TO_COLLECTIONS[p.category] || [];
    for (const slug of slugs) {
      const cid = collMap.get(slug);
      if (!cid) continue;
      try {
        await db.productCollection.create({
          data: { productId: p.id, collectionId: cid },
        });
        assigned++;
      } catch {}
    }

    // Under-10 collection
    if (Number(p.price) <= 10 && p.price !== null) {
      const cid = collMap.get("nen-10");
      if (cid) {
        try {
          await db.productCollection.create({
            data: { productId: p.id, collectionId: cid },
          });
        } catch {}
      }
    }
  }
  console.log(`✓ Created ${assigned} new category-collection memberships`);

  // Final counts
  console.log("\nCollection counts after rebuild:");
  for (const c of collections) {
    const n = await db.productCollection.count({ where: { collectionId: c.id } });
    console.log(`  ${c.slug}: ${n}`);
  }

  await db.$disconnect();
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
