"use client";
import {NextResponse} from "next/server";
import type {ThemeProviderProps} from "next-themes";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import React from "react";
import {ImageKitProvider} from "imagekitio-next";

interface ProviderProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    const data = await response.json();

    return data;
  } catch (error) {
    return NextResponse.json(
      {error: "unable to fetch data"},
      {
        status: 401,
      }
    );
  }
};

const providers = ({children, themeProps}: ProviderProps) => {
  return (
    <ImageKitProvider
      authenticator={authenticator}
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
    >
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </ImageKitProvider>
  );
};

export default providers;
