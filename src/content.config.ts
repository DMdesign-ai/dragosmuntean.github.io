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
    /** The one checkable figure this entry is judged on. */
    figure: z.string().optional(),
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
    /** Where this was originally published, e.g. "LinkedIn", "Medium". */
    platform: z.string().optional(),
    /** Canonical link to the original, if it lives somewhere else. */
    url: z.string().url().optional(),
  }),
});

const labs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/labs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** The one checkable figure this entry is judged on. */
    figure: z.string().optional(),
    /** What it was built with. */
    stack: z.array(z.string()).default([]),
    /** Where it can be used, if it is live. */
    live: z.string().optional(),
    /** Slug of a related note, if one exists. */
    note: z.string().optional(),
    /** Preview image used for the hover thumbnail and any card treatment. */
    image: z.string().optional(),
    status: z.string().default('Shipped'),
  }),
});

export const collections = { projects, blog, labs };
