// upload-step2.js - Core Receiver & Transition Framework (Fixed Storage Pipeline)

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let haliYaVideoIliyochaguliwa = "challenge"; // Thamani ya dharura (Default)

    // ==========================================================================
    // 1. FUNGUA DATABASE ILE ILE YA VIPANDE KUTOKA STEP 1
    // ==========================================================================
    document.addEventListener("DOMContentLoaded", function () {
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 2: Database ya vipande imefunguka vizuri!");
            
            // Amsha mtambo wa kuvuta vipande na kuwasha video kioni upande huu
            vutaVipandeKutokaKwenyeDiski();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Step 2: Imeshindikana kufungua database.");
            alert("Mfumo umepata hitilafu ya diski. Tafadhali rudi nyuma.");
        };

        // Washa usimamizi wa kadi za Challenge vs Freestyle
        amshaUsimamiziWaKadiZaAina();
        // Washa kitufe cha kusonga mbele Hatua ya 3
        washaKitufeChaKuvukaHatuaYaPili();
    });

    // ==========================================================================
    // 2. MTAMBO WA KUVUTA VIPANDE KUTOKA INDEXEDDB (MCHWA CONTROLLER)
    // ==========================================================================
    function vutaVipandeKutokaKwenyeDiski() {
        const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
        
        if (!jumlaYaVipandeStr || !dbIndexedAkiba) {
            alert("Hitilafu: Mfumo haujapata video kutoka Hatua ya 1. Tafadhali rudi nyuma uichague upya!");
            window.location.href = "./upload-step1.html"; 
            return;
        }

        const jumlaYaVipande = parseInt(jumlaYaVipandeStr, 10);
        console.log(`🎬 Step 2: Mfumo unavuta vipande ${jumlaYaVipande} kutoka kwenye diski...`);

        const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readonly");
        const duka = muamala.objectStore("jumannetok_chunks");
        
        let mfululizoWaVipande = [];
        let index = 0;

        function dakaKipandeKwenyeDiski() {
            if (index >= jumlaYaVipande) {
                // Tumeshavuta vipande vyote salama! Sasa tunaviunganisha kuwa video moja
                unganishaVipandeNaWashaPlayer(mfululizoWaVipande);
                return;
            }

            const ombi = duka.get(index);
            ombi.onsuccess = function (e) {
                // 🔥 FIX 1: Hakikisha variable ya maandishi ipo thabiti ndipo uisukume kwenye orodha
                if (e.target.result && e.target.result.maandishi_base64) {
                    mfululizoWaVipande.push(e.target.result.maandishi_base64);
                }
                index++;
                dakaKipandeKwenyeDiski();
            };

            ombi.onerror = function () {
                console.error(`❌ Mkwamo wa kusoma kipande namba ${index}`);
                window.location.href = "./upload-step1.html"; 
            };
        }

        dakaKipandeKwenyeDiski();
    }

    // ==========================================================================
    // 3. INJINI YA GEUZA MAANDISHI KUWA VIDEO GHAFI (BLOB CONCATENATION FIXED)
    // ==========================================================================
    function unganishaVipandeNaWashaPlayer(vipandeVyaMaandishi) {
        try {
            if (vipandeVyaMaandishi.length === 0) {
                window.location.href = "./upload-step1.html";
                return;
            }

            // 🔥 FIX 2: Ng'oa kabisa amri ya split! Soma Base64 ghafi mnyofu kuzuia crash ya koma
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
            const playerStep2 = document.getElementById("jumanne-step2-preview-player");
            
            if (playerStep2) {
                playerStep2.src = URL.createObjectURL(videoKamiliBlob);
                
                // 🔥 FIX 3: Washa video kwa usalama bila kulazimisha load ya dharura inayocrash memory
                playerStep2.play().catch(function() {
                    console.log("Autoplay ilizuiliwa na kivinjari kisa ukosefu wa mguso.");
                });
                console.log("🏆 Ushindi: Video ya Step 2 imelupuka kioni salama!");
            }

        } catch (err) {
            console.error("❌ Mkwamo wa kuunganisha vipande Step 2:", err);
            alert("Hitilafu ya kumbukumbu. Tafadhali jaribu tena.");
            window.location.href = "./upload-step1.html"; 
        }
    }

    // ==========================================================================
    // 4. USIMAMIZI WA KADI (CHALLENGE VS FREESTYLE) KUGUSA NA KUBADILI COLOR
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
    // 5. INJINI YA KITUFE CHA INAYOFUATA (KUKUSANYA DATA NA KUVUKA STEP 3)
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

            if (dbIndexedAkiba) {
                dbIndexedAkiba.close();
                console.log("🛡️ Database imefungwa salama Step 2 ili kuruhusu Step 3 kusoma.");
            }

            window.location.href = "./upload-step3.html";
        });
    }

})();
                    
