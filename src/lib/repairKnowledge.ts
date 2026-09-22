// FixLens AI Repair Knowledge Engine
// Strictly scoped to low-risk household repairs (loose screws, cabinet hinges,
// drawer handles, torn bags, bicycle chain) and explicit hard blocking for
// electrical, gas, vehicle-brake, structural, and medical hazards.

export type RepairStep = {
  order: number;
  title: string;
  description: string;
  durationSeconds: number;
  tip?: string;
};

export type DangerAlert = {
  title: string;
  hazardType: string;
  explanation: string;
  emergencyAction: string;
  requiredSpecialist: string;
};

export type RepairTemplate = {
  category: string;
  label: string;
  emoji: string;
  isDiySafe: boolean;
  isDangerous: boolean;
  dangerCategory?: "electrical" | "gas" | "vehicle_brake" | "structural" | "medical" | "hazardous_plumbing";
  dangerAlert?: DangerAlert;
  objectLabels: string[];
  damageSummaries: string[];
  severity: "minor" | "moderate" | "severe";
  difficulty: "easy" | "medium" | "hard";
  safetyLevel: "safe" | "caution" | "unsafe";
  timeMinutes: [number, number];
  costRange: [number, number];
  tools: string[];
  materials: string[];
  safetyNotes: string[];
  steps: Omit<RepairStep, "order">[];
  narrationEn: string;
  narrationTa: string;
  animationType: "screw_tighten" | "hinge_align" | "handle_fasten" | "fabric_stitch" | "chain_mount" | "danger_lock";
};

// 5 Strict MVP Low-Risk Categories (Safe for DIY)
export const MVP_ALLOWED_CATEGORIES = [
  { value: "loose_furniture_screws", label: "Loose Furniture Screws", emoji: "🪑" },
  { value: "cabinet_hinges", label: "Cabinet Hinges", emoji: "🚪" },
  { value: "drawer_handles", label: "Drawer Handles & Knobs", emoji: "🗄️" },
  { value: "torn_bags", label: "Torn Bags & Backpacks", emoji: "🎒" },
  { value: "bicycle_chain", label: "Basic Bicycle-Chain Issues", emoji: "🚲" },
] as const;

// Blocked Dangerous Categories (Hard Safety Lock)
export const DANGEROUS_CATEGORIES = [
  { value: "electrical", label: "Electrical / Wiring / Outlets", emoji: "⚡" },
  { value: "gas", label: "Gas Stoves / LPG Cylinders / Regulators", emoji: "🔥" },
  { value: "vehicle_brake", label: "Vehicle Brakes / Brake Lines", emoji: "🚗" },
  { value: "structural", label: "Structural Wall / Foundation Cracks", emoji: "🧱" },
  { value: "medical", label: "Medical Devices / Oxygen Equipment", emoji: "🩺" },
  { value: "hazardous_plumbing", label: "High-Pressure Water Mains / Geysers", emoji: "🚰" },
] as const;

export const CATEGORY_OPTIONS = [
  ...MVP_ALLOWED_CATEGORIES,
  ...DANGEROUS_CATEGORIES,
] as const;

export const REPAIR_TEMPLATES: Record<string, RepairTemplate> = {
  // 1. Loose Furniture Screws
  loose_furniture_screws: {
    category: "loose_furniture_screws",
    label: "Loose Furniture Screws",
    emoji: "🪑",
    isDiySafe: true,
    isDangerous: false,
    objectLabels: ["Wooden dining chair leg", "Study desk corner joint", "Bookshelf bracket screw", "Bed frame support bolt"],
    damageSummaries: [
      "Loose Phillips screw rocking in chair leg joint",
      "Stripped screw hole causing table corner wobbling",
      "Backing-out screw on wooden bed rail joint",
    ],
    severity: "minor",
    difficulty: "easy",
    safetyLevel: "safe",
    timeMinutes: [10, 20],
    costRange: [20, 100],
    tools: ["Phillips #2 screwdriver", "Slot screwdriver", "Wooden toothpicks or matchsticks", "Utility knife"],
    materials: ["PVA Wood glue", "Replacement screw (4x35mm)", "Thread-lock paste (optional)"],
    safetyNotes: [
      "Ensure the furniture is fully unloaded and resting upside-down on a soft cloth before tightening.",
      "Do not overtighten screws into particle board or MDF to avoid stripping the wooden fibers.",
    ],
    steps: [
      {
        title: "Unload and invert furniture",
        description: "Turn the chair or table upside down onto a rug or blanket so you have direct, stable access to the screw joint.",
        durationSeconds: 3,
        tip: "Inspect the screw head to ensure you use the exact right screwdriver bit size.",
      },
      {
        title: "Inspect hole for stripped thread",
        description: "Back the screw out 2-3 turns. If it spins freely without biting into the wood, the screw hole is stripped.",
        durationSeconds: 3,
        tip: "A stripped hole can easily be shimmed using wooden toothpicks and wood glue.",
      },
      {
        title: "Shim the hole with glue & toothpicks",
        description: "Dip 2-3 wooden toothpicks into wood glue, pack them tightly into the stripped screw hole, and trim flush with the surface.",
        durationSeconds: 3,
        tip: "The wooden toothpicks provide fresh dense grain for the screw threads to grip.",
      },
      {
        title: "Drive the screw firmly home",
        description: "Drive the screw clockwise straight into the shimmed hole until the head sits flush and snug against the metal bracket.",
        durationSeconds: 3,
        tip: "Stop once firm resistance is felt — do not over-torque.",
      },
      {
        title: "Stability check",
        description: "Set the furniture upright and apply gentle downward rocking pressure to confirm the joint is rock-solid.",
        durationSeconds: 3,
        tip: "Allow glue to cure for 1 hour before full heavy use.",
      },
    ],
    narrationEn:
      "Fixing loose furniture screws is a quick, safe DIY repair. Remove the screw, check the hole for stripping, pack a wooden toothpick with glue if loose, and drive the screw tight with a Phillips screwdriver.",
    narrationTa:
      "தளபாடங்களில் உள்ள தளர்வான திருகுகளை சரிசெய்வது எளிதான, பாதுகாப்பான பழுது. திருகை கழற்றி, மர பசை மற்றும் பற்பசையை கொண்டு துளையை சரிசெய்து, திருகு திருப்பி கொண்டு இறுக்கமாக பொருத்தவும்.",
    animationType: "screw_tighten",
  },

  // 2. Cabinet Hinges
  cabinet_hinges: {
    category: "cabinet_hinges",
    label: "Cabinet Hinges",
    emoji: "🚪",
    isDiySafe: true,
    isDangerous: false,
    objectLabels: ["Kitchen cabinet door", "Wardrobe hinge plate", "Bathroom vanity cabinet door", "Shoe rack cabinet hinge"],
    damageSummaries: [
      "Upper hinge plate loose from cabinet carcass causing 15mm door sag",
      "Cup hinge mounting screws pulled out of pressed wood door",
      "Hinge depth adjustment screw loosened causing door rubbing",
    ],
    severity: "minor",
    difficulty: "easy",
    safetyLevel: "safe",
    timeMinutes: [15, 30],
    costRange: [30, 150],
    tools: ["Phillips #2 screwdriver", "Wooden dowel or golf tee", "Hammer (small)", "Ruler / Level"],
    materials: ["Wood glue", "Hinge repair mounting plate (optional)", "Longer wood screws (4x25mm)"],
    safetyNotes: [
      "Have a second person support the cabinet door or prop a book stack underneath so it doesn't drop while unscrewing.",
      "Work with the cabinet door open at a 90-degree angle to avoid bending the hinge arms.",
    ],
    steps: [
      {
        title: "Support door and inspect hinge",
        description: "Place books or a wooden wedge underneath the cabinet door to take the weight off the sagging hinge.",
        durationSeconds: 3,
        tip: "Relieving door weight prevents further strain on the remaining screws.",
      },
      {
        title: "Remove loose mounting screws",
        description: "Unscrew the loose hinge screws from the cabinet wall plate and remove any loose wood fragments from the holes.",
        durationSeconds: 3,
        tip: "Check whether the hole in the cabinet carcass is enlarged.",
      },
      {
        title: "Reinforce mounting holes",
        description: "Coat a wooden plug or matchsticks in wood glue, drive into the stripped hole, cut flush, and let set for 5 minutes.",
        durationSeconds: 3,
        tip: "For badly damaged MDF, a metal hinge repair bracket can be screwed over the area.",
      },
      {
        title: "Re-anchor hinge plate",
        description: "Position the hinge back against the mounting mark and screw in firmly using 20mm or 25mm replacement wood screws.",
        durationSeconds: 3,
        tip: "Use hand screwdriver rather than a power drill to avoid stripping.",
      },
      {
        title: "Fine-tune door alignment",
        description: "Turn the horizontal adjustment screw on the hinge arm clockwise or counter-clockwise until door gaps are even.",
        durationSeconds: 3,
        tip: "The front screw controls side-to-side gap; the rear screw controls door depth.",
      },
    ],
    narrationEn:
      "Your cabinet door is sagging due to loose hinge mounting screws. Support the door from below, reinforce the stripped screw holes with glue and dowels, secure the hinge plate, and fine-tune the adjustment screws.",
    narrationTa:
      "அலமாரி கதவின் கீல் தளர்ந்து கதவு கீழே சாய்ந்துள்ளது. கதவை கீழிருந்து தாங்கி பிடித்து, கீல் துளைகளை சரிசெய்து, கீல் தகட்டை இறுக்கமாக பொருத்தி கதவை நேராக சீரமைக்கவும்.",
    animationType: "hinge_align",
  },

  // 3. Drawer Handles
  drawer_handles: {
    category: "drawer_handles",
    label: "Drawer Handles & Knobs",
    emoji: "🗄️",
    isDiySafe: true,
    isDangerous: false,
    objectLabels: ["Study desk drawer handle", "Kitchen drawer pull", "Wardrobe drawer knob", "Nightstand drawer handle"],
    damageSummaries: [
      "Wobbly metal drawer pull with loosened interior machine screw",
      "Detached wooden drawer knob with stripped bolt thread",
      "Loose drawer handle causing faceplate scratching during pull",
    ],
    severity: "minor",
    difficulty: "easy",
    safetyLevel: "safe",
    timeMinutes: [10, 15],
    costRange: [15, 60],
    tools: ["Phillips or flat-head screwdriver", "Pliers or adjustable wrench"],
    materials: ["M4 machine screw (matching length)", "Spring lock washer or flat washer", "Blue thread-locking fluid"],
    safetyNotes: [
      "Ensure drawer is pulled out safely so you can comfortably reach the rear screw heads without straining.",
      "Check that the screw length matches the drawer face thickness plus handle depth.",
    ],
    steps: [
      {
        title: "Open and empty the drawer",
        description: "Pull the drawer out and remove items near the front so you have clear visual and mechanical access to the inside face.",
        durationSeconds: 3,
        tip: "Some drawers can be lifted out of their slides for even easier working.",
      },
      {
        title: "Inspect screw and handle thread",
        description: "Unscrew the bolt from inside the drawer. Inspect the handle thread for dirt or stripped metal shavings.",
        durationSeconds: 3,
        tip: "If the screw is too long, the handle wobbles even when fully tightened.",
      },
      {
        title: "Add washer & thread-locker",
        description: "Slide a small spring lock washer onto the screw from the inside, and apply a drop of blue threadlocker to the screw threads.",
        durationSeconds: 3,
        tip: "The lock washer prevents vibrations from loosening the handle over time.",
      },
      {
        title: "Tighten handle firmly in place",
        description: "Hold the exterior handle firmly against the front face with one hand while driving the screw tight from the inside with the other.",
        durationSeconds: 3,
        tip: "Tighten both screws evenly on two-screw drawer pulls.",
      },
      {
        title: "Test pull resistance",
        description: "Pull the drawer open and push closed firmly multiple times to verify there is zero play or wobble in the handle.",
        durationSeconds: 3,
        tip: "Check that the handle sits perfectly horizontal and parallel to the drawer top.",
      },
    ],
    narrationEn:
      "This drawer handle is wobbly. Open the drawer, remove the interior screw, add a lock washer with threadlocker, hold the handle straight, and tighten firmly from inside.",
    narrationTa:
      "இழுப்பறை கைப்பிடி ஆடுகிறது. டிராயரை திறந்து, உட்புற திருகை கழற்றி, வாஷரை வைத்து, கைப்பிடியை நேராக பிடித்து உள்ளிருந்து திருப்புளி மூலம் இறுக்கமாக மாட்டவும்.",
    animationType: "handle_fasten",
  },

  // 4. Torn Bags & Backpacks
  torn_bags: {
    category: "torn_bags",
    label: "Torn Bags & Backpacks",
    emoji: "🎒",
    isDiySafe: true,
    isDangerous: false,
    objectLabels: ["Student backpack shoulder strap", "Canvas tote bag seam", "Travel duffel bag seam tear", "Laptop backpack handle seam"],
    damageSummaries: [
      "Shoulder strap seam separating from main backpack body under weight load",
      "Split seam along side pocket of nylon backpack",
      "Torn bottom corner seam on canvas book bag",
    ],
    severity: "minor",
    difficulty: "easy",
    safetyLevel: "safe",
    timeMinutes: [15, 30],
    costRange: [25, 80],
    tools: ["Heavy-duty sewing needle (#16 or #18)", "Sewing thimble", "Fabric scissors", "Sewing pins / clips"],
    materials: ["Heavy-duty bonded nylon or polyester thread", "Fabric adhesive / fray check (optional)", "Nylon webbing patch (for heavy straps)"],
    safetyNotes: [
      "Use a thimble to push the needle through thick cordura or leather bag layers to protect your fingers.",
      "Keep sharp needles and shears away from children and pets.",
    ],
    steps: [
      {
        title: "Trim frayed threads",
        description: "Snip frayed or tangled loose threads around the torn bag seam cleanly with fabric scissors.",
        durationSeconds: 3,
        tip: "Do not pull loose threads with force as this unravels surrounding good stitches.",
      },
      {
        title: "Pin and align torn edges",
        description: "Tuck 5mm of seam allowance inward and clip or pin the torn edges together along the original seamline.",
        durationSeconds: 3,
        tip: "For shoulder straps, overlap the strap end 15mm inside the bag seam for maximum strength.",
      },
      {
        title: "Thread needle with double strand",
        description: "Thread a heavy-duty needle with bonded nylon thread, double it over, and tie a secure double knot at the end.",
        durationSeconds: 3,
        tip: "Heavy-duty nylon thread has 3x the tensile strength of regular cotton thread.",
      },
      {
        title: "Sew reinforced backstitch",
        description: "Sew a tight backstitch along the seam line, overlapping 10mm into the undamaged stitching on both sides for reinforcement.",
        durationSeconds: 3,
        tip: "For heavy load straps, stitch a 'box with an X' pattern across the strap joint.",
      },
      {
        title: "Knot and stress-test",
        description: "Pass needle through the loop twice to make a locking knot, trim thread, and pull firmly on the strap to verify strength.",
        durationSeconds: 3,
        tip: "Apply a tiny dab of fabric glue over the knot to prevent it from ever coming undone.",
      },
    ],
    narrationEn:
      "The seam of this bag is torn. Trim loose threads, align the torn seam edges, thread a needle with heavy-duty nylon thread, and sew a reinforced backstitch across the tear.",
    narrationTa:
      "இந்த பையின் தையல் பிரிந்துள்ளது. தளர்வான நூல்களை வெட்டி, ஓரங்களை சீராக இணைத்து, நைலான் நூல் மற்றும் ஊசியை கொண்டு வலுவான பின் தையல் போட்டு சரிசெய்யவும்.",
    animationType: "fabric_stitch",
  },

  // 5. Basic Bicycle-Chain Issues
  bicycle_chain: {
    category: "bicycle_chain",
    label: "Basic Bicycle-Chain Issues",
    emoji: "🚲",
    isDiySafe: true,
    isDangerous: false,
    objectLabels: ["Commuter bicycle chain", "Geared bicycle drivetrain", "Single-speed cycle chain", "Kids bicycle chain"],
    damageSummaries: [
      "Slipped bicycle chain dropped off front chainring onto bottom bracket shell",
      "Dry, squeaking chain with stiff link causing pedal skipping",
      "Slack chain rubbing against chainstay after gear change",
    ],
    severity: "minor",
    difficulty: "easy",
    safetyLevel: "safe",
    timeMinutes: [10, 20],
    costRange: [30, 150],
    tools: ["Work gloves / nitrile gloves", "Clean rag or microfiber cloth", "Flathead screwdriver (for chain guide)"],
    materials: ["Bicycle chain lubricant (dry or wet lube)", "Degreaser spray (optional)"],
    safetyNotes: [
      "Never place fingers directly between the chain and cog teeth while the wheel or crank is moving.",
      "Work with the bicycle resting upside down on handlebar and saddle, or mounted on a kickstand.",
    ],
    steps: [
      {
        title: "Stabilize bicycle & shift derailleur",
        description: "Set bike upside down on its handlebars and saddle, or support on kickstand. Set shifter to the smallest rear cog.",
        durationSeconds: 3,
        tip: "Setting to the smallest cog relieves chain tension, making it much easier to handle.",
      },
      {
        title: "Push derailleur cage forward for slack",
        description: "Wearing gloves, push the lower rear derailleur cage arm gently forward toward the front of the bike to create slack.",
        durationSeconds: 3,
        tip: "Pushing the derailleur relieves all spring tension on the chain.",
      },
      {
        title: "Guide chain onto chainring teeth",
        description: "Lift the fallen chain and engage the lower chain links onto the bottom teeth of the front chainring.",
        durationSeconds: 3,
        tip: "Ensure inner and outer link plates nest cleanly over the chainring teeth.",
      },
      {
        title: "Slowly rotate pedals forward",
        description: "While holding the chain in place, turn the crank arm forward by hand one full revolution until the chain wraps fully around.",
        durationSeconds: 3,
        tip: "Rotate slowly to prevent fingers from being pinched near the chain guard.",
      },
      {
        title: "Clean and apply chain lube",
        description: "Wipe road grime off with a rag, then apply one drop of bicycle chain lube to each link roller and wipe off excess.",
        durationSeconds: 3,
        tip: "Never use cooking oil or WD-40 as chain lubricant — use dedicated bicycle chain lube.",
      },
    ],
    narrationEn:
      "Your bicycle chain has slipped off the cogs. Shift to the smallest gear, push the rear derailleur cage forward to create slack, guide the chain onto the chainring teeth, and rotate the pedals forward slowly.",
    narrationTa:
      "சைக்கிள் சங்கிலி பற்சக்கரத்திலிருந்து நழுவியுள்ளது. பின்புற கியரை மாற்றி, சங்கிலியை தளர்த்தி, பற்களின் மீது சங்கிலியை சரியாக பொருத்தி, பெடலை மெதுவாக சுழற்றவும்.",
    animationType: "chain_mount",
  },

  // --------------------------------------------------------------------------
  // STRICTLY BLOCKED DANGEROUS REPAIR CATEGORIES (Hard DIY Lock + Escalation)
  // --------------------------------------------------------------------------

  // DANGER 1: Electrical Wiring & Components
  electrical: {
    category: "electrical",
    label: "Electrical / Wiring / Outlets",
    emoji: "⚡",
    isDiySafe: false,
    isDangerous: true,
    dangerCategory: "electrical",
    dangerAlert: {
      title: "CRITICAL DANGER: Electrical Shock & Fire Hazard",
      hazardType: "230V Mains Electrocution & Electrical Arcing",
      explanation:
        "Damaged electrical cables, sparking sockets, internal appliance wiring, and breaker panels present immediate lethal shock and fire hazards. Tampering with 230V mains electricity without certification is illegal and hazardous.",
      emergencyAction:
        "1. DO NOT touch exposed copper wires or sparking sockets.\n2. Immediately turn OFF the main circuit breaker (MCB) in your distribution board.\n3. Keep children and moisture away from the affected area.\n4. Call a certified, licensed electrician immediately.",
      requiredSpecialist: "Licensed Electrical Contractor / Certified Wireman",
    },
    objectLabels: ["Exposed power cable", "Sparking wall switch / socket", "Electrical distribution panel", "Geyser power supply cord"],
    damageSummaries: [
      "Frayed high-voltage power cord with exposed live copper strands",
      "Scorched wall outlet with burning smell and intermittent arcing",
      "Loose mains wiring terminal inside high-power appliance",
    ],
    severity: "severe",
    difficulty: "hard",
    safetyLevel: "unsafe",
    timeMinutes: [60, 180],
    costRange: [500, 2500],
    tools: ["Insulated electrician tools (1000V rated)", "Digital multimeter", "Voltage detector pen"],
    materials: ["Certified ISI-marked wiring", "Modular socket replacement", "MCB circuit breaker"],
    safetyNotes: [
      "STOP: FixLens has locked DIY instructions for this repair.",
      "Mains electricity causes involuntary muscle contraction, severe internal burns, and cardiac arrest.",
      "Always hire a licensed electrical technician.",
    ],
    steps: [
      {
        title: "SAFETY HARD-LOCK ACTIVE",
        description: "FixLens strictly prohibits DIY repairs on electrical wiring. Turn off the main electrical breaker immediately and contact a certified electrician.",
        durationSeconds: 15,
        tip: "Do not attempt to patch exposed 230V power cords with tape.",
      },
    ],
    narrationEn:
      "DANGER: This electrical repair has been blocked by FixLens AI safety check. Working with live electrical wires carries severe risk of fatal electric shock and fire. Turn off the main circuit breaker immediately and escalate to a licensed electrician.",
    narrationTa:
      "ஆபத்து: மின்சார பழுதுகளை FixLens பாதுகாப்பு தடை செய்துள்ளது. உயிருக்கு ஆபத்தான மின் அதிர்ச்சி மற்றும் தீ விபத்து ஏற்பட வாய்ப்புள்ளதால், மின் இணைப்பை உடனே துண்டித்து தகுதிவாய்ந்த மின் நிபுணரை அணுகவும்.",
    animationType: "danger_lock",
  },

  // DANGER 2: Gas & LPG Systems
  gas: {
    category: "gas",
    label: "Gas Stoves / LPG Cylinders / Regulators",
    emoji: "🔥",
    isDiySafe: false,
    isDangerous: true,
    dangerCategory: "gas",
    dangerAlert: {
      title: "CRITICAL DANGER: Gas Explosion & Asphyxiation Hazard",
      hazardType: "Pressurized LPG Gas Leakage & Flame Explosion",
      explanation:
        "LPG gas cylinders, gas stove valves, regulators, and gas water heaters are under high pressure. Even a microscopic leak or friction spark can ignite gas vapors and trigger an explosive fireball.",
      emergencyAction:
        "1. DO NOT turn on/off ANY electrical switches or use mobile phones in the room.\n2. Put out all open flames, incense, or pilot lights immediately.\n3. Turn the LPG cylinder knob clockwise to the OFF position.\n4. Open all windows and doors for full ventilation.\n5. Evacuate the premises and contact your LPG distributor emergency helpline.",
      requiredSpecialist: "Authorized LPG Distributor Technician / Gas Pipe Specialist",
    },
    objectLabels: ["LPG cylinder regulator", "Gas stove rubber hose (Suraksha)", "Gas stove burner manifold", "Gas geyser valve"],
    damageSummaries: [
      "Hissing sound and rotten-egg mercaptan odor from LPG regulator connection",
      "Cracked, stiffened gas supply hose with surface micro-fissures",
      "Stuck gas burner control knob with continuous minor gas seepage",
    ],
    severity: "severe",
    difficulty: "hard",
    safetyLevel: "unsafe",
    timeMinutes: [30, 90],
    costRange: [400, 1800],
    tools: ["Pressure gauge detector", "Soap solution leak tester", "Brass flare wrenches"],
    materials: ["BIS approved Suraksha steel-braided gas hose", "Certified LPG regulator"],
    safetyNotes: [
      "STOP: FixLens has locked DIY instructions for this repair.",
      "LPG is heavier than air and pools at floor level, creating an explosive blanket.",
      "Never use matches or lighters to test for gas leaks.",
    ],
    steps: [
      {
        title: "SAFETY HARD-LOCK ACTIVE",
        description: "FixLens strictly prohibits DIY repairs on gas appliances. Shut off the gas cylinder valve immediately, ventilate the area, and call emergency gas support.",
        durationSeconds: 15,
        tip: "Evacuate the area if strong gas odor persists.",
      },
    ],
    narrationEn:
      "CRITICAL ALERT: Gas repairs are blocked by FixLens. Gas leaks pose extreme risk of explosion and fire. Turn off the cylinder valve, open all windows, do not touch electrical switches, and call your gas distributor emergency helpline immediately.",
    narrationTa:
      "அபாயம்: எரிவாயு பழுதுகளை நீங்களே செய்வது தடை செய்யப்பட்டுள்ளது. சிலிண்டர் வால்வை உடனே மூடி, ஜன்னல்களை திறந்து, மின் சுவிட்சுகளை இயக்காமல், அவசர எரிவாயு சேவை மையத்தை தொடர்பு கொள்ளவும்.",
    animationType: "danger_lock",
  },

  // DANGER 3: Vehicle Brakes & Hydraulics
  vehicle_brake: {
    category: "vehicle_brake",
    label: "Vehicle Brakes / Brake Lines",
    emoji: "🚗",
    isDiySafe: false,
    isDangerous: true,
    dangerCategory: "vehicle_brake",
    dangerAlert: {
      title: "LIFE SAFETY DANGER: Vehicle Braking Failure Hazard",
      hazardType: "Automotive Brake Failure & Road Collision Risk",
      explanation:
        "Car, scooter, and motorcycle brakes are life-critical safety systems. Incorrect brake bleeding, contaminated friction pads, or improper caliper torque leads to sudden complete stopping failure on public roads.",
      emergencyAction:
        "1. DO NOT drive or ride the vehicle under any circumstances.\n2. Park the vehicle safely on a level surface with parking/handbrake engaged.\n3. Book an authorized automotive mechanic or towing service to a certified garage.",
      requiredSpecialist: "Certified Automotive Mechanic / Brake Specialist",
    },
    objectLabels: ["Car disc brake caliper", "Motorcycle front disc brake", "Scooter drum brake cable", "Brake master cylinder"],
    damageSummaries: [
      "Spongy brake lever traveling to the handlebar with brake fluid seepage",
      "Metal-on-metal grinding sound from worn-out disc brake pads",
      "Frayed scooter rear brake cable near the wheel lever attachment",
    ],
    severity: "severe",
    difficulty: "hard",
    safetyLevel: "unsafe",
    timeMinutes: [60, 150],
    costRange: [800, 4500],
    tools: ["Calibrated torque wrench", "Brake bleeder kit", "Piston compression tool"],
    materials: ["OEM brake pads / shoes", "DOT 4 certified brake fluid", "New brake cable"],
    safetyNotes: [
      "STOP: FixLens has locked DIY instructions for this repair.",
      "Air bubbles in hydraulic lines cause total loss of braking ability at high speed.",
      "Automotive brakes must be serviced and road-tested by certified technicians.",
    ],
    steps: [
      {
        title: "SAFETY HARD-LOCK ACTIVE",
        description: "FixLens strictly prohibits DIY repairs on vehicle braking systems. Do not drive or ride this vehicle. Escalate to a certified mechanic.",
        durationSeconds: 15,
        tip: "Vehicle brakes require certified torque specifications and hydraulic pressure bleeding.",
      },
    ],
    narrationEn:
      "DANGER: Vehicle brake repairs are strictly blocked by FixLens. Faulty brake work causes catastrophic loss of stopping control on roads. Do not drive this vehicle. Escalate immediately to an authorized automotive mechanic.",
    narrationTa:
      "எச்சரிக்கை: வாகன பிரேக் பழுதுகள் FixLens-ஆல் தடை செய்யப்பட்டுள்ளது. பிரேக் கோளாறு கடுமையான விபத்தை உண்டாக்கும். வாகனத்தை இயக்காமல் தகுதிவாய்ந்த ஆட்டோமொபைல் மெக்கானிக்கை அணுகவும்.",
    animationType: "danger_lock",
  },

  // DANGER 4: Structural Wall & Foundation Cracks
  structural: {
    category: "structural",
    label: "Structural Wall / Foundation Cracks",
    emoji: "🧱",
    isDiySafe: false,
    isDangerous: true,
    dangerCategory: "structural",
    dangerAlert: {
      title: "STRUCTURAL DANGER: Foundation & Building Integrity Risk",
      hazardType: "Load-Bearing Wall Fracture & Structural Settlement",
      explanation:
        "Diagonal or stair-step cracks exceeding 5mm across brickwork, reinforced concrete pillars, beams, or ceilings indicate structural movement, foundation subsidence, or shear failure. Superficial plaster patching conceals catastrophic structural weakness.",
      emergencyAction:
        "1. Do not apply heavy loads or drill into the cracked wall or pillar.\n2. Keep children away from cracked ceilings or sagging lintels.\n3. Take multiple dated photographs to monitor whether the crack is widening.\n4. Call a licensed civil engineer or structural auditor for an immediate site inspection.",
      requiredSpecialist: "Licensed Civil Engineer / Certified Structural Auditor",
    },
    objectLabels: ["Load-bearing masonry wall", "Concrete beam joint", "Foundation corner wall", "Ceiling slab crack"],
    damageSummaries: [
      "Diagonal stair-step crack wider than 6mm spanning through brick mortar and column",
      "Horizontal displacement crack near foundation base showing brick shearing",
      "Sagging lintel crack above doorway with plaster spalling",
    ],
    severity: "severe",
    difficulty: "hard",
    safetyLevel: "unsafe",
    timeMinutes: [120, 360],
    costRange: [2000, 15000],
    tools: ["Crack monitoring gauge / tell-tale", "Ultrasonic pulse tester", "Hammer drill"],
    materials: ["Epoxy structural injection resin", "Carbon fiber reinforcement mesh", "Structural mortar"],
    safetyNotes: [
      "STOP: FixLens has locked DIY instructions for this repair.",
      "Structural cracks are symptoms of foundation movement or overload, not surface cosmetics.",
      "Covering a structural crack with putty risks sudden structural collapse.",
    ],
    steps: [
      {
        title: "SAFETY HARD-LOCK ACTIVE",
        description: "FixLens strictly prohibits DIY repairs on structural cracks. Do not tamper with load-bearing walls. Escalate to a licensed civil or structural engineer.",
        durationSeconds: 15,
        tip: "A structural engineer must inspect foundation settlement before any remediation.",
      },
    ],
    narrationEn:
      "WARNING: This structural crack repair has been blocked by FixLens. Large or diagonal wall fissures indicate structural movement and risk building collapse. Do not attempt DIY cosmetic filling. Escalate to a licensed structural engineer.",
    narrationTa:
      "எச்சரிக்கை: இந்த கட்டமைப்பு விரிசல் FixLens-ஆல் தடை செய்யப்பட்டுள்ளது. தூண் அல்லது சுவரில் உள்ள பெரிய விரிசல்கள் கட்டிடத்தின் உறுதிக்கு ஆபத்து விளைவிக்கும். நீங்களே பூசாமல் கட்டடப் பொறியாளரை அணுகவும்.",
    animationType: "danger_lock",
  },

  // DANGER 5: Medical Devices & Equipment
  medical: {
    category: "medical",
    label: "Medical Devices / Oxygen Equipment",
    emoji: "🩺",
    isDiySafe: false,
    isDangerous: true,
    dangerCategory: "medical",
    dangerAlert: {
      title: "MEDICAL DANGER: Life-Support & Regulatory Safety Risk",
      hazardType: "Medical Device Failure & Inaccurate Dosimetry / Flow",
      explanation:
        "Medical oxygen concentrators, regulators, CPAP/BiPAP units, dialysis pumps, and powered mobility devices sustain patient life. Unauthorized DIY disassembly or component substitution can cause oxygen fires, toxic contamination, or lethal failure.",
      emergencyAction:
        "1. Switch the patient immediately to a verified backup oxygen supply or medical unit if in use.\n2. Contact the medical device manufacturer or hospital supplier emergency service.\n3. Do not attempt to open sealed medical electronic housings or oxygen valves.",
      requiredSpecialist: "Certified Biomedical Equipment Technician (BMET)",
    },
    objectLabels: ["Oxygen concentrator flow valve", "Nebulizer compressor unit", "CPAP air pressure connector", "Electric wheelchair drive axle"],
    damageSummaries: [
      "Cracked oxygen pressure regulator valve showing pressure drop",
      "Overheating CPAP motor housing emitting electrical burning odor",
      "Faulty battery connection on patient motorized wheelchair",
    ],
    severity: "severe",
    difficulty: "hard",
    safetyLevel: "unsafe",
    timeMinutes: [60, 180],
    costRange: [1500, 8000],
    tools: ["Biomedical calibration analyzer", "Flow rate calibrator", "Anti-static toolkit"],
    materials: ["OEM certified medical filters", "FDA/CE approved medical seals"],
    safetyNotes: [
      "STOP: FixLens has locked DIY instructions for this repair.",
      "Oxygen-enriched atmospheres can cause rapid, explosive combustion with even minor sparks or oils.",
      "All medical equipment repairs require biomedical calibration certification.",
    ],
    steps: [
      {
        title: "SAFETY HARD-LOCK ACTIVE",
        description: "FixLens strictly prohibits DIY repairs on medical equipment. Switch patient to backup equipment and contact an authorized biomedical service provider.",
        durationSeconds: 15,
        tip: "Never use oil or petroleum-based lubricants near oxygen equipment.",
      },
    ],
    narrationEn:
      "CRITICAL SAFETY WARNING: Medical device repair is strictly blocked by FixLens. Medical equipment requires certified biomedical technicians to protect patient safety. Escalate to an authorized biomedical equipment specialist immediately.",
    narrationTa:
      "முக்கிய எச்சரிக்கை: மருத்துவ உபகரணங்களை சரிசெய்வது FixLens-ஆல் தடை செய்யப்பட்டுள்ளது. நோயாளியின் பாதுகாப்பிற்காக தகுதிவாய்ந்த மருத்துவ தொழில்நுட்ப நிபுணரை உடனடியாக தொடர்பு கொள்ளவும்.",
    animationType: "danger_lock",
  },

  // DANGER 6: Hazardous High-Pressure Plumbing / Water Mains
  hazardous_plumbing: {
    category: "hazardous_plumbing",
    label: "High-Pressure Water Mains / Geysers",
    emoji: "🚰",
    isDiySafe: false,
    isDangerous: true,
    dangerCategory: "hazardous_plumbing",
    dangerAlert: {
      title: "HIGH-PRESSURE HAZARD: Flooding & Scalding Risk",
      hazardType: "High-Pressure Water Main Burst & Electric Geyser Scalding",
      explanation:
        "Main supply water pipes operate under high hydraulic pressure, and geysers combine pressurized water with high-voltage electricity. A burst main line can flood homes in minutes, and geyser valve tampering risks scalding 90°C water discharge.",
      emergencyAction:
        "1. Turn OFF the main water valve at your overhead tank or municipal meter immediately.\n2. If near an electric water heater, turn OFF its electrical breaker.\n3. Keep electrical appliances away from standing water.\n4. Call a certified master plumber.",
      requiredSpecialist: "Licensed Master Plumber / Certified Geyser Technician",
    },
    objectLabels: ["High-pressure main pipe union", "Electric water geyser pressure relief valve", "Under-floor water supply pipe", "Building riser valve"],
    damageSummaries: [
      "High-pressure burst crack in main water inlet pipe spraying 40 PSI water",
      "Corroded water geyser temperature relief valve weeping boiling water",
      "Fractured main shutoff gate valve spinning without stopping water flow",
    ],
    severity: "severe",
    difficulty: "hard",
    safetyLevel: "unsafe",
    timeMinutes: [60, 180],
    costRange: [600, 3000],
    tools: ["Heavy-duty pipe wrench set", "Pipe threader / cutter", "Pressure testing gauge"],
    materials: ["CPVC/GI schedule 40 pipes", "Brass ball valves", "Industrial PTFE sealant"],
    safetyNotes: [
      "STOP: FixLens has locked DIY instructions for this repair.",
      "High pressure water can damage walls and mix with concealed electrical wiring.",
      "Water geyser pressure relief valves must only be replaced by certified technicians.",
    ],
    steps: [
      {
        title: "SAFETY HARD-LOCK ACTIVE",
        description: "FixLens strictly prohibits DIY repairs on high-pressure water mains and water geysers. Shut off the main water valve and call a certified plumber.",
        durationSeconds: 15,
        tip: "Do not attempt to patch high-pressure mains with tape or putty.",
      },
    ],
    narrationEn:
      "WARNING: High-pressure water main and geyser repairs are blocked by FixLens. High-pressure leaks cause severe flooding and scalding hazards. Shut off the main water valve and escalate to a licensed plumber.",
    narrationTa:
      "எச்சரிக்கை: உயர் அழுத்த குடிநீர் குழாய் மற்றும் கீசர் பழுதுகள் FixLens-ஆல் தடை செய்யப்பட்டுள்ளது. நீர் வால்வை உடனே நிறுத்திவிட்டு சான்றளிக்கப்பட்ட பிளம்பரை அழைக்கவும்.",
    animationType: "danger_lock",
  },
};

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
}

export function pickFrom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export type AnalysisResult = {
  objectLabel: string;
  category: string;
  damageSummary: string;
  damageSeverity: RepairTemplate["severity"];
  damageBox: { x: number; y: number; w: number; h: number };
  difficulty: RepairTemplate["difficulty"];
  estimatedTimeMinutes: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  safetyLevel: RepairTemplate["safetyLevel"];
  safetyNotes: string[];
  isDiySafe: boolean;
  isDangerous: boolean;
  dangerCategory?: string;
  dangerAlert?: DangerAlert;
  steps: RepairStep[];
  tools: string[];
  materials: string[];
  narrationEn: string;
  narrationTa: string;
  animationType: RepairTemplate["animationType"];
};

export function runAiAnalysis(category: string, seed: string): AnalysisResult {
  const template = REPAIR_TEMPLATES[category] ?? REPAIR_TEMPLATES.loose_furniture_screws;
  const rand = seededRandom(seed);

  const timeMinutes =
    template.timeMinutes[0] +
    Math.floor(rand() * (template.timeMinutes[1] - template.timeMinutes[0] + 1));

  const boxWidth = 24 + Math.floor(rand() * 16);
  const boxHeight = 20 + Math.floor(rand() * 14);

  return {
    objectLabel: pickFrom(template.objectLabels, rand),
    category: template.category,
    damageSummary: pickFrom(template.damageSummaries, rand),
    damageSeverity: template.severity,
    damageBox: {
      x: 18 + Math.floor(rand() * (65 - boxWidth)),
      y: 20 + Math.floor(rand() * (60 - boxHeight)),
      w: boxWidth,
      h: boxHeight,
    },
    difficulty: template.difficulty,
    estimatedTimeMinutes: timeMinutes,
    estimatedCostMin: template.costRange[0],
    estimatedCostMax: template.costRange[1],
    safetyLevel: template.safetyLevel,
    safetyNotes: template.safetyNotes,
    isDiySafe: template.isDiySafe,
    isDangerous: template.isDangerous,
    dangerCategory: template.dangerCategory,
    dangerAlert: template.dangerAlert,
    steps: template.steps.map((s, i) => ({ ...s, order: i + 1 })),
    tools: template.tools,
    materials: template.materials,
    narrationEn: template.narrationEn,
    narrationTa: template.narrationTa,
    animationType: template.animationType,
  };
}

export function getTemplate(category: string): RepairTemplate {
  return REPAIR_TEMPLATES[category] ?? REPAIR_TEMPLATES.loose_furniture_screws;
}
