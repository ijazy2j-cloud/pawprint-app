"use server";

import sharp from "sharp";

import { cloudinary, imageUploadConfig } from "@/lib/cloudinary";

export async function uploadSosImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed.");
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are required for SOS image uploads.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(input)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true })
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${compressed.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder: `${imageUploadConfig.folder}/sos`,
    resource_type: "image",
  });

  return result.secure_url;
}
