// upload-step1.js - Advanced Stream-on-Select Ingestion Engine & Keep-Alive Loop (Production Fix)

(function () {
    "use strict";

    const UKUBWA_WA_KIPANDE = 1 * 1024 * 1024; // Megabyte 1 kamili kwa kila kipande cha binary
    const urlYaSevaMaster = "https://serina-qv77.onrender.com/api"; // Link ya Seva Kuu ya Render
    
    let failiLaVideoGhafi = null;
    let videoUuidMtaani = "";
    let asilimiaYaSasa = 0;
    let urushajiUmekamilikaSeva = false;

    // Uzalishaji wa UUID ya siri kwa ajili ya kutofautisha session ya upload hewani
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

        // Baada ya sekunde 4.5 anza kuyeyusha, sekunde 5 inapotea mazima kioone!
        setTimeout(() => { targetElement.style.opacity = "0"; }, 4500);
        setTimeout(() => { targetElement.style.display = "none"; }, 5000);
    }

    // ==========================================================================
    // 🔥 INJINI YA KIJASUSI: STREAM CHUNKS VIA XHR TO NODE.JS ON SELECT (0% RAM)
    // ==========================================================================
    function anzaKurushaVipandeMnyofuHewani(faili) {
        videoUuidMtaani = tengenezaVideoUuid();
        let nafasiYaSasa = 0;
        let nambaYaKipande = 0;
        const jumlaYaVipande = Math.ceil(faili.size / UKUBWA_WA_KIPANDE);
        urushajiUmekamilikaSeva = false; 

        // Piga kete ya kwanza ya piga hodi (Ping Request) hewani
        const pingXhr = new XMLHttpRequest();
        pingXhr.open("GET", `${urlYaSevaMaster}/ping`, true);
        
        pingXhr.onload = function () {
            if (pingXhr.status === 200) {
                // Seva Ikiwaka: Andika ujumbe na uwashe mtambo wa mchwa nyuma ya pazia
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Seva Imewashwa! Mdundo wako unaanza kusafiri...", "#00e676");
                rushaKipandeKinachofuata();
            } else {
                lupushaHitilafuSevaImezimwa();
            }
        };

        pingXhr.onerror = function () {
            lupushaHitilafuSevaImezimwa();
        };

        pingXhr.send();

        function rushaKipandeKinachofuata() {
            if (nafasiYaSasa >= faili.size) {
                console.log("🏆 Chunks zote zimetua mlangoni pa Seva Kuu!");
                sessionStorage.setItem("jumannetok_total_chunks", nambaYaKipande);
                urushajiUmekamilikaSeva = true; 
                
                // Urushaji ukikamilika kwa 100%, amsha ufungaji na uhamisho
                kaguaUshindiNaUhamisheKurasa();
                return;
            }

            const kipandeGhafi = faili.slice(nafasiYaSasa, nafasiYaSasa + UKUBWA_WA_KIPANDE);
            const msomaji = new FileReader();

            msomaji.onload = function (event) {
                const base64Ghafi = event.target.result;
                const base64Safi = base64Ghafi.replace(/^data:video\/[a-zA-Z0-9]+;base64,/, "");

                // 🔥 BADILISHA TU HII SEHEMU YA CHUNK XHR NDANI YA UPLOAD-STEP1.JS MKUU WANGU:
const xhr = new XMLHttpRequest();
xhr.open("POST", `${urlYaSevaMaster}/upload/chunk`, true);

// 🛡️ SULUHISHO LA KIVITA LA SEKUNDE 23:
xhr.timeout = 0; // 0 inamaanisha Unlimited Time (Subiri sekunde mamilioni hadi seva ijibu!)
xhr.keepalive = true; // Inalazimisha mrija wa mtandao usikate pumzi wakati Render inasindika video hewani!
                

                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                xhr.setRequestHeader("x-chunk-index", nambaYaKipande);
                xhr.setRequestHeader("x-total-chunks", jumlaYaVipande);
                xhr.setRequestHeader("x-video-uuid", videoUuidMtaani);

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        asilimiaYaSasa = Math.round(((nambaYaKipande + 1) / jumlaYaVipande) * 100);
                        console.log(`Video inasafiri kimya kimya nyuma ya pazia: ${asilimiaYaSasa}%`);

                        nafasiYaSasa += UKUBWA_WA_KIPANDE;
                        nambaYaKipande++;
                        rushaKipandeKinachofuata(); // Kimbiza kipande kinachofuata bila lag
                    } else {
                        lupushaHitilafuSevaImezimwa();
                    }
                };

                xhr.onerror = function () {
                    lupushaHitilafuSevaImezimwa();
                };

                xhr.send(new TextEncoder().encode(base64Safi));
            };

            msomaji.readAsDataURL(kipandeGhafi);
        }

        function lupushaHitilafuSevaImezimwa() {
            urushajiUmekamilikaSeva = false; 
            
            const btnNext = document.getElementById("jumanne-btn-force-next-step2");
            if (btnNext) {
                btnNext.disabled = true;
                btnNext.style.background = "#222";
                btnNext.style.color = "#555";
                btnNext.innerHTML = '❌ Seva Imezimwa (Mdundo Umesitishwa)';
            }

            // 🚨 TOAST YA NYEKUNDU INAPOTEA SEKUNDE 5: Seva ikizimwa mteja anapewa onyo instantly!
            onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "❌ Hitilafu: Seva Imezimwa kwa Sasa!", "#ff5252");
            console.error("❌ Critical Network Crash: Seva ya Render haipatikani.");
        }
    }

    // ==========================================================================
    // 🔥 INJINI YA KIVITA 2: ZERO-CLICK AUTO-ADVANCE DRIVER (THE AUTO-ROUTER)
    // ==========================================================================
    function kaguaUshindiNaUhamisheKurasa() {
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        
        if (urushajiUmekamilikaSeva) {
            if (btnNext) {
                btnNext.disabled = true;
                btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inafungua Ukurasa...';
            }

            // 🟢 TOAST YA KIJANI INAPOTEA SEKUNDE 5: Lupusha ujumbe mteja afurahie ushindi!
            onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Data Inserted Successfully! Mdundo Umetua Seva Kuu.", "#00e676");
            const toastKioo = document.getElementById("jumanne-caption-error-toast");
            if (toastKioo) toastKioo.style.fontWeight = "bold";

            // 🛡️ SULUHISHO: Mpe sekunde 5 kamili acheki video na asome ujumbe, kisha mvute mbele kiotomatiki!
            setTimeout(() => {
                console.log("✈️ Zero-Click Navigation Triggered: Ukurasa unajifungua wenyewe kuelekea Step 2!");
                window.location.href = "./upload-step2.html"; // Relative Path salama kwa GitHub Pages
            }, 5000); 
        }
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
            
            // Funga mtambo wa video ya loop ya kijasusi mfononi
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
    // 3. MASTER MASTER TIMING LOCK (DOM CONTENT LOADED DRIVER)
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
                
                // 🔥 SULUHISHO: Daka index ya kwanza ya faili halisi la video kuzuia object crash!
                const failiSafi = e.target.files[0];

                const kikomoChaMb45 = 45 * 1024 * 1024;
                if (failiSafi.size > kikomoChaMb45) {
                    alert("Video ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                    videoInput.value = "";
                    return;
                }

                failiLaVideoGhafi = failiSafi;
                sessionStorage.setItem("jumannetok_video_name", failiSafi.name);
                
                // 1. Washa preview ya kioo ya loop instantly hapo hapo kioni
                                washaPreviewYaMudaKioni(failiSafi);
                
                // 2. 🚀 RUKSA: Amsha ukaguzi wa seva na urushaji wa siri sekunde hiyo hiyo!
                anzaKurushaVipandeMnyofuHewani(failiSafi);
            });
        }
    });

    // Linda mteja asitoroke kwa bahati mbaya bando likiwa linasafiri hewani
    window.addEventListener("beforeunload", function (e) {
        if (failiLaVideoGhafi && !urushajiUmekamilikaSeva) {
            e.preventDefault();
            e.returnValue = "Mkuu, usiondoke! Mdundo wako bado unasafiri kwenda seva kuu ya JumanneTok TZ.";
            return e.returnValue;
        }
    });

})();


                                   
