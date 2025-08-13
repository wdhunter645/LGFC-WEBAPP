import { defineCollection, z } from 'astro:content';

// Define the schema for pages
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

// Define the schema for milestones
const milestones = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for events
const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    location: z.string().optional(),
    description: z.string(),
    body: z.string().optional(),
    image: z.string().optional(),
    externalLink: z.string().optional(),
    isClubEvent: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for news
const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('Lou Gehrig Fan Club'),
    description: z.string(),
    body: z.string(),
    featuredImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for memorabilia
const memorabilia = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().optional(),
    category: z.enum(['Baseball Card', 'Autograph', 'Photograph', 'Document', 'Trophy', 'Uniform', 'Other']),
    image: z.string(),
    details: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for photos
const photos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    year: z.number().optional(),
    photographer: z.string().optional(),
    image: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for books
const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    yearPublished: z.number().optional(),
    description: z.string(),
    coverImage: z.string().optional(),
    isbn: z.string().optional(),
    review: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for settings
const settings = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    contactEmail: z.string(),
    socialLinks: z.object({
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    }),
  }),
});

export const collections = {
  pages,
  milestones,
  events,
  news,
  memorabilia,
  photos,
  books,
  settings,
};