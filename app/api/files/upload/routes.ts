import {db} from "@/lib/db";
import {files} from "@/lib/db/schema";
import {auth} from "@clerk/nextjs/server";
import {NextRequest, NextResponse} from "next/server";
import ImageKit from "imagekit";
import {and, eq} from "drizzle-orm";
import {error} from "console";
import {v4 as uuidv4} from "uuid";

const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
  try {
    const {userId} = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized ",
        },
        {status: 401}
      );
    }

    // parsed user id
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formUserId = formData.get("userId") as string;
    const parentId = (formData.get("parentId") as string) || null;

    if (formUserId !== userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {status: 401}
      );
    }

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided ",
        },
        {status: 401}
      );
    }

    if (parentId) {
      await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.isFolder, true),
            eq(files.userId, userId)
          )
        );
    }
    if (!parentId) {
      {
        return NextResponse.json(
          {
            error: "Parent folder not found",
          },
          {status: 402}
        );
      }
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "Only images and pdf are supported ",
        },
        {status: 401}
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const folderPath = parentId
      ? `/droply/${userId}/folder/${parentId}`
      : `/droply/${userId}`;

    const originalFileName = file.name;

    const fileExtension = originalFileName.split(".").pop() || ""; // check for empty extension

    // validation for not storing exe, .php

    const denyedFileExtensions = ["php", "exe", "md", "mp3", "bat"];

    if (denyedFileExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: "Only images and pdf's are allowed to be uploaded",
        },
        {status: 401}
      );
    }

    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    const uploadResponse = await imageKit.upload({
      file: fileBuffer,
      fileName: uniqueFileName,
      folder: folderPath,
      useUniqueFileName: false,
    });
    const fileData = {
      name: originalFileName,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId,
      isStarred: false,
      isTrash: false,
    };
    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json({
      newFile,
    });
  } catch (error) {
    // return NextResponse.json({
    //   error,"failed to upload file"
    // },{status: 401})
    return NextResponse.json(
      {
        error: "Failed to upload the file.",
      },
      {status: 401}
    );
  }
}
