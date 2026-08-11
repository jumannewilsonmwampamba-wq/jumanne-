// upload-step1.js - Unique Button ID Binding Framework

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let failiLaVideoAsili = null; 

    // 1. FUNGUA DATABASE YA NDANI MARA TU KIOO KINAPOFUNGUKA
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

    amshaDukaLaUploadLocal();

    const videoInput = document.getElementById("jumanne-video-file-input");
    const uploadDropzone = document.getElementById("jumanne-upload-box-dashed");
    const previewContainer = document.getElementById("jumanne-preview-container");
    const localPlayer = document.getElementById("jumanne-local-preview-player");
    const timeBadge = document.getElementById("jumanne-time-badge");
    const progressBar = document.getElementById("jumanne-video-progress");
    const changeVideoBtn = document.getElementById("jumanne-change-video-btn");
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    // 2. MTAMBO WA KUKAMATA VIDEO NA KULUPUSHA PREVIEW
    if (videoInput) {
        videoInput.addEventListener("change", function (e) {
            e.stopPropagation();

            // SULUHISHO KUU: Tunadaka faili la kwanza kabisa [0] ghafi ili IndexedDB isikwame
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            if (!faili.type.startsWith("video/")) {
                alert("Makosa: Tafadhali chagua faili la video halisi pekee (kama MP4, MOV)!");
                e.target.value = "";
                return;
            }

            // Kupima ukubwa sasa inasoma kwa usahihi kwa kuwa tumeshika faili lenyewe
            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert("Video yako ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                e.target.value = "";
                return;
            }

            failiLaVideoAsili = faili;

            try {
                const urlYaPreview = URL.createObjectURL(faili);
                
                if (localPlayer) {
                    localPlayer.src = urlYaPreview;
                    localPlayer.load();
                    
                    localPlayer.onloadedmetadata = function() {
                        const kikomoChaMuda = 90; 
                        if (localPlayer.duration > kikomoChaMuda) {
                            alert("Video imezidi urefu! Tafadhali weka video isiyozidi dakika 1 na sekunde 30.");
                            localPlayer.src = "";
                            videoInput.value = "";
                            failiLaVideoAsili = null;
                            if (uploadDropzone) uploadDropzone.style.setProperty("display", "block", "important");
                            if (previewContainer) previewContainer.style.setProperty("display", "none", "important");
                            if (changeVideoBtn) changeVideoBtn.style.setProperty("display", "none", "important");
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
                console.error("Mkwamo wa kuwasha preview ya video:", errPreview);
            }
        });
    }

    // 3. INJINI YA KUHIFADHI KWENYE INDEXEDDB NA KUENDA MBELE
    if (btnNext) {
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!failiLaVideoAsili) {
                alert("Tafadhali chagua video kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            if (!dbIndexedAkiba) {
                alert("Mfumo wa kuhifadhi wa ndani bado haujakaa sawa, tafadhali jaribu tena.");
                return;
            }

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inahifadhi...';

            try {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaKuweka = {
                    id: "current_draft_video",
                    video_blob: failiLaVideoAsili, // Hapa sasa inapokelewa kama Faili safi la Binary
                    jina: failiLaVideoAsili.name,
                    tarehe: new Date().getTime()
                };

                const ombiKuhifadhi = duka.put(dataYaKuweka);

                // Muhimu: Hatuhami ukurasa mpaka data iwe imeandikwa kwenye diski kikamilifu!
                ombiKuhifadhi.onsuccess = function () {
                    console.log("✅ Video imehifadhiwa kikamilifu!");
                    window.location.href = "upload-step2.html";
                };

                ombiKuhifadhi.onerror = function (e) {
                    console.error("❌ Imeshindikana kuandika faili:", e);
                    alert("Kuna shida imejitokeza kwenye diski ya simu yako. Jaribu tena.");
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Inayofuata <i class="fas fa-chevron-right"></i>';
                };

            } catch (err) {
                console.error("Mkwamo umezuiwa:", err);
                btnNext.disabled = false;
                btnNext.innerHTML = 'Inayofuata <i class="fas fa-chevron-right"></i>';
            }
        })();
    }

})();
            
