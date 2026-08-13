// upload-step2.js - Core Receiver & Transition Framework (TikTok Media Stream Cache Hack)

(function () {
    "use strict";

    let haliYaVideoIliyochaguliwa = "challenge"; // Thamani ya dharura (Default)

    // 🔥 TIMING PROTOCOL LOCK: Subiri HTML imalizike kusomwa ndipo uwashe mitambo ya kioo
    document.addEventListener("DOMContentLoaded", function () {
        console.log("✅ Step 2: Mtambo wa kivita umezinduka hewani GitHub Pages!");
        
        // 1. Washa preview ya kioo cha uwongo bila kufungua kabisa database ya IndexedDB!
        vutaPreviewKutokaKwenyeStreamCache();

        // 2. Washa usimamizi wa kadi za Challenge vs Freestyle
        amshaUsimamiziWaKadiZaAina();

        // 3. Washa kitufe cha kusonga mbele Hatua ya 3
        washaKitufeChaKuvukaHatuaYaPili();
    });

    // ==========================================================================
    // 2. INJINI YA KIVITA: VUTA PREVIEW NYEPESI KUTOKA KWENYE RAM (0% DISK USAGE)
    // ==========================================================================
    function vutaPreviewKutokaKwenyeStreamCache() {
        const localStreamUrl = sessionStorage.getItem("jumannetok_preview_stream_url");
        const playerStep2 = document.getElementById("jumanne-step2-preview-player");

        if (!localStreamUrl) {
            console.warn("⚠️ Mfumo haujapata kamba ya preview, unarudi nyuma kwa usalama.");
            alert("Tafadhali chagua video kwanza mkuu!");
            window.location.href = "./upload-step1.html";
            return;
        }

        if (playerStep2) {
            try {
                // 🔥 CHOMEKA KAMBA NYEPESI DIRECT KWENYE PLAYER (MILISEKUNDE SIFURI!)
                playerStep2.src = localStreamUrl;
                playerStep2.play().catch(function() {
                    console.log("Autoplay ilizuiliwa na kivinjari, inasubiri mguso wa mteja.");
                });
                console.log("🏆 Ushindi wa Kivita: Video imelupuka kioni Step 2 bila kugusa IndexedDB!");
            } catch (err) {
                console.error("❌ Mkwamo wa kuwasha player, tunawasha ulinzi wa dharura:", err);
                // Mbinu ya 2: Kama simu ni ya mzee na imegoma kabisa, ficha player, usiigandishe app!
                const previewContainer = document.getElementById("jumanne-step2-preview-container");
                if (previewContainer) {
                    previewContainer.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#111; color:#888; font-weight:bold; font-size:14px; text-align:center; padding:20px;">🎬 Video imeshapakiwa diski salama!<br>Tunaandaa mdundo wako...</div>`;
                }
            }
        }
    }

    // ==========================================================================
    // 3. USIMAMIZI WA KADI (CHALLENGE VS FREESTYLE) KUGUSA NA KUBADILI COLOR
    // ==========================================================================
    function amshaUsimamiziWaKadiZaAina() {
        const kadiChallenge = document.getElementById("jumanne-card-challenge");
        const kadiFreestyle = document.getElementById("jumanne-card-freestyle");
        const radioChallenge = document.getElementById("jumanne-radio-challenge");
        const radioFreestyle = document.getElementById("jumanne-radio-freestyle");

        if (kadiChallenge && kadiFreestyle) {
            
            kadiChallenge.addEventListener("click", () => {
                haliYaVideoIliyochaguliwa = "challenge";
                if (radioChallenge) radioChallenge.checked = true;
                
                kadiChallenge.style.border = "2px solid #00e676";
                kadiChallenge.classList.add("jumanne-card-active");
                
                kadiFreestyle.style.border = "1px solid #222";
                kadiFreestyle.classList.remove("jumanne-card-active");
                
                if (kadiChallenge.querySelector("i")) kadiChallenge.querySelector("i").style.color = "#00e676";
                if (kadiFreestyle.querySelector("i")) kadiFreestyle.querySelector("i").style.color = "#888";
            });

            kadiFreestyle.addEventListener("click", () => {
                haliYaVideoIliyochaguliwa = "freestyle";
                if (radioFreestyle) radioFreestyle.checked = true;
                
                kadiFreestyle.style.border = "2px solid #00e676";
                kadiFreestyle.classList.add("jumanne-card-active");
                
                kadiChallenge.style.border = "1px solid #222";
                kadiChallenge.classList.remove("jumanne-card-active");
                
                if (kadiFreestyle.querySelector("i")) kadiFreestyle.querySelector("i").style.color = "#00e676";
                if (kadiChallenge.querySelector("i")) kadiChallenge.querySelector("i").style.color = "#888";
            });
        }
    }

    // ==========================================================================
    // 4. INJINI YA KITUFE CHA INAYOFUATA (KUKUSANYA DATA NA KUVUKA STEP 3)
    // ==========================================================================
    function washaKitufeChaKuvukaHatuaYaPili() {
        const btnNextStep3 = document.getElementById("jumanne-to-step3");
        const selectKipaji = document.getElementById("jumanne-video-category");

        if (!btnNextStep3) return;

        btnNextStep3.addEventListener("click", function (event) {
            event.preventDefault();

            const botInput = document.getElementById("jumanne-video-bot-input-step2");
            if (botInput && botInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            if (selectKipaji && selectKipaji.value === "") {
                alert("Tafadhali chagua aina ya Kipaji chako kwanza mkuu!");
                selectKipaji.focus();
                return;
            }

            btnNextStep3.disabled = true;
            btnNextStep3.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

            const dataZaHatuaYaPili = {
                ainaYaKipaji: selectKipaji ? selectKipaji.value : "",
                utaratibuWaVideo: haliYaVideoIliyochaguliwa,
                tareheYaKuhifadhi: Date.now()
            };

            sessionStorage.setItem("jumannetok_step2_data", JSON.stringify(dataZaHatuaYaPili));
            console.log("💾 Step 2: Data zimefungwa salama:", dataZaHatuaYaPili);

            // Mtoe mnyofu akatafute bando la kizalendo kuelekea Step 3
            window.location.href = "./upload-step3.html";
        });
    }

})();
