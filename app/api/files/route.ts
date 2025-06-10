import {db} from "@/lib/db";
import {files} from "@/lib/db/schema";
import {auth} from "@clerk/nextjs/server";
import {and, eq, isNull} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "you are unauthorized to do this action.",
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get("userId");
    const parentId = searchParams.get("parentId");

    if (userId !== queryUserId || !queryUserId) {
      return NextResponse.json(
        {
          error: "Unauthorized to proceed",
        },
        {status: 401}
      );
    }
    // parent id passed in

    if (parentId) {
      const filesData = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, userId), eq(files.parentId, parentId)));

      return NextResponse.json({
        success: true,
        message: "Successfully fetched files data",
        filesData,
      });
    }

    if (!parentId) {
      const allFilesData = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, userId), isNull(files.parentId)));
      return NextResponse.json({
        success: true,
        message: "Successfully fetched files data",
        allFilesData,
      });
    }
  } catch (error) {
    console.error("Error getting files from the routes.");
  }
}
