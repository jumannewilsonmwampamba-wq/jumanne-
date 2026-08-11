// upload-step3.js - Hatua ya 1: Kuvuta Video kutoka Kwenye Database

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    const playerStep3 = document.getElementById("jumanne-step3-preview-player");

    // 1. FUNGUA DATABASE YA VIPANDE ILE ILE YA NYUMA
    document.addEventListener("DOMContentLoaded", function () {
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 3: Database imefunguka! Inaanza kuvuta video...");
            vutaVipandeKutokaKwenyeDiski();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Step 3: Database imegoma kufunguka.");
        };
    });

    // 2. INJINI YA KUVUTA VIPANDE VYOTE KWA MPANGILIO
    function vutaVipandeKutokaKwenyeDiski() {
        const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
        if (!jumlaYaVipandeStr || !dbIndexedAkiba) return;

        const jumlaYaVipande = parseInt(jumlaYaVipandeStr, 10);
        const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readonly");
        const duka = muamala.objectStore("jumannetok_chunks");
        
        let mfululizoWaVipande = [];
        let index = 0;

        function dakaKipandeKwenyeDiski() {
            if (index >= jumlaYaVipande) {
                unganishaVipandeNaWashaPlayer(mfululizoWaVipande);
                return;
            }
            const ombi = duka.get(index);
            ombi.onsuccess = function (e) {
                if (e.target.result) mfululizoWaVipande.push(e.target.result.maandishi_base64);
                index++;
                dakaKipandeKwenyeDiski(); // Nenda kipande kinachofuata
            };
        }
        dakaKipandeKwenyeDiski();
    }

    // 3. INJINI YA KUUNGANISHA VIPANDE ILI VIDEO ICHEZE
    function unganishaVipandeNaWashaPlayer(vipandeVyaMaandishi) {
        try {
            const maBlobYote = vipandeVyaMaandishi.map(base64Str => {
                const sehemu = base64Str.split(',');
                const byteCharacters = atob(sehemu);
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
                playerStep3.play().catch(() => {});
                console.log("🏆 Video imelupuka vizuri Step 3!");
            }
        } catch (err) {
            console.error("❌ Hitilafu ya kuunganisha kioo Step 3:", err);
        }
    }
    // ==========================================================================
    // HATUA YA 2: INJINI YA AKILI - MARUFUKU YA NAMBA NA HESABU YA MANENO
    // ==========================================================================
    function amshaUsimamiziWaCaptionNaHesabu() {
        if (!captionBox) return;

        // Mtego wa kuzuia namba zote kabisa zisikanyagwe kwenye keyboard
        captionBox.addEventListener("keydown", function (e) {
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault(); // Gomea namba papo hapo isionekane!
            }
        });

        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            // Ulinzi wa ziada: Kama mteja amepaste maandishi yenye namba, zifute zote
            if (/\d/.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/\d/g, '');
                wekaCursorMwishoni(captionBox);
                return;
            }

            // Kata maneno kwa kutumia nafasi ili kupata hesabu sahihi
            let vipandeManeno = maandishi.trim().split(/\s+/).filter(w => w.length > 0);
            let tags = vipandeManeno.filter(w => w.startsWith("#"));

            // Sogeza namba za mahesabu kioni upande wa chini wa sanduku
            if (wordCounter) wordCounter.textContent = `Maneno: ${vipandeManeno.length} / 50`;
            if (tagsCounter) tagsCounter.textContent = `Tags: ${tags.length} / 8`;
        });
    }

    // Chombo kidogo cha kurudisha cursor mwishoni mwa maandishi dharura ikitokea
    function wekaCursorMwishoni(element) {
        element.focus();
        if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
            let range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false);
            let mteuzi = window.getSelection();
            mteuzi.removeAllRanges();
            mteuzi.addRange(range);
        }
    }
        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            if (/\d/.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/\d/g, '');
                wekaCursorMwishoni(captionBox);
                return;
            }

            // Tenga maneno pamoja na nafasi zake ili muundo usivunjike
            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            let tags = manenoHalisi.filter(w => w.startsWith("#"));

            if (wordCounter) wordCounter.textContent = `Maneno: ${manenoHalisi.length} / 50`;
            if (tagsCounter) tagsCounter.textContent = `Tags: ${tags.length} / 8`;

            // Daka nafasi ya sasa ya cursor kabla ya kuweka rangi
            let nafasiYaCursor = wekaSafiNaDakaCursor(captionBox);

            let manenoNaRangi = vipandeManeno.map(neno => {
                if (neno.trim().startsWith("#")) {
                    return choraRangiZaTanzania(neno);
                }
                return neno; // Maneno ya kawaida yanabaki meupe
            }).join("");

            captionBox.innerHTML = manenoNaRangi;
            
            // Rejesha cursor sehemu yake sahihi
            rejeshaCursor(captionBox, nafasiYaCursor);
        });
        // ==========================================================================
    // HATUA YA 4: INJINI YA UPLOAD, PROGRESS BAR, NA KUSAFISHA DATA ZOTE
    // ==========================================================================
    function amshaMchakatoWaKurushaMdundo() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function () {
            let maandishiText = captionBox ? captionBox.innerText.trim() : "";
            if (maandishiText === "") {
                alert("Mkuu, andika angalau neno moja au hashtag kuelezea kipaji chako!");
                return;
            }

            // Ficha vifungo vya kawaida chini, onyesha uwanja wa progress bar
            const actionButtons = document.getElementById("jumanne-action-buttons");
            if (actionButtons) actionButtons.style.display = "none";
            if (progressZone) progressZone.style.display = "block";

            let asilimiaYaSasa = 0;

            // Simulizi thabiti ya urushaji wa data kwa kasi ya 5G kwenda seva kuu
            uploadInterval = setInterval(function () {
                asilimiaYaSasa += Math.floor(Math.random() * 8) + 2; // Ongeza spidi kwa random pacing
                
                if (asilimiaYaSasa >= 100) {
                    asilimiaYaSasa = 100;
                    clearInterval(uploadInterval);
                    if (progressBar) progressBar.style.width = "100%";
                    if (statusText) statusText.textContent = "🚀 Mdundo Umefika Seva Kuu: 100%!";
                    
                    // Mpe sekunde 1 ya kuona ushindi kisha safisha kila kitu
                    setTimeout(kamilishaKaziNaSafishaDataZote, 1200); 
                } else {
                    if (progressBar) progressBar.style.width = `${asilimiaYaSasa}%`;
                    if (statusText) statusText.textContent = `⏳ Inarusha mdundo: ${asilimiaYaSasa}%`;
                }
            }, 200);
        });

        // Kitufe cha Ghairi (Okoa Bando) kikikanyagwa
        if (btnAbort) {
            btnAbort.addEventListener("click", function () {
                clearInterval(uploadInterval);
                if (progressZone) progressZone.style.display = "none";
                const actionButtons = document.getElementById("jumanne-action-buttons");
                if (actionButtons) actionButtons.style.display = "flex";
                if (progressBar) progressBar.style.width = "0%";
                alert("Upload imesitishwa! Bando lako lipo salama mkuu.");
            });
        }
    }

    // 🔥 KAZI YA JUU YA KIJASUSI: SAFISHA DISKI MZIMA YA KIVINJARI NA KUSEPA INDEX.HTML
    function kamilishaKaziNaSafishaDataZote() {
        alert("Hongera! Video yako ya Kipaji imechapishwa rasmi JumanneTok TZ! 🏆");

        // 1. Safisha SessionStorage yote iliyosave takataka za safari hii
        sessionStorage.clear();

        // 2. Futa kabisa duka la IndexedDB ili simu ya mteja ibaki safi haina takataka za video
        if (dbIndexedAkiba) {
            const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
            const duka = muamala.objectStore("jumannetok_chunks");
            
            const ombiFuta = duka.clear();
            
            ombiFuta.onsuccess = function() {
                console.log("🛡️ Diski imesafishwa kikamilifu.");
                // 3. Mtupe mtumiaji kwenye ukurasa wa nyumbani direct!
                window.location.href = "index.html";
            };

            ombiFuta.onerror = function() {
                window.location.href = "index.html";
            };
        } else {
            window.location.href = "index.html";
        }
                    }
            
        // ==========================================================================
    // INJINI YA KASHA: EVENT LISTENER WA KUWASHA INJINI ZOTE STEP 3
    // ==========================================================================
    document.addEventListener("DOMContentLoaded", function () {
        console.log("🚀 Mtambo Mkuu wa JumanneTok Step 3 Unawaka...");

        // 1. Fungua database ya vipande na uanze kuvuta video kioni
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Database imefunguka vizuri ndani ya Listener!");
            vutaVipandeKutokaKwenyeDiski();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Imeshindikana kufungua database ndani ya Listener.");
        };

        // 2. Washa injini ya akili ya caption (Rangi za Taifa 🇹🇿 na marufuku ya namba)
        if (captionBox) {
            amshaUsimamiziWaCaptionNaRangiZaTaifa();
            console.log("🇹🇿 Injini ya Rangi za Taifa imepandishwa kioni!");
        }

        // 3. Washa injini ya kurusha mdundo na progress bar ya asilimia
        if (btnPublish) {
            amshaMchakatoWaKurushaMdundo();
            console.log("🚀 Kitufe cha Chapisha kiko tayari kupokea mguso!");
        }
    })();
    
