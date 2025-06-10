import {auth} from "@clerk/nextjs/server";
import next from "next";
import {NextResponse} from "next/server";
import {useId} from "react";

const {userId} = await auth();

export default function checkIsValid() {
  if (!useId) {
    return NextResponse.json({
      message: "you are unauthorized to do this action.",
    });
  }

}
