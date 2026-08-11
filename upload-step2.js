// upload-step2.js - Core Receiver & Transition Framework (Ushindi 100%)

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
            window.location.href = "upload-step1.html";
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
                if (e.target.result) {
                    mfululizoWaVipande.push(e.target.result.maandishi_base64);
                }
                index++;
                dakaKipandeKwenyeDiski();
            };

            ombi.onerror = function () {
                console.error(`❌ Mkwamo wa kusoma kipande namba ${index}`);
                window.location.href = "upload-step1.html";
            };
        }

        dakaKipandeKwenyeDiski();
    }

    // ==========================================================================
    // 3. INJINI YA GEUZA MAANDISHI KUWA VIDEO GHAFI (BLOB CONCATENATION)
    // ==========================================================================
    function unganishaVipandeNaWashaPlayer(vipandeVyaMaandishi) {
        try {
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

            const videoKamiliBlob = new Blob(maBlobYote, { type: "video/mp4" });
            
            // Daka kicheza video cha ID yetu mpya niliyoisawazisha kwenye HTML yako
            const playerStep2 = document.getElementById("jumanne-step2-preview-player");
            
            if (playerStep2) {
                playerStep2.src = URL.createObjectURL(videoKamiliBlob);
                playerStep2.load();
                playerStep2.play().catch(function() {
                    console.log("Autoplay imezuiwa na kivinjari.");
                });
                console.log("🏆 Ushindi! Video ipo kioni sasa hivi Hatua ya Pili.");
            }

        } catch (err) {
            console.error("Mkwamo wa kuunganisha vipande Step 2:", err);
            alert("Hitilafu ya kumbukumbu. Tafadhali jaribu tena.");
            window.location.href = "upload-step1.html";
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
            
            // Mtumiaji akigusa Kadi ya Challenge
            kadiChallenge.addEventListener("click", () => {
                haliYaVideoIliyochaguliwa = "challenge";
                if (radioChallenge) radioChallenge.checked = true;
                
                kadiChallenge.style.border = "2px solid #00e676";
                kadiChallenge.classList.add("jumanne-card-active");
                
                kadiFreestyle.style.border = "1px solid #222";
                kadiFreestyle.classList.remove("jumanne-card-active");
                
                // Badilisha rangi ya icon ya mbele ya Challenge kuwa ya kijani
                kadiChallenge.querySelector("i").style.color = "#00e676";
                kadiFreestyle.querySelector("i").style.color = "#888";
            });

            // Mtumiaji akigusa Kadi ya Freestyle
            kadiFreestyle.addEventListener("click", () => {
                haliYaVideoIliyochaguliwa = "freestyle";
                if (radioFreestyle) radioFreestyle.checked = true;
                
                kadiFreestyle.style.border = "2px solid #00e676";
                kadiFreestyle.classList.add("jumanne-card-active");
                
                kadiChallenge.style.border = "1px solid #222";
                kadiChallenge.classList.remove("jumanne-card-active");
                
                kadiFreestyle.querySelector("i").style.color = "#00e676";
                kadiChallenge.querySelector("i").style.color = "#888";
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

            // Mtego wa robot (Honeypot)
            const botInput = document.getElementById("jumanne-video-bot-input-step2");
            if (botInput && botInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            // Kagua kama amechagua aina ya kipaji
            if (selectKipaji && selectKipaji.value === "") {
                alert("Tafadhali chagua aina ya Kipaji chako kwanza mkuu!");
                selectKipaji.focus();
                return;
            }

            // Badilisha muonekano wa kitufe kuonyesha kazi inafanyika
            btnNextStep3.disabled = true;
            btnNextStep3.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasonga mbele...';

            // 🔥 DAKA NA KUTUNZA TAARIFA ZOTE KWENYE SESSIONSTORAGE KWA AJILI YA STEP 3
            const dataZaHatuaYaPili = {
                ainaYaKipaji: selectKipaji ? selectKipaji.value : "",
                utaratibuWaVideo: haliYaVideoIliyochaguliwa,
                tareheYaKuhifadhi: Date.now()
            };

            sessionStorage.setItem("jumannetok_step2_data", JSON.stringify(dataZaHatuaYaPili));
            console.log("💾 Data za Step 2 zimehifadhiwa salama:", dataZaHatuaYaPili);

            // Swaga mtumiaji kwenda Hatua ya Tatu kibashara!
            window.location.href = "upload-step3.html";
        });
    }

})();
                                           
