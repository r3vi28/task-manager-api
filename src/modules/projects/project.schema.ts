import { z } from 'zod';

const createProjectSchema = z.object({
    name: z.string().min(1, "Name is mandatory"),
    description: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
})

export { createProjectSchema, updateProjectSchema };