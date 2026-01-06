const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

// Results callback
hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 2,
    });
    drawLandmarks(ctx, landmarks, {
      color: "#FF0000",
      radius: 4,
    });

    analyzeHand(landmarks);
  }
});

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480,
});

camera.start();

video.onloadedmetadata = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
};

// ======= Gesture analysis =======
function analyzeHand(landmarks) {
  const indexTip = landmarks[8];
  const wrist = landmarks[0];

  // Left/right movement
  const dx = indexTip.x - wrist.x;

  if (dx > 0.15) {
    console.log("👉 Move Right");
  } else if (dx < -0.15) {
    console.log("👈 Move Left");
  }

  // Fist detection
  const isFist =
    landmarks[8].y > landmarks[6].y && landmarks[12].y > landmarks[10].y;

  if (isFist) {
    console.log("✊ Drop");
  }

  // Palm rotation
  const palmAngle = landmarks[5].x - landmarks[17].x;
  if (palmAngle > 0.1) {
    console.log("🔄 Rotate Right");
  }
}
