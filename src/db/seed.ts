import "dotenv/config";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, pool, isPglite } from "@/db";
import {
  activityLog,
  escalations,
  repairRequests,
  savedRepairGuides,
  technicians,
  users,
} from "@/db/schema";
import { runAiAnalysis } from "@/lib/repairKnowledge";

const DEMO_EMAIL = "demo@fixit.ai";

async function main() {
  console.log("Seeding FixLens demo data…");

  const existing = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (existing.length > 0) {
    await db.delete(users).where(eq(users.id, existing[0].id));
    console.log("Removed previous demo user + cascaded data.");
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const [user] = await db
    .insert(users)
    .values({
      name: "Ananya Sharma (iQOO User)",
      email: DEMO_EMAIL,
      passwordHash,
      preferredLanguage: "en",
    })
    .returning();

  // Certified specialists for low-risk repairs and dangerous escalations
  const [techHandyman, techElectrician, techGas, techStructural] = await db
    .insert(technicians)
    .values([
      {
        userId: user.id,
        name: "Karthik Raja",
        specialty: "Furniture & Bicycle Mechanics",
        phone: "+91 98765 43210",
        email: "karthik.raja@fixlens.in",
        city: "Chennai",
        yearsExperience: 8,
        rating: 49,
        available: true,
        notes: "Certified cycle mechanic and furniture joinery specialist. Prompt doorstep service.",
      },
      {
        userId: user.id,
        name: "Meena Lakshmi",
        specialty: "Licensed Electrical Contractor (Lic #TN-E-4921)",
        phone: "+91 91234 56780",
        email: "meena.l@electricpro.in",
        city: "Chennai",
        yearsExperience: 14,
        rating: 50,
        available: true,
        notes: "Class-A licensed electrician. Dispatched for all high-voltage, socket, and wiring hazards.",
      },
      {
        userId: user.id,
        name: "Ramesh Patel",
        specialty: "Certified LPG & Gas Safety Inspector",
        phone: "+91 94444 88776",
        email: "ramesh.gas@safefix.in",
        city: "Chennai",
        yearsExperience: 11,
        rating: 48,
        available: true,
        notes: "Authorized for domestic LPG pipelines, cylinder regulators, and safety valve testing.",
      },
      {
        userId: user.id,
        name: "Er. Suresh Kumar",
        specialty: "Chartered Structural Engineer & Civil Auditor",
        phone: "+91 90000 11223",
        email: "suresh.structural@civileng.in",
        city: "Chennai",
        yearsExperience: 18,
        rating: 49,
        available: false,
        notes: "Specializes in building foundation settlement, load-bearing pillar audits, and concrete shear cracks.",
      },
    ])
    .returning();

  type SeedRepair = {
    title: string;
    category: string;
    description: string;
    photoBeforeUrl: string;
    photoAfterUrl?: string;
    status: "analyzing" | "ready" | "in_progress" | "completed" | "escalated";
    daysAgo: number;
    tech?: typeof techHandyman;
    escalationReason?: string;
  };

  const seedRepairs: SeedRepair[] = [
    // 1. Cabinet Hinges (Low-Risk MVP)
    {
      title: "Sagging kitchen cabinet door with loose mounting screws",
      category: "cabinet_hinges",
      description: "Cabinet door is dragging along the lower frame because the top hinge plate screws backed out.",
      photoBeforeUrl: "/images/seed/chair-before.jpg",
      photoAfterUrl: "/images/seed/chair-before.jpg",
      status: "completed",
      daysAgo: 4,
    },
    // 2. Bicycle Chain (Low-Risk MVP)
    {
      title: "Slipped bicycle chain on commuter cycle",
      category: "bicycle_chain",
      description: "Chain dropped off the front chainring after shifting over a speed bump.",
      photoBeforeUrl: "/images/seed/shoe-before.jpg",
      status: "ready",
      daysAgo: 1,
    },
    // 3. Torn Bags (Low-Risk MVP)
    {
      title: "Torn shoulder strap seam on student backpack",
      category: "torn_bags",
      description: "Heavy textbooks caused the right shoulder strap seam stitching to tear open.",
      photoBeforeUrl: "/images/seed/wall-before.jpg",
      photoAfterUrl: "/images/seed/wall-after.jpg",
      status: "completed",
      daysAgo: 6,
    },
    // 4. Drawer Handles (Low-Risk MVP)
    {
      title: "Wobbly study desk drawer pull knob",
      category: "drawer_handles",
      description: "Drawer handle spins and wobbles whenever opened. The rear machine screw is loose.",
      photoBeforeUrl: "/images/seed/phone-crack-before.jpg",
      status: "in_progress",
      daysAgo: 2,
    },
    // 5. Loose Furniture Screws (Low-Risk MVP)
    {
      title: "Loose dining chair leg screws rocking on floor",
      category: "loose_furniture_screws",
      description: "Wooden chair leg rocks back and forth due to loose corner bracket screws.",
      photoBeforeUrl: "/images/seed/chair-before.jpg",
      status: "ready",
      daysAgo: 0,
    },
    // 6. DANGEROUS CASE 1: Electrical Hazard (HARD-BLOCKED)
    {
      title: "Exposed 240V water heater power cord sparking",
      category: "electrical",
      description: "Frayed copper wire sparking near plug. FixLens detected 240V shock hazard and hard-locked DIY execution.",
      photoBeforeUrl: "/images/seed/cable-before.jpg",
      status: "escalated",
      daysAgo: 2,
      tech: techElectrician,
      escalationReason: "Exposed copper conductors on 240V mains circuit. Severe electrocution and fire hazard. Blocked for DIY by FixLens Safety Gate.",
    },
    // 7. DANGEROUS CASE 2: Gas Hazard (HARD-BLOCKED)
    {
      title: "Leaking LPG gas stove regulator hose with hissing smell",
      category: "gas",
      description: "Pungent mercaptan gas smell and hissing at the regulator joint. DIY repair blocked for safety.",
      photoBeforeUrl: "/images/seed/faucet-before.jpg",
      status: "escalated",
      daysAgo: 1,
      tech: techGas,
      escalationReason: "High-pressure LPG vapor leak. Catastrophic fire/explosion hazard. Cylinder isolated; technician dispatched.",
    },
    // 8. DANGEROUS CASE 3: Structural Crack (HARD-BLOCKED)
    {
      title: "Deep 8mm diagonal fracture through load-bearing pillar",
      category: "structural",
      description: "Large diagonal shear crack across basement support pillar. Structural audit mandated.",
      photoBeforeUrl: "/images/seed/wall-before.jpg",
      status: "escalated",
      daysAgo: 3,
      tech: techStructural,
      escalationReason: "Structural shear crack exceeding 8mm in load-bearing concrete column. Critical building collapse risk. Cosmetic patching prohibited.",
    },
  ];

  for (const seed of seedRepairs) {
    const createdAt = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000);
    const analysis = runAiAnalysis(seed.category, seed.title + seed.daysAgo);

    const [repair] = await db
      .insert(repairRequests)
      .values({
        userId: user.id,
        title: seed.title,
        category: seed.category,
        description: seed.description,
        photoBeforeUrl: seed.photoBeforeUrl,
        photoAfterUrl: seed.photoAfterUrl ?? null,
        objectLabel: analysis.objectLabel,
        damageSummary: analysis.damageSummary,
        damageSeverity: analysis.damageSeverity,
        damageBox: analysis.damageBox,
        difficulty: analysis.difficulty,
        estimatedTimeMinutes: analysis.estimatedTimeMinutes,
        estimatedCostMin: analysis.estimatedCostMin,
        estimatedCostMax: analysis.estimatedCostMax,
        safetyLevel: analysis.safetyLevel,
        safetyNotes: analysis.safetyNotes,
        isDiySafe: analysis.isDiySafe,
        isDangerous: analysis.isDangerous,
        dangerCategory: analysis.dangerCategory ?? null,
        audioNarrationUrlEn: `/api/ai/tts?category=${analysis.category}&lang=en`,
        audioNarrationUrlTa: `/api/ai/tts?category=${analysis.category}&lang=ta`,
        steps: analysis.steps,
        tools: analysis.tools,
        materials: analysis.materials,
        narrationEn: analysis.narrationEn,
        narrationTa: analysis.narrationTa,
        status: seed.status,
        createdAt,
        updatedAt: createdAt,
        completedAt: seed.status === "completed" ? new Date(createdAt.getTime() + 40 * 60 * 1000) : null,
      })
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      repairRequestId: repair.id,
      action: "created",
      detail: `FixLens AI analyzed "${repair.title}" — detected ${analysis.objectLabel}`,
      createdAt,
    });

    if (seed.status === "completed") {
      await db.insert(activityLog).values({
        userId: user.id,
        repairRequestId: repair.id,
        action: "completed",
        detail: `Verified repair completion for "${repair.title}"`,
        createdAt: new Date(createdAt.getTime() + 40 * 60 * 1000),
      });
    }

    if (seed.status === "escalated" && seed.tech) {
      await db.insert(escalations).values({
        userId: user.id,
        repairRequestId: repair.id,
        technicianId: seed.tech.id,
        reason: seed.escalationReason || `${analysis.damageSummary}. Hard-locked by FixLens safety gate.`,
        urgency: "high",
        status: "in_progress",
        notes: "Technician assigned. Safety instructions issued to user.",
        createdAt: new Date(createdAt.getTime() + 15 * 60 * 1000),
      });

      await db.insert(activityLog).values({
        userId: user.id,
        repairRequestId: repair.id,
        action: "escalated",
        detail: `Escalated "${repair.title}" to specialist ${seed.tech.name}`,
        createdAt: new Date(createdAt.getTime() + 15 * 60 * 1000),
      });
    }
  }

  // Seed Initial Saved Repair Guides in Guides Library
  await db.insert(savedRepairGuides).values([
    {
      userId: user.id,
      title: "Master Guide: Sagging Kitchen Cabinet Hinges",
      category: "cabinet_hinges",
      difficulty: "easy",
      estimatedTimeMinutes: 20,
      estimatedCostMin: 30,
      estimatedCostMax: 150,
      tools: ["Phillips #2 screwdriver", "Wooden toothpicks / matchsticks", "Wood glue"],
      materials: ["PVA Wood glue", "Longer wood screws (4x25mm)"],
      steps: [
        { order: 1, title: "Support Door Weight", description: "Prop books underneath the cabinet door to take weight off hinges.", durationSeconds: 3 },
        { order: 2, title: "Pack Stripped Hole", description: "Dip toothpicks in wood glue and pack stripped holes tightly.", durationSeconds: 3 },
        { order: 3, title: "Drive Screws & Align", description: "Anchor hinge plate and adjust the horizontal screw for perfect gap alignment.", durationSeconds: 3 },
      ],
      safetyNotes: ["Support door from below so it does not pull loose while unscrewing."],
      coverImageUrl: "/images/seed/chair-before.jpg",
      userNotes: "Saved from pantry repair. Worked great on MDF and plywood cabinets.",
      isBookmarked: true,
      tags: ["cabinet_hinges", "kitchen", "woodwork"],
    },
    {
      userId: user.id,
      title: "Field Guide: Emergency Bicycle Chain Remounting",
      category: "bicycle_chain",
      difficulty: "easy",
      estimatedTimeMinutes: 10,
      estimatedCostMin: 30,
      estimatedCostMax: 100,
      tools: ["Work gloves", "Clean rag", "Small flathead screwdriver"],
      materials: ["Bicycle chain lube (dry or wet)"],
      steps: [
        { order: 1, title: "Shift to Smallest Cog", description: "Relieve chain tension by setting the derailleur to the smallest rear sprocket.", durationSeconds: 3 },
        { order: 2, title: "Push Derailleur Cage", description: "Push lower derailleur arm forward to generate chain slack.", durationSeconds: 3 },
        { order: 3, title: "Guide & Pedal", description: "Engage chain onto lower chainring teeth and rotate crank forward smoothly.", durationSeconds: 3 },
      ],
      safetyNotes: ["Never place fingers between chain and cog teeth while the wheel is spinning."],
      coverImageUrl: "/images/seed/shoe-before.jpg",
      userNotes: "Keep gloves in backpack. Useful for any sudden chain drops during daily commutes.",
      isBookmarked: true,
      tags: ["bicycle_chain", "cycling", "emergency-fix"],
    },
    {
      userId: user.id,
      title: "Quick Fix: Backpack Strap Seam Reinforced Stitching",
      category: "torn_bags",
      difficulty: "easy",
      estimatedTimeMinutes: 25,
      estimatedCostMin: 25,
      estimatedCostMax: 80,
      tools: ["Heavy-duty #16 sewing needle", "Thimble", "Fabric scissors"],
      materials: ["Bonded nylon thread", "Fabric glue dab"],
      steps: [
        { order: 1, title: "Trim Frayed Strands", description: "Cleanly snip loose threads along the seam without pulling them.", durationSeconds: 3 },
        { order: 2, title: "Pin Seam Inward", description: "Tuck 5mm of seam allowance inside and pin the strap securely.", durationSeconds: 3 },
        { order: 3, title: "Reinforced Backstitch", description: "Sew a double-row backstitch across the tear and knot twice.", durationSeconds: 3 },
      ],
      safetyNotes: ["Use a thimble when pushing needle through thick canvas layers."],
      coverImageUrl: "/images/seed/wall-before.jpg",
      userNotes: "Used heavy nylon thread. Held over 10kg load with college books.",
      isBookmarked: false,
      tags: ["torn_bags", "backpack", "stitching"],
    },
  ]);

  console.log("FixLens Seed Complete:");
  console.log(`  Demo User: ${DEMO_EMAIL} / demo1234`);
  console.log(`  Technicians: 4 (Handyman, Electrician, Gas Specialist, Civil Engineer)`);
  console.log(`  Repair Cases: ${seedRepairs.length} (5 MVP safe + 3 dangerous blocked)`);
  console.log(`  Saved Guides: 3 library guides`);
}

main()
  .then(async () => {
    if (!isPglite && pool) {
      await pool.end();
    }
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed error:", err);
    if (!isPglite && pool) {
      await pool.end();
    }
    process.exit(1);
  });
