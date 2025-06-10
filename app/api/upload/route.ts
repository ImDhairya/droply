import {db} from "@/lib/db";
import {files} from "@/lib/db/schema";
import {auth} from "@clerk/nextjs/server";
import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {userId} = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          Error: "Error getting the authentication for this route",
        },
        {status: 401}
      );
    }

    const body = await request.json();

    const {imagekit, userId: bodyUserId} = body;

    if (bodyUserId !== userId) {
      return NextResponse.json(
        {
          error: "Unable to autheiticate the user ",
        },
        {status: 401}
      );
    }

    if (!imagekit || !imagekit.url) {
      return NextResponse.json(
        {
          message: "invalid file upload data.",
        },
        {
          status: 400,
        }
      );
    }

    const fileData = {
      name: imagekit.name || "untiled",
      path: imagekit.filePath || `droply${userId}/${imagekit.name}`,
      size: imagekit.size || 0,
      type: imagekit.fileType || "image",
      fileUrl: imagekit.fileUrl,
      thumbnailUrl: imagekit.thumbnailUrl || null,
      parentId: null, // means this is root level by default
      isFolder: false,
      isStarred: false,
      isTrashed: false,
      userId: userId,
    };

    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file", error);
    return NextResponse.json(
      {
        error: "Error saving information to database",
      },
      {
        status: 500,
      }
    );
  }
}
