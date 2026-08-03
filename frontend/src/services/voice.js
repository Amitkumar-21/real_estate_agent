/**
 * VoiceService - Web Speech API Service
 * Follows official MDN Web Speech API specification.
 */
class VoiceService {
  constructor() {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    this.SpeechRecognition = SpeechRecognition || null;
    this.recognition = null;
    this.isListening = false;
  }

  /**
   * Check if browser supports Speech Recognition
   */
  isSupported() {
    return !!this.SpeechRecognition;
  }

  /**
   * Starts speech recognition session following MDN Web Speech API standards.
   */
  start({ onStart, onResult, onError, onEnd }) {
    if (!this.isSupported()) {
      if (onError) {
        onError('Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    try {
      this.recognition = new this.SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log('[VoiceService] Speech recognition started');
        this.isListening = true;
        if (onStart) onStart();
      };

      this.recognition.onresult = (event) => {
        console.log('[VoiceService] Speech recognition result event:', event);
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          console.log('[VoiceService] Recognized text:', transcript);
          if (onResult) {
            onResult(transcript);
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceService] Speech recognition error:', event.error);
        this.isListening = false;
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          if (onError) onError('Microphone permission denied. Please allow access in browser settings.');
        } else if (event.error === 'audio-capture') {
          if (onError) onError('No microphone detected. Please check your audio input device.');
        }
      };

      this.recognition.onend = () => {
        console.log('[VoiceService] Speech recognition ended');
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (err) {
      console.error('[VoiceService] Failed to start recognition:', err);
      this.isListening = false;
    }
  }

  /**
   * Stops active speech recognition
   */
  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
    this.isListening = false;
  }
}

export const voiceService = new VoiceService();
