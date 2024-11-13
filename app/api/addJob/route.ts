import { handleRequest } from "@/lib/handleRequest";
import prisma from "@/prisma/prisma-client";
import { addJobRequestSchema } from "@/schema/schemas";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = await handleRequest(request, addJobRequestSchema, async (parsed) => {
    await prisma.job.create({
      data: parsed
    })

    return {
      message: 'Job added.',
    }
  })

  return response;
}