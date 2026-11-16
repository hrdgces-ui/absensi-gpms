<!-- LANJUTAN DARI: <div id="cameraModal" class="hidden fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-4"> -->
  <!-- <div class="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col"> (Sudah ada di kode Anda sebelumnya) -->
    
      <div class="relative w-full aspect-[3/4] bg-black">
        <!-- Elemen Video & Canvas untuk Kamera -->
        <video id="cameraVideo" class="w-full h-full object-cover" autoplay playsinline></video>
        <canvas id="cameraCanvas" class="hidden"></canvas>
        
        <!-- Overlay Info di Kamera (Watermark) -->
        <div class="absolute bottom-3 left-3 right-3 text-white text-[10px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10 pointer-events-none">
          <p id="camOverlayName" class="font-bold text-emerald-400 mb-0.5">Nama Karyawan</p>
          <p id="camOverlayTime" class="font-mono text-amber-300"></p>
          <p id="camOverlayLoc" class="leading-tight mt-0.5 opacity-90 text-[8px]"></p>
        </div>

        <!-- Indikator Loading Kamera -->
        <div id="cameraLoading" class="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 z-20">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2 text-emerald-500"></i>
          <span class="text-xs font-bold">Membuka Kamera...</span>
        </div>
      </div>
      
      <!-- Tombol Aksi Kamera -->
      <div class="p-4 grid grid-cols-2 gap-3 bg-slate-50 border-t border-slate-200">
        <button type="button" onclick="closeCameraModal()" class="py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs shadow-sm">Batal</button>
        <button type="button" id="btnCapturePhoto" onclick="capturePhoto()" class="py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center">
          <i class="fa-solid fa-camera mr-2"></i>Ambil Foto
        </button>
      </div>

    </div>
  </div> <!-- End of Camera Modal -->

  <!-- SCRIPT LOGIKA UTAMA -->
  <script>
    // === 1. MANAJEMEN TAB & NAVIGASI ===
    function switchTab(tabId) {
      // Sembunyikan semua konten tab
      document.querySelectorAll('.tab-content-pane').forEach(el => {
        el.classList.add('hidden');
      });
      // Tampilkan tab yang dipilih
      document.getElementById('tabContent-' + tabId).classList.remove('hidden');

      // Reset warna icon navigasi
      document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('text-emerald-600');
        el.classList.add('text-slate-400');
      });
      
      // Warnai icon navigasi yang aktif
      const activeNav = document.getElementById('nav-' + tabId);
      if(activeNav) {
        activeNav.classList.remove('text-slate-400');
        activeNav.classList.add('text-emerald-600');
      }
    }

    // === 2. MANAJEMEN DROPDOWN & PIN MODAL ===
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdownCard');
      dropdown.classList.toggle('hidden');
    }

    function openPinModal(userName) {
      document.getElementById('userDropdownCard').classList.add('hidden');
      document.getElementById('pinModalUserName').innerText = userName;
      document.getElementById('pinModal').classList.remove('hidden');
      document.getElementById('pinInputField').value = '';
      document.getElementById('pinInputField').focus();
    }

    function closePinModal() {
      document.getElementById('pinModal').classList.add('hidden');
    }

    function confirmPinLogin() {
      const pin = document.getElementById('pinInputField').value;
      if(pin.length >= 4) {
        const userName = document.getElementById('pinModalUserName').innerText;
        document.getElementById('headerActiveUserShort').innerText = userName;
        closePinModal();
        showToast('Berhasil masuk sebagai ' + userName, 'success');
      } else {
        showToast('PIN tidak valid!', 'error');
      }
    }

    // === 3. JAM REAL-TIME ===
    function updateClock() {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateString = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      
      const clockEl = document.getElementById('liveClockText');
      const dateEl = document.getElementById('liveDateText');
      
      if(clockEl) clockEl.innerHTML = `${timeString} <span class="text-xs text-emerald-400 font-sans">WIB</span>`;
      if(dateEl) dateEl.innerText = dateString;
      
      const camTime = document.getElementById('camOverlayTime');
      if(camTime) camTime.innerText = `${dateString} ${timeString}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // === 4. SISTEM KAMERA (WEB RTC) ===
    let videoStream = null;
    const video = document.getElementById('cameraVideo');
    let currentPhotoTarget = ''; 

    async function openTaskLiveCamera(targetCode) {
      currentPhotoTarget = targetCode; // 'BEFORE', 'DURING', atau 'AFTER'
      document.getElementById('cameraModal').classList.remove('hidden');
      document.getElementById('cameraLoading').classList.remove('hidden');
      
      try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        video.srcObject = videoStream;
        video.onloadedmetadata = () => {
          document.getElementById('cameraLoading').classList.add('hidden');
        };
      } catch (err) {
        console.error("Kamera error:", err);
        document.getElementById('cameraLoading').innerHTML = `<p class="text-red-400 text-xs">Gagal mengakses kamera.</p>`;
      }
    }

    function closeCameraModal() {
      document.getElementById('cameraModal').classList.add('hidden');
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
      }
    }

    function capturePhoto() {
      // Mockup logika ambil foto
      showToast(`Foto ${currentPhotoTarget} berhasil diambil!`, 'success');
      closeCameraModal();
      
      // Update UI Kotak Foto di Laporan
      const imgTarget = document.getElementById(currentPhotoTarget === 'BEFORE' ? 'imgPrevBefore' : currentPhotoTarget === 'DURING' ? 'imgPrevDuring' : 'imgPrevAfter');
      const iconTarget = document.getElementById(currentPhotoTarget === 'BEFORE' ? 'emptyIconBefore' : currentPhotoTarget === 'DURING' ? 'emptyIconDuring' : 'emptyIconAfter');
      
      if(imgTarget && iconTarget) {
        // Simulasi placeholder foto
        imgTarget.src = 'https://via.placeholder.com/150/059669/FFFFFF?text=' + currentPhotoTarget;
        imgTarget.classList.remove('hidden');
        iconTarget.classList.add('hidden');
      }
      
      checkLapPhotoCompletion();
    }

    // === 5. TOAST NOTIFICATION ===
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toastNotification');
      const icon = document.getElementById('toastIcon');
      
      document.getElementById('toastMessage').innerText = message;
      
      if(type === 'success') {
        icon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
      } else {
        icon.className = 'fa-solid fa-circle-exclamation text-rose-400 text-lg';
      }

      toast.classList.remove('opacity-0', 'pointer-events-none');
      toast.classList.add('opacity-100', '-translate-y-4');
      
      setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
        toast.classList.remove('opacity-100', '-translate-y-4');
      }, 3000);
    }

    // === 6. FUNGSI-FUNGSI UI LAINNYA (DUMMY/MOCKUP) ===
    function initRealGps() {
      document.getElementById('gpsStatusTitle').innerText = "MENCARI SATELIT...";
      showToast('Meminta lokasi GPS...', 'success');
      // Logika GPS navigator.geolocation bisa ditambahkan disini
    }

    function selectShift(shift) {
      document.querySelectorAll('#shiftSelectorBox button').forEach(btn => {
        btn.className = "flex-1 border border-slate-200 bg-slate-50 text-slate-500 py-1.5 rounded-lg text-[10px] font-bold";
      });
      const selectedBtn = document.getElementById(shift === 'Middle' ? 'btnShiftMiddle' : 'btnShift' + shift);
      if(selectedBtn) {
        selectedBtn.className = "flex-1 border border-emerald-500 bg-emerald-50 text-emerald-700 py-1.5 rounded-lg text-[10px] font-bold";
      }
    }

    function setJenisAbsen(jenis) {
      const btnMasuk = document.getElementById('btnJenisMasuk');
      const btnPulang = document.getElementById('btnJenisPulang');
      
      if(jenis === 'masuk') {
        btnMasuk.className = "flex-1 text-[11px] font-bold py-2 rounded-lg bg-white text-emerald-600 shadow-sm";
        btnPulang.className = "flex-1 text-[11px] font-bold py-2 rounded-lg text-slate-500";
        document.getElementById('mainAbsenLabel').innerText = "TAP MASUK";
      } else {
        btnPulang.className = "flex-1 text-[11px] font-bold py-2 rounded-lg bg-white text-emerald-600 shadow-sm";
        btnMasuk.className = "flex-1 text-[11px] font-bold py-2 rounded-lg text-slate-500";
        document.getElementById('mainAbsenLabel').innerText = "TAP PULANG";
      }
    }

    function triggerAbsenAction() {
      showToast('Memproses absensi...', 'success');
    }

    function switchSubTabLaporan(subTab) {
      document.querySelectorAll('[id^="subPaneLap-"]').forEach(el => el.classList.add('hidden'));
      document.getElementById('subPaneLap-' + subTab).classList.remove('hidden');
    }

    function checkLapPhotoCompletion() {
      const b = !document.getElementById('imgPrevBefore').classList.contains('hidden');
      const d = !document.getElementById('imgPrevDuring').classList.contains('hidden');
      const a = !document.getElementById('imgPrevAfter').classList.contains('hidden');
      
      const btn = document.getElementById('btnSubmitTaskReport');
      if (b && d && a) {
        btn.disabled = false;
        btn.className = "flex-1 bg-emerald-600 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg";
        btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i><span>KIRIM LAPORAN (3/3)</span>`;
      }
    }

    // Inisialisasi daftar karyawan dummy (Merespon 'userListContainer')
    const userList = document.getElementById('userListContainer');
    if(userList) {
      userList.innerHTML = `
        <div onclick="openPinModal('Ahmad Syafiq')" class="p-3 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100">
          <div><p class="font-bold text-slate-800">Ahmad Syafiq</p><p class="text-[9px] text-slate-500">NIP: 1012023 | Leader</p></div>
          <i class="fa-solid fa-chevron-right text-slate-300"></i>
        </div>
        <div onclick="openPinModal('Budi Santoso')" class="p-3 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 mt-2">
          <div><p class="font-bold text-slate-800">Budi Santoso</p><p class="text-[9px] text-slate-500">NIP: 1012024 | CSO</p></div>
          <i class="fa-solid fa-chevron-right text-slate-300"></i>
        </div>
      `;
    }

  </script>
</body>
</html>
