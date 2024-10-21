'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useState, useRef } from 'react';

const TIKTOK_SESSION_ID = '8c849d8b93947c5f7e0984991f1b72d9';

export default function Home() {
	const [inputText, setInputText] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newText = e.target.value;
		setInputText(newText);
	};

	async function generateAudio(
		text: string,
		speaker: string,
		sessionId: string
	): Promise<string | undefined> {
		try {
			const response = await fetch('/api/generateAudio', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text, speaker, sessionId }),
			});

			if (!response.ok) {
				throw new Error(`Server error: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.audio) {
				const byteCharacters = atob(data.audio);
				const byteNumbers = new Array(byteCharacters.length)
					.fill(0)
					.map((_, i) => byteCharacters.charCodeAt(i));
				const byteArray = new Uint8Array(byteNumbers);
				const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });

				const audioUrl = URL.createObjectURL(audioBlob);
				return audioUrl;
			} else {
				throw new Error('No audio data received from server');
			}
		} catch (error) {
			console.error('Error generating audio:', error);
			return undefined;
		}
	}

	const processTiktok = async () => {
		console.log('Processing TikTok conversation...');
		setIsProcessing(true);
		try {
			const audioUrl = await generateAudio(
				inputText,
				'en_us_002',
				TIKTOK_SESSION_ID
			);
			if (audioUrl) {
				console.log('Audio generated successfully:', audioUrl);
				const audio = new Audio(audioUrl);
				audio
					.play()
					.then(() => {
						console.log('Audio playback started');
					})
					.catch((error) => {
						console.error('Error playing audio:', error);
					});
			} else {
				console.log('Failed to generate audio');
			}
		} catch (error) {
			console.error('Error in processTiktok:', error);
		}
		setIsProcessing(false);
		console.log('Finished processing TikTok conversation.');
	};

	return (
		<main className='flex justify-center'>
			<div className='container flex justify-center'>
				<div className='w-1/2 h-screen flex justify-center items-center flex-col gap-4'>
					<h1 className='text-4xl font-extrabold'>Tiktok TTS Demo</h1>
					<Input
						ref={inputRef}
						className='w-full'
						placeholder='Type your text here for TikTok TTS'
						value={inputText}
						onChange={handleInputChange}
					/>
					<div className='flex gap-4'>
						<Button
							variant='default'
							onClick={processTiktok}
							disabled={isProcessing}>
							{isProcessing ? 'Processing...' : 'Generate TikTok Audio'}
						</Button>
					</div>
					<audio ref={audioRef} style={{ display: 'none' }} />
				</div>
			</div>
		</main>
	);
}
