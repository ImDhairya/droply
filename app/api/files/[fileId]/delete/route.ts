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
        {error: "Unauthorized to access this path"},
        {status: 401}
      );
    }

    const {fileId} = await props.params;

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({error: "File not found"}, {status: 401});
    }

    const updatedFile = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    return NextResponse.json(updatedFile, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete the file.",
      },
      {status: 401}
    );
  }
}
