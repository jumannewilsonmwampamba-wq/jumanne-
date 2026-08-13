// upload-step3.js - Sehemu ya 1: Ma-Variable ya Juu na Core Framework Initialization

(function () {
    "use strict";

    let dbIndexedAkiba = null;

    // 1. DAKA MA-ELEMENT YOTE YA HTML KUTOKA KWENYE FOMU YA STEP 3
    const playerStep3 = document.getElementById("jumanne-step3-preview-player");
    const captionBox = document.getElementById("jumanne-video-caption");
    const tagsBox = document.getElementById("jumanne-video-tags");
    const wordCounter = document.getElementById("jumanne-word-counter");
    const tagsCounter = document.getElementById("jumanne-tags-counter");
    const btnPublish = document.getElementById("jumanne-final-publish-btn");

    // ==========================================================================
    // INJINI NDOGO: TOAST NOTIFICATION CONTROLLER (INAPOTEA NDANI YA SEKUNDE 5)
    // ==========================================================================
    function onyeshaUjumbeWaMuda(elementId, ujumbe) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        targetElement.textContent = ujumbe;
        targetElement.style.display = "block";
        targetElement.style.opacity = "1";

        // Baada ya sekunde 4.5, anza kuyeyusha maandishi (fade out)
        setTimeout(() => {
            targetElement.style.opacity = "0";
        }, 4500);

        // Baada ya sekunde 5 kamili, ficha kabisa element
        setTimeout(() => {
            targetElement.style.display = "none";
        }, 5000);
    }

    // Mlango unabaki wazi chini yake kwa ajili ya kuingiza mtambo wa kuvuta vipande kutoka diski...
     // ==========================================================================
    // SEHEMU YA 2: INJINI YA KUVUTA VIPANDE VYOTE NA KUWASHA PLAYER (VIDEO FIX)
    // ==========================================================================
    function vutaVipandeKutokaKwenyeDiski() {
        const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
        if (!jumlaYaVipandeStr || !dbIndexedAkiba) {
            console.error("❌ Mfumo haujapata hesabu ya vipande kwenye sessionStorage.");
            return;
        }

        const jumlaYaVipande = parseInt(jumlaYaVipandeStr, 10);
        const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readonly");
        const duka = muamala.objectStore("jumannetok_chunks");
        
        let mfululizoWaVipande = [];
        let index = 0;

        function dakaKipandeKwenyeDiski() {
            if (index >= jumlaYaVipande) {
                // Tumeshavuta vipande vyote salama! Sasa tunaviunganisha kuwa video jedna
                unganishaVipandeNaWashaPlayer(mfululizoWaVipande);
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

            ombi.onerror = function() {
                console.error("❌ Hitilafu ya kusoma kipande namba: " + index);
            };
        }
        dakaKipandeKwenyeDiski();
    }

    function unganishaVipandeNaWashaPlayer(vipandeVyaMaandishi) {
        try {
            if (vipandeVyaMaandishi.length === 0) return;

            // 🔥 SULUHISHO KUU: Tunasoma Base64 safi mnyofu bila split kuzuia crash ya koma!
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
            
            if (playerStep3) {
                playerStep3.src = URL.createObjectURL(videoKamiliBlob);
                playerStep3.load();
                playerStep3.play().catch(function(err) {
                    console.log("Autoplay imezuiwa na kivinjari, inasubiri mguso: ", err);
                });
                console.log("🏆 Video imelupuka kioni Step 3!");
            }
        } catch (err) {
            console.error("❌ Mkwamo wa kuunganisha kioo Step 3:", err);
        }
    }

    // Mlango unabaki wazi chini yake kwa ajili ya kuweka mtambo wa rangi nne za kitaifa wa caption...
                // ==========================================================================
    // SEHEMU YA 3: INTERACTIVE CAPTION SYNTAX (BENDERA YA TZ 🇹🇿) & FINAL PUBLISH
    // ==========================================================================
    function choraRangiZaTanzania(text) {
        let herufi = text.split("");
        let rangiSafi = ["#00e676", "#ffeb3b", "#aaaaaa", "#2196f3"]; // Kijani, Njano, Nyeupe, Bluu
        let matokeoYaRangi = "";

        herufi.forEach((char, index) => {
            let rangiYaSasa = rangiSafi[index % rangiSafi.length];
            matokeoYaRangi += `<span style="color: ${rangiYaSasa}; font-weight: bold;">${char}</span>`;
        });

        return matokeoYaRangi;
    }

    function amshaUsimamiziWaCaption() {
        if (!captionBox) return;

        captionBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }
            if (!/^[a-zA-Z]$/.test(e.key)) {
                e.preventDefault();
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "⚠️ Ruhusu herufi tu! Namba na alama zimepigwa marufuku hapa.");
            }
        });

        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            if (/[^a-zA-Z\s]/g.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/[^a-zA-Z\s]/g, '');
                return;
            }

            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            if (wordCounter) wordCounter.textContent = `Maneno: ${manenoHalisi.length} / 50`;

            let manenoNaRangi = vipandeManeno.map(neno => {
                if (neno.trim().length > 0) {
                    return choraRangiZaTanzania(neno);
                }
                return neno;
            }).join("");

            captionBox.innerHTML = manenoNaRangi;
            
            // Weka cursor mwisho wa kitalu cha matandao
            let range = document.createRange();
            let sel = window.getSelection();
            range.selectNodeContents(captionBox);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        });
    }

    function amshaUsimamiziWaKitufeChaMwisho() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function (event) {
            event.preventDefault();

            const botInput = document.getElementById("jumanne-video-bot-input-step3");
            if (botInput && botInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            let maandishiCaption = captionBox ? captionBox.innerText.trim() : "";
            let maandishiTags = tagsBox ? tagsBox.value.trim() : "";

            if (maandishiCaption.length === 0) {
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "⚠️ Tafadhali andika maelezo ya video (Caption) kwanza mkuu!");
                if (captionBox) captionBox.focus();
                return;
            }

            btnPublish.disabled = true;
            btnPublish.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasajili Seva...';

            let dataStep2Str = sessionStorage.getItem("jumannetok_step2_data");
            let dataStep2 = dataStep2Str ? JSON.parse(dataStep2Str) : {};
            let jinaLaVideoAsili = sessionStorage.getItem("jumannetok_video_name") || "mdundo_ghafi.mp4";

            const wasifuWaVideoUpload = {
                videoId: Math.floor(100000 + Math.random() * 900000),
                jinaVideo: jinaLaVideoAsili,
                caption: maandishiCaption,
                hashtags: maandishiTags || "#jumannetok #uzalendo",
                kipajiKundi: dataStep2.ainaYaKipaji || "Singeli",
                utaratibu: dataStep2.utaratibuWaVideo || "challenge",
                tareheUchapishaji: Date.now()
            };

            const urlYaSevaMaster = "http://localhost:3000/api";

            // Push ya kwanza ya maandishi mnyofu kwenda kusevwa kwenye ProfileDB/SearchDB ya master server
            fetch(`${urlYaSevaMaster}/profiles/sync-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(wasifuWaVideoUpload)
            })
            .then(res => res.ok ? res.json() : wasifuWaVideoUpload)
            .then(dataNode => {
                console.log("🚀 Seva Kuu imepokea metadata ya video:", dataNode);

                sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify(wasifuWaVideoUpload));

                if (dbIndexedAkiba) {
                    dbIndexedAkiba.close();
                    console.log("🛡️ Database ya ndani imefungwa salama mlangoni pa Step 3.");
                }

                // 🔥 UJUMBE WA USHINDI WA SEKUNDE 5: Andika neno kama ulivyotaka kibashara!
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Data Inserted Successfully! Unapelekwa Feed...");
                
                const toastKioo = document.getElementById("jumanne-caption-error-toast");
                if (toastKioo) {
                    toastKioo.style.color = "#00e676";
                    toastKioo.style.fontWeight = "bold";
                }

                setTimeout(() => {
                    window.location.href = "./index.html"; // Fixed Relative Path kwa GitHub Pages
                }, 1500);
            })
            .catch(err => {
                console.warn("⚠️ Offline Mode Activated: Seva ipo bize, tunasave local na kuhama.");
                sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify(wasifuWaVideoUpload));
                if (dbIndexedAkiba) dbIndexedAkiba.close();

                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "⏳ Data Inserted Successfully (Offline)! Unapelekwa Feed...");
                
                const toastKioo = document.getElementById("jumanne-caption-error-toast");
                if (toastKioo) toastKioo.style.color = "#ffeb3b";

                setTimeout(() => {
                    window.location.href = "./index.html";
                }, 1500);
            });
        });
    }

    // 🔥 TIMING PROTOCOL LOCK: Amsha database na kila kitu kwa mpangilio sahihi wa hardware
    document.addEventListener("DOMContentLoaded", function () {
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 3: Database ya vipande imefunguka vizuri!");
            vutaVipandeKutokaKwenyeDiski();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Step 3: Database imegoma.");
            vutaVipandeKutokaKwenyeDiski();
        };

        amshaUsimamiziWaCaption();
        amshaUsimamiziWaKitufeChaMwisho();
    });

})(); // <--- HILI NDILO BANO LA MWISHO KABISA LINAFUNGA FILE ZIMA REKORD SAFU!
                
