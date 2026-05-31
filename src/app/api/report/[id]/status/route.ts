import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransitionSosStatus, canUpdateReportStatus } from "@/lib/sos/status";
import { sosStatusUpdateSchema } from "@/lib/sos/validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!canUpdateReportStatus(session?.user?.role)) {
    return NextResponse.json({ error: "Only NGOs, volunteers, or admins can update SOS status." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sosStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const report = await prisma.petReport.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const isAssignedNgo = session?.user?.role === "NGO" && report.assignedNgoId === session.user.id;
  const isAssignedVolunteer = session?.user?.role === "VOLUNTEER" && report.assignedVolunteerId === session.user.id;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAssignedNgo && !isAssignedVolunteer && !isAdmin) {
    return NextResponse.json({ error: "You must be assigned to this report before updating it." }, { status: 403 });
  }

  if (!canTransitionSosStatus(report.status, parsed.data.status)) {
    return NextResponse.json({ error: `Invalid transition from ${report.status} to ${parsed.data.status}.` }, { status: 409 });
  }

  const updated = await prisma.petReport.update({
    where: { id: report.id },
    data: { status: parsed.data.status },
    select: {
      id: true,
      status: true,
      district: true,
      landmark: true,
      lat: true,
      lng: true,
      assignedNgoId: true,
      assignedVolunteerId: true,
    },
  });

  const canViewPreciseLocation = isAssignedNgo || isAssignedVolunteer || isAdmin;

  return NextResponse.json({
    report: {
      id: updated.id,
      status: updated.status,
      district: updated.district,
      landmark: updated.landmark,
      preciseLocation: canViewPreciseLocation ? { lat: updated.lat.toString(), lng: updated.lng.toString() } : null,
    },
  });
}
