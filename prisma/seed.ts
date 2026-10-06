import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";
import { Role, TaskPriority, TaskStatus } from "../generated/prisma/enums";

/**
 * Seeds demo data for the public deployment.
 * Idempotent: users are upserted (re-running resets their name, role and password),
 * and sample projects are only created when the owner does not have them yet.
 */

const DEMO_PASSWORD = "Demo1234!";

async function upsertUser(name: string, email: string, role: Role) {
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);

    return prisma.user.upsert({
        where: { email },
        update: { name, password, role },
        create: { name, email, password, role },
    });
}

async function ensureProject(
    ownerId: number,
    name: string,
    description: string,
    tasks: {
        title: string;
        description?: string;
        status: TaskStatus;
        priority: TaskPriority;
        assignedToId?: number;
        dueDate?: Date;
    }[]
) {
    const existing = await prisma.project.findFirst({ where: { ownerId, name } });
    if (existing) {
        return existing;
    }

    return prisma.project.create({
        data: { name, description, ownerId, tasks: { create: tasks } },
    });
}

function daysFromNow(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
    const member = await upsertUser("Demo Member", "member@demo.com", Role.MEMBER);
    const admin = await upsertUser("Demo Admin", "admin@demo.com", Role.ADMIN);

    await ensureProject(member.id, "Portfolio Website", "Personal site redesign", [
        { title: "Design wireframes", status: TaskStatus.DONE, priority: TaskPriority.HIGH, assignedToId: member.id },
        { title: "Build landing page", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assignedToId: member.id, dueDate: daysFromNow(7) },
        { title: "Write blog section", description: "Three initial posts", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: daysFromNow(14) },
        { title: "Set up analytics", status: TaskStatus.TODO, priority: TaskPriority.LOW },
    ]);

    await ensureProject(admin.id, "Team Onboarding", "Onboarding checklist for new hires", [
        { title: "Create accounts", status: TaskStatus.DONE, priority: TaskPriority.HIGH, assignedToId: admin.id },
        { title: "Prepare documentation", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, assignedToId: member.id, dueDate: daysFromNow(5) },
        { title: "Schedule kickoff meeting", status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDate: daysFromNow(3) },
    ]);

    console.log("Seed completed: member@demo.com / admin@demo.com (password: Demo1234!)");
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
