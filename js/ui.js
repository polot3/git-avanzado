// Renderer: Lee estado y dibuja manos + UI
class Renderer {
  constructor(gameState, handPoseController) {
    this.gameState = gameState;
    this.handPoseController = handPoseController;
  }

  // ============================================
  // DIBUJAR MANOS (ESQUELETO)
  // ============================================

  /**
   * Dibuja las manos como palitos (conexiones) + círculos (articulaciones)
   * IMPORTANTE: No dibuja la cámara, solo el esqueleto
   */
  drawHands() {
    const hands = this.handPoseController.getHands();

    // Conexiones entre articulaciones (topología de la mano)
    // Handpose usa 21 landmarks: 0=wrist, 1-4=thumb, 5-8=index, 9-12=middle, 13-16=ring, 17-20=pinky
    const fingerConnections = [
      // Thumb (dedo pulgar)
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index (índice)
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle (corazón)
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring (anular)
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky (meñique)
      [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    hands.forEach((hand, handIndex) => {
      // ========== DIBUJAR PALITOS (CONEXIONES) ==========
      stroke(0, 255, 100);    // Verde lima
      strokeWeight(3);
      
      fingerConnections.forEach(([startIdx, endIdx]) => {
        const start = hand.landmarks[startIdx];
        const end = hand.landmarks[endIdx];

        if (start && end) {
          // start y end son [x, y, z]
          // Espejea X (porque cámara está invertida)
          const startX = width - start[0];
          const startY = start[1];
          const endX = width - end[0];
          const endY = end[1];

          line(startX, startY, endX, endY);
        }
      });

      // ========== DIBUJAR CÍRCULOS (ARTICULACIONES) ==========
      noStroke();
      hand.landmarks.forEach((landmark, idx) => {
        // landmark es [x, y, z]
        const x = width - landmark[0];
        const y = landmark[1];

        // Wrist (muñeca/landmark 0) es más grande
        if (idx === 0) {
          fill(255, 50, 100);      // Rojo-rosa
          circle(x, y, 12);
        } else {
          fill(255, 150, 50);      // Naranja
          circle(x, y, 8);
        }
      });

      // ========== DEBUG: Label de mano ==========
      if (hand.landmarks[0]) {
        fill(255, 255, 255);
        textSize(12);
        text(`Hand ${handIndex + 1}`, width - hand.landmarks[0][0] - 50, hand.landmarks[0][1] - 15);
      }
    });
  }

  // ============================================
  // DIBUJAR UI DEL JUEGO
  // ============================================

  /**
   * Dibuja HUD (puntos, vidas, etc.)
   */
  drawHUD() {
    const state = this.gameState.getState();

    fill(255, 255, 255);
    textSize(20);
    textAlign(LEFT);

    // Puntuación
    text(`Score: ${state.player.score}`, 20, 40);

    // Vidas
    text(`Lives: ${state.player.lives}`, 20, 70);

    // Estado del juego
    if (state.isPaused) {
      fill(255, 200, 0);
      textSize(24);
      textAlign(CENTER);
      text('PAUSED', width / 2, 50);
    }

    if (state.gameOver) {
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER);
      text('GAME OVER', width / 2, height / 2);
      text(`Final Score: ${state.player.score}`, width / 2, height / 2 + 40);
    }

    // Indicador de manos detectadas
    fill(100, 200, 100);
    textAlign(RIGHT);
    textSize(14);
    const handCount = this.handPoseController.getHandCount();
    text(`Hands: ${handCount}`, width - 20, 40);
  }

  /**
   * Dibuja posición del jugador (marcador de dónde está la muñeca)
   */
  drawPlayerPosition() {
    const playerPos = this.gameState.getPlayerPosition();

    if (this.gameState.player.isActive) {
      // Marcador en la posición del jugador
      fill(100, 255, 100);
      circle(playerPos.x, playerPos.y, 15);

      // Texto de coordenadas (debug)
      fill(200, 255, 200);
      textSize(12);
      text(`(${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`, playerPos.x + 20, playerPos.y);
    }
  }

  /**
   * Dibuja información de debug (opcional)
   */
  drawDebugInfo() {
    const fps = Math.round(frameRate());
    const handCount = this.handPoseController.getHandCount();

    fill(100, 200, 100);
    textSize(12);
    textAlign(LEFT);
    text(`FPS: ${fps}`, 20, height - 20);
    text(`Model Ready: ${this.handPoseController.isReady ? 'Yes' : 'No'}`, 20, height - 5);
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  /**
   * Se llama desde draw() para dibujar TODO
   */
  render() {
    // Fondo negro limpio
    background(0);

    // Dibuja las manos (lo importante)
    this.drawHands();

    // Dibuja UI
    this.drawHUD();
    this.drawPlayerPosition();
    this.drawDebugInfo();
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================
const renderer = new Renderer(gameState, handPoseController);
