// upload-step1.js - Injini Imara ya Kuzuia Kupoteza Video Hata Ikirefresh

(function () {
    "use strict";

    let failiLaVideoGhafi = null;
    let dbIndexedAkiba = null;

    // 1. FUNGUA DATABASE MARA TU UKURASA UNAPOWAKA
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
            
            // 🚀 Kagua na urejeshe video mara moja (Hata ukirefresh au ukirudi nyuma!)
            rejeshaVideoKamaUserAmebofyaBack();
        };

        ombiDuka.onerror = function() {
            console.error("❌ Database imegoma kufunguka.");
        };
    }

    // 2. INJINI YA KUKAMATA VIDEO NA KUHIFADHI PAPO HAPO KWENYE DISKI (CHANGE EVENT)
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

            // 🔥 SULUHISHO KUU: Hifadhi video kwenye IndexedDB sasa hivi kabla kivinjari hakijamaliza refresh!
            if (dbIndexedAkiba) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaDraft = {
                    id: "jumanne_current_upload_draft",
                    jinaLaVideo: faili.name,
                    ukubwaWaVideo: faili.size,
                    videoBlobData: faili, // Faili ghafi linaingia diski papo hapo
                    tareheYaKupandisha: Date.now()
                };

                duka.put(dataYaDraft);
                console.log("💾 Video imegandishwa kwenye diski kuzuia madhara ya refresh!");
            }

            // Washa preview kioni
            washaPreviewYaKioo(faili);
        });
    }

    // INJINI NDOGO YA KUONYESHA VIDEO KIONI
    function washaPreviewYaKioo(failiBlob) {
        const dropzoneBox = document.getElementById("jumanne-upload-box-dashed");
        const bandoWarningBox = document.getElementById("jumanne-bando-warning");
        const previewContainer = document.getElementById("jumanne-preview-container");
        const localPlayer = document.getElementById("jumanne-local-preview-player");
        const changeVideoBtn = document.getElementById("jumanne-change-video-btn");

        try {
            if (localPlayer && localPlayer.src) {
                URL.revokeObjectURL(localPlayer.src);
            }

            const URLyaVideo = URL.createObjectURL(failiBlob);
            
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
    }

    // 3. INJINI YA KUREJESHA VIDEO MTUMIAJI AKIREFRESH AU AKIRUDI NYUMA
    function rejeshaVideoKamaUserAmebofyaBack() {
        if (!dbIndexedAkiba) return;

        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        const ombiDaka = duka.get("jumanne_current_upload_draft");

        ombiDaka.onsuccess = function(e) {
            const data = e.target.result;
            // 🚀 Ikikutwa video kwenye diski, irudishe kioni upesi bila kumuomba mtumiaji achague tena!
            if (data && data.videoBlobData) {
                console.log("♻️ Mfumo umerejesha video kutoka kwenye diski baada ya refresh!");
                failiLaVideoGhafi = data.videoBlobData;
                washaPreviewYaKioo(data.videoBlobData);
            }
        };
    }

    // 4. KITUFE CHA INAYOFUATA: Kazi yake sasa ni kukagua muda tu na kuvuka goli
    function washaKitufeChaKuvukaHatuaYaPwanza() {
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");

        if (!btnNext) return;

        btnNext.addEventListener("click", () => {
            if (!failiLaVideoGhafi) {
                alert("Tafadhali chagua video yako ya kipaji kwanza!");
                return;
            }

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

            // Pima sekunde za video kwa kutumia element ya siri
            const videoSiriElement = document.createElement("video");
            videoSiriElement.src = URL.createObjectURL(failiLaVideoGhafi);
            
            videoSiriElement.addEventListener("loadedmetadata", () => {
                const urefuWaVideo = videoSiriElement.duration;
                URL.revokeObjectURL(videoSiriElement.src);

                if (urefuWaVideo > 90.5) { 
                    alert(`Mfumo unaruhusu video za dakika 1:30 tu. Video yako ina sekunde ${urefuWaVideo.toFixed(0)}.`);
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Inayofuata <i class="fas fa-chevron-right"></i>';
                    return;
                }

                // Kila kitu safi, nenda Step 2 (Data tayari ipo kwenye diski tangu mwanzo!)
                sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify({ hasDraft: true, jina: failiLaVideoGhafi.name }));
                window.location.href = "upload-step2.html";
            });

            videoSiriElement.addEventListener("error", () => {
                // Kama ikifeli kupima kwa dharura, mruhusu kupita kwa usalama
                window.location.href = "upload-step2.html";
            });

            videoSiriElement.load();
        });
    }

    // 5. KIFUNGO CHA KUFUTA VIDEO MWENYEWE (UKITAKA KUBADILISHA)
    const changeVideoBtn = document.getElementById("jumanne-change-video-btn");
    if (changeVideoBtn) {
        changeVideoBtn.addEventListener("click", () => {
            if (dbIndexedAkiba) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                muamala.objectStore("jumannetok_feed_cache").delete("jumanne_current_upload_draft");
                sessionStorage.removeItem("jumannetok_upload_meta");
                console.log("🗑️ Mtumiaji amefuta video kwenye diski mwenyewe.");
            }
            // Fungua upya uchaguzi wa faili
            document.getElementById("jumanne-video-file-input").click();
        });
    }

    // WASHA KILA KITU MARA MOJA
    amshaDukaLaUploadLocal();
    amshaMtamboWaKupokeaVideo();
    washakitufeChaKuvukaHatuaYaPwanza();

})();
    
