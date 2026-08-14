// ==========================================================================
// JUMANNETOK TZ - CORE UPLOAD CONTROLLER (STEP 1: FIXED PING & STREAMING ENGINE)
// ==========================================================================

(function () {
    "use strict";

    const UKUBWA_WA_KIPANDE = 1 * 1024 * 1024; // Megabyte 1 kamili kwa kila kipande cha chuma
    const urlYaSevaMaster = "https://serina-qv77.onrender.com"; // Link ya Seva Kuu ya Render
    
    let failiLaVideoGhafi = null;
    let videoUuidMtaani = "";
    let asilimiaYaSasa = 0;
    let urushajiUmekamilikaSeva = false;
    let mtamboWaAutoAdvanceUmeshawaka = false;

    // Uzalishaji wa UUID ya siri kwa ajili ya session ya upload hewani
    function tengenezaVideoUuid() {
        return 'jumanne_vid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    }

    // ==========================================================================
    // INJINI NDOGO: TOAST NOTIFICATION CONTROLLER (INAPOTEA NDANI YA SEKUNDE 5)
    // ==========================================================================
    function onyeshaUjumbeWaMuda(elementId, ujumbe, rangiUkingo = "#ff5252") {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        targetElement.textContent = ujumbe;
        targetElement.style.color = rangiUkingo;
        targetElement.style.display = "block";
        targetElement.style.opacity = "1";
        targetElement.style.fontWeight = "bold";

        setTimeout(() => { targetElement.style.opacity = "0"; }, 4500);
        setTimeout(() => { targetElement.style.display = "none"; }, 5000);
    }

    // ==========================================================================
    // 🔥 INJINI YA KIJASUSI: STREAM BINARY ARRAYBUFFER DIRECT TO NODE.JS (0% CRASH)
    // ==========================================================================
    function kaguaSevaNaAnzaUrushaji(faili) {
        videoUuidMtaani = tengenezaVideoUuid();
        urushajiUmekamilikaSeva = false;
        mtamboWaAutoAdvanceUmeshawaka = false;

        // 🔥 FIX: Piga ping moja kwa moja kwenye njia rasmi ya API kuzuia mkwamo wa CORS wa kivinjari
        const pingXhr = new XMLHttpRequest();
        pingXhr.open("GET", `${urlYaSevaMaster}/ping`, true);
        
        pingXhr.onload = function () {
            // Tunaruhusu status 200 au status yoyote ya live kutoka kwenye API yetu
            if (pingXhr.status === 200 || pingXhr.status === 204) {
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Seva Imewashwa! Mdundo wako unaanza kusafiri...", "#00e676");
                anzaKusagaNaKurushaVipande(faili);
            } else {
                lupushaHitilafuSevaImezimwa();
            }
        };

        pingXhr.onerror = function () {
            lupushaHitilafuSevaImezimwa();
        };

        pingXhr.send();
    }

    function lupushaHitilafuSevaImezimwa() {
        urushajiUmekamilikaSeva = false;
        mtamboWaAutoAdvanceUmeshawaka = false;

        onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "❌ Hitilafu: Mawasiliano ya Seva Yamegoma! (Kagua CORS au Mtandao)", "#ff5252");
        
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        if (btnNext) {
            btnNext.disabled = true;
            btnNext.style.background = "#222";
            btnNext.style.color = "#555";
            btnNext.innerHTML = '❌ Upakiaji Umesitishwa (Seva Imekataa)';
        }
    }

    function anzaKusagaNaKurushaVipande(faili) {
        let nafasiYaSasa = 0;
        let nambaYaKipande = 0;
        const jumlaYaVipande = Math.ceil(faili.size / UKUBWA_WA_KIPANDE);

        function rushaKipandeKinachofuata() {
            if (nafasiYaSasa >= faili.size) {
                console.log("🏆 Chunks zote zimetua salama seva kuu ya Node.js!");
                sessionStorage.setItem("jumannetok_total_chunks", nambaYaKipande);
                urushajiUmekamilikaSeva = true;
                
                pigaMtamboWaAutoAdvanceKalamu();
                return;
            }

            const kipandeGhafi = faili.slice(nafasiYaSasa, nafasiYaSasa + UKUBWA_WA_KIPANDE);
            const msomaji = new FileReader();

            msomaji.onload = function (event) {
                const arrayBufferGhafi = event.target.result;

                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${urlYaSevaMaster}/upload/chunk`, true);

                // Kuzuia kivinjari cha simu kisikate pumzi wakati Render inasindika video hewani
                xhr.timeout = 0; 
                xhr.keepalive = true;

                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                xhr.setRequestHeader("x-chunk-index", nambaYaKipande);
                xhr.setRequestHeader("x-total-chunks", jumlaYaVipande);
                xhr.setRequestHeader("x-video-uuid", videoUuidMtaani);

                xhr.onload = function () {
                    if (xhr.status === 200 || xhr.status === 201) {
                        asilimiaYaSasa = Math.round(((nambaYaKipande + 1) / jumlaYaVipande) * 100);
                        
                        const toastKioo = document.getElementById("jumanne-caption-error-toast");
                        if (toastKioo) {
                            toastKioo.style.display = "block";
                            toastKioo.style.opacity = "1";
                            toastKioo.style.color = "#00e676";
                            toastKioo.textContent = `⚡ Seva Ipo Mubashara! Mdundo unapakia: ${asilimiaYaSasa}%`;
                        }

                        nafasiYaSasa += UKUBWA_WA_KIPANDE;
                        nambaYaKipande++;
                        rushaKipandeKinachofuata(); // Kimbiza kipande kinachofuata bila lag!
                    } else {
                        lupushaHitilafuSevaImezimwa();
                    }
                };

                xhr.onerror = function () {
                    lupushaHitilafuSevaImezimwa();
                };

                xhr.send(arrayBufferGhafi);
            };

            msomaji.readAsArrayBuffer(kipandeGhafi);
        }

        rushaKipandeKinachofuata();
    }

    // ==========================================================================
    // 🔥 INJINI YA KIVITA 2: ZERO-CLICK AUTO-ADVANCE DRIVER (THE AUTO-ROUTER)
    // ==========================================================================
    function pigaMtamboWaAutoAdvanceKalamu() {
        if (!urushajiUmekamilikaSeva || mtamboWaAutoAdvanceUmeshawaka) return;
        mtamboWaAutoAdvanceUmeshawaka = true;

        onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Data Inserted Successfully! Mdundo Umetua Seva Kuu.", "#00e676");

        const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        if (btnNext) {
            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inafungua Ukurasa...';
        }

        setTimeout(() => {
            console.log("✈️ Zero-Click Navigation Triggered: Ukurasa unajifungua wenyewe kuelekea Step 2!");
            window.location.href = "./upload-step2.html"; 
        }, 5000); 
    }

    function washaPreviewYaMudaKioni(faili) {
        const dropzoneBox = document.getElementById("jumanne-upload-box-dashed");
        const bandoWarningBox = document.getElementById("jumanne-bando-warning");
        const previewContainer = document.getElementById("jumanne-preview-container");
        const localPlayer = document.getElementById("jumanne-local-preview-player");
        const changeVideoBtn = document.getElementById("jumanne-change-video-btn");

        if (localPlayer && previewContainer) {
            const localUrl = URL.createObjectURL(faili);
            sessionStorage.setItem("jumannetok_preview_stream_url", localUrl);

            localPlayer.src = localUrl;
            previewContainer.style.display = "flex";
            
            localPlayer.loop = true;
            localPlayer.muted = true;
            localPlayer.setAttribute("playsinline", "true");
            localPlayer.setAttribute("webkit-playsinline", "true");
            
            localPlayer.play().catch(() => {});

            if (changeVideoBtn) changeVideoBtn.style.display = "flex";
            if (dropzoneBox) dropzoneBox.style.setProperty("display", "none", "important");
            if (bandoWarningBox) bandoWarningBox.style.display = "none";
        }
    }

    // ==========================================================================
    // 3. MASTER TIMING PROTOCOL DOM CONTENT LOADED
    // ==========================================================================
    document.addEventListener("DOMContentLoaded", function () {
        const videoInput = document.getElementById("jumanne-video-file-input");
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");

        if (btnNext) {
            btnNext.innerHTML = '⚙️ Mfumo Unajiongoza Kiotomatiki';
            btnNext.disabled = true;
            btnNext.style.cursor = "not-allowed";
        }

        if (videoInput) {
            videoInput.addEventListener("change", function (e) {
                if (!e.target.files || e.target.files.length === 0) return;

                const failiSafi = e.target.files[0];
                const kikomoChaMb45 = 45 * 1024 * 1024;
                
                if (failiSafi.size > kikomoChaMb45) {
                    alert("Video ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                    videoInput.value = "";
                    return;
                }

                failiLaVideoGhafi = failiSafi;
                sessionStorage.setItem("jumannetok_video_name", failiSafi.name);
                
                washaPreviewYaMudaKioni(failiSafi);
                kaguaSevaNaAnzaUrushaji(failiSafi);
                        
            });
        }
    });

    // Sensa ya kulinda mteja asisafiri au kufunga tab bahati mbaya njiani
    window.addEventListener("beforeunload", function (e) {
        if (failiLaVideoGhafi && !urushajiUmekamilikaSeva) {
            e.preventDefault();
            e.returnValue = "Mkuu, usiondoke! Mdundo wako bado unasafiri kwenda seva kuu ya JumanneTok TZ.";
            return e.returnValue;
        }
    });

    // SENSA YA KI-HARDWARE: Mtumiaji akiondoka na kurudi kwenye tab, piga ping upya instantly!
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden && failiLaVideoGhafi && !urushajiUmekamilikaSeva) {
            console.log("♻️ Tab Show: Mteja amerudi kwenye app, tunasafisha njia na kupiga ping upya...");
            const pingXhr = new XMLHttpRequest();
            pingXhr.open("GET", `${urlYaSevaMaster}/ping`, true);

            pingXhr.onload = function () {
                if (pingXhr.status === 200 || pingXhr.status === 204) {
                    onyeshaUjumbeWaMuda("jumanne-caption-error-toast", `⚡ Mtandao umerudi! Upakiaji unaendelea: ${asilimiaYaSasa}%`, "#00e676");
                }
            };
            pingXhr.send();
        }
    });

})(); // <--- HILI NDILO BANO LA MWISHO KABISA LINAFUNGA FILE ZIMA MKUU!
                                       
