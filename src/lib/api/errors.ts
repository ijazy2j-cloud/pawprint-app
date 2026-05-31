import { NextResponse } from "next/server";

export function apiError(message: string, code = "ERROR", status = 400) {
  return NextResponse.json({ success: false, error: message, code }, { status });
}

export function apiOk<T>(data: T) {
  return NextResponse.json({ success: true, ...data });
}
