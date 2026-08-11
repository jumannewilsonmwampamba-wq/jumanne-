// upload-step3.js - Hatua ya 1: Mtambo wa Kuvuta na Kuwasha Video

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    
    // Daka kicheza video halisi cha Step 3
    const playerStep3 = document.getElementById("jumanne-step3-preview-player");

    // 1. FUNGUA DATABASE YA CHUNKS KIVINJARI KIKIMALIZA KUSOMA UKURASA
    document.addEventListener("DOMContentLoaded", function () {
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 3: Database imewaka salama!");
            
            // Vuta vipande upesi kutoka kwenye diski ya simu
            vutaVipandeKutokaKwenyeDiski();
            amshaUsimamiziWaCaption();
            amshaUsimamiziWaHashtags();
            amshaMchakatoWaKurushaMdundoMnyofu();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Step 3: Database imegoma kufunguka.");
        };
    });

    // 2. INJINI YA KUVUTA VIPANDE KWA MIFULO YA NAMBA ZAO
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
                playerStep3.play().catch(() => {
                    console.log("Autoplay imezuiwa na kivinjari.");
                });
            }
        } catch (err) {
            console.error("❌ Hitilafu ya kuunganisha video Step 3:", err);
        }
    }
    // Daka ma-element ya Boksi la Kwanza la Caption
    const captionBox = document.getElementById("jumanne-video-caption");
    const wordCounter = document.getElementById("jumanne-word-counter");

    // ==========================================================================
    // HATUA YA 2: INJINI YA CAPTION - RUHUSU HERUFI NA SPACE TU (PIGA MARUFUKU ARAMA NA NAMBA)
    // ==========================================================================
    function amshaUsimamiziWaCaption() {
        if (!captionBox) return;

        // Ulinzi wa kibodi: Zuia kabisa herufi isiyotakiwa kabla haijazaliwa kioni
        captionBox.addEventListener("keydown", function (e) {
            // Ruhusu funguo maalum za mfumo kama Backspace, Space, Enter, na Mishale ya kutelezea
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }

            // Mtego wa Regex: Ruhusu herufi pekee (Herufi kubwa na ndogo za Lugha yoyote)
            // Kama sio herufi, piga kufuli ya e.preventDefault() papo hapo!
            if (!/^[a-zA-Z]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Ulinzi wa usalama iwapo mteja atakili na kubandika (Paste) maandishi kutoka WhatsApp
        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            // Futa kila kitu ambacho sio herufi wala nafasi (Ondoa namba na alama zote)
            if (/[^a-zA-Z\s]/g.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/[^a-zA-Z\s]/g, '');
                wekaCursorMwishoni(captionBox);
                return;
            }

            // Hesabu maneno yaliyopo sasa hivi na uyasogeze kioni chini ya boksi
            let vipandeManeno = captionBox.innerText.trim().split(/\s+/).filter(w => w.length > 0);
            if (wordCounter) wordCounter.textContent = `Maneno: ${vipandeManeno.length} / 50`;
        });
    }

    // Chombo kidogo cha kudhibiti cursor isirudi nyuma mtumiaji anapopaste maandishi
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
        // Daka ma-element ya Boksi la Pili la Hashtags
    const tagsBox = document.getElementById("jumanne-video-tags");
    const tagsCounter = document.getElementById("jumanne-tags-counter");

    // ==========================================================================
    // HATUA YA 3: INJINI YA HASHTAGS PEKEE - LAZIMA #, HERUFI TU & RANGI ZA TAIFA 🇹🇿
    // ==========================================================================
    function amshaUsimamiziWaHashtags() {
        if (!tagsBox) return;

        // A: Ulinzi wa kibodi - Lazimisha alama ya reli (#) mwanzoni mwa kila neno
        tagsBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }

            // Zuia namba zote kabisa
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                return;
            }

            let maandishiSasa = tagsBox.innerText;

            // WAZO LAKO LA KIJASUSI: Kama anaanza neno jipya, mzuie kuandika herufi mpaka aweke #
            if (maandishiSasa.length === 0 || maandishiSasa.endsWith(" ")) {
                if (e.key !== "#") {
                    e.preventDefault();
                    alert("⚠️ Sheria ya JumanneTok: Sanduku hili ni la Hashtags tu! Lazima uanze neno lako na alama ya reli (#) kwanza!");
                    return;
                }
            }

            // Mzuie asiandike alama zilizorundikana (mfano ##) au alama zisizo herufi
            if (!/^[a-zA-Z#]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // B: Injini ya Kuchora Rangi za Bendera ya Tanzania herufi kwa herufi
        tagsBox.addEventListener("input", function () {
            let maandishi = tagsBox.innerText;

            // Kusafisha data zilizopastiwa za hovyo (Bana herufi, nafasi na # pekee)
            if (/[^a-zA-Z#\s]/g.test(maandishi)) {
                tagsBox.innerText = maandishi.replace(/[^a-zA-Z#\s]/g, '');
                wekaCursorMwishoni(tagsBox);
                return;
            }

            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            let tags = manenoHalisi.filter(w => w.startsWith("#"));

            if (tagsCounter) tagsCounter.textContent = `Tags: ${tags.length} / 8`;

            // Daka nafasi ya sasa ya cursor ili kuondoa kigugumizi cha kuruka
            let mteuzi = window.getSelection();
            let nafasiYaCursor = 0;
            if (mteuzi.rangeCount > 0) {
                let range = mteuzi.getRangeAt(0);
                let preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(tagsBox);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                nafasiYaCursor = preCaretRange.toString().length;
            }

            // Paka rangi za bendera ya Taifa
            let manenoNaRangi = vipandeManeno.map(neno => {
                if (neno.trim().startsWith("#")) {
                    let herufi = neno.split("");
                    let rangiSafi = ["#00e676", "#ffeb3b", "#aaaaaa", "#2196f3"]; // Kijani, Njano, Nyeupe, Bluu
                    let matokeoYaRangi = "";
                    herufi.forEach((char, index) => {
                        let rangiYaSasa = rangiSafi[index % rangiSafi.length];
                        matokeoYaRangi += `<span style="color: ${rangiYaSasa}; font-weight: bold;">${char}</span>`;
                    });
                    return matokeoYaRangi;
                }
                return neno;
            }).join("");

            tagsBox.innerHTML = manenoNaRangi;

            // Rejesha cursor sehemu yake sahihi
            let kiongozi = document.createNodeIterator(tagsBox, NodeFilter.SHOW_TEXT, null, false);
            let node, jumlaNafasi = 0;
            let range = document.createRange();
            while ((node = kiongozi.nextNode())) {
                if (jumlaNafasi + node.length >= nafasiYaCursor) {
                    range.setStart(node, nafasiYaCursor - jumlaNafasi);
                    range.collapse(true);
                    mteuzi.removeAllRanges();
                    mteuzi.addRange(range);
                    return;
                }
                jumlaNafasi += node.length;
            }
            wekaCursorMwishoni(tagsBox);
        });
    }
        const btnPublish = document.getElementById("jumanne-final-publish-btn");

    // ==========================================================================
    // HATUA YA 4: INJINI YA POST - ISAFISHE DATA INSTANT NA KUENDA INDEX.HTML
    // ==========================================================================
    function amshaMchakatoWaKurushaMdundoMnyofu() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function () {
            let captionText = captionBox ? captionBox.innerText.trim() : "";
            let tagsText = tagsBox ? tagsBox.innerText.trim() : "";

            // Kagua kama amejaza walau hashtag moja kwenye boksi la pili
            if (tagsText === "") {
                alert("Mkuu, andika angalau hashtag moja kwenye sanduku la Alama za Reli!");
                if (tagsBox) tagsBox.focus();
                return;
            }

            // Badilisha muonekano wa kitufe kuzuia double click
            btnPublish.disabled = true;
            btnPublish.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inachapisha...';

            alert("Hongera! Kipaji chako kimechapishwa rasmi JumanneTok TZ! Tunasafisha kumbukumbu ya simu...");

            // 1. Futa na kusafisha kabisa kumbukumbu zote za SessionStorage
            sessionStorage.clear();

            // 2. Futa kabisa duka la IndexedDB ili simu ya mteja ibaki safi 100%
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

                ombiHifadhi.onerror = function() {
                    window.location.href = "index.html";
                };
            } else {
                window.location.href = "index.html";
            }
        });
    }
                  
})();
                


