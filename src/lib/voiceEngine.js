/**
 * Voice Engine - CELIS ENGINE (Reconocimiento Híbrido: Web Speech API + Groq Whisper Fallback)
 */

export class CelisVoiceEngine {
  constructor(options = {}) {
    this.onResult = options.onResult || (() => {});
    this.onError = options.onError || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onEnd = options.onEnd || (() => {});
    this.isListening = false;
    this.recognition = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.initNativeSpeech();
  }

  initNativeSpeech() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-MX';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStart();
        };

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          this.onResult({ transcript, source: 'web_speech' });
        };

        this.recognition.onerror = (event) => {
          console.warn('[CelisVoiceEngine] Error en Web Speech:', event.error);
          this.onError(event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onEnd();
        };
      }
    }
  }

  async startListening(groqKey = null) {
    if (this.isListening) return;

    if (this.recognition) {
      try {
        this.recognition.start();
        return;
      } catch (err) {
        console.warn('[CelisVoiceEngine] No se pudo iniciar Web Speech, usando grabador de audio:', err);
      }
    }

    // Fallback: Grabar audio vía MediaRecorder para Groq Whisper
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };
        this.mediaRecorder.onstop = async () => {
          this.isListening = false;
          this.onEnd();
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          if (groqKey) {
            await this.transcribeWithGroq(audioBlob, groqKey);
          }
        };
        this.mediaRecorder.start();
        this.isListening = true;
        this.onStart();
      } catch (err) {
        this.onError('No se pudo acceder al micrófono: ' + err.message);
      }
    } else {
      this.onError('El navegador no soporta captura de voz.');
    }
  }

  stopListening() {
    if (!this.isListening) return;
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isListening = false;
  }

  async transcribeWithGroq(audioBlob, groqKey) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'es');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}` },
        body: formData
      });

      const data = await response.json();
      if (data.text) {
        this.onResult({ transcript: data.text, source: 'groq_whisper' });
      } else {
        this.onError('No se pudo transcribir audio con Groq Whisper');
      }
    } catch (err) {
      this.onError('Error transcribiendo con Whisper: ' + err.message);
    }
  }
}
