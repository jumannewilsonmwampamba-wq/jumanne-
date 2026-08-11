// ==========================================================================
// JUMANNETOK TZ - CORE UPLOAD ENGINE (STEP 2: CATEGORY & TYPE SELECTION)
// ==========================================================================

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let dataYaVideoDraftGlobal = null; // Inashikilia kete tuliyoivuta kutoka IndexedDB
    let videoTypeSelected = "challenge"; // Hali chanya ya asili (Default)

    // 1. FUNGUA DATABASE YA NDANI MARA TU USER ANAPOTUA STEP 2
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 2: Database ya IndexedDB imefunguka salama!");
            
            // Database ikishafunguka tu, vuta ile Blob ya video iliyosaviwa Step 1
            vutaNaUchezeVideoYaPreview();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Mkwamo! Kivinjari kimegoma kufunguka IndexedDB Step 2.");
        };
    }

    // 2. INJINI YA KUVUTA VIDEO BLOB KUTOKA STEP 1 NA KUICHEZA PREVIEW JUU
    function vutaNaUchezeVideoYaPreview() {
        if (!dbIndexedAkiba) return;

        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        
        // Piga hodi kwa kutumia ufunguo ule ule thabiti wa herufi ndogo
        const ombiDaka = duka.get("jumanne_current_upload_draft");

        ombiDaka.onsuccess = function (e) {
            const data = e.target.result;
            
            if (data && data.videoBlobData) {
                dataYaVideoDraftGlobal = data; // Iweke kwenye memory ya RAM kwa ajili ya mbele
                
                const playerStep2 = document.getElementById("jumanne-local-preview-player-step2");
                try {
                    const URLyaVideoStep2 = URL.createObjectURL(data.videoBlobData);
                    if (playerStep2) {
                        playerStep2.src = URLyaVideoStep2;
                        playerStep2.load();
                        playerStep2.play().catch(() => {
                            console.log("Autoplay imezuiwa Step 2, inasubiri user.");
                        });
                    }
                } catch (err) {
                    console.error("Mkwamo wa kuwasha mrija wa preview Step 2:", err);
                }
            } else {
                console.warn("⚠️ Hakuna draft ya video iliyopatikana kwenye diski! Rudisha Step 1.");
                alert("Hitilafu: Tafadhali rudi nyuma ukachague video upya haijapatikana diski ya simu!");
                window.location.href = "upload-step1.html";
            }
        };
    }

    // 3. INJINI YA MANUVA YA KADI ZA REDIO (CHALLENGE VS FREESTYLE SELECTION)
    // Inafanya kazi direct mtumiaji akikanyaga ma-card ya kioo giza
    window.chaguaHaliYaVideo = function (ainaKete) {
        videoTypeSelected = ainaKete;

        const radioChallenge = document.getElementById("jumanne-radio-challenge");
        const radioFreestyle = document.getElementById("jumanne-radio-freestyle");
        const cardChallenge = document.getElementById("jumanne-card-challenge");
        const cardFreestyle = document.getElementById("jumanne-card-freestyle");

        if (!radioChallenge || !radioFreestyle || !cardChallenge || !cardFreestyle) return;

        if (ainaKete === "challenge") {
            // Washa Challenge: Kaza border ya kijani, zima Freestyle
            radioChallenge.checked = true;
            radioFreestyle.checked = false;
            
            cardChallenge.style.border = "2px solid #00e676";
            cardChallenge.style.background = "#111";
            
            cardFreestyle.style.border = "1px solid #222";
            cardFreestyle.style.background = "#111";
            
            // Geuza rangi ya icon ya Trophy kuwa ya dhahabu/kijani
            cardChallenge.querySelector("i").style.color = "#00e676";
            cardFreestyle.querySelector("i").style.color = "#888";
            
        } else if (ainaKete === "freestyle") {
            // Washa Freestyle: Kaza border ya kijani, zima Challenge
            radioChallenge.checked = false;
            radioFreestyle.checked = true;
            
            cardFreestyle.style.border = "2px solid #00e676";
            cardFreestyle.style.background = "#111";
            
            cardChallenge.style.border = "1px solid #222";
            cardChallenge.style.background = "#111";
            
            // Geuza rangi ya icon ya Microphone kuwa ya kijani
            cardFreestyle.querySelector("i").style.color = "#00e676";
            cardChallenge.querySelector("i").style.color = "#888";
        }
        
        console.log(`🎯 Utaratibu umebadilika kuwa: ${videoTypeSelected.toUpperCase()}`);
    };

    // 4. INJINI INAYOFUNGASHWA DATA MBELE KUELEKEA HATUA YA TATU (`upload-step3.html`)
    const btnNext = document.getElementById("jumanne-to-step3");

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            // Mtego wa siri wa ma-robot (Honeypot Enforcement)
            const botInputStep2 = document.getElementById("jumanne-video-bot-input-step2");
            if (botInputStep2 && botInputStep2.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            const categorySelect = document.getElementById("jumanne-video-category");
            if (!categorySelect || !categorySelect.value) {
                alert("Mkwamo! Tafadhali chagua aina ya Kipaji Chako kwanza kabla ya kwenda hatua inayofuata!");
                return;
            }

            const ainaYaKipajiSafi = categorySelect.value;

            // FUNGASHA DATA NDANI YA SESSIONSTORAGE ILI HATUA YA 3 IZIKUTE KULE MBELE
            const keteYaUpakiajiStep2 = {
                ainaYaKipaji: ainaYaKipajiSafi,
                utaratibuWaVideo: videoTypeSelected,
                tareheMabadiliko: Date.now()
            };

            try {
                sessionStorage.setItem("jumannetok_upload_step2", JSON.stringify(keteYaUpakiajiStep2));
                console.log("📦 Cache Persistence Locked: Data za Step 2 zimehifadhiwa RAM!");
                
                // Zima player ya video kwanza ili isilemee RAM ya simu wakati wa kuhama ukurasa
                const playerStep2 = document.getElementById("jumanne-local-preview-player-step2");
                if (playerStep2) {
                    playerStep2.pause();
                    playerStep2.src = "";
                }

                // MFYATUE USER MNYOFU KUELEKEA HATUA YA TATU YA HITIMISHO
                window.location.href = "upload-step3.html";

            } catch (errSession) {
                console.error("❌ Mkwamo wa kuandika kwenye sessionStorage:", errSession);
                alert("Hitilafu ya simu: Imeshindwa kufungasha data za usajili mbele!");
            }
        });
    }

    // Amsha duka la local upose ukurasa unamwaga macho ya kwanza kitaifa
    amshaDukaLaUploadLocal();
})();
            
