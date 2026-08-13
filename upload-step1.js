// upload-step1.js - Advanced Stream-on-Select Ingestion Engine & Keep-Alive Loop (Production Fix)

(function () {
    "use strict";

    const UKUBWA_WA_KIPANDE = 1 * 1024 * 1024; // Megabyte 1 kamili kwa kila kipande cha binary
    const urlYaSevaMaster = "http://localhost:3000/api"; // Link ya Seva Kuu ya Render
    
    let failiLaPichaAsili = null;
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

        setTimeout(() => { targetElement.style.opacity = "0"; }, 4500);
        setTimeout(() => { targetElement.style.display = "none"; }, 5000);
    }

    // ==========================================================================
    // 🔥 INJINI YA KIVITA 1: STREAM CHUNKS DIRECT TO NODE.JS ON SELECT (0% RAM CACHE)
    // ==========================================================================
        // ==========================================================================
    // 🔥 NGOME YA CHUMA: PROTOCOL INAYOGANDISHA UKURASA KAMA SEVA IMERARA!
    // ==========================================================================
    function anzaKurushaVipandeMnyofuHewani(faili) {
        videoUuidMtaani = tengenezaVideoUuid();
        let nafasiYaSasa = 0;
        let nambaYaKipande = 0;
        const jumlaYaVipande = Math.ceil(faili.size / UKUBWA_WA_KIPANDE);
        urushajiUmekamilikaSeva = false; // Hakikisha lock ipo imara mlangoni!

        // Lupusha ujumbe wa kwanza kabisa kumpa mteja amani ya moyo
        onyeshaUjumbeWaMuda("jumanne-caption-error-toast", `📡 Tunapiga hodi kwenye seva ya JumanneTok TZ...`, "#2196f3");

        function rushaKipandeKinachofuata() {
            if (nafasiYaSasa >= faili.size) {
                console.log("🏆 Chunks zote zimetua mlangoni pa Seva Kuu!");
                sessionStorage.setItem("jumannetok_total_chunks", nambaYaKipande);
                urushajiUmekamilikaSeva = true; // Fungua lock hapa TU baada ya ushindi!
                
                kaguaUshindiNaUhamisheKurasa();
                return;
            }

            const kipandeGhafi = faili.slice(nafasiYaSasa, nafasiYaSasa + UKUBWA_WA_KIPANDE);
            const msomaji = new FileReader();

            msomaji.onload = function (event) {
                const base64Ghafi = event.target.result;
                const base64Safi = base64Ghafi.replace(/^data:video\/[a-zA-Z0-9]+;base64,/, "");

                fetch(`${urlYaSevaMaster}/upload/chunk`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "x-chunk-index": nambaYaKipande,
                        "x-total-chunks": jumlaYaVipande,
                        "x-video-uuid": videoUuidMtaani
                    },
                    body: new TextEncoder().encode(base64Safi)
                })
                .then(res => {
                    if(!res.ok) throw new Error("Seva Imekataa");
                    return res.json();
                })
                .then(jibuSeva => {
                    asilimiaYaSasa = Math.round(((nambaYaKipande + 1) / jumlaYaVipande) * 100);
                    
                    const toastKioo = document.getElementById("jumanne-caption-error-toast");
                    if (toastKioo) {
                        toastKioo.style.display = "block";
                        toastKioo.style.opacity = "1";
                        toastKioo.style.color = "#00e676"; // Kijani ya ushindi 🇹🇿
                        toastKioo.textContent = `⚡ Seva Ipo Mubashara! Mdundo unapakia: ${asilimiaYaSasa}%`;
                    }

                    nafasiYaSasa += UKUBWA_WA_KIPANDE;
                    nambaYaKipande++;
                    rushaKipandeKinachofuata();
                })
                .catch(err => {
                    // 🚨 SULUHISHO KUU: Seva ikifeli au ikiwa offline, mtambo unalupua onyo jekundu kioni!
                    urushajiUmekamilikaSeva = false; // Kaza kufuli isihame kurasa kienyeji!
                    
                    const btnNext = document.getElementById("jumanne-btn-force-next-step2");
                    if (btnNext) {
                        btnNext.disabled = false;
                        btnNext.innerHTML = 'Inayofuata <i class="fas fa-arrow-right"></i>';
                    }

                    const toastKioo = document.getElementById("jumanne-caption-error-toast");
                    if (toastKioo) {
                        toastKioo.style.display = "block";
                        toastKioo.style.opacity = "1";
                        toastKioo.style.color = "#ff5252"; // Rangi nyekundu ya hatari ya dharura!
                        toastKioo.textContent = `❌ Hitilafu: Mdundo Umegoma! Seva ya Render haipatikani mtaani (Offline).`;
                    }
                    console.error("❌ Critical Network Crash: Urushaji umesitishwa kinguvu.");
                });
            };

            msomaji.readAsDataURL(kipandeGhafi);
        }

        rushaKipandeKinachofuata();
    }
    
                        
    // ==========================================================================
    // 🔥 INJINI YA KIVITA 2: PREVIEW CONTROLLER & ROUTER TIMING LOCK
    // ==========================================================================
    function kaguaUshindiNaUhamisheKurasa() {
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        
        if (urushajiUmekamilikaSeva) {
            onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Data Inserted Successfully! Mdundo Umetua Seva Kuu.", "#00e676");
            const toastKioo = document.getElementById("jumanne-caption-error-toast");
            if (toastKioo) toastKioo.style.fontWeight = "bold";

            setTimeout(() => {
                if (btnNext) {
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Inayofuata < i class="fas fa-arrow-right">< /i>';
                }
                window.location.href = "./upload-step2.html";
            }, 1500); 
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

        if (videoInput) {
            videoInput.addEventListener("change", function (e) {
                if (!e.target.files || e.target.files.length === 0) return;
                
                // 🔥 FIX: Daka index ya kwanza ya faili halisi la video kuzuia object crash
                const failiLaVideo = e.target.files[0];

                const kikomoChaMb45 = 45 * 1024 * 1024;
                if (failiLaVideo.size > kikomoChaMb45) {
                    alert("Video ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                    videoInput.value = "";
                    return;
                }

                failiLaPichaAsili = failiLaVideo;
                sessionStorage.setItem("jumannetok_video_name", failiLaVideo.name);
                
                // 🔥 FIX: Jina limesasishwa kuwa P kuu kulingana na muundo wa juu!
                washaPreviewYaMudaKioni(failiLaVideo);
                
                // Anza kurusha vipande direct seva ya Node nyuma ya pazia
                anzaKurushaVipandeMnyofuHewani(failiLaVideo);
            });
        }

        if (btnNext) {
            btnNext.addEventListener("click", function (event) {
                event.preventDefault();
                
                if (!failiLaPichaAsili) {
                    alert("Tafadhali chagua video kwanza kabla ya kwenda hatua inayofuata!");
                    return;
                }

                if (!urushajiUmekamilikaSeva) {
                    btnNext.disabled = true;
                    btnNext.innerHTML = '<i class="Inasubiri Seva...';
                    
                    onyeshaUjumbeWaMuda("jumanne-caption-error-toast", `⏳ Kipaji Chako Kinasafiri Kwenda Kwenye Seva Kuu: ${asilimiaYaSasa}%... Tafadhali Subiri Sekunde Chache!`, "#ffeb3b");
                    return;
                }

                kaguaUshindiNaUhamisheKurasa();
            });
        }
    });

    // SENSOR YA KULINDA UKURASA USIFUNGWE GHAFLA WAKATI WA UPLOAD
    window.addEventListener("beforeunload", function (e) {
        if (failiLaPichaAsili && !urushajiUmekamilikaSeva) {
            e.preventDefault();
            e.returnValue = "Mkuu, usiondoke! Mdundo wako bado unasafiri kwenda seva kuu ya JumanneTok TZ.";
            return e.returnValue;
        }
    });

})();
            
