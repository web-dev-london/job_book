import z from 'zod'

export const recommendRequestSchema = z.object({
  jobId: z.string(),
})

export const addBookRequestSchema = z.object({
  title: z.string(),
  author: z.string(),
  description: z.string(),
  userId: z.string(),
})

export const addJobRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  userId: z.string(),
})

export const addUserRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
})