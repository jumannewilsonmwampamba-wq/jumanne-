// upload-step1.js - Toleo Lililosafishwa na Kufungwa Makosa Yote (Ushindi 100%)

(function () {
    "use strict";

    let failiLaVideoGhafi = null;
    let dbIndexedAkiba = null;

    // 1. FUNGUA DATABASE MAALUM KWANZA KABISA
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
            console.log("✅ Database imewaka!");
            rejeshaVideoKamaUserAmebofyaBack();
        };
    }

    // 2. MTAMBO WA KUKAMATA FAILU GHAFI LA VIDEO (FILE OBJECT HALISI)
    function amshaMtamboWaKupokeaVideo() {
        const videoInput = document.getElementById("jumanne-video-file-input");

        if (!videoInput) return;

        videoInput.addEventListener("change", (e) => {
            // SULUHISHO HALISI: Tunachukua index [0] ili kupata faili ghafi la Blob, sio FileList!
            if (!e.target.files || e.target.files.length === 0) return;
            const faili = e.target.files[0]; 

            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert(`Video ni kubwa mno! Mwisho ni MB 45 tu.`);
                videoInput.value = ""; 
                return;
            }

            failiLaVideoGhafi = faili;

            // Hifadhi faili ghafi la Blob kwenye IndexedDB papo hapo mteja anapochagua
            if (dbIndexedAkiba) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaDraft = {
                    id: "jumanne_current_upload_draft",
                    jinaLaVideo: faili.name,
                    ukubwaWaVideo: faili.size,
                    videoBlobData: faili, // Sasa hivi inasafiri kama File/Blob safi bila kugoma!
                    tareheYaKupandisha: Date.now()
                };

                duka.put(dataYaDraft);
            }

            washaPreviewYaKioo(faili);
        });
    }

    function washaPreviewYaKioo(failiBlob) {
        const dropzoneBox = document.getElementById("jumanne-upload-box-dashed");
        const bandoWarningBox = document.getElementById("jumanne-bando-warning");
        const previewContainer = document.getElementById("jumanne-preview-container");
        const localPlayer = document.getElementById("jumanne-local-preview-player");
        const changeVideoBtn = document.getElementById("jumanne-change-video-btn");

        if (localPlayer && previewContainer) {
            localPlayer.src = URL.createObjectURL(failiBlob);
            previewContainer.style.display = "flex";
            localPlayer.play().catch(() => {});

            if (changeVideoBtn) changeVideoBtn.style.display = "flex"; 
            if (dropzoneBox) dropzoneBox.style.setProperty("display", "none", "important");
            if (bandoWarningBox) bandoWarningBox.style.display = "none";
        }
    }

    // 3. REJESHA VIDEO MTUMIAJI AKIREFRESH UKURASA
    function rejeshaVideoKamaUserAmebofyaBack() {
        if (!dbIndexedAkiba) return;

        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        const ombiDaka = duka.get("jumanne_current_upload_draft");

        ombiDaka.onsuccess = function(e) {
            const data = e.target.result;
            if (data && data.videoBlobData) {
                failiLaVideoGhafi = data.videoBlobData;
                washaPreviewYaKioo(data.videoBlobData);
            }
        };
    }

    // 4. KITUFE CHA INAYOFUATA: Kinakagua urefu wa muda na kukuswaga mbele upesi
    function washaKitufeChaKuvukaHatuaYaPwanza() {
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");

        if (!btnNext) return;

        btnNext.addEventListener("click", (event) => {
            event.preventDefault();

            if (!failiLaVideoGhafi) {
                alert("Tafadhali chagua video kwanza!");
                return;
            }

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

            const videoSiriElement = document.createElement("video");
            videoSiriElement.src = URL.createObjectURL(failiLaVideoGhafi);
            
            videoSiriElement.addEventListener("loadedmetadata", () => {
                const urefuWaVideo = videoSiriElement.duration;
                if (urefuWaVideo > 90.5) { 
                    alert(`Mfumo unaruhusu video za dakika 1:30 tu.`);
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Inayofuata <i class="fas fa-chevron-right"></i>';
                    return;
                }
                
                sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify({ hasDraft: true, jina: failiLaVideoGhafi.name }));
                window.location.href = "upload-step2.html";
            });

            videoSiriElement.addEventListener("error", () => {
                window.location.href = "upload-step2.html";
            });

            videoSiriElement.load();
        });
    }

    // WASHA MITUNGI YOTE KWA ZAMU
    amshaDukaLaUploadLocal();
    amshaMtamboWaKupokeaVideo();
    washaKitufeChaKuvukaHatuaYaPwanza();

})();
