import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    images: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    category: z.enum(['work', 'personal']).default('work'),
    company: z.string().optional(),
    role: z.string().optional(),
    duration: z.string().optional(),
    impact: z.array(z.string()).default([]),
    testimonials: z
      .array(
        z.object({
          quote: z.string(),
          author: z.string(),
          role: z.string(),
        }),
      )
      .default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
