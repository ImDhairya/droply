import {db} from "@/lib/db";
import {files} from "@/lib/db/schema";
import {auth} from "@clerk/nextjs/server";
import {eq, and} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuidv4} from "uuid";

export async function POST(request: NextRequest) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized  ",
        },
        {status: 401}
      );
    }

    const body = await request.json();

    const {name, userId: bodyUserId, parentId = null} = body;

    if (userId !== bodyUserId) {
      return NextResponse.json(
        {
          error: "Unauthorized to proceed",
        },
        {status: 401}
      );
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        {
          error: "Name is a required entity.",
        },
        {status: 401}
      );
    }

    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true)
          )
        );

      if (!parentFolder) {
        return NextResponse.json(
          {
            error: "The parent folder does not exists.",
          },
          {status: 401}
        );
      }

      // creating a folder in db

      const folderData = {
        id: uuidv4(),
        name: name.trim(),
        path: `/folders/${userId}/${uuidv4()}`,
        size: 0,
        type: `folder`,
        fileUrl: "",
        thumbnailUrl: null,
        userId,
        parentId,
        isFolder: true,
        isStarred: false,
        isTrash: false,
      };

      const [newFolder] = await db.insert(files).values(folderData).returning();
    }

    if (!parentId) {
    }
  } catch (error) {}
}
