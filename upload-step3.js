// upload-step3.js - Core Publishing Engine with Universal National Color Syntax & GitHub Pages Video Fix

(function () {
    "use strict";

    let dbIndexedAkiba = null;

    // Daka ma-element yote ya HTML kutoka kwenye fomu yako ya Step 3
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

    // ==========================================================================
    // HATUA YA 1: INJINI YA KUVUTA VIPANDE VYOTE NA KUWASHA PLAYER (VIDEO FIX)
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

            const maBlobYote = vipandeVyaMaandishi.map(base64Str => {
                // 🔥 SULUHISHO KUU LA GITHUB PAGES: Safisha maandishi ili kuondoa neno la utangulizi data:video...
                const sehemu = base64Str.indexOf(',') !== -1 ? base64Str.split(',')[1] : base64Str;
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
                playerStep3.play().catch(function(err) {
                    console.log("Autoplay imezuiwa na kivinjari, inasubiri mguso: ", err);
                });
                console.log("🏆 Video imelupuka kioni Step 3!");
            }
        } catch (err) {
            console.error("❌ Mkwamo wa kuunganisha kioo Step 3:", err);
        }
    }

    // ==========================================================================
    // HATUA YA 2: INJINI YA UNIVERSAL COLOR SYNTAX (BENDERA YA TANZANIA 🇹🇿)
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
                wekaCursorMwishoni(captionBox);
                return;
            }

            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            if (wordCounter) wordCounter.textContent = `Maneno: ${manenoHalisi.length} / 50`;

            let nafasiYaCursor = dakaNafasiYaCursor(captionBox);

            let manenoNaRangi = vipandeManeno.map(neno => {
                if (neno.trim().length > 0) {
                    return choraRangiZaTanzania(neno);
                }
                return neno;
            }).join("");

            captionBox.innerHTML = manenoNaRangi;
            rejeshaCursorSehemuSahihi(captionBox, nafasiYaCursor);
        });
    }

    // ==========================================================================
    // HATUA YA 3: INJINI YA BOKSI LA HASHTAGS PEKEE (LAZIMA # + RANGI 🇹🇿)
    // ==========================================================================
    function amshaUsimamiziWaHashtags() {
        if (!tagsBox) return;

        tagsBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                onyeshaUjumbeWaMuda("jumanne-tags-error-toast", "⚠️ Namba haziruhusiwi kwenye hashtags!");
                return;
            }

            let maandishiSasa = tagsBox.innerText;
            if (maandishiSasa.length === 0 || maandishiSasa.endsWith(" ")) {
                if (e.key !== "#") {
                    e.preventDefault();
                    onyeshaUjumbeWaMuda("jumanne-tags-error-toast", "⚠️ Sheria ya JumanneTok: Sanduku hili ni la Hashtags tu! Lazima uanze na alama ya reli (#) kwanza!");
                    return;
                }
            }

            if (!/^[a-zA-Z#]$/.test(e.key)) {
                e.preventDefault();
                onyeshaUjumbeWaMuda("jumanne-tags-error-toast", "⚠️ Alama za simu haziruhusiwi hapa!");
            }
        });

        tagsBox.addEventListener("input", function () {
            let maandishi = tagsBox.innerText;

            if (/[^a-zA-Z#\s]/g.test(maandishi)) {
                tagsBox.innerText = maandishi.replace(/[^a-zA-Z#\s]/g, '');
                wekaCursorMwishoni(tagsBox);
                return;
            }

            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            let tags = manenoHalisi.filter(w => w.startsWith("#"));

            if (tagsCounter) tagsCounter.textContent = `Tags: ${tags.length} / 8`;

            let nafasiYaCursor = dakaNafasiYaCursor(tagsBox);

            let manenoNaRangi = vipandeManeno.map(neno => {
                if (neno.trim().startsWith("#")) {
                    return choraRangiZaTanzania(neno);
                }
                return neno;
            }).join("");

            tagsBox.innerHTML = manenoNaRangi;
            rejeshaCursorSehemuSahihi(tagsBox, nafasiYaCursor);
        });
    }

    // Vyombo vya kusimamia cursor kwenye ContentEditable
    function dakaNafasiYaCursor(element) {
        let mteuzi = window.getSelection();
        if (mteuzi.rangeCount > 0) {
            let range = mteuzi.getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return preCaretRange.toString().length;
        }
        return 0;
    }

    function rejeshaCursorSehemuSahihi(element, nafasi) {
        let kiongozi = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, null, false);
        let node, jumlaNafasi = 0;
        let mteuzi = window.getSelection();
                 let range = document.createRange();

        while ((node = kiongozi.nextNode())) {
            if (jumlaNafasi + node.length >= nafasi) {
                range.setStart(node, nafasi - jumlaNafasi);
                range.collapse(true);
                mteuzi.removeAllRanges();
                mteuzi.addRange(range);
                return;
            }
            jumlaNafasi += node.length;
        }
        wekaCursorMwishoni(element);
    }

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

    // ==========================================================================
    // HATUA YA 4: VALIDATION, KITUFE CHA TZ 🇹🇿, CLEANUP NA KUENDA INDEX.HTML
    // ==========================================================================
    function kaguaMaboksiNaUwasheKitufeChaTZ() {
        if (!captionBox || !tagsBox || !btnPublish) return;

        function kaguaHali() {
            let captionText = captionBox.innerText.trim();
            let tagsText = tagsBox.innerText.trim();

            if (captionText.length > 0 && tagsText.length > 0) {
                // Suka muonekano wa sare za Taifa kwenye kitufe
                btnPublish.style.background = "linear-gradient(45deg, #00e676 33%, #ffeb3b 33%, #ffeb3b 66%, #2196f3 66%)";
                btnPublish.style.color = "#000000";
                btnPublish.style.fontWeight = "900";
                btnPublish.style.textShadow = "1px 1px 2px rgba(255,255,255,0.6)";
            } else {
                btnPublish.style.background = "#00e676";
                btnPublish.style.color = "#000000";
                btnPublish.style.textShadow = "none";
            }
        }

        captionBox.addEventListener("input", kaguaHali);
        tagsBox.addEventListener("input", kaguaHali);
    }

    function amshaMchakatoWaKurushaMdundoMnyofu() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function (event) {
            event.preventDefault();

            let captionText = captionBox ? captionBox.innerText.trim() : "";
            let tagsText = tagsBox ? tagsBox.innerText.trim() : "";

            if (captionText === "" || tagsText === "") {
                onyeshaUjumbeWaMuda("jumanne-final-error-toast", "⚠️ Hitilafu: Tafadhali jaza sehemu zote mbili mkuu!");
                return;
            }

            btnPublish.disabled = true;
            btnPublish.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inachapisha...';

            onyeshaUjumbeWaMuda("jumanne-final-error-toast", "🎉 Ushindi! Kazi imechapishwa. Tunasafisha simu...");

            // Daka data zote za kurasa zilizopita kutoka kwenye Session
            const metaHatuaYaKwanza = sessionStorage.getItem("jumannetok_upload_meta");
            const dataHatuaYaPili = sessionStorage.getItem("jumannetok_step2_data");
            let dataKurasaYa1 = metaHatuaYaKwanza ? JSON.parse(metaHatuaYaKwanza) : {};
            let dataKurasaYa2 = dataHatuaYaPili ? JSON.parse(dataHatuaYaPili) : {};

            const kifurushiKikuuChaUpload = {
                jinaLaVideo: dataKurasaYa1.jina || "video_kipaji.mp4",
                ainaYaKipaji: dataKurasaYa2.ainaYaKipaji || "singeli",
                utaratibuWaVideo: dataKurasaYa2.utaratibuWaVideo || "challenge",
                maelezoYaCaption: captionText,
                alamaZaHashtags: tagsText,
                tareheYaMwisho: Date.now()
            };

            console.log("📦 Data zote tatu zilizokusanywa mnyofu:", kifurushiKikuuChaUpload);

            // Safisha kumbukumbu zote za muda
            sessionStorage.clear();

            if (dbIndexedAkiba) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
                const duka = muamala.objectStore("jumannetok_chunks");
                const ombiFuta = duka.clear();
                
                // Mchakato wa kusafisha diski ukikamilika mnyofu...
                ombiFuta.onsuccess = function() {
                    console.log("🛡️ Kumbukumbu ya diski imesafishwa kikamilifu.");
                    window.location.href = "index.html"; // Mtupe mtumiaji index.html kibashara!
                };

                ombiFuta.onerror = function() {
                    window.location.href = "index.html";
                };
            } else {
                window.location.href = "index.html";
            }
        });
    }

    // ==========================================================================
    // 5. MASTER DOMCONTENTLOADED LISTENER
    // ==========================================================================
    document.addEventListener("DOMContentLoaded", function () {
        console.log("🚀 Mtambo Mkuu wa JumanneTok Step 3 Unawaka...");

        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Database imefunguka vizuri ndani ya Listener!");
            vutaVipandeKutokaKwenyeDiski();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Imeshindikana kufungua database.");
        };

        amshaUsimamiziWaCaption();
        amshaUsimamiziWaHashtags();
        kaguaMaboksiNaUwasheKitufeChaTZ();
        amshaMchakatoWaKurushaMdundoMnyofu();
    });

})();
                     
