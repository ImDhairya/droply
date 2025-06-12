import {db} from "@/lib/db";
import {File, files} from "@/lib/db/schema";
import {auth} from "@clerk/nextjs/server";
import {and, eq} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

export async function PATCH(
  request: NextRequest,
  props: {params: Promise<{fileId: string}>}
) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "You are not authorized to access this",
      });
    }

    const {fileId} = await props.params;
    if (!fileId) {
      return NextResponse.json({
        message: "file id is required ",
      });
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({
        message: "The file data could not be fetched   ",
      });
    }

    // toggle the star status

    const updatedFiles = await db
      .update(files)
      .set({isStarred: !file.isStarred})
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    // loog the updatedFiles

    const updatedFile = updatedFiles[0];

    return NextResponse.json(updatedFile);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update thee file",
      },
      {status: 401}
    );
  }
}
