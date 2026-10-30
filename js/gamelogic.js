// GameState: Modelo de datos del juego
class GameState {
  constructor() {
    this.player = {
      position: { x: 0, y: 0 },
      score: 0,
      lives: 3,
      isActive: false
    };
    this.enemies = [];
    this.gameOver = false;
    this.isPaused = false;
  }

  // ============================================
  // ACTUALIZACIÓN DE POSICIÓN DEL JUGADOR
  // ============================================

  /**
   * Actualiza la posición del jugador basado en la mano detectada
   * @param {Array} handsData - Array de manos detectadas
   */
  updatePlayerPosition(handsData) {
    if (!handsData || handsData.length === 0) {
      this.player.isActive = false;
      return;
    }

    const hand = handsData[0]; // Primera mano detectada
    
    // Handpose: landmark[0] es la muñeca (wrist)
    const wrist = hand.landmarks[0];
    
    if (wrist) {
      // wrist es [x, y, z]
      // Espejea X porque la cámara está invertida
      this.player.position = { 
        x: window.innerWidth - wrist[0], 
        y: wrist[1]
      };
      this.player.isActive = true;
    }
  }

  /**
   * Obtiene la posición actual del jugador
   * @returns {Object} { x, y }
   */
  getPlayerPosition() {
    return { ...this.player.position };
  }

  /**
   * Obtiene la posición de un punto de mano específico
   * Índices: 0=wrist, 1-4=thumb, 5-8=index, 9-12=middle, 13-16=ring, 17-20=pinky
   * @param {Array} handsData
   * @param {number} handIndex - 0 o 1
   * @param {number} landmarkIndex - 0-20
   * @returns {Object|null} { x, y } o null
   */
  getLandmarkPosition(handsData, handIndex = 0, landmarkIndex = 8) { // 8 = index_tip
    if (!handsData || !handsData[handIndex]) return null;

    const hand = handsData[handIndex];
    const landmark = hand.landmarks[landmarkIndex];

    if (landmark) {
      return {
        x: window.innerWidth - landmark[0],
        y: landmark[1],
        z: landmark[2]
      };
    }
    return null;
  }

  // ============================================
  // PUNTUACIÓN Y VIDAS
  // ============================================

  /**
   * Suma puntos
   * @param {number} points
   */
  addScore(points) {
    this.player.score += points;
  }

  /**
   * Resta vidas
   * @param {number} lives
   */
  subtractLife(lives = 1) {
    this.player.lives -= lives;
    if (this.player.lives < 0) {
      this.player.lives = 0;
    }
  }

  /**
   * Restaura vidas
   * @param {number} lives
   */
  addLife(lives = 1) {
    this.player.lives += lives;
  }

  // ============================================
  // LÓGICA DEL JUEGO
  // ============================================

  /**
   * Actualiza la lógica del juego
   * Se llama cada frame desde draw()
   */
  update() {
    if (this.gameOver || this.isPaused) return;

    // TODO: Aquí van las colisiones, enemigos, etc.
    // Por ahora es solo un placeholder

    // Comprueba condición de game over
    if (this.player.lives <= 0) {
      this.gameOver = true;
    }
  }

  // ============================================
  // CONTROL DEL JUEGO
  // ============================================

  /**
   * Pausa el juego
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Reanuda el juego
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Reinicia el juego
   */
  reset() {
    this.player = {
      position: { x: 0, y: 0 },
      score: 0,
      lives: 3,
      isActive: false
    };
    this.enemies = [];
    this.gameOver = false;
    this.isPaused = false;
  }

  // ============================================
  // ACCESO A ESTADO (PUBLIC API)
  // ============================================

  /**
   * Obtiene todo el estado del juego
   * @returns {Object}
   */
  getState() {
    return {
      player: { ...this.player },
      enemies: [...this.enemies],
      gameOver: this.gameOver,
      isPaused: this.isPaused
    };
  }

  /**
   * Obtiene solo datos del jugador
   * @returns {Object}
   */
  getPlayerData() {
    return { ...this.player };
  }

  /**
   * Obtiene solo enemigos
   * @returns {Array}
   */
  getEnemies() {
    return [...this.enemies];
  }

  /**
   * ¿El juego terminó?
   * @returns {boolean}
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * ¿El juego está pausado?
   * @returns {boolean}
   */
  getIsPaused() {
    return this.isPaused;
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================
const gameState = new GameState();
