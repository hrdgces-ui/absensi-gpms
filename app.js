let currentStream = null;
let currentFacingMode = 'environment'; // Kamera belakang
let currentLocation = { lat: '-', lng: '-' };

const video = document.getElementById('cameraVideo');
const canvas = document.getElementById('cameraCanvas');
const modalCamera = document.getElementById('cameraModal');
const camWmDate = document.getElementById('camWmDate');
const camWmLocation = document.getElementById('camWmLocation');

// 1. FUNGSI GPS
function updateGPS() {
    if ("geolocation" in navigator) {
        camWmLocation.innerText = "📍 Sedang mencari lokasi...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation.lat = position.coords.latitude.toFixed(6);
                currentLocation.lng = position.coords.longitude.toFixed(6);
                camWmLocation.innerText = `📍 ${currentLocation.lat}, ${currentLocation.lng}`;
            },
            (error) => {
                camWmLocation.innerText = "📍 Gagal mendapat lokasi";
            },
            { enableHighAccuracy: true }
        );
    } else {
        camWmLocation.innerText = "📍 GPS tidak didukung";
    }
}

// 2. FUNGSI KAMERA
async function initCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
    };

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (err) {
        alert("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
    }
}

function switchCamera() {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    initCamera();
}

function openTaskLiveCamera() {
    modalCamera.classList.remove('hidden');
    updateGPS();
    initCamera();
    window.wmInterval = setInterval(updateWatermarkPreview, 1000);
}

function closeTaskLiveCamera() {
    modalCamera.classList.add('hidden');
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    clearInterval(window.wmInterval);
}

// 3. FUNGSI WATERMARK & FOTO
function updateWatermarkPreview() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID');
    camWmDate.innerText = `${dateStr} - ${timeStr}`;
}

function capturePhoto() {
    if (!currentStream) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Styling Watermark
    const fontSize = canvas.width * 0.03; 
    ctx.font = `${fontSize}px monospace`;
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const startX = 20;
    let startY = canvas.height - (fontSize * 4);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(10, startY - fontSize, canvas.width * 0.6, fontSize * 4.5);

    ctx.fillStyle = "#34d399"; 
    ctx.fillText(camWmDate.innerText, startX, startY);
    
    ctx.fillStyle = "white";
    ctx.fillText(camWmLocation.innerText, startX, startY + (fontSize * 1.5));
    ctx.fillText("User: Karyawan", startX, startY + (fontSize * 3));

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    alert("Foto berhasil diambil!");
    
    closeTaskLiveCamera();
}
