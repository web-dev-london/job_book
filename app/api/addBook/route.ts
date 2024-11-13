import { handleRequest } from "@/lib/handleRequest";
import prisma from "@/prisma/prisma-client";
import { addBookRequestSchema } from "@/schema/schemas";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = await handleRequest(request, addBookRequestSchema, async (parsed) => {

    await prisma.book.create({
      data: parsed
    })

    return {
      message: 'Book added.',
    }
  })

  return response


}