import {db} from "@/lib/db";
import {files} from "@/lib/db/schema";
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
      return NextResponse.json(
        {
          message:
            "The user is not authenticated and you are not allowed to access this route",
        },
        {
          status: 401,
        }
      );
    }

    const {fileId} = await props.params;

    if (!fileId) {
      return NextResponse.json(
        {error: "Unable to find the fileId from parameters"},
        {status: 401}
      );
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId)));

    if (!file) {
      return NextResponse.json({
        message: "The file data could not be fetched   ",
      });
    }

    const updatedFiles = await db
      .update(files)
      .set({isTrash: !file.isTrash})
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    const updatedFile = updatedFiles[0];

    return NextResponse.json(updatedFile);
  } catch (error) {
    return NextResponse.json(
      {error: "Unable to mark file to trash"},
      {status: 401}
    );
  }
}
