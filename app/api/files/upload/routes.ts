import {db} from "@/lib/db";
import {files} from "@/lib/db/schema";
import {auth} from "@clerk/nextjs/server";
import {NextRequest, NextResponse} from "next/server";
import ImageKit from "imagekit";
import {and, eq} from "drizzle-orm";
import {error} from "console";

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

    const formData = await request.formData();
    formData.get('file') as File
    
  } catch (error) {}
}
