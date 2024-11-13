
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

export async function handleRequest<T, U>(request: NextRequest, schema: z.ZodSchema<T>, handle: (parsed: T) => Promise<U>) {
  try {
    const requestBody = await request.json();
    const parsed = schema.parse(requestBody);

    const responseBody = await handle(parsed);

    return NextResponse.json({ success: true, ...responseBody });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error('Invalid error', error);
      const responseBody = {
        success: false,
        message: 'Invalid error',
      }
      return NextResponse.json(responseBody, { status: 400 });
    }

    if (error instanceof ZodError) {
      const responseBody = {
        success: false,
        message: error.issues,
      }
      return NextResponse.json(responseBody, { status: 400 });
    }

    const responseBody = {
      success: false,
      message: error.message,
    }
    return NextResponse.json(responseBody, { status: 400 });
  }
}