// upload-step1.js - Kamili: Base64 Chunking Engine & State Restoration (Fixed Pipeline)

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    const UKUBWA_WA_KIPANDE = 1 * 1024 * 1024; // Megabyte 1 kamili kwa kila kipande cha maandishi

    // ==========================================================================
    // 1. INJINI YA DATABASE (INDEXEDDB CHUNK STORAGE)
    // ==========================================================================
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("jumannetok_chunks")) {
                db.createObjectStore("jumannetok_chunks", { keyPath: "kipande_id" });
            }
        };

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Database ya vipande imewaka salama!");
            
            // Kagua kama kuna video ya zamani iliyovunjwa vipande ili tuirejeshe kioni
            kaguaNaUunganisheVipandeKioni();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Imeshindikana kufungua database ya vipande.");
        };
    }

    // ==========================================================================
    // 2. INJINI YA KUKATA VIDEO NA KUHIFADHI BILA TAKATAKA ZA HEADER
    // ==========================================================================
    function vunjaVideoKuwaVipandeVyaMaandishi(faili) {
        if (!dbIndexedAkiba) return;

        const muamalaSafisha = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
        muamalaSafisha.objectStore("jumannetok_chunks").clear();

        let nafasiYaSasa = 0;
        let nambaYaKipande = 0;
        const jumlaYaVipande = Math.ceil(faili.size / UKUBWA_WA_KIPANDE);

        console.log(`🎬 Mchakato umeanza: Video inakatwa kuwa vipande ${jumlaYaVipande}...`);

        function somaKipandeKinachofuata() {
            if (nafasiYaSasa >= faili.size) {
                console.log("🏆 Ushindi! Vipande vyote vimegandishwa kwenye diski ya simu.");
                sessionStorage.setItem("jumannetok_total_chunks", nambaYaKipande);
                return;
            }

            const kipandeGhafi = faili.slice(nafasiYaSasa, nafasiYaSasa + UKUBWA_WA_KIPANDE);
            const msomaji = new FileReader();

            msomaji.onload = function (event) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
                const duka = muamala.objectStore("jumannetok_chunks");

                // Ng'oa maneno ya utangulizi ya Base64 ili diski ibaki na byte safi za video tu
                const base64Ghafi = event.target.result;
                const base64Safi = base64Ghafi.replace(/^data:video\/[a-zA-Z0-9]+;base64,/, "");

                const dataYaKipande = {
                    kipande_id: nambaYaKipande,
                    maandishi_base64: base64Safi
                };

                duka.put(dataYaKipande);

                nafasiYaSasa += UKUBWA_WA_KIPANDE;
                nambaYaKipande++;

                somaKipandeKinachofuata();
            };

            msomaji.readAsDataURL(kipandeGhafi);
        }

        somaKipandeKinachofuata();
    }

    // ==========================================================================
    // 3. INJINI YA STATE RESTORATION (UREJESHAJI WA VIDEO BAADA YA REFRESH)
    // ==========================================================================
    function kaguaNaUunganisheVipandeKioni() {
        const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
        if (!jumlaYaVipandeStr || !dbIndexedAkiba) return;

        const jumlaYaVipande = parseInt(jumlaYaVipandeStr, 10);
        console.log("♻️ Mfumo umegundua vipande vya zamani kwenye diski. Unavirejesha kioni...");

        const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readonly");
        const duka = muamala.objectStore("jumannetok_chunks");
        
        let mfululizoWaVipande = [];
        let index = 0;

        function dakaKipandeKwenyeDiski() {
            if (index >= jumlaYaVipande) {
                unganishaVipandeKuwaVideoMoja(mfululizoWaVipande);
                return;
            }

            const ombi = duka.get(index);
            ombi.onsuccess = function (e) {
                if (e.target.result && e.target.result.maandishi_base64) {
                    mfululizoWaVipande.push(e.target.result.maandishi_base64);
                }
                index++;
                dakaKipandeKwenyeDiski();
            };
        }

        dakaKipandeKwenyeDiski();
    }

    function unganishaVipandeKuwaVideoMoja(vipandeVyaMaandishi) {
        try {
            // 🔥 FIXED PROTOCOL: Data zetu ni Base64 safi sasa hivi, tunasoma mnyofu bila split!
            const maBlobYote = vipandeVyaMaandishi.map(base64Str => {
                const byteCharacters = atob(base64Str);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: "video/mp4" });
            });

            const videoKamiliBlob = new Blob(maBlobYote, { type: "video/mp4" });
            washaPreviewYaMudaKioni(videoKamiliBlob);

        } catch (err) {
            console.error("Mkwamo wa kuunganisha vipande baada ya refresh:", err);
        }
    }

    function washaPreviewYaMudaKioni(failiBlob) {
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

    // ==========================================================================
    // 4. TIMING PROTOCOL & ROUTER LOGIC (NEXT BUTTON GATE)
    // ==========================================================================
    document.addEventListener("DOMContentLoaded", function () {
        amshaDukaLaUploadLocal();

        const videoInput = document.getElementById("jumanne-video-file-input");
        if (videoInput) {
            videoInput.addEventListener("change", function (e) {
                if (!e.target.files || e.target.files.length === 0) return;
                const failiLaVideo = e.target.files[0];

                const kikomoChaMb45 = 45 * 1024 * 1024;
                if (failiLaVideo.size > kikomoChaMb45) {
                    alert("Video ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                    videoInput.value = "";
                    return;
                }

                sessionStorage.setItem("jumannetok_video_name", failiLaVideo.name);
                
                // Washa preview ya kwanza instantly kwa kutumia RAM ya muda
                washaPreviewYaMudaKioni(failiLaVideo);
                
                // Kukata katakata faili
                vunjaVideoKuwaVipandeVyaMaandishi(failiLaVideo);
            });
        }

                const btnNext = document.getElementById("jumanne-btn-force-next-step2");
        if (btnNext) {
            btnNext.addEventListener("click", function (event) {
                event.preventDefault();
                
                const videoInput = document.getElementById("jumanne-video-file-input");
                const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
                
                if (!jumlaYaVipandeStr) {
                    alert("Tafadhali chagua video kwanza kabla ya kwenda hatua inayofuata!");
                    return;
                }

                btnNext.disabled = true;
                btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

                // 🔥 SILAHA YA KIVITA 1: Daka faili ghafi la video lile lile mtumiaji alilolichagua hivi punde
                if (videoInput && videoInput.files && videoInput.files.length > 0) {
                    const failiHalisi = videoInput.files[0];
                    // Tengeneza kamba fupi ya siri ya preview nyepesi isiyo na uzito wa RAM
                    const temporaryStreamUrl = URL.createObjectURL(failiHalisi);
                    sessionStorage.setItem("jumannetok_preview_stream_url", temporaryStreamUrl);
                    console.log("🚀 Step 1: Kamba ya siri ya preview imefungwa kwenye sessionStorage.");
                }

                // Funga database ya Step 1 kinguvu hapa hapa kuachia diski kuu ya simu
                if (dbIndexedAkiba) {
                    dbIndexedAkiba.close();
                    console.log("🔒 Step 1: Database imefungwa kwa usalama.");
                }

                // Hama kurasa kibashara mnyofu kwa kutumia relative pathing
                window.location.href = "./upload-step2.html";
            });
        }
        
