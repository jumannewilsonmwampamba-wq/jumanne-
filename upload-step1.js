// upload-step1.js - Mbinu ya URL Hash Passing

(function () {
    "use strict";

    let urlYaVideoDharura = null;

    const videoInput = document.getElementById("jumanne-video-file-input");
    const uploadDropzone = document.getElementById("jumanne-upload-box-dashed");
    const previewContainer = document.getElementById("jumanne-preview-container");
    const localPlayer = document.getElementById("jumanne-local-preview-player");
    const changeVideoBtn = document.getElementById("jumanne-change-video-btn");
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    // 1. MTAMBO WA KUKAMATA VIDEO NA PREVIEW
    if (videoInput) {
        videoInput.addEventListener("change", function (e) {
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            // Tengeneza anwani ya dharura ya video
            urlYaVideoDharura = URL.createObjectURL(faili);
            
            if (localPlayer) {
                localPlayer.src = urlYaVideoDharura;
                localPlayer.load();
                localPlayer.play().catch(function () {});
            }

            if (uploadDropzone) uploadDropzone.style.setProperty("display", "none", "important");
            if (previewContainer) previewContainer.style.setProperty("display", "flex", "important");
            if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "inline-flex", "important");
        });
    }

    // 2. INJINI YA KUSHIKILIA ANWANI NA KUHAMA UKURASA
    if (btnNext) {
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();

            if (!urlYaVideoDharura) {
                alert("Tafadhali chagua video kwanza!");
                return;
            }

            // Tunapachika anwani ya video mwisho wa URL kwa kutumia # (encodeURIComponent)
            const anwaniSafi = encodeURIComponent(urlYaVideoDharura);
            window.location.href = "upload-step2.html#video=" + anwaniSafi;
        });
    }

})();
                                                  
