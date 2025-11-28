// src/r2Config.js
import { S3Client } from "@aws-sdk/client-s3";

// Initialize the R2 Client
// We use the AWS S3 SDK because Cloudflare R2 is S3-compatible.
export const r2Client = new S3Client({
    region: "auto", // R2 uses 'auto' for region
    endpoint: process.env.REACT_APP_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,
    },
});

export const R2_BUCKET_ID = process.env.REACT_APP_R2_BUCKET_ID;
export const R2_PUBLIC_DOMAIN = process.env.REACT_APP_R2_PUBLIC_DOMAIN;