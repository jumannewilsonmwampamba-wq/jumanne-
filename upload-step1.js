// upload-step1.js - Toleo la Kimkakati: Base64 Chunking Engine (Step 1)

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    const UKUBWA_WA_KIPANDE = 1 * 1024 * 1024; // Megabyte 1 kwa kila kipande cha maandishi

    // 1. FUNGUA DATABASE YA NDANI MARA TU UKURASA UNAPOWAKA
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            // Duka hili litahifadhi vipande vyote vya video kwa namba zao
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

    amshaDukaLaUploadLocal();

    // 2. MTAMBO WA KUKAMATA VIDEO NA KUIKATAKATA VIPANDE (THE CHUNKING PROCESS)
    const videoInput = document.getElementById("jumanne-video-file-input");

    if (videoInput) {
        videoInput.addEventListener("change", function (e) {
            if (!e.target.files || e.target.files.length === 0) return;
            const failiLaVideo = e.target.files[0];

            // Kagua ukubwa (Mwisho MB 45)
            const kikomoChaMb45 = 45 * 1024 * 1024;
            if (failiLaVideo.size > kikomoChaMb45) {
                alert("Video ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 45 pekee.");
                videoInput.value = "";
                return;
            }

            // Hifadhi jina na habari za video kwenye sessionStorage kwa ajili ya kurasa zinazofuata
            sessionStorage.setItem("jumannetok_video_name", failiLaVideo.name);

            // Washa kicheza preview cha hapa hapo haraka kwa kutumia RAM ya muda
            washaPreviewYaMudaKioni(failiLaVideo);

            // 🚀 ANZA MKAKATI WA MCHWA: Vunja video vipande vidogo na uvitunze kwenye diski
            vunjaVideoKuwaVipandeVyaMaandishi(failiLaVideo);
        });
    }

    // 3. INJINI YA KUKATA VIDEO NA KUHIFADHI KWENYE INDEXEDDB
    function vunjaVideoKuwaVipandeVyaMaandishi(faili) {
        if (!dbIndexedAkiba) return;

        // Safisha kwanza vipande vya zamani kama vilikuwepo ili visichanganyike
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

            // Kata kipande cha Megabyte 1 kutoka kwenye video nzima
            const kipandeGhafi = faili.slice(nafasiYaSasa, nafasiYaSasa + UKUBWA_WA_KIPANDE);
            
            const msomaji = new FileReader();
            msomaji.onload = function (event) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
                const duka = muamala.objectStore("jumannetok_chunks");

                const dataYaKipande = {
                    kipande_id: nambaYaKipande, // Mfano: 0, 1, 2, 3...
                    maandishi_base64: event.target.result // Kipande kikiwa katika muundo wa maandishi mepesi
                };

                duka.put(dataYaKipande);

                // Sogeza mbele hesabu kwa ajili ya kipande kinachofuata
                nafasiYaSasa += UKUBWA_WA_KIPANDE;
                nambaYaKipande++;

                // Endelea kukata kipande kinachofuata (Mbinu ya recursion)
                somaKipandeKinachofuata();
            };

            msomaji.readAsDataURL(kipandeGhafi);
        }

        // Anza kukata kipande cha kwanza kabisa
        somaKipandeKinachofuata();
    }

    // 4. INJINI YA KUREJESHA VIDEO IKIWA USER AMEREFRESH UKURASA WA STEP 1
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
                // Tumeshavuta vipande vyote! Sasa tunaviunganisha kuwa video moja
                unganishaVipandeKuwaVideoMoja(mfululizoWaVipande);
                return;
            }

            const ombi = duka.get(index);
            ombi.onsuccess = function (e) {
                if (e.target.result) {
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
            // Geuza ma-string ya Base64 kurudi kuwa ma-Blob ghafi ya video
            const maBlobYote = vipandeVyaMaandishi.map(base64Str => {
                const sehemu = base64Str.split(',');
                const byteCharacters = atob(sehemu[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: "video/mp4" });
            });

            // Unganisha vipande vyote vya blob kuwa faili moja kubwa la video
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

    // 5. INJINI YA KITUFE CHA INAYOFUATA: Kazi yake sasa ni kuvuka tu ukurasa kibashara
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");
    if (btnNext) {
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            
            const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
            if (!jumlaYaVipandeStr) {
                alert("Tafadhali chagua video kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

            // Hamisha ukurasa kibashara kwenda Step 2. Data yetu tayari ipo vipande-vipande kwenye diski!
            window.location.href = "upload-step2.html";
        });
    }

})();
                    
