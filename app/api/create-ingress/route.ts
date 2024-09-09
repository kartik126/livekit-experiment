import { NextRequest, NextResponse } from 'next/server';
import { IngressClient, IngressInput } from 'livekit-server-sdk';

export async function POST(request: NextRequest) {
  try {
    // Parse request body (if you are sending custom data)
    const body = await request.json();
    const livekitHost = "wss://test-khsr3dts.livekit.cloud"
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    // Create IngressClient instance
    const ingressClient = new IngressClient(livekitHost, apiKey, apiSecret);

    // Define the ingress parameters
    const ingress = {
      name: body.name || 'my-ingress',
      roomName: body.roomName || 'my-room',
      participantIdentity: body.participantIdentity || 'my-participant',
      participantName: body.participantName || 'My Participant',
      url: body.url
    };

    // Call LiveKit's createIngress method
    const ingressInfo = await ingressClient.createIngress(IngressInput.URL_INPUT, ingress);

    // Return success with ingress info
    return NextResponse.json({ success: true, ingressInfo });
  } catch (error) {
    console.error('Error creating ingress:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
