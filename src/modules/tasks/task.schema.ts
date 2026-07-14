import { z } from "zod";

const createTaskSchema = z.object({
    title: z.string().min(1, "Name is mandatory"),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    assignedToId: z.number().optional(),
    dueDate: z.iso.datetime().optional()
})

const updateTaskSchema = z.object({
    title: z.string().min(1, "Name is mandatory").optional(),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO").optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM").optional(),
    assignedToId: z.number().optional(),
    dueDate: z.iso.datetime().optional()
})

export { createTaskSchema, updateTaskSchema };