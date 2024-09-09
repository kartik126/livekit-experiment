import { NextRequest, NextResponse } from "next/server";
import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  GCPUpload,
} from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const livekitHost = "wss://test-khsr3dts.livekit.cloud"; // Your LiveKit server URL
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

    // Decode the GCP credentials from Base64
    const base64Credentials = process.env.GCP_CREDENTIALS_BASE64!;
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );

    // Create the EgressClient
    const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);

    // Configure the file output for GCP
    const fileOutput = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: "livekit-demo/web-test.mp4",
      output: {
        case: "gcp",
        value: new GCPUpload({
          credentials: credentials, // Use the decoded credentials
          bucket: "avatar-lesson-recordings", // Replace 'my-bucket' with your actual GCP bucket name
        }),
      },
    });

    // Start Web Egress for the specified URL
    const info = await egressClient.startRoomCompositeEgress(
      "quickstart-room",
      { file: fileOutput }
    );
    const egressID = info.egressId;

    return NextResponse.json({ success: true, egressId: egressID });
  } catch (error) {
    console.error("Error starting web egress:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
