// ==========================================================================
// JUMANNETOK TZ - CORE UPLOAD ENGINE (STEP 1: REPAIRED LIFECYCLE CONTROLLER)
// ==========================================================================

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let failiLaVideoAsili = null; // Memory lock kwenye RAM ya mteja maisha yote

    // 1. FUNGUA DATABASE YA NDANI MARA TU KIOO KINAPOFUNGUKA MACHINE
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
                db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
            }
        };

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 1: Database ya IndexedDB imefunguka salama!");
        };

        ombiDuka.onerror = function () {
            console.error("❌ Mkwamo wa kufungua database ya ndani Step 1.");
        };
    }

    // DAKA MA-ELEMENT YOTE KUTOKA KWENYE HTML YAKO VERBATIM
    const videoInput = document.getElementById("jumanne-video-file-input");
    const uploadDropzone = document.getElementById("jumanne-upload-box-dashed");
    const previewContainer = document.getElementById("jumanne-preview-container");
    const localPlayer = document.getElementById("jumanne-local-preview-player");
    const timeBadge = document.getElementById("jumanne-time-badge");
    const progressBar = document.getElementById("jumanne-video-progress");
    const changeVideoBtn = document.getElementById("jumanne-change-video-btn");
    const btnNext = document.getElementById("jumanne-to-step2");
    const formStep1 = document.getElementById("jumanne-upload-form-step1");

    // 2. MTAMBO WA KUKAMATA VIDEO NA KULUPUSHA PREVIEW
    if (videoInput) {
        videoInput.addEventListener("change", function (e) {
            e.stopPropagation();

            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            if (!faili.type.startsWith("video/")) {
                alert("Makosa: Tafadhali chagua faili la video halisi pekee!");
                e.target.value = "";
                return;
            }

            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert("Video yako ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                e.target.value = "";
                return;
            }

            // Lock faili kinguvu hapa lisifutike hata fomu ikileta dhoruba
            failiLaVideoAsili = faili;
            console.log(`🎰 Video Imehamishiwa RAM Salama: ${faili.name}`);

            try {
                const urlYaPreview = URL.createObjectURL(faili);
                
                if (localPlayer) {
                    localPlayer.src = urlYaPreview;
                    localPlayer.load();
                    localPlayer.play().catch(() => {});

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

                // Ficha boksi la dashed na kuwasha preview
                if (uploadDropzone) uploadDropzone.style.setProperty("display", "none", "important");
                if (previewContainer) previewContainer.style.setProperty("display", "flex", "important");
                if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "inline-flex", "important");

            } catch (errPreview) {
                console.error("Mkwamo wa kuwasha preview:", errPreview);
            }
        });
    }

    // 3. INJINI INAYOGANDISHA BLOB NA KUMSWAGA USER KWENYE HATUA YA PILI
    if (btnNext) {
        // 🔥 MAREKEBISHO YA KI-HARDWARE: Weka mtego thabiti wa kusikiliza mibofyo ya dharura
        btnNext.addEventListener("click", function (event) {
            event.preventDefault(); 
            event.stopPropagation();

            const botInput = document.getElementById("jumanne-video-bot-input");
            if (botInput && botInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            // Kagua kwa mara ya mwisho variable yetu kali ya chuma
            if (!failiLaVideoAsili) {
                alert("Tafadhali gusa sanduku la juu ukachague video yako ya kipaji kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            if (!dbIndexedAkiba) {
                alert("Mtambo wa simu bado haujajifunga vizuri diski, subiri sekunde moja kisha uguse tena!");
                return;
            }

            console.log("🚀 Inafungua transaction ya kuandika Blob...");
            const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
            const duka = muamala.objectStore("jumannetok_feed_cache");

            const dataYaVideoDraft = {
                id: "jumanne_current_upload_draft",
                jinaLaVideo: failiLaVideoAsili.name || "singeli_kipaji.mp4",
                ukubwaWaVideo: failiLaVideoAsili.size,
                videoBlobData: failiLaVideoAsili, // Hifadhi Blob halisi
                haliYaUploadNyuma: "isomeke", 
                tareheSajili: Date.now()
            };

            const ombiHifadhi = duka.put(dataYaVideoDraft);

            // GOLI LA USHINDI: Lazimisha browser isisite, ikimaliza kuandika inahamisha ukurasa direct!
            ombiHifadhi.onsuccess = function () {
                console.log("💾 Disk Lock: Video Blob imelazwa IndexedDB salama kabisa!");
                
                if (localPlayer) {
                    localPlayer.pause();
                    localPlayer.src = "";
                }
                
                console.log("✈️ Redirecting: Mtumiaji anaswagwa kwenda upload-step2.html mnyofu...");
                window.location.href = "upload-step2.html";
            };

            ombiHifadhi.onerror = function (err) {
                console.error("❌ Mkwamo wa kuandika video ndani ya IndexedDB:", err);
                alert("Hitilafu ya ki-hardware: Simu imeshindwa kulaza bando la video kwenye diski!");
            };
        });
    }

    // 4. UKUTA WA MWISHO WA USALAMA KUSHIKILIA FOMU YA HTML ISIPIGE RELOAD
    if (formStep1) {
        formStep1.addEventListener("submit", function (e) {
            e.preventDefault();
        });
    }

    amshaDukaLaUploadLocal();
})();
            
