import chooseBook from "@/lib/chooseBook";
import { handleRequest } from "@/lib/handleRequest";
import prisma from "@/prisma/prisma-client";
import { recommendRequestSchema } from "@/schema/schemas";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = await handleRequest(request, recommendRequestSchema, async (parsed) => {
    const job = await prisma.job.findUniqueOrThrow({
      where: {
        id: parsed.jobId
      }
    })
    const books = await prisma.book.findMany({
      where: {
        userId: job.userId
      }
    })

    if (books.length === 0) {
      throw new Error('No books found.')
    }
    const book = await chooseBook(books)

    await prisma.job.update({
      where: {
        id: job.id
      },
      data: {
        recommendedBookId: book.id
      }
    })
    return {
      message: 'Book recommended.',
    }
  })

  return response
}