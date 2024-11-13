import { handleRequest } from "@/lib/handleRequest";
import prisma from "@/prisma/prisma-client";
import { addUserRequestSchema } from "@/schema/schemas";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = await handleRequest(request, addUserRequestSchema, async (parsed) => {
    await prisma.user.create({
      data: parsed
    })

    return {
      message: 'User added.',
    }
  })

  return response;
}