// ============================================
// SKETCH.JS - Orquestador Principal
// ============================================

/**
 * Setup: Inicializa p5.js y los módulos
 */
async function setup() {
  // Corrige typos del setup anterior
  createCanvas(windowWidth, windowHeight);

  console.log('🎮 Game initializing...');

  try {
    // 1. Carga modelo de manos (espera a que esté listo)
    await handPoseController.init();
    console.log('✓ Hand Pose Controller ready');

    // 2. Suscribe gameState a eventos de manos
    handPoseController.on('handsDetected', (hands) => {
      gameState.updatePlayerPosition(hands);
    });

    console.log('✓ Game State listening to hand events');
    console.log('🎮 Game ready!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

/**
 * Draw: Loop principal (30-60 FPS)
 */
function draw() {
  // 1. Detecta manos del video en cada frame
  handPoseController.detect();

  // 2. Actualiza lógica del juego
  gameState.update();

  // 3. Dibuja todo en pantalla
  renderer.render();
}

/**
 * Si la ventana cambia de tamaño, ajusta el canvas
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * (Opcional) Limpia recursos cuando se cierra la página
 */
function windowClosed() {
  handPoseController.stop();
}
