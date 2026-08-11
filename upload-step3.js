// upload-step3.js - Hatua ya 1: Mtambo wa Kuvuta Video (Fixed)

(function () {
    "use strict";

    let dbIndexedAkiba = null;

    // Daka ma-element yote ya HTML kwa usahihi
    const playerStep3 = document.getElementById("jumanne-step3-preview-player");
    const captionBox = document.getElementById("jumanne-video-caption");
    const tagsBox = document.getElementById("jumanne-video-tags");
    const wordCounter = document.getElementById("jumanne-word-counter");
    const tagsCounter = document.getElementById("jumanne-tags-counter");
    const btnPublish = document.getElementById("jumanne-final-publish-btn");

    // 1. FUNGUA DATABASE YA CHUNKS KIVINJARI KIKIMALIZA KUSOMA UKURASA
    document.addEventListener("DOMContentLoaded", function () {
        // Tunafungua database ile ile ya mchwa kutoka Step 1
        const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 3: Database imewaka salama!");
            
            // Vuta vipande upesi kutoka kwenye diski ili video icheze
            vutaVipandeKutokaKwenyeDiski();
            amshaUsimamiziWaCaption();
            amshaUsimamiziWaHashtags();
            kaguaMaboksiNaUwasheKitufeChaTZ();
            amshaMchakatoWaKurushaMdundoMnyofu();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Step 3: Database imegoma kufunguka.");
        };
    });

    // 2. INJINI YA KUVUTA VIPANDE KWA MIFULULIZO YA NAMBA ZAO
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
                if (e.target.result) {
                    mfululizoWaVipande.push(e.target.result.maandishi_base64);
                }
                index++;
                dakaKipandeKwenyeDiski(); // Nenda kipande kinachofuata bila lag
            };
        }
        dakaKipandeKwenyeDiski();
    }

    // 3. INJINI YA KUGEUZA MAANDISHI KUWA VIDEO GHAFI KIONI
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
                playerStep3.play().catch(function() {
                    console.log("Autoplay imezuiwa, inasubiri mguso.");
                });
            }
        } catch (err) {
            console.error("❌ Hitilafu ya kuunganisha video Step 3:", err);
        }
    }    // ==========================================================================
    // HATUA YA 2: MTAMBO WA UNIVERSAL COLOR SYNTAX (BENDERA YA TANZANIA 🇹🇿)
    // ==========================================================================
    
    // Injini ya kiufundi inayovunja maneno herufi kwa herufi na kuyavika rangi za Taifa
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

    // USIMAMIZI WA BOKSI LA KWANZA: CAPTION (Herufi tu + Rangi za Taifa)
    function amshaUsimamiziWaCaption() {
        if (!captionBox) return;

        // Zuia namba na alama kabla hazijatokea kioni
        captionBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }
            if (!/^[a-zA-Z]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Paka rangi za kitaifa wakati anatype
        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            // Safisha kama kuna herufi zisizotakiwa zimepenya
            if (/[^a-zA-Z\s]/g.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/[^a-zA-Z\s]/g, '');
                wekaCursorMwishoni(captionBox);
                return;
            }

            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            if (wordCounter) wordCounter.textContent = `Maneno: ${manenoHalisi.length} / 50`;

            // Daka nafasi ya sasa ya cursor ili isiruke rudi nyuma
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

    // Vyombo vya dharura vya kusimamia cursor (Caret Control) kwenye ContentEditable
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
    // HATUA YA 3: USIMAMIZI WA BOKSI LA PILI: HASHTAGS PEKEE (LAZIMA # + RANGI 🇹🇿)
    // ==========================================================================
    function amshaUsimamiziWaHashtags() {
        if (!tagsBox) return;

        // Zuia namba na ulazimishe alama ya reli (#) mwanzoni
        tagsBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                return;
            }

            let maandishiSasa = tagsBox.innerText;
            if (maandishiSasa.length === 0 || maandishiSasa.endsWith(" ")) {
                if (e.key !== "#") {
                    e.preventDefault();
                    alert("⚠️ Sheria ya JumanneTok: Sanduku hili ni la Hashtags tu! Lazima uanze na alama ya reli (#) kwanza!");
                    return;
                }
            }

            if (!/^[a-zA-Z#]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Paka rangi za kitaifa kwenye ma-hashtag wakati anatype
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
                                 
            // ==========================================================================
    // HATUA YA 4: VALIDATION, KITUFE CHA TZ 🇹🇿, CLEANUP NA KUENDA INDEX.HTML
    // ==========================================================================
    
    // Mtambo unaokagua kama maboksi yote yamejazwa ili kubadili rangi ya kitufe kuwa ya TZ
    function kaguaMaboksiNaUwasheKitufeChaTZ() {
        if (!captionBox || !tagsBox || !btnPublish) return;

        function kaguaHali() {
            let captionText = captionBox.innerText.trim();
            let tagsText = tagsBox.innerText.trim();

            // Kama mtumiaji amejaza maboksi yote mawili vizuri
            if (captionText.length > 0 && tagsText.length > 0) {
                // Badilisha muonekano kuwa rangi thabiti za Bendera ya Tanzania 🇹🇿
                btnPublish.style.background = "linear-gradient(45deg, #00e676 33%, #ffeb3b 33%, #ffeb3b 66%, #2196f3 66%)";
                btnPublish.style.color = "#000000";
                btnPublish.style.fontWeight = "900";
                btnPublish.style.textShadow = "1px 1px 2px rgba(255,255,255,0.6)";
                console.log("🇹🇿 Kitufe kimeshavikwa sare za Taifa!");
            } else {
                // Ukurasa ukiwa bado haujajazwa urudishe kwenye rangi ya kijani ya kawaida
                btnPublish.style.background = "#00e676";
                btnPublish.style.color = "#000000";
                btnPublish.style.textShadow = "none";
            }
        }

        // Tega mtambo kusikiliza uandishi wa maboksi yote mawili papo hapo
        captionBox.addEventListener("input", kaguaHali);
        tagsBox.addEventListener("input", kaguaHali);
    }

    // Injini ya kubonyeza kitufe, kufuta kila kitu na kusepa index.html
    function amshaMchakatoWaKurushaMdundoMnyofu() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function (event) {
            event.preventDefault();

            let captionText = captionBox ? captionBox.innerText.trim() : "";
            let tagsText = tagsBox ? tagsBox.innerText.trim() : "";

            // A: Shurutisha mtumiaji kujaza sehemu zote mbili kabla ya kupita
            if (captionText === "" || tagsText === "") {
                alert("⚠️ Hitilafu: Tafadhali jaza sehemu zote mbili (Maelezo na Alama za Reli) kabla ya kuchapisha kipaji chako mkuu!");
                return;
            }

            btnPublish.disabled = true;
            btnPublish.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasafisha kumbukumbu...';

            alert("Hongera sana! Kipaji chako kimechapishwa rasmi JumanneTok TZ! 🏆");

            // 1. Futa na kusafisha kabisa kumbukumbu zote za SessionStorage
            sessionStorage.clear();

            // 2. Futa kabisa duka la IndexedDB ili simu ya mteja isibaki na takataka za video
            if (dbIndexedAkiba) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
                const duka = muamala.objectStore("jumannetok_chunks");
                const ombiFuta = duka.clear();
                
                // Mchakato wa kufuta ukikamilika salama kwenye diski ya simu...
                ombiFuta.onsuccess = function() {
                    console.log("🛡️ Kumbukumbu ya diski imesafishwa kikamilifu.");
                    // 3. Mtupe mtumiaji kwenye ukurasa wa nyumbani kibashara!
                    window.location.href = "index.html";
                };

                ombiFuta.onerror = function() {
                    window.location.href = "index.html";
                };
            } else {
                window.location.href = "index.html";
            }
        });
                      }
    

    // Tunaacha mlango wazi hapa chini ili kuingiza hatua zinazofuata kidogo kidogo
})();
                        
