export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type Risk = "low" | "medium" | "high" | "extreme";

export interface FaultEntry {
  symptom: string;
  likelyFault: string;
  repairCost: { min: number; max: number };
  difficulty: Difficulty;
  risk: Risk;
  successRate: number;
  timeHours: number;
  partsNeeded: string[];
  steps: string[];
  warnings: string[];
  tools: string[];
}

export interface DeviceFaults {
  device: string;
  brands?: string[];
  faults: FaultEntry[];
}

export const faultDatabase: DeviceFaults[] = [
  {
    device: "Nintendo Switch / Switch OLED",
    faults: [
      {
        symptom: "Joy-Con stick drift",
        likelyFault: "Worn analog stick module",
        repairCost: { min: 2, max: 8 },
        difficulty: "beginner",
        risk: "low",
        successRate: 97,
        timeHours: 0.5,
        partsNeeded: ["Replacement analog stick module (£2-5 each)"],
        tools: ["Tri-wing screwdriver", "JIS screwdriver", "Spudger"],
        steps: [
          "Remove Joy-Con rail screws (tri-wing)",
          "Carefully detach back shell",
          "Unplug battery connector",
          "Remove 3 JIS screws holding analog module",
          "Lift old module, press new one in",
          "Reassemble and test"
        ],
        warnings: ["Ribbon cables tear easily — lift ZIF connectors straight up"]
      },
      {
        symptom: "No power / won't turn on",
        likelyFault: "Dead battery, faulty USB-C port, or M92T36 charging IC",
        repairCost: { min: 5, max: 60 },
        difficulty: "advanced",
        risk: "high",
        successRate: 60,
        timeHours: 2,
        partsNeeded: ["Battery (£8-15)", "USB-C port (£3-6)", "M92T36 IC (£5-15)"],
        tools: ["Tri-wing screwdriver", "JIS screwdriver", "Soldering iron", "Hot air station", "Multimeter"],
        steps: [
          "Try charging for 30 mins first",
          "Test USB-C port for bent pins",
          "Open console and check battery voltage with multimeter",
          "Replace battery if below 2V",
          "If still dead — test M92T36 charging IC",
          "Reflow or replace M92T36 if faulty"
        ],
        warnings: ["If battery is puffed — DO NOT puncture. Dispose safely", "M92T36 requires BGA soldering skills — high risk for beginners"]
      },
      {
        symptom: "HDMI no signal / dock not working",
        likelyFault: "Faulty HDMI chip (BQ24193 or M92T36) or dock issue",
        repairCost: { min: 10, max: 50 },
        difficulty: "advanced",
        risk: "high",
        successRate: 65,
        timeHours: 3,
        partsNeeded: ["HDMI IC chip (£5-15)", "Replacement dock (£15-25)"],
        tools: ["Hot air station", "Flux", "Soldering iron", "BGA balls"],
        steps: [
          "First test with a known-good dock",
          "Test USB-C port for damage",
          "Open console, locate HDMI IC on motherboard",
          "Reflow chip with hot air",
          "If reflow fails — reball and replace IC"
        ],
        warnings: ["HDMI chip is BGA — requires professional hot air work", "Test dock first before opening console"]
      },
      {
        symptom: "Cracked screen",
        likelyFault: "Broken LCD/digitizer",
        repairCost: { min: 25, max: 55 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 90,
        timeHours: 1.5,
        partsNeeded: ["Switch LCD + digitizer assembly (£25-40)", "OCA glue (optional)"],
        tools: ["Tri-wing screwdriver", "JIS screwdriver", "Suction cup", "Heat gun", "Spudger"],
        steps: [
          "Remove all screws from back shell",
          "Carefully pry apart front and back",
          "Disconnect all ribbon cables",
          "Warm old screen with heat gun to soften adhesive",
          "Peel old screen, fit new assembly",
          "Reconnect ribbons, reassemble"
        ],
        warnings: ["OLED screens are 3x the cost of LCD — check model before ordering", "Ribbon cables are fragile"]
      },
      {
        symptom: "Battery drains fast",
        likelyFault: "Degraded battery",
        repairCost: { min: 8, max: 15 },
        difficulty: "beginner",
        risk: "low",
        successRate: 99,
        timeHours: 0.75,
        partsNeeded: ["Nintendo Switch battery (£8-12)"],
        tools: ["Tri-wing screwdriver", "JIS screwdriver", "Spudger"],
        steps: [
          "Remove back shell screws",
          "Disconnect battery connector gently",
          "Unscrew battery bracket",
          "Slide in new battery",
          "Reassemble"
        ],
        warnings: ["Check battery health in settings first (System > Console Info)"]
      }
    ]
  },
  {
    device: "PS5",
    faults: [
      {
        symptom: "Disc not reading",
        likelyFault: "Dirty/faulty disc drive lens",
        repairCost: { min: 10, max: 45 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 80,
        timeHours: 1.5,
        partsNeeded: ["Disc drive laser lens (£10-20)", "Disc drive unit (£30-45)"],
        tools: ["Torx T8/T10 screwdrivers", "Spudger", "Lens cleaning kit"],
        steps: [
          "Remove faceplates and stand",
          "Remove all screws on back panel",
          "Carefully open console",
          "Locate disc drive and disconnect ribbon",
          "Clean lens with isopropyl alcohol",
          "If cleaning fails — replace laser or full drive"
        ],
        warnings: ["PS5 disc drive is paired to motherboard on newer units — replacement drive needs software pairing via PS5 menu"]
      },
      {
        symptom: "Overheating / loud fan",
        likelyFault: "Dust buildup or dry thermal paste",
        repairCost: { min: 3, max: 12 },
        difficulty: "intermediate",
        risk: "low",
        successRate: 95,
        timeHours: 1,
        partsNeeded: ["Thermal paste (£3-5)", "Compressed air"],
        tools: ["Torx T8 screwdriver", "Spudger", "Thermal paste applicator"],
        steps: [
          "Remove faceplates",
          "Open console carefully",
          "Blow out all dust from heatsink and fan",
          "Remove heatsink — clean old paste",
          "Apply fresh thermal paste (rice grain amount)",
          "Reassemble and test under load"
        ],
        warnings: ["Do not overtighten heatsink screws — cracking the APU die is possible"]
      },
      {
        symptom: "No power / won't turn on",
        likelyFault: "Power supply fault, blown fuse, or APU issue",
        repairCost: { min: 20, max: 200 },
        difficulty: "expert",
        risk: "extreme",
        successRate: 40,
        timeHours: 4,
        partsNeeded: ["Power supply unit (£25-50)", "Fuse kit"],
        tools: ["Torx screwdrivers", "Multimeter", "Soldering iron"],
        steps: [
          "Check mains cable and power outlet first",
          "Open console, check PSU for visible damage",
          "Test PSU output with multimeter",
          "Replace PSU if no output",
          "If PSU OK — likely APU/BGA fault (board-level repair)"
        ],
        warnings: ["APU faults = near-total loss. Avoid buying PS5s with 'no power' unless very cheap", "PSU holds dangerous charge — discharge capacitors before touching"]
      },
      {
        symptom: "DualSense stick drift",
        likelyFault: "Worn potentiometer in analog stick",
        repairCost: { min: 3, max: 8 },
        difficulty: "beginner",
        risk: "low",
        successRate: 95,
        timeHours: 0.75,
        partsNeeded: ["DualSense analog stick module (£3-6 each)"],
        tools: ["Phillips screwdriver", "Spudger", "Prying tool"],
        steps: [
          "Remove 4 screws on back of controller",
          "Carefully pry apart shell halves",
          "Unplug battery ribbon",
          "Unscrew and lift old stick module",
          "Press in replacement module",
          "Reassemble and calibrate in PS5 settings"
        ],
        warnings: ["Newer DualSense uses hall effect sticks — check before ordering parts"]
      }
    ]
  },
  {
    device: "Xbox Series X/S",
    faults: [
      {
        symptom: "Disc drive not working",
        likelyFault: "Dirty lens or faulty drive",
        repairCost: { min: 15, max: 50 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 80,
        timeHours: 1.5,
        partsNeeded: ["Disc drive lens (£15-25)", "Full drive unit (£40-55)"],
        tools: ["Torx T9 screwdriver", "Spudger"],
        steps: [
          "Remove vents and side panels",
          "Unscrew internal chassis",
          "Locate disc drive, disconnect ribbon and power",
          "Clean or swap laser unit",
          "Reassemble"
        ],
        warnings: ["Unlike PS5, Xbox Series X drive units are generally plug-and-play replacements"]
      },
      {
        symptom: "Overheating / shutting down",
        likelyFault: "Dust clog or dry thermal paste",
        repairCost: { min: 3, max: 10 },
        difficulty: "intermediate",
        risk: "low",
        successRate: 96,
        timeHours: 1,
        partsNeeded: ["Thermal paste", "Compressed air"],
        tools: ["Torx T9 screwdriver", "Spudger"],
        steps: [
          "Remove all panels",
          "Remove internal chassis screws",
          "Blow out heatsink and fan",
          "Replace thermal paste on APU",
          "Reassemble"
        ],
        warnings: ["Vapour chamber on Series X — do not damage the copper plate"]
      },
      {
        symptom: "Controller stick drift",
        likelyFault: "Worn analog stick potentiometer",
        repairCost: { min: 2, max: 6 },
        difficulty: "beginner",
        risk: "low",
        successRate: 96,
        timeHours: 0.5,
        partsNeeded: ["Xbox analog stick module (£2-5)"],
        tools: ["Torx T6/T8 screwdriver", "Spudger"],
        steps: [
          "Remove battery cover and batteries",
          "Remove grip cover screws",
          "Pry shell apart",
          "Desolder or pull out old stick module",
          "Install replacement",
          "Reassemble"
        ],
        warnings: ["Xbox Elite controllers have more complex internals — budget extra time"]
      }
    ]
  },
  {
    device: "iPhone",
    brands: ["Apple"],
    faults: [
      {
        symptom: "Cracked screen",
        likelyFault: "Broken OLED/LCD and digitizer",
        repairCost: { min: 20, max: 80 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 90,
        timeHours: 1,
        partsNeeded: ["Screen assembly (model-specific, £20-80)"],
        tools: ["Pentalobe screwdriver", "Suction cup", "Spudger", "Heat gun", "Plastic picks"],
        steps: [
          "Power off completely",
          "Remove pentalobe screws at bottom",
          "Apply heat to bottom edge, use suction cup",
          "Carefully pry open — STOP at 90 degrees (cables inside)",
          "Disconnect battery, then screen connectors",
          "Swap screen, transfer earpiece/components if needed",
          "Reconnect all, test before closing"
        ],
        warnings: ["Face ID components are paired — do NOT swap sensors between phones", "iPhone 12+ OLED screens: True Tone requires original screen for full function", "Always disconnect battery first to prevent short circuits"]
      },
      {
        symptom: "Won't charge / dead",
        likelyFault: "Faulty USB-C/Lightning port, Tristar IC, or dead battery",
        repairCost: { min: 5, max: 60 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 75,
        timeHours: 1.5,
        partsNeeded: ["Charging port flex (£5-15)", "Battery (£10-20)", "Tristar IC (£5-20)"],
        tools: ["Pentalobe screwdriver", "JIS screwdriver", "Soldering iron", "Multimeter"],
        steps: [
          "Try different cables and chargers first",
          "Open phone, check port for lint/damage",
          "Replace charging port if physically damaged",
          "Check battery voltage — replace if below 3V",
          "If port and battery OK — likely Tristar/Hydra IC fault"
        ],
        warnings: ["Tristar IC requires microsoldering — not beginner friendly", "iPhone 15+ uses USB-C: easier to replace than Lightning"]
      },
      {
        symptom: "Battery drains fast",
        likelyFault: "Degraded battery (below 80% health)",
        repairCost: { min: 10, max: 25 },
        difficulty: "beginner",
        risk: "low",
        successRate: 99,
        timeHours: 0.75,
        partsNeeded: ["iPhone battery (model-specific, £10-20)"],
        tools: ["Pentalobe screwdriver", "Suction cup", "Spudger", "Isopropyl alcohol"],
        steps: [
          "Check battery health in Settings > Battery",
          "Open phone, disconnect battery first",
          "Apply isopropyl alcohol under adhesive strips",
          "Pull strips out slowly to release battery",
          "Fit new battery, reconnect"
        ],
        warnings: ["Battery health warning may appear — needs software reset with genuine Apple part or 3rd party tool", "Don't tear the adhesive pull strips or battery will be glued in"]
      },
      {
        symptom: "Face ID not working",
        likelyFault: "Damaged Face ID dot projector or TrueDepth camera",
        repairCost: { min: 0, max: 200 },
        difficulty: "expert",
        risk: "extreme",
        successRate: 30,
        timeHours: 3,
        partsNeeded: ["Face ID module (paired — must come from donor phone)"],
        tools: ["Microsoldering station"],
        steps: [
          "Check if screen was previously replaced (most common cause)",
          "Face ID module is paired to motherboard via serial",
          "Replacement requires donor iPhone with matching serial or Apple repair"
        ],
        warnings: ["Face ID CANNOT be repaired with aftermarket parts", "Only Apple and Apple Authorised can restore Face ID after module swap", "Avoid buying iPhones listed as 'Face ID broken' unless very cheap for parts"]
      }
    ]
  },
  {
    device: "iPad",
    brands: ["Apple"],
    faults: [
      {
        symptom: "Cracked screen / touch not working",
        likelyFault: "Broken digitizer or LCD",
        repairCost: { min: 20, max: 100 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 85,
        timeHours: 2,
        partsNeeded: ["iPad digitizer/screen (model-specific, £20-100)"],
        tools: ["Pentalobe screwdriver", "Heat gun", "Suction cup", "Plastic picks", "OCA glue (optional)"],
        steps: [
          "Apply sustained heat around glass edges",
          "Use suction cup and picks to slowly lift glass",
          "Disconnect digitizer ribbons carefully",
          "Fit new glass/digitizer assembly",
          "Glue or clamp while adhesive sets"
        ],
        warnings: ["iPad screens use adhesive glue — high heat needed but don't overheat LCD", "Apple Pencil pairing survives screen swap on most models"]
      },
      {
        symptom: "Won't charge",
        likelyFault: "Faulty charging port or USB-C IC",
        repairCost: { min: 10, max: 40 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 82,
        timeHours: 1.5,
        partsNeeded: ["Charging port assembly (£10-30)"],
        tools: ["Pentalobe screwdriver", "Soldering iron", "Spudger"],
        steps: [
          "Test with multiple cables",
          "Open iPad — remove screen first",
          "Locate and replace charging port flex or USB-C port",
          "Reassemble and test"
        ],
        warnings: ["iPad 10th Gen uses USB-C — easier to source parts than older Lightning models"]
      }
    ]
  },
  {
    device: "MacBook",
    brands: ["Apple"],
    faults: [
      {
        symptom: "No power / won't turn on",
        likelyFault: "Dead battery, faulty MagSafe/USB-C board, or SMC issue",
        repairCost: { min: 5, max: 150 },
        difficulty: "intermediate",
        risk: "high",
        successRate: 70,
        timeHours: 2,
        partsNeeded: ["Battery (£30-80)", "USB-C charge board (£20-50)"],
        tools: ["Pentalobe/Torx screwdrivers", "Spudger", "Multimeter"],
        steps: [
          "Try SMC reset first (hold power 10s, or Ctrl+Opt+Shift+Power)",
          "Try PRAM/NVRAM reset",
          "Test with different USB-C charger on all ports",
          "Open, check battery voltage",
          "Replace battery if below 7V (2-cell) or 10V (3-cell)",
          "Test USB-C board continuity"
        ],
        warnings: ["M1/M2 MacBooks have no SMC reset — just hold power 10s", "Battery glued in on M-series — takes 30+ mins and isopropyl alcohol"]
      },
      {
        symptom: "Keyboard keys not working",
        likelyFault: "Butterfly mechanism failure (2016-2019) or liquid damage",
        repairCost: { min: 5, max: 80 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 80,
        timeHours: 2,
        partsNeeded: ["Individual keycap + mechanism (£3-8)", "Full keyboard (£40-80)"],
        tools: ["Torx T5 screwdriver", "Keycap puller", "Spudger"],
        steps: [
          "Identify which keys fail — single key or whole rows?",
          "Single key: replace keycap and butterfly mechanism",
          "Multiple keys/rows: likely spill damage or failing keyboard ribbon",
          "Full replacement requires removing screen assembly on older models"
        ],
        warnings: ["2016-2019 butterfly keyboards are notoriously fragile — budget for full keyboard swap", "2019+ scissor switches are much more reliable and easier to repair"]
      },
      {
        symptom: "Screen flickering or no display",
        likelyFault: "Loose display cable, failing backlight, or GPU issue",
        repairCost: { min: 10, max: 300 },
        difficulty: "advanced",
        risk: "high",
        successRate: 65,
        timeHours: 3,
        partsNeeded: ["Display cable (£10-30)", "Display assembly (£100-300)"],
        tools: ["Pentalobe/Torx screwdrivers", "Spudger"],
        steps: [
          "Connect external monitor — if working, display or cable issue",
          "If external also blank — GPU or logic board fault",
          "Open lid, reseat display cable connection on logic board",
          "If cable reseating fails — replace display cable",
          "If still failing — full display assembly replacement"
        ],
        warnings: ["Some MacBook Pros had a 'Flexgate' issue — display cable fails at hinge", "GPU failures on Intel MacBooks are often logic board replacements = not worth it"]
      }
    ]
  },
  {
    device: "GPU",
    brands: ["NVIDIA", "AMD"],
    faults: [
      {
        symptom: "No display output",
        likelyFault: "Faulty HDMI/DP port, failed VRAM, or artifacting GPU",
        repairCost: { min: 5, max: 80 },
        difficulty: "advanced",
        risk: "high",
        successRate: 55,
        timeHours: 2,
        partsNeeded: ["HDMI port (£3-8)", "Thermal pads (£5-15)"],
        tools: ["Torx/Phillips screwdrivers", "Hot air station", "Soldering iron", "Multimeter"],
        steps: [
          "Test in another PC first",
          "Test all ports — one HDMI may work",
          "Try different cable and monitor",
          "Replace faulty port if only one dead",
          "If no ports work — VRAM/GPU die issue"
        ],
        warnings: ["VRAM faults require BGA reballing — very high skill needed", "Check for artifacting by running Furmark before buying"]
      },
      {
        symptom: "Fan not spinning / overheating",
        likelyFault: "Dead fan bearing or clogged heatsink",
        repairCost: { min: 5, max: 30 },
        difficulty: "beginner",
        risk: "low",
        successRate: 95,
        timeHours: 1,
        partsNeeded: ["Replacement GPU fan(s) (£5-25)", "Thermal paste", "Thermal pads"],
        tools: ["Phillips screwdriver", "Spudger"],
        steps: [
          "Remove GPU shroud/cooler",
          "Identify which fan(s) not spinning",
          "Unplug fan connector from PCB",
          "Swap fan, replace thermal paste",
          "Check thermal pad thickness and replace if compressed"
        ],
        warnings: ["Match fan model exactly — blade count and connector type must match", "While cooler is off — always replace thermal paste"]
      }
    ]
  },
  {
    device: "Steam Deck",
    brands: ["Valve"],
    faults: [
      {
        symptom: "Stick drift",
        likelyFault: "Worn analog stick module",
        repairCost: { min: 5, max: 12 },
        difficulty: "beginner",
        risk: "low",
        successRate: 96,
        timeHours: 0.75,
        partsNeeded: ["Steam Deck analog stick module (£5-10)"],
        tools: ["Phillips screwdriver", "Spudger"],
        steps: [
          "Remove 8 back screws",
          "Pry shell open gently",
          "Disconnect battery ribbon first",
          "Remove 3 screws on thumbstick module",
          "Lift and replace module",
          "Reassemble, calibrate in Steam settings"
        ],
        warnings: ["Steam Deck uses hall effect sticks in later batches — check revision before ordering"]
      },
      {
        symptom: "Battery drains fast / won't charge",
        likelyFault: "Degraded battery or USB-C charge IC",
        repairCost: { min: 20, max: 50 },
        difficulty: "intermediate",
        risk: "medium",
        successRate: 88,
        timeHours: 1.5,
        partsNeeded: ["Steam Deck battery (£20-35)"],
        tools: ["Phillips screwdriver", "Spudger", "Isopropyl alcohol"],
        steps: [
          "Check battery level in Steam OS settings",
          "Open back shell",
          "Disconnect battery, then all other connectors",
          "Remove 4 battery screws + peel adhesive",
          "Fit new battery"
        ],
        warnings: ["Be gentle with battery adhesive — pulling too fast causes tears"]
      }
    ]
  }
];

export function findFaults(deviceQuery: string): DeviceFaults | null {
  const q = deviceQuery.toLowerCase();
  return faultDatabase.find(d => d.device.toLowerCase().includes(q)) || null;
}
