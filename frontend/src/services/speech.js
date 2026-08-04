/**
 * SpeechService - Production ElevenLabs Text-to-Speech Service
 * Manages ElevenLabs API integration, memory-safe audio blob URL revocation,
 * strict single-instance playback control, conversational voice settings, and single-attempt retry logic.
 */
class SpeechService {
  constructor() {
    this.currentAudio = null;
    this.audioUrl = null;
    this.isPlayingAudio = false;
  }

  /**
   * Get ElevenLabs API Key from environment variables
   */
  getApiKey() {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (
        import.meta.env.VITE_ELEVEN_LABS_API_KEY ||
        import.meta.env.ELEVEN_LABS_API_KEY ||
        ''
      );
    }
    return '';
  }

  /**
   * Get ElevenLabs Voice ID from environment variables
   */
  getVoiceId() {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (
        import.meta.env.VITE_ELEVEN_LABS_VOICE_ID ||
        import.meta.env.ELEVEN_LABS_VOICE_ID ||
        '21m00Tcm4TlvDq8ikWAM' // Default voice fallback
      );
    }
    return '21m00Tcm4TlvDq8ikWAM';
  }

  /**
   * Returns true if audio is currently playing or fetching
   */
  isSpeaking() {
    return (
      this.isPlayingAudio ||
      (this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended)
    );
  }

  /**
   * Immediately stops audio, clears event listeners, revokes object URLs, and resets playback flags.
   */
  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.onplay = null;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
      } catch (e) {
        // Ignore pause errors
      }
      this.currentAudio = null;
    }
    this._cleanupAudioUrl();
    this.isPlayingAudio = false;
  }

  /**
   * Helper to safely revoke object URL to prevent browser memory leaks
   */
  _cleanupAudioUrl() {
    if (this.audioUrl) {
      try {
        URL.revokeObjectURL(this.audioUrl);
      } catch (e) {
        // Ignore revocation errors
      }
      this.audioUrl = null;
    }
  }

  /**
   * Fetches audio blob from ElevenLabs with conversational voice settings and single-attempt retry logic.
   */
  async _fetchElevenLabsAudio(cleanText, isRetry = false) {
    const apiKey = this.getApiKey();
    const voiceId = this.getVoiceId();

    if (!apiKey) {
      const err = new Error('ElevenLabs API key missing. Please set VITE_ELEVEN_LABS_API_KEY in .env file.');
      err.isAuthError = true;
      throw err;
    }

    console.log('[SpeechService.speak] 2. Before fetch call to ElevenLabs', { voiceId, textLength: cleanText.length, isRetry });

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.35,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true
            }
          })
        }
      );

      console.log('[SpeechService.speak] 3. After fetch response received', { ok: response.ok, status: response.status });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const message = errorData.detail?.message || `ElevenLabs HTTP ${status}: ${response.statusText}`;

        const err = new Error(message);
        err.status = status;

        if (status === 400 || status === 401 || status === 403) {
          err.isAuthError = true;
        } else {
          err.isTransient = status === 429 || status >= 500;
        }
        throw err;
      }

      const audioBlob = await response.blob();
      console.log('[SpeechService.speak] 4. After reading response blob', { blobSize: audioBlob.size, blobType: audioBlob.type });
      return audioBlob;
    } catch (err) {
      if (!isRetry && !err.isAuthError) {
        console.warn('[SpeechService] ElevenLabs API request failed, retrying in 1s...', err.message);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this._fetchElevenLabsAudio(cleanText, true);
      }
      throw err;
    }
  }

  /**
   * Speaks clean text using ElevenLabs TTS with detailed checkpoint logging.
   */
  async speak(text, { onStart, onEnd, onError } = {}) {
    console.log('[SpeechService.speak] 1. Entry', { text });

    // 1. Immediately mark as playing and stop any existing audio
    this.stop();
    this.isPlayingAudio = true;

    if (!text || !text.trim()) {
      console.log('[SpeechService.speak] Empty text provided, aborting.');
      this.isPlayingAudio = false;
      if (onEnd) onEnd();
      return;
    }

    // 2. Clean text by stripping Markdown formatting
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) {
      console.log('[SpeechService.speak] Cleaned text is empty, aborting.');
      this.isPlayingAudio = false;
      if (onEnd) onEnd();
      return;
    }

    try {
      const audioBlob = await this._fetchElevenLabsAudio(cleanText);

      // Verify that playback wasn't stopped/cancelled while fetching
      if (!this.isPlayingAudio) {
        console.log('[SpeechService.speak] Playback cancelled during fetch.');
        if (onEnd) onEnd();
        return;
      }

      this._cleanupAudioUrl();
      this.audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(this.audioUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        console.log('[SpeechService.speak] Event: onplay fired');
        this.isPlayingAudio = true;
        if (onStart) onStart();
      };

      audio.onended = () => {
        console.log('[SpeechService.speak] Event: onended fired');
        this.stop();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn('[SpeechService.speak] Event: onerror fired', e);
        this.stop();
        if (onError) onError('Audio playback failed.');
        if (onEnd) onEnd();
      };

      console.log('[SpeechService.speak] 5. Before audio.play() call', { audioUrl: this.audioUrl });
      await audio.play();
      console.log('[SpeechService.speak] 6. After audio.play() resolved successfully');
    } catch (err) {
      console.warn('[SpeechService.speak] ElevenLabs TTS Exception:', err.message || err);
      this.stop();
      if (onError) {
        onError(err.isAuthError ? err.message : 'Voice synthesis unavailable. Continuing conversation...');
      }
      if (onEnd) onEnd(); // Gracefully continue hands-free loop
    }
  }
}

export const speechService = new SpeechService();
