// ==========================================================================
// INJINI KUU YA JUMANNETOK TZ - STATE RESTORATION CONTROLLER (BACK PREVIEW FIX)
// ==========================================================================

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
        
        // 🔥 PIGO LA USHINDI: Kagua na urejeshe video kama mtumiaji amerudi nyuma!
        rejeshaVideoKamaUserAmebofyaBack();
        
        kaguaNaKusafishaDraftZilizochoka();
    };

    ombiDuka.onerror = function() {
        console.error("❌ Database imegoma kufunguka.");
    };
}

// 🔥 INJINI MPYA YA DAKIKA SIFURI: INAREJESHA VIDEO MTUMIAJI AKIRUDI NYUMA!
function rejeshaVideoKamaUserAmebofyaBack() {
    if (!dbIndexedAkiba) return;

    const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
    const duka = muamala.objectStore("jumannetok_feed_cache");
    const ombiDaka = duka.get("jumanne_current_upload_draft");

    ombiDaka.onsuccess = function(e) {
        const data = e.target.result;
        
        // Kama amekuta kuna video ilihifadhiwa kwenye IndexedDB mwanzo
        if (data && data.videoBlobData) {
            console.log("♻️ State Restored: Mtambo umegundua video ya zamani, unairejesha kioni...");
            
            const dropzoneBox = document.getElementById("jumanne-upload-box-dashed");
            const bandoWarningBox = document.getElementById("jumanne-bando-warning");
            const previewContainer = document.getElementById("jumanne-preview-container");
            const localPlayer = document.getElementById("jumanne-local-preview-player");
            const changeVideoBtn = document.getElementById("jumanne-change-video-btn");

            failiLaVideoGhafi = data.videoBlobData;

            try {
                // Geuza ile Blob tuliyoikuta kuwa URL safi ya kucheza video
                const URLyaVideoyazamani = URL.createObjectURL(data.videoBlobData);
                
                if (localPlayer && previewContainer) {
                    localPlayer.src = URLyaVideoyazamani;
                    
                    // Washa kioo kiwe kikubwa upesi
                    previewContainer.style.display = "flex";
                    localPlayer.style.width = "100%";
                    localPlayer.style.height = "60vh"; 
                    localPlayer.style.objectFit = "cover"; 
                    localPlayer.play().catch(() => {});

                    // Washa kitufe cha Badilisha kiwepo chini pembeni
                    if (changeVideoBtn) {
                        changeVideoBtn.style.display = "flex";
                    }

                    // Ficha yale mabox ya hatua ya kwanza yasiwepo
                    if (dropzoneBox) {
                        dropzoneBox.style.setProperty("display", "none", "important");
                    }
                    if (bandoWarningBox) {
                        bandoWarningBox.style.display = "none";
                    }
                }
            } catch (err) {
                console.error("Mkwamo wa kurejesha video ya nyuma:", err);
            }
        }
    };
}

// 2. INJINI YA PREVIEW YA SKRINI NZIMA NA USALAMU WA KUSHUSHA KITUFE CHA BADILISHA CHINI
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
                localPlayer.style.height = "60vh"; 
                localPlayer.style.objectFit = "cover"; 
                localPlayer.play().catch(() => {});

                if (changeVideoBtn) {
                    changeVideoBtn.style.display = "flex"; 
                }

                if (dropzoneBox) {
                    dropzoneBox.style.setProperty("display", "none", "important");
                }
                if (bandoWarningBox) {
                    bandoWarningBox.style.display = "none";
                }
            }
        } catch (err) {
            console.error("Mkwamo wa kupanga vifungo au kuwasha video:", err);
        }
    });
}

// 3. INJINI YA KUBONYEZA NEXT NA KUHAMIA UKURASA UNAOFATA SALAMA
function washaKitufeChaKuvukaHatuaYaPwanza() {
    const btnNext = document.getElementById("jumanne-to-step2");
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

        // MAREKEBISHO YA UHAKIKA: Kama user amerudi nyuma na failiLaVideoGhafi lipo RAM, mruhusu kupita mnyofu!
        if (!videoInput.files || videoInput.files.length === 0) {
            if (failiLaVideoGhafi) {
                // Video tayari ipo IndexedDB kwa hiyo avuke goli direct!
                window.location.href = "upload-step2.html";
                return;
            }
            alert("Tafadhali chagua video yako ya kipaji kwanza!");
            return;
        }

        const failiKazi = videoInput.files[0];

        const videoSiriElement = document.createElement("video");
        videoSiriElement.src = URL.createObjectURL(failiKazi);
        
        videoSiriElement.addEventListener("loadedmetadata", () => {
            const urefuWaVideo = videoSiriElement.duration;
            URL.revokeObjectURL(videoSiriElement.src);

            if (urefuWaVideo > 90.5) { 
                alert(`Mfumo unaruhusu video za dakika 1:30 tu. Video yako ina sekunde ${urefuWaVideo.toFixed(0)}.`);
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
                videoBlobData: failiKazi, 
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

// 4. MTAMBO WA KUSAFISHA DATA BAADA YA SAA 1
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
                console.log("🛡️ Draft ya zamani imefutwa baada ya saa 1.");
            }
        }
    };
}

function washaMitungiYoteMwishoni() { 
    amshaMtamboWaKutumaVideo();
}

window.addEventListener("DOMContentLoaded", () => {
    amshaDukaLaUploadLocal();
    amshaMtamboWaKupokeaVideo();
    washaKitufeChaKuvukaHatuaYaPwanza();
});
                
