// ==========================================================================
// JUMANNETOK TZ - CORE UPLOAD ENGINE (STEP 1: REPAIRED PREVIEW & LIVE REDIRECT)
// ==========================================================================

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let failiLaVideoAsili = null; // Inashikilia faili ghafi la binary la mteja

    // 1. INJINI YA KI-HARDWARE: FUNGUA DATABASE YA NDANI MARA TU KIOO KINAPOFUNGUKA
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
            console.error("❌ Mkwamo! Kivinjari kimegoma kufunguka IndexedDB Step 1.");
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

    // 2. MTAMBO WA KUKAMATA VIDEO NA KULUPUSHA PREVIEW SKRINI NZIMA BILA LAG
    if (videoInput) {
        videoInput.addEventListener("change", (e) => {
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            // Uhakiki wa kijeshi: Lazima liwe faili la video halisi pekee!
            if (!faili.type.startsWith("video/")) {
                alert("Makosa: Tafadhali chagua faili la video halisi pekee (kama MP4, MOV)!");
                e.target.value = "";
                return;
            }

            // Kikomo cha uzani wa MB 45 kulingana na onyo la bando la fomu yako
            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (faili.size > kikomoChaMb45) {
                alert("Video yako ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                e.target.value = "";
                return;
            }

            failiLaVideoAsili = faili;
            console.log(`⏳ Video imelazwa kwenye RAM ya mteja: ${faili.name}`);

            // 🔥 SULUHISHO: Geuza faili kuwa URL ya binary ya unyoya na washa player mubashara
            try {
                const urlYaPreview = URL.createObjectURL(faili);
                
                if (localPlayer) {
                    localPlayer.src = urlYaPreview;
                    localPlayer.load();
                    
                    // Lazimisha video icheze yenyewe kioone
                    localPlayer.play().catch(() => {
                        console.log("Autoplay imezuiwa na kivinjari, inasubiri mguso wa mteja.");
                    });

                    // Sikiliza sekunde za uchezaji ili kuendesha progress bar ya kijani
                    localPlayer.addEventListener("timeupdate", () => {
                        if (localPlayer.duration) {
                            const asilimia = (localPlayer.currentTime / localPlayer.duration) * 100;
                            if (progressBar) progressBar.style.width = `${asilimia}%`;
                            
                            // Sasisha kibandiko cha muda (Time Badge overlay)
                            let sasaMin = Math.floor(localPlayer.currentTime / 60);
                            let sasaSec = Math.floor(localPlayer.currentTime % 60).toString().padStart(2, '0');
                            let jumlaMin = Math.floor(localPlayer.duration / 60);
                            let jumlaSec = Math.floor(localPlayer.duration % 60).toString().padStart(2, '0');
                            
                            if (timeBadge) timeBadge.textContent = `${sasaMin}:${sasaSec} / ${jumlaMin}:${jumlaSec}`;
                        }
                    });
                }

                // 🔥 PIGO LA USHINDI WA KIOO: Ficha kabisa lile boksi la dashed, na uwashe preview container!
                if (uploadDropzone) {
                    uploadDropzone.style.setProperty("display", "none", "important");
                }
                if (previewContainer) {
                    previewContainer.style.setProperty("display", "flex", "important");
                }
                if (changeVideoBtn) {
                    changeVideoBtn.style.setProperty("display", "inline-flex", "important");
                }

            } catch (errPreview) {
                console.error("Mkwamo wa kuwasha preview ya video:", errPreview);
            }
        });
    }

    // 3. INJINI INAYOGANDISHA BLOB NA KUMSWAGA USER KWENYE HATUA YA PILI (`upload-step2.html`)
    if (btnNext) {
        btnNext.addEventListener("click", (event) => {
            event.preventDefault(); // Zuia fomu isiruke kienyeji na kufunga kioo

            // Mtego wa siri wa ma-robot (Honeypot Shield)
            const botInput = document.getElementById("jumanne-video-bot-input");
            if (botInput && botInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            if (!failiLaVideoAsili) {
                alert("Tafadhali gusa sanduku la juu ukachague video yako ya kipaji kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            if (!dbIndexedAkiba) {
                alert("Mtambo wa simu bado haujajifunga vizuri diski, subiri sekunde moja kisha uguse tena!");
                return;
            }

            // Fungua muamala wa kuandika diski kuu ya ndani ya simu (readwrite)
            const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
            const duka = muamala.objectStore("jumannetok_feed_cache");

            // Suka ufunguo ule ule thabiti wa herufi ndogo unaosomeka kote mtaani
            const dataYaVideoDraft = {
                id: "jumanne_current_upload_draft",
                jinaLaVideo: failiLaVideoAsili.name || "singeli_kipaji.mp4",
                ukubwaWaVideo: failiLaVideoAsili.size,
                videoBlobData: failiLaVideoAsili, // Hifadhi Blob asili ghafi (0 TZS Bando)
                haliYaUploadNyuma: "isomeke", 
                tareheSajili: Date.now()
            };

            const ombiHifadhi = duka.put(dataYaVideoDraft);

            // GOLI LA USHINDI: Ikishakaa tu diski ya simu, mfyatue mteja kwenda ukurasa wa pili!
            ombiHifadhi.onsuccess = function () {
                console.log("💾 Disk Lock: Real Video Blob imelazwa IndexedDB kwa usalama!");
                
                // Zima player ya video kwanza ili isilemee RAM ya simu wakati wa kuhama ukurasa
                if (localPlayer) {
                    localPlayer.pause();
                    localPlayer.src = "";
                }
                
                console.log("✈️ Redirecting: Mtumiaji anaswagwa kwenda upload-step2.html sekunde hii...");
                window.location.href = "upload-step2.html";
            };

            ombiHifadhi.onerror = function (err) {
                console.error("❌ Mkwamo wa kuandika video ndani ya IndexedDB:", err);
                alert("Hitilafu ya ki-hardware: Simu imeshindwa kulaza bando la video kwenye diski!");
            };
        });
    }

    // Amsha duka la local upose kioo kinapofunguka macho kitaifa
    amshaDukaLaUploadLocal();
})();
                    
