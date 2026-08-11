// upload-step1.js - Core Upload Engine (Step 1: Preview & Storage)

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let failiLaVideoAsili = null; 

    // 1. INJINI YA KI-HARDWARE: FUNGUA DATABASE YA NDANI KWA USALAMA
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Storage_v2", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("video_drafts")) {
                db.createObjectStore("video_drafts", { keyPath: "id" });
            }
        };

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Kumbukumbu maalum ya diski imewaka salama!");
        };

        ombiDuka.onerror = function () {
            console.error("❌ Imeshindikana kufungua kumbukumbu ya ndani.");
        };
    }

    amshaDukaLaUploadLocal();

    // DAKA MA-ELEMENT YOTE KUTOKA KWENYE HTML YAKO VERBATIM
    const videoInput = document.getElementById("jumanne-video-file-input");
    const uploadDropzone = document.getElementById("jumanne-upload-box-dashed");
    const previewContainer = document.getElementById("jumanne-preview-container");
    const localPlayer = document.getElementById("jumanne-local-preview-player");
    const timeBadge = document.getElementById("jumanne-time-badge");
    const progressBar = document.getElementById("jumanne-video-progress");
    const changeVideoBtn = document.getElementById("jumanne-change-video-btn");
    
    // ID Halisi ya kitufe chako cha HTML
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    // 2. MTAMBO WA KUKAMATA VIDEO NA KUWASHA PREVIEW PAPO HAPO
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

            // Ukaguzi wa bando: MB 45
            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert("Video yako ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                e.target.value = "";
                return;
            }

            failiLaVideoAsili = faili;

            try {
                // Tengeneza URL ya dharura ili video ionekane kwenye kichezaji (Preview)
                const urlYaPreview = URL.createObjectURL(faili);
                
                if (localPlayer) {
                    localPlayer.src = urlYaPreview;
                    localPlayer.load();
                    
                    // Kupima muda isizidi dakika 1:30 (Sekunde 90)
                    localPlayer.onloadedmetadata = function() {
                        if (localPlayer.duration > 90) {
                            alert("Video imezidi urefu! Mfumo unaruhusu mwisho wa dakika 1 na sekunde 30.");
                            safishaKilaKitu();
                            return;
                        }
                    };

                    localPlayer.play().catch(function () {});

                    // Kusogeza Progress Bar na kubadili namba za muda
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

                // Ficha boksi la kuchagua, onyesha kioo cha video na kitufe cha badilisha
                if (uploadDropzone) uploadDropzone.style.setProperty("display", "none", "important");
                if (previewContainer) previewContainer.style.setProperty("display", "flex", "important");
                if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "inline-flex", "important");

            } catch (errPreview) {
                console.error("Mkwamo wa kuwasha preview:", errPreview);
            }
        });
    }

    // 3. INJINI INAYOHIFADHI VIDEO KWENYE DISKI (MEMORI) NA KUHAMA UKURASA
    if (btnNext) {
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!failiLaVideoAsili) {
                alert("Tafadhali chagua video kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            // Fallback: Kama kumbukumbu ya ndani imegoma kuwaka, mrushe tu mbele kulinda UX
            if (!dbIndexedAkiba) {
                console.warn("⚠️ Kumbukumbu haiko tayari, tunasonga mbele kwa dharura...");
                window.location.href = "upload-step2.html";
                return;
            }

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inahifadhi...';

            try {
                const muamala = dbIndexedAkiba.transaction(["video_drafts"], "readwrite");
                const duka = muamala.objectStore("video_drafts");

                const dataYaKuweka = {
                    id: "current_draft_video",
                    video_blob: failiLaVideoAsili, 
                    jina: failiLaVideoAsili.name,
                    tarehe: new Date().getTime()
                };

                const ombiKuhifadhi = duka.put(dataYaKuweka);

                // Hakikisha faili limeandikwa kikamilifu kwenye diski kabla ya kuhama
                ombiKuhifadhi.onsuccess = function () {
                    console.log("✅ Video imehifadhiwa salama kwenye memori!");
                    window.location.href = "upload-step2.html";
                };

                // Ikifeli kuandika, usimkwamishe mtumiaji, mpeleke tu mbele
                ombiKuhifadhi.onerror = function (e) {
                    console.error("❌ Imeshindikana kuandika faili:", e);
                    window.location.href = "upload-step2.html";
                };

            } catch (err) {
                console.error("Mkwamo umezuiwa kwa dharura:", err);
                window.location.href = "upload-step2.html";
            }
        });
    }

    function safishaKilaKitu() {
        if (localPlayer) localPlayer.src = "";
        if (videoInput) videoInput.value = "";
        failiLaVideoAsili = null;
        if (uploadDropzone) uploadDropzone.style.setProperty("display", "block", "important");
        if (previewContainer) previewContainer.style.setProperty("display", "none", "important");
        if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "none", "important");
    }

})();
                        
