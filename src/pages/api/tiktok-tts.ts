// For Next.js 13 with App Router (app/api/generateAudio/route.ts)

import { NextRequest, NextResponse } from 'next/server';
import tiktokTTS from '../../lib/tiktok-tts'; // Adjust the import path accordingly

export async function POST(req: NextRequest) {
	try {
		const { text, speaker, sessionId } = await req.json();

		// Configure tiktokTTS with the session ID
		tiktokTTS.config(sessionId);

		// Generate audio from text
		const audioData = await tiktokTTS.createAudioFromText(text, speaker);

		// Return the audio data as a base64 string
		const base64Audio = await audioData.arrayBuffer().then((buffer) => {
			return Buffer.from(buffer).toString('base64');
		});

		return NextResponse.json({ audio: base64Audio });
	} catch (error: unknown) {
		console.error('Error generating audio:', error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'An unknown error occurred',
			},
			{ status: 500 }
		);
	}
}
