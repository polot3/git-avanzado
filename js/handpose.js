// HandPoseController: Encapsula Google Handpose y detección de manos
class HandPoseController {
  constructor() {
    this.model = null;
    this.predictions = []; // Array de manos detectadas
    this.isReady = false;
    this.listeners = {}; // Sistema de eventos pub/sub
    this.video = null;
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  /**
   * Carga el modelo Handpose de Google y prepara el video
   * Llamar desde setup()
   */
  async init() {
    try {
      // Carga modelo de detección de manos de Google
      this.model = await handpose.load();
      console.log('✓ Handpose Model loaded');

      // Obtén el elemento video del DOM
      this.video = document.getElementById('video');
      if (!this.video) {
        console.error('❌ Video element not found in DOM');
        return;
      }

      // Solicita acceso a la cámara
      await this._startWebcam();
      this.isReady = true;
      this.emit('ready');
    } catch (error) {
      console.error('❌ Error initializing Handpose:', error);
    }
  }

  /**
   * Inicia webcam del navegador
   * @private
   */
  async _startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      this.video.srcObject = stream;

      // Espera a que el video esté listo
      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });
    } catch (error) {
      console.error('❌ Webcam access denied or not available:', error);
      throw error;
    }
  }

  // ============================================
  // DETECCIÓN DE MANOS
  // ============================================

  /**
   * Procesa el video y extrae manos
   * Llamar desde draw()
   */
  async detect() {
    if (!this.isReady || !this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return;
    }

    try {
      // Handpose estima las manos en el video
      this.predictions = await this.model.estimateHands(this.video, false);

      // Emite evento para listeners (ej: gameState)
      if (this.predictions.length > 0) {
        this.emit('handsDetected', this.predictions);
      }
    } catch (error) {
      console.error('❌ Error detecting hands:', error);
    }
  }

  // ============================================
  // ACCESO A DATOS (PUBLIC API)
  // ============================================

  /**
   * Obtiene manos detectadas en formato normalizado
   * @returns {Array} [ { landmarks, handedness }, ... ]
   */
  getHands() {
    return this.predictions.map(hand => ({
      landmarks: hand.landmarks, // Array de [x, y, z]
      confidence: hand.confidence || 0
    }));
  }

  /**
   * Obtiene una mano específica por índice
   * @param {number} index - 0 para primera mano, 1 para segunda
   * @returns {Object|null}
   */
  getHand(index = 0) {
    return this.predictions[index] || null;
  }

  /**
   * Obtiene posición de un punto específico (ej: landmark 0 = wrist)
   * Handpose usa índices numéricos para landmarks
   * 0: wrist, 1-4: thumb, 5-8: index, 9-12: middle, 13-16: ring, 17-20: pinky
   * @param {number} handIndex - Índice de la mano (0 o 1)
   * @param {number} landmarkIndex - Índice del punto (0-20)
   * @returns {Object|null} { x, y, z } o null
   */
  getLandmarkPosition(handIndex = 0, landmarkIndex = 0) {
    const hand = this.getHand(handIndex);
    if (!hand || !hand.landmarks[landmarkIndex]) return null;

    const [x, y, z] = hand.landmarks[landmarkIndex];
    return { x, y, z };
  }

  /**
   * Obtiene todos los landmarks de una mano
   * @param {number} handIndex
   * @returns {Array} Array de [x, y, z]
   */
  getLandmarks(handIndex = 0) {
    const hand = this.getHand(handIndex);
    return hand ? hand.landmarks : [];
  }

  /**
   * Cantidad de manos detectadas
   * @returns {number}
   */
  getHandCount() {
    return this.predictions.length;
  }

  /**
   * ¿Hay manos detectadas?
   * @returns {boolean}
   */
  hasHands() {
    return this.predictions.length > 0;
  }

  // ============================================
  // SISTEMA DE EVENTOS
  // ============================================

  /**
   * Suscribe a un evento
   * @param {string} event - Nombre del evento ('ready', 'handsDetected')
   * @param {Function} callback - Función a llamar
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Desuscribe de un evento
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emite un evento a todos los listeners
   * @private
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for '${event}':`, error);
        }
      });
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Calcula distancia entre dos puntos
   * Útil para detectar gestos (ej: pinza)
   * @param {Array} point1 - [x, y, z]
   * @param {Array} point2 - [x, y, z]
   * @returns {number} Distancia en píxeles
   */
  static distance(point1, point2) {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Detecta si dos puntos están cerca (útil para gestos)
   * @param {Array} point1 - [x, y, z]
   * @param {Array} point2 - [x, y, z]
   * @param {number} threshold - Distancia máxima en píxeles
   * @returns {boolean}
   */
  static isNear(point1, point2, threshold = 50) {
    return this.distance(point1, point2) < threshold;
  }

  /**
   * Obtiene nombre de landmark por índice (para debug)
   * @param {number} index
   * @returns {string}
   */
  static getLandmarkName(index) {
    const names = [
      'wrist',
      'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
      'index_mcp', 'index_pip', 'index_dip', 'index_tip',
      'middle_mcp', 'middle_pip', 'middle_dip', 'middle_tip',
      'ring_mcp', 'ring_pip', 'ring_dip', 'ring_tip',
      'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip'
    ];
    return names[index] || 'unknown';
  }

  /**
   * Detiene la cámara (para limpiar recursos)
   */
  stop() {
    if (this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
    this.isReady = false;
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================
const handPoseController = new HandPoseController();
