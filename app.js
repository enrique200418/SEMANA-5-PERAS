// URL de tu modelo de peras
  const URL = "https://teachablemachine.withgoogle.com/models/yW4Ao2GUw/";

  let model, webcam, maxPredictions;
  let isRunning = false;

  async function init() {
    if (isRunning) return;

    const startBtn = document.querySelector('.button-primary');
    startBtn.disabled = true;
    startBtn.innerText = "Cargando modelo...";

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Cargar modelo de Teachable Machine
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Configurar webcam
    const flip = true;
    webcam = new tmImage.Webcam(360, 360, flip);
    await webcam.setup();
    await webcam.play();

    // Reemplazar la vista previa vacía por el canvas de la webcam
    const previewWrap = document.querySelector('.preview-wrap');
    previewWrap.innerHTML = '<div class="scan-line"></div>'; // Mantiene la línea de escaneo
    previewWrap.appendChild(webcam.canvas);

    // Ajustar estilo del canvas para que encaje bien en el contenedor
    webcam.canvas.style.width = '100%';
    webcam.canvas.style.height = '100%';
    webcam.canvas.style.objectFit = 'cover';

    startBtn.innerText = "Cámara Activa";
    isRunning = true;

    // Iniciar bucle de predicción
    window.requestAnimationFrame(loop);
  }

  async function loop() {
    if (isRunning) {
      webcam.update();
      await predict();
      window.requestAnimationFrame(loop);
    }
  }

  async function predict() {
    // Correr la imagen de la webcam por el modelo
    const prediction = await model.predict(webcam.canvas);
    const predictionsContainer = document.querySelector('.predictions');
    
    // Limpiar predicciones anteriores
    predictionsContainer.innerHTML = '';

    // Actualizar el contador del panel de resultados
    const resultCount = document.querySelector('.result-count');
    if (resultCount) {
      resultCount.innerText = `${maxPredictions} Clases`;
    }

    // Renderizar cada clase detectada dentro de la nueva UI
    for (let i = 0; i < maxPredictions; i++) {
      const className = prediction[i].className;
      const percentage = (prediction[i].probability * 100).toFixed(1);

      const predictionCard = document.createElement('div');
      predictionCard.className = 'prediction';
      predictionCard.innerHTML = `
        <div class="prediction-top">
          <strong>${className}</strong>
          <span>${percentage}%</span>
        </div>
        <div class="meter">
          <i style="width: ${percentage}%;"></i>
        </div>
      `;

      predictionsContainer.appendChild(predictionCard);
    }
  }

  // Vincular la función al botón principal de "Iniciar Cámara"
  document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.querySelector('.button-primary');
    if (startBtn) {
      startBtn.setAttribute('onclick', 'init()');
    }
  });