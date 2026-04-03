import {
  PrismaClient,
  ProjectHealth,
  ProjectStatus,
  RecurrenceRule,
  WorkItemPriority,
  WorkItemStatus,
} from "@prisma/client";

import { hashPassword, normalizeEmail } from "../src/lib/password";

const prisma = new PrismaClient();

const SEED_DEMO_EMAIL = process.env.SEED_DEMO_EMAIL?.trim();
const SEED_DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD;
const SEED_DEMO_NAME = process.env.SEED_DEMO_NAME?.trim() || "Demo User";

type SeedWorkItem = {
  title: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  dueDate: Date;
  notes: string;
  section: string;
  tags: string[];
  subtasks: string[];
  recurrenceRule?: RecurrenceRule;
};

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00`);
}

async function main() {
  if (!SEED_DEMO_EMAIL && !SEED_DEMO_PASSWORD) {
    console.log(
      "Skipping seed. Set both SEED_DEMO_EMAIL and SEED_DEMO_PASSWORD to create an optional demo account.",
    );
    return;
  }

  if (!SEED_DEMO_EMAIL || !SEED_DEMO_PASSWORD) {
    throw new Error("Set both SEED_DEMO_EMAIL and SEED_DEMO_PASSWORD, or leave both unset.");
  }

  const email = normalizeEmail(SEED_DEMO_EMAIL);

  await prisma.user.deleteMany({
    where: { email },
  });

  const user = await prisma.user.create({
    data: {
      email,
      name: SEED_DEMO_NAME,
      passwordHash: await hashPassword(SEED_DEMO_PASSWORD),
      timezone: "America/Los_Angeles",
      dailyTargetMinutes: 360,
      deepWorkTarget: 2,
      defaultSessionMinutes: 50,
      weekStartsOn: 1,
    },
  });

  const relocationArea = await prisma.area.create({
    data: {
      userId: user.id,
      name: "Relocation",
      slug: "relocation",
      description: "Move planning, admin, packing, and transition work.",
      color: "#007aff",
    },
  });

  const tags = await Promise.all(
    [
      ["tesla", "#111827"],
      ["admin", "#6b7280"],
      ["travel", "#0ea5e9"],
      ["packing", "#f59e0b"],
      ["sell", "#ef4444"],
      ["housing", "#10b981"],
      ["documents", "#8b5cf6"],
    ].map(([name, color]) =>
      prisma.tag.create({
        data: {
          userId: user.id,
          name,
          color,
        },
      }),
    ),
  );

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      areaId: relocationArea.id,
      name: "Amsterdam Relocation",
      slug: "amsterdam-relocation",
      description: "Move from Mountain View to Amsterdam for Tesla transfer.",
      clientName: "Personal",
      status: ProjectStatus.active,
      health: ProjectHealth.on_track,
      pinned: true,
      sortOrder: 1,
      targetOutcome: "Arrive in Amsterdam prepared and ready to join Tesla on June 1.",
      notes: "Keep this project tight: sell aggressively, pack lightly, reserve final weeks for move prep.",
    },
  });

  const sectionNames = ["Backlog", "This Week", "Waiting", "Done"] as const;
  const sections = await Promise.all(
    sectionNames.map((name, position) =>
      prisma.projectSection.create({
        data: {
          projectId: project.id,
          name,
          position,
        },
      }),
    ),
  );

  const sectionMap = Object.fromEntries(sections.map((section) => [section.name, section]));
  const tagMap = Object.fromEntries(tags.map((tag) => [tag.name, tag]));

  const items: SeedWorkItem[] = [
    {
      title: "Confirm Tesla relocation package and transfer checklist",
      status: WorkItemStatus.in_progress,
      priority: WorkItemPriority.critical,
      dueDate: dateAtNoon("2026-04-07"),
      notes: "Confirm immigration support, temporary housing coverage, shipment policy, payroll transition, and June 1 onboarding expectations.",
      section: "This Week",
      tags: ["tesla", "documents"],
      subtasks: [
        "Email HR/relocation contact",
        "List all unanswered relocation questions",
        "Confirm what Tesla covers vs what you need to self-manage",
      ],
    },
    {
      title: "Plan US travel week before the move",
      status: WorkItemStatus.planned,
      priority: WorkItemPriority.high,
      dueDate: dateAtNoon("2026-04-12"),
      notes: "Choose a week that does not conflict with the final move-prep window.",
      section: "This Week",
      tags: ["travel"],
      subtasks: [
        "Pick preferred travel week",
        "Check PTO and work handoff impact",
        "Rough itinerary only; no overplanning",
      ],
    },
    {
      title: "Sell the car",
      status: WorkItemStatus.planned,
      priority: WorkItemPriority.critical,
      dueDate: dateAtNoon("2026-04-20"),
      notes: "Start early so you are not forced into a bad last-minute sale.",
      section: "This Week",
      tags: ["sell"],
      subtasks: [
        "Get car cleaned and photographed",
        "Collect title/loan/payoff details",
        "List on 2-3 platforms",
        "Decide walk-away price",
      ],
    },
    {
      title: "Build sell / donate / keep inventory for apartment",
      status: WorkItemStatus.inbox,
      priority: WorkItemPriority.high,
      dueDate: dateAtNoon("2026-04-15"),
      notes: "Bias toward selling or donating anything bulky or cheap to replace in Amsterdam.",
      section: "Backlog",
      tags: ["sell", "packing"],
      subtasks: [
        "Furniture",
        "Kitchen items",
        "Electronics/accessories",
        "Clothes and shoes",
      ],
    },
    {
      title: "Create packing plan for Amsterdam first month",
      status: WorkItemStatus.inbox,
      priority: WorkItemPriority.high,
      dueDate: dateAtNoon("2026-04-22"),
      notes: "Separate carry-on essentials, checked baggage, and rebuy-on-arrival items.",
      section: "Backlog",
      tags: ["packing"],
      subtasks: [
        "Carry-on essentials",
        "Checked baggage list",
        "Do-not-pack / rebuy list",
      ],
    },
    {
      title: "Research temporary housing for Amsterdam arrival",
      status: WorkItemStatus.planned,
      priority: WorkItemPriority.high,
      dueDate: dateAtNoon("2026-04-18"),
      notes: "You want a low-friction first landing, not perfect permanent housing immediately.",
      section: "Backlog",
      tags: ["housing"],
      subtasks: [
        "Decide temporary vs long-term strategy",
        "Research neighborhoods with simple commute",
        "Estimate first-month housing budget",
      ],
    },
    {
      title: "Prepare immigration and registration document packet",
      status: WorkItemStatus.planned,
      priority: WorkItemPriority.critical,
      dueDate: dateAtNoon("2026-04-25"),
      notes: "Centralize everything before the final two weeks.",
      section: "Backlog",
      tags: ["documents", "admin"],
      subtasks: [
        "Passport and copies",
        "Tesla transfer/offer docs",
        "Housing/address docs if available",
        "Tax/payroll/ID references",
      ],
    },
    {
      title: "Map final two-week move prep window",
      status: WorkItemStatus.inbox,
      priority: WorkItemPriority.critical,
      dueDate: dateAtNoon("2026-05-01"),
      notes: "Protect one to two weeks before departure for move-only execution.",
      section: "Backlog",
      tags: ["admin", "packing"],
      subtasks: [
        "Choose final work day / transition point",
        "Reserve move-prep-only days",
        "List must-finish items for final two weeks",
      ],
    },
    {
      title: "Set recurring weekly relocation review",
      status: WorkItemStatus.planned,
      priority: WorkItemPriority.medium,
      dueDate: dateAtNoon("2026-04-05"),
      notes: "Use a short weekly review to keep the move project from drifting.",
      section: "This Week",
      tags: ["admin"],
      recurrenceRule: RecurrenceRule.weekly,
      subtasks: [
        "Check upcoming deadlines",
        "Update sell/pack/admin status",
        "Adjust next week priorities",
      ],
    },
  ];

  for (const [index, item] of items.entries()) {
    const created = await prisma.workItem.create({
      data: {
        userId: user.id,
        projectId: project.id,
        sectionId: sectionMap[item.section].id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        dueDate: item.dueDate,
        notes: item.notes,
        recurring: Boolean(item.recurrenceRule),
        recurrenceRule: item.recurrenceRule ?? null,
        completedAt: item.status === WorkItemStatus.done ? item.dueDate : null,
      },
    });

    if (item.tags.length) {
      await prisma.workItemTag.createMany({
        data: item.tags.map((tagName) => ({
          workItemId: created.id,
          tagId: tagMap[tagName].id,
        })),
      });
    }

    await Promise.all(
      item.subtasks.map((title, position) =>
        prisma.subtask.create({
          data: {
            workItemId: created.id,
            title,
            position,
            completedAt: index === 0 && position === 0 ? new Date() : null,
          },
        }),
      ),
    );
  }

  await prisma.dailyPlan.create({
    data: {
      userId: user.id,
      date: dateAtNoon("2026-04-03"),
      note: "Keep this week focused on Tesla logistics, travel timing, and getting the car sale moving.",
    },
  });

  console.log(`Seeded demo account for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
