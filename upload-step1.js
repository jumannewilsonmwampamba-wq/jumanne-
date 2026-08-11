// upload-step1.js - Unique Button ID Binding Framework

(function () {
    "use strict";

    let failiLaVideoAsili = null;

    // Daka ma-element ya HTML yaliyopo kwenye fomu yako
    const videoInput = document.getElementById("jumanne-video-file-input");
    const uploadDropzone = document.getElementById("jumanne-upload-box-dashed");
    const previewContainer = document.getElementById("jumanne-preview-container");
    const localPlayer = document.getElementById("jumanne-local-preview-player");
    const timeBadge = document.getElementById("jumanne-time-badge");
    const progressBar = document.getElementById("jumanne-video-progress");
    const changeVideoBtn = document.getElementById("jumanne-change-video-btn");
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    // KAGUA KAMA KUNA VIDEO ILIYOHIFADHIWA TAYARI (Kudhibiti kivinjari kikijirefresh chenyewe)
    function kaguaMizigoYaZamani() {
        const videoYaZamani = sessionStorage.getItem("jumannetok_draft_base64");
        if (videoYaZamani) {
            console.log("🔄 Kivinjari kilijirefresh! Tunairudisha video kutoka sessionStorage...");
            
            // Tengeneza muundo wa faili bandia ili kitufe cha 'Inayofuata' kisimzuie mtumiaji
            failiLaVideoAsili = { name: sessionStorage.getItem("jumannetok_draft_name") || "video.mp4" };
            
            if (localPlayer) {
                localPlayer.src = videoYaZamani;
                localPlayer.load();
                localPlayer.play().catch(function () {});
            }

            if (uploadDropzone) uploadDropzone.style.setProperty("display", "none", "important");
            if (previewContainer) previewContainer.style.setProperty("display", "flex", "important");
            if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "inline-flex", "important");
        }
    }

    // Washa ukaguzi huu mara tu script inapoingia kwenye kivinjari
    kaguaMizigoYaZamani();

    // MTAMBO WA KUKAMATA VIDEO MPYA KUTOKA KWENYE NYALAKA AU KAMERA
    if (videoInput) {
        videoInput.addEventListener("change", function (e) {
            e.stopPropagation();

            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            if (!faili.type.startsWith("video/")) {
                alert("Makosa: Tafadhali chagua faili la video halisi pekee (kama MP4, MOV)!");
                e.target.value = "";
                return;
            }

            // Kikomo cha ukubwa wa video: MB 45
            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert("Video yako ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                e.target.value = "";
                return;
            }

            failiLaVideoAsili = faili;

            // KUBADILISHA VIDEO KUWA TEXT (BASE64) ILI ILINDEKE KWENYE MEMORI YA RAM
            const msomaji = new FileReader();
            msomaji.onload = function (event) {
                try {
                    sessionStorage.setItem("jumannetok_draft_base64", event.target.result);
                    sessionStorage.setItem("jumannetok_draft_name", faili.name);
                    console.log("✅ Video imehifadhiwa salama kwenye sessionStorage!");
                } catch (errStorage) {
                    console.error("Ukomo wa kumbukumbu ya sessionStorage umefikiwa:", errStorage);
                }
            };
            msomaji.readAsDataURL(faili);

            // WASHA KICHEZA VIDEO CHA PREVIEW KWENYE UKURASA
            try {
                const urlYaPreview = URL.createObjectURL(faili);
                if (localPlayer) {
                    localPlayer.src = urlYaPreview;
                    localPlayer.load();
                    
                    localPlayer.onloadedmetadata = function() {
                        const kikomoChaMuda = 90; // Sekunde 90 (Dakika 1:30)
                        if (localPlayer.duration > kikomoChaMuda) {
                            alert("Video imezidi urefu! Mfumo unaruhusu mwisho wa dakika 1 na sekunde 30.");
                            safishaKilaKitu();
                            return;
                        }
                    };

                    localPlayer.play().catch(function () {});

                    localPlayer.addEventListener("timeupdate", function () {
                        if (localPlayer.duration) {
                            const asilimia = (localPlayer.currentTime / localPlayer.duration) * 100;
                            if (progressBar) progressBar.style.width = `${asilimia}%`;
                            
                            let sasaMin = Math.floor(localPlayer.currentTime / 60);
                            let sasaSec = Math.floor(localPlayer.currentTime % 60).toString().padStart(2, '0');
                            let jumlaMin = Math.floor(localPlayer.duration / 60);
                            let jumlaSec = Math.floor(localPlayer.duration % 60).toString().padStart(2, '0');
                            
                            if (timeBadge) timeBadge.textContent = `${sasaMin}:${sasaSec} / ${jumlaMin}:${jumlaSec}`;
                        }
                    });
                }

                if (uploadDropzone) uploadDropzone.style.setProperty("display", "none", "important");
                if (previewContainer) previewContainer.style.setProperty("display", "flex", "important");
                if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "inline-flex", "important");

            } catch (errPreview) {
                console.error("Mkwamo wa kuwasha preview:", errPreview);
            }
        });
    }

    // INJINI INAYOMTIKA MTUMIAJI KWENDA HATUA YA PILI KIBASHARA
    if (btnNext) {
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!failiLaVideoAsili && !sessionStorage.getItem("jumannetok_draft_base64")) {
                alert("Tafadhali chagua video kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

            // Hamisha ukurasa, data ipo salama kwenye sessionStorage haitapotea
            window.location.href = "upload-step2.html";
        });
    }

    function safishaKilaKitu() {
        if (localPlayer) localPlayer.src = "";
        if (videoInput) videoInput.value = "";
        failiLaVideoAsili = null;
        sessionStorage.removeItem("jumannetok_draft_base64");
        sessionStorage.removeItem("jumannetok_draft_name");
        if (uploadDropzone) uploadDropzone.style.setProperty("display", "block", "important");
        if (previewContainer) previewContainer.style.setProperty("display", "none", "important");
        if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "none", "important");
    }

})();
                                  
