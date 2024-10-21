import axios from 'axios';

let BASE_URL =
	'https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke';

const DEFAULT_VOICE = 'en_us_001';

let tiktokSessionId: string | null = null;

function config(userTiktokSessionId: string, customBaseUrl?: string): void {
	tiktokSessionId = userTiktokSessionId;
	if (customBaseUrl) BASE_URL = customBaseUrl;
}

function getConfig(): { BASE_URL: string; tiktokSessionId: string | null } {
	return {
		BASE_URL: BASE_URL,
		tiktokSessionId: tiktokSessionId,
	};
}

function prepareText(text: string): string {
	text = text.replace('+', 'plus');
	text = text.replace(/\s/g, '+');
	text = text.replace('&', 'and');
	return text;
}

function handleStatusError(status_code: number): never {
	switch (status_code) {
		case 1:
			throw new Error(
				`Your TikTok session id might be invalid or expired. Try getting a new one. status_code: ${status_code}`
			);
		case 2:
			throw new Error(
				`The provided text is too long. status_code: ${status_code}`
			);
		case 4:
			throw new Error(
				`Invalid speaker, please check the list of valid speaker values. status_code: ${status_code}`
			);
		case 5:
			throw new Error(`No session id found. status_code: ${status_code}`);
		default:
			throw new Error(`Unknown error. status_code: ${status_code}`);
	}
}

async function createAudioFromText(
	text: string | null = null,
	text_speaker: string = DEFAULT_VOICE
): Promise<Blob> {
	if (text === null) {
		throw new Error('Text cannot be null');
	}
	const req_text = prepareText(text);
	const URL = `${BASE_URL}/?text_speaker=${text_speaker}&req_text=${req_text}&speaker_map_type=0&aid=1233`;
	const headers = {
		'User-Agent':
			'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
		Cookie: `sessionid=${tiktokSessionId}`,
		'Accept-Encoding': 'gzip,deflate,compress',
	};
	try {
		const result = await axios.post(URL, null, { headers: headers });
		const status_code = result?.data?.status_code;
		if (status_code !== 0) return handleStatusError(status_code);
		const encoded_voice = result?.data?.data?.v_str;
		const buffer = Buffer.from(encoded_voice, 'base64');
		return new Blob([buffer], { type: 'audio/mp3' });
	} catch (err) {
		throw new Error(`tiktok-tts ${err}`);
	}
}

const tiktokTTS = {
	config: (tiktokSessionId: string, customBaseUrl?: string): void =>
		config(tiktokSessionId, customBaseUrl),
	createAudioFromText: async (text: string, speaker: string): Promise<Blob> => {
		if (tiktokSessionId) return createAudioFromText(text, speaker);
		throw new Error(
			`tiktok-tts has not been configured! Make sure you run config(yourTiktokSessionIdHere)`
		);
	},
	getConfig: getConfig,
};

export default tiktokTTS;
