

// upload-step1.js - Mfumo wa Upakiaji wa Video kwa Chunks na Hesabu ya Asilimia (ArrayBuffer)

(function () {
    "use strict";

    const UKUBWA_WA_KIPANDE = 1 * 1024 * 1024; // Megabyte 1 kamili kwa kila kipande cha binary
    const urlYaSevaMaster = "https://onrender.com"; // Link ya Seva Kuu ya Render
    
    let failiLaVideoGhafi = null;
    let videoUuidMtaani = "";
    let asilimiaYaSasa = 0;
    let urushajiUmekamilikaSeva = false;

    // Uzalishaji wa UUID ya siri kwa ajili ya session ya upload hewani
    function tengenezaVideoUuid() {
        return 'jumanne_vid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    }

    // TOAST NOTIFICATION CONTROLLER (INAPOTEA NDANI YA SEKUNDE 5)

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

    // INJINI YA KIJASUSI: ANZA UKAGUZI WA SEVA MNYOFU
    function kaguaSevaNaAnzaUrushaji(faili) {
        videoUuidMtaani = tengenezaVideoUuid();
        urushajiUmekamilikaSeva = false;


        const pingXhr = new XMLHttpRequest();
        pingXhr.open("GET", `${urlYaSevaMaster.replace('/api', '')}/ping`, true);
        
        pingXhr.onload = function () {
            if (pingXhr.status === 200) {
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
        onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "❌ Hitilafu: Seva Imezimwa kwa Sasa!", "#ff5252");
        
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        if (btnNext) {
            btnNext.disabled = true;
            btnNext.style.background = "#222";
            btnNext.style.color = "#555";
            btnNext.innerHTML = '❌ Seva Imezimwa (Mdundo Umesitishwa)';
        }
    }

    // 🔥 MTAMBO WA KUHESABU ASILIMIA MUBASHARA KIOONE BILA CRASH
    function anzaKusagaNaKurushaVipande(faili) {
        let nafasiYaSasa = 0;
        let nambaYaKipande = 0;
        const jumlaYaVipande = Math.ceil(faili.size / UKUBWA_WA_KIPANDE);


        function rushaKipandeKinachofuata() {
            if (nafasiYaSasa >= faili.size) {
                console.log("🏆 Chunks zote zimetua salama seva kuu ya Node.js!");
                sessionStorage.setItem("jumannetok_total_chunks", nambaYaKipande);
                urushajiUmekamilikaSeva = true;
                
                // Ujumbe wa ushindi wa sekunde 5 mlangoni
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Data Inserted Successfully! Mdundo Umetua Seva Kuu.", "#00e676");
                
                // Auto-advance kuelekea Step 2 baada ya ujumbe wa sekunde 5 kupotea
                setTimeout(() => {
                    window.location.href = "./upload-step2.html";
                }, 5000);
                return;
            }

            const kipandeGhafi = faili.slice(nafasiYaSasa, nafasiYaSasa + UKUBWA_WA_KIPANDE);
            const msomaji = new FileReader();


            msomaji.onload = function (event) {
                const arrayBufferGhafi = event.target.result;

                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${urlYaSevaMaster}/upload/chunk`, true);

                xhr.timeout = 0;
                xhr.keepalive = true;

                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                xhr.setRequestHeader("x-chunk-index", nambaYaKipande);
                xhr.setRequestHeader("x-total-chunks", jumlaYaVipande);
                xhr.setRequestHeader("x-video-uuid", videoUuidMtaani);

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        // Hapa tunapiga hesabu halisi ya asilimia na kuichora kioone cha mtumiaji!
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
                        rushaKipandeKinachofuata(); // Kimbiza kipande kinachofuata bila lag
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

    document.addEventListener("DOMContentLoaded", function () {
        const videoInput = document.getElementById("jumanne-video-file-input");
        const btnNext = document.getElementById("jumanne-btn-force-next-step2");


        if (btnNext) {
            btnNext.innerHTML = '⚙️ Mfumo Unajiongoza Kiotomatiki';
            btnNext.disabled = true;
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

                failiLaVideoGhafi = failSafi;
                sessionStorage.setItem("jumannetok_video_name", failSafi.name);

                
                washaPreviewYaMudaKioni(failSafi);
                kaguaSevaNaAnzaUrushaji(failSafi);
            });
        }
    });

    window.addEventListener("beforeunload", function (e) {
        if (failiLaVideoGhafi && !urushajiUmekamilikaSeva) {
            e.preventDefault();
            e.returnValue = "Mkuu, usiondoke! Mdundo wako bado unasafiri kwenda seva kuu ya JumanneTok TZ.";
            return e.returnValue;
        }
    });

})();


                     
