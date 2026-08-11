// upload-step1.js - Core Upload Engine (Kazi Safi Isiyo na Wenge)

(function () {
    "use strict";

    let failiLaVideoGhafi = null;
    let dbIndexedAkiba = null;

    // 1. ANZA KUFUNGUA DATABASE KWANZA KABISA KIVINJARI KIKIFUNGUKA
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

        ombiDuka.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
                db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
            }
        };

        ombiDuka.onsuccess = function(e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Database imefunguka salama!");
            
            // Kagua na urejeshe video kama mtumiaji amerudi nyuma!
            rejeshaVideoKamaUserAmebofyaBack();
            kaguaNaKusafishaDraftZilizochoka();
        };

        ombiDuka.onerror = function() {
            console.error("❌ Database imegoma kufunguka.");
        };
    }

    // 2. INJINI YA PREVIEW YA SKRINI NZIMA
    function amshaMtamboWaKupokeaVideo() {
        const videoInput = document.getElementById("jumanne-video-file-input");
        const dropzoneBox = document.getElementById("jumanne-upload-box-dashed");
        const bandoWarningBox = document.getElementById("jumanne-bando-warning");
        const previewContainer = document.getElementById("jumanne-preview-container");
        const changeVideoBtn = document.getElementById("jumanne-change-video-btn");

        if (!videoInput) return;

        videoInput.addEventListener("change", (e) => {
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            // Kagua ukubwa usizidi MB 45
            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert(`Video yako ina ukubwa wa ${(faili.size / (1024 * 1024)).toFixed(1)} MB. Mfumo unaruhusu mwisho MB 45 tu!`);
                videoInput.value = ""; 
                return;
            }

            failiLaVideoGhafi = faili;

            try {
                const localPlayer = document.getElementById("jumanne-local-preview-player");
                if (localPlayer && localPlayer.src) {
                    URL.revokeObjectURL(localPlayer.src);
                }

                const URLyaVideo = URL.createObjectURL(faili);
                
                if (localPlayer && previewContainer) {
                    localPlayer.src = URLyaVideo;
                    
                    previewContainer.style.display = "flex";
                    localPlayer.style.width = "100%";
                    localPlayer.style.height = "440px"; 
                    localPlayer.style.objectFit = "cover"; 
                    localPlayer.play().catch(() => {});

                    if (changeVideoBtn) changeVideoBtn.style.display = "flex"; 
                    if (dropzoneBox) dropzoneBox.style.setProperty("display", "none", "important");
                    if (bandoWarningBox) bandoWarningBox.style.display = "none";
                }
            } catch (err) {
                console.error("Mkwamo wa kuwasha video:", err);
            }
        });
    }

    // 3. INJINI YA KUBONYEZA NEXT NA KUHAMIA UKURASA UNAOFATA SALAMA
    function washaKitufeChaKuvukaHatuaYaPwanza() {
        // 🔥 ID Sahihi ya HTML yako
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        const videoInput = document.getElementById("jumanne-video-file-input");

        if (!btnNext || !videoInput) return;

        btnNext.addEventListener("click", () => {
            const botInput = document.getElementById("jumanne-video-bot-input");
            const honeyValue = botInput ? botInput.value : "";
            if (honeyValue.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            // Kama mtumiaji amerudi nyuma na faili lipo tayari kwenye RAM
            if (!videoInput.files || videoInput.files.length === 0) {
                if (failiLaVideoGhafi) {
                    window.location.href = "upload-step2.html";
                    return;
                }
                alert("Tafadhali chagua video yako ya kipaji kwanza!");
                return;
            }

            // 🔥 SULUHISHO: Tunachukua faili lenyewe la kwanza [0] badala ya listi nzima!
            const failiKazi = videoInput.files[0];

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inahifadhi...';

            const videoSiriElement = document.createElement("video");
            videoSiriElement.src = URL.createObjectURL(failiKazi);
            
            videoSiriElement.addEventListener("loadedmetadata", () => {
                const urefuWaVideo = videoSiriElement.duration;
                URL.revokeObjectURL(videoSiriElement.src);

                if (urefuWaVideo > 90.5) { 
                    alert(`Mfumo unaruhusu video za dakika 1:30 tu. Video yako ina sekunde ${urefuWaVideo.toFixed(0)}.`);
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Inayofuata <i class="fas fa-chevron-right"></i>';
                    return;
                }

                if (!dbIndexedAkiba) {
                    sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify({ hasDraft: false, jina: failiKazi.name }));
                    window.location.href = "upload-step2.html";
                    return;
                }

                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaDraft = {
                    id: "jumanne_current_upload_draft",
                    jinaLaVideo: failiKazi.name,
                    ukubwaWaVideo: failiKazi.size,
                    videoBlobData: failiKazi, // Sasa inaandika faili safi ghafi
                    tareheYaKupandisha: Date.now()
                };

                const ombiHifadhi = duka.put(dataYaDraft);

                ombiHifadhi.onsuccess = function() {
                    sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify({ hasDraft: true, jina: failiKazi.name }));
                    window.location.href = "upload-step2.html";
                };

                ombiHifadhi.onerror = function() {
                    window.location.href = "upload-step2.html";
                };
            });

            videoSiriElement.load();
        });
    }

    // 4. INJINI YA RECOVERY (BACK BUTTON STATE RESTORE)
    function rejeshaVideoKamaUserAmebofyaBack() {
        if (!dbIndexedAkiba) return;

        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        const ombiDaka = duka.get("jumanne_current_upload_draft");

        ombiDaka.onsuccess = function(e) {
            const data = e.target.result;
            if (data && data.videoBlobData) {
                console.log("♻️ State Restored: Tunairudisha video kioni...");
                
                const dropzoneBox = document.getElementById("jumanne-upload-box-dashed");
                const bandoWarningBox = document.getElementById("jumanne-bando-warning");
                const previewContainer = document.getElementById("jumanne-preview-container");
                const localPlayer = document.getElementById("jumanne-local-preview-player");
                const changeVideoBtn = document.getElementById("jumanne-change-video-btn");

                failiLaVideoGhafi = data.videoBlobData;

                try {
                    const URLyaVideoyazamani = URL.createObjectURL(data.videoBlobData);
                    if (localPlayer && previewContainer) {
                        localPlayer.src = URLyaVideoyazamani;
                        previewContainer.style.display = "flex";
                        localPlayer.style.width = "100%";
                        localPlayer.style.height = "440px"; 
                        localPlayer.style.objectFit = "cover"; 
                        localPlayer.play().catch(() => {});

                        if (changeVideoBtn) changeVideoBtn.style.display = "flex";
                        if (dropzoneBox) dropzoneBox.style.setProperty("display", "none", "important");
                        if (bandoWarningBox) bandoWarningBox.style.display = "none";
                    }
                } catch (err) {
                    console.error("Mkwamo wa kurejesha video ya nyuma:", err);
                }
            }
        };
    }

    // 5. MTAMBO WA KUSAFISHA DATA BAADA YA SAA 1
    function kaguaNaKusafishaDraftZilizochoka() {
        if (!dbIndexedAkiba) return;
        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        const ombiDaka = duka.get("jumanne_current_upload_draft");

        ombiDaka.onsuccess = function(e) {
            const data = e.target.result;
            if (data && data.tareheYaKupandisha) {
                const mudaWaSasa = Date.now();
                if (mudaWaSasa - data.tareheYaKupandisha > 60 * 60 * 1000) {
                    duka.delete("jumanne_current_upload_draft");
                    sessionStorage.removeItem("jumannetok_upload_meta");
                    console.log("🛡️ Draft ya zamani imefutwa.");
                }
            }
        };
    }

    // AWASHA MITUNGI YOTE MARA MOJA
    document.addEventListener("DOMContentLoaded", () => {
        amshaDukaLaUploadLocal();
        amshaMtamboWaKupokeaVideo();
        washaKitufeChaKuvukaHatuaYaPwanza();
    });

})();
            
