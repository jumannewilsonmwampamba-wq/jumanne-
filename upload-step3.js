// upload-step3.js - Hatua ya 1: Mtambo wa Kuvuta Video kutoka Chunks & Toast Engine

(function () {
    "use strict";

    let dbIndexedAkiba = null;

    // Daka ma-element ya HTML ya Step 3 verbatim
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
    // 1. INJINI YA DATABASE: FUNGUA NA UREJESHE VIDEO YA VIPANDE KUTOKA STEP 1
    // ==========================================================================
        // ==========================================================================
    // HATUA YA 1: INJINI YA KUVUTA VIPANDE VYOTE KWA MPANGILIO KUTOKA DISK (FIXED)
    // ==========================================================================
    function vutaVipandeKutokaKwenyeDiski() {
        const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
        if (!jumlaYaVipandeStr || !dbIndexedAkiba) {
            console.error("❌ Mfumo haujapata hesabu ya vipande kwenye sessionStorage.");
            return;
        }

        const jumlaYaVipande = parseInt(jumlaYaVipandeStr, 10);
        
        // 🔥 SULUHISHO: Fungua duka halisi la jumannetok_feed_cache lililoandikwa Step 1 kabla ya kuhamia hapa
        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        
        let mfululizoWaVipande = [];
        let index = 0;

        function dakaKipandeKwenyeDiski() {
            if (index >= jumlaYaVipande) {
                unganishaVipandeNaWashaPlayer(mfululizoWaVipande);
                return;
            }
            // Mchwa anavuta funguo sahihi ya jumanne_current_upload_draft uliyoiandika Step 1
            const ombi = duka.get("jumanne_current_upload_draft"); 
            
            ombi.onsuccess = function (e) {
                const data = e.target.result;
                if (data && data.videoBlobData) {
                    // Kwa kuwa msimbo wako wa Step 1 ulihifadhi faili zima au vipande, hapa tunadaka BlobData halisi
                    // Kama ulihifadhi kama vipande, tunalisha index, kama uliweka file zima tunalivuta mara moja
                    if(Array.isArray(data.videoBlobData)) {
                        mfululizoWaVipande = data.videoBlobData;
                    } else {
                        mfululizoWaVipande.push(data.videoBlobData);
                    }
                }
                // Hapa tunasonga mbele kibashara kulupusha player
                unganishaVipandeNaWashaPlayer(mfululizoWaVipande);
            };
            
            ombi.onerror = function() {
                console.error("❌ Hitilafu ya kusoma diski upande wa GitHub Pages.");
            };
        }
        dakaKipandeKwenyeDiski();
    }
    
        // ==========================================================================
    // HATUA YA 2: INJINI YA CAPTION - RUHUSU HERUFI TU + RANGI ZA BENDERA 🇹🇿
    // ==========================================================================
    
    // Mtambo unaovunja maneno herufi kwa herufi na kuyavika rangi za kitaifa
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

        // A: Ulinzi wa keyboard - Gomea namba na alama kabla hazijatokea kioni
        captionBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }
            // Kama sio herufi (A-Z, a-z), piga kufuli na utoe toast notification ya sekunde 5
            if (!/^[a-zA-Z]$/.test(e.key)) {
                e.preventDefault();
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "⚠️ Ruhusu herufi tu! Namba na alama zimepigwa marufuku hapa.");
            }
        });

        // B: Kupaka rangi za kitaifa wakati anatype herufi
        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            // Safisha kama kuna herufi haramu zimepenya kwa njia ya Paste
            if (/[^a-zA-Z\s]/g.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/[^a-zA-Z\s]/g, '');
                wekaCursorMwishoni(captionBox);
                return;
            }

            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            if (wordCounter) wordCounter.textContent = `Maneno: ${manenoHalisi.length} / 50`;

            // Daka nafasi ya sasa ya cursor ili kuondoa kigugumizi cha kurudi nyuma
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

    // Vyombo vya usimamizi wa cursor (Caret Stabilizers) ndani ya ContentEditable
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

        // Zuia namba na ulazimishe alama ya reli (#) mwanzoni kabla herufi haijazaliwa
        tagsBox.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" || e.key === " " || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }
            // Kataa namba zote papo hapo
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                onyeshaUjumbeWaMuda("jumanne-tags-error-toast", "⚠️ Namba haziruhusiwi kwenye hashtags!");
                return;
            }

            let maandishiSasa = tagsBox.innerText;
            // WAZO LAKO LA KIJASUSI: Kama anaanza neno jipya, mzuie kuandika herufi mpaka aweke #
            if (maandishiSasa.length === 0 || maandishiSasa.endsWith(" ")) {
                if (e.key !== "#") {
                    e.preventDefault();
                    onyeshaUjumbeWaMuda("jumanne-tags-error-toast", "⚠️ Sheria ya JumanneTok: Lazima uanze na alama ya reli (#) kwanza!");
                    return;
                }
            }

            // Ruhusu herufi na alama ya reli pekee, piga marufuku alama nyingine za simu (? ! ( ))
            if (!/^[a-zA-Z#]$/.test(e.key)) {
                e.preventDefault();
                onyeshaUjumbeWaMuda("jumanne-tags-error-toast", "⚠️ Alama za simu haziruhusiwi hapa!");
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
    // HATUA YA 4: VALIDATION, KITUFE CHA TZ 🇹🇿, KUKUSANYA DATA NA KUENDA INDEX.HTML
    // ==========================================================================
    
    // Mtambo unaokagua kama maboksi yote mawili yamejazwa ili kuvika kitufe sare za Taifa 🇹🇿
    function kaguaMaboksiNaUwasheKitufeChaTZ() {
        if (!captionBox || !tagsBox || !btnPublish) return;

        function kaguaHali() {
            let captionText = captionBox.innerText.trim();
            let tagsText = tagsBox.innerText.trim();

            // Kama mtumiaji amejaza maeneo yote mawili vizuri
            if (captionText.length > 0 && tagsText.length > 0) {
                btnPublish.style.background = "linear-gradient(45deg, #00e676 33%, #ffeb3b 33%, #ffeb3b 66%, #2196f3 66%)";
                btnPublish.style.color = "#000000";
                btnPublish.style.fontWeight = "900";
                btnPublish.style.textShadow = "1px 1px 2px rgba(255,255,255,0.6)";
                console.log("🇹🇿 Kitufe kimeshavikwa sare za Taifa!");
            } else {
                // Kama bado hajamaliza kujaza, kirudishe kwenye kijani ya kawaida
                btnPublish.style.background = "#00e676";
                btnPublish.style.color = "#000000";
                btnPublish.style.textShadow = "none";
            }
        }

        // Tega mitambo kusikiliza uandishi wa maboksi yote mawili papo hapo
        captionBox.addEventListener("input", kaguaHali);
        tagsBox.addEventListener("input", kaguaHali);
    }

    // Injini kuu ya kubonyeza Post, kukusanya data, na kusafisha diski
    function amshaMchakatoWaKurushaMdundoMnyofu() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function (event) {
            event.preventDefault();

            let captionText = captionBox ? captionBox.innerText.trim() : "";
            let tagsText = tagsBox ? tagsBox.innerText.trim() : "";

            // A: Shurutisha mtumiaji kujaza sehemu zote mbili kabla ya kupita
            if (captionText === "" || tagsText === "") {
                onyeshaUjumbeWaMuda("jumanne-final-error-toast", "⚠️ Hitilafu: Tafadhali jaza sehemu zote mbili kabla ya kuchapisha!");
                return;
            }

            btnPublish.disabled = true;
            btnPublish.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inakusanya data...';

            // B: DAKA DATA ZOTE KUTOKA KURASA YA KWANZA NA YA PILI ZILIZOPO KWENYE MEMORI
            const metaHatuaYaKwanza = sessionStorage.getItem("jumannetok_upload_meta");
            const dataHatuaYaPili = sessionStorage.getItem("jumannetok_step2_data");

            let dataKurasaYa1 = metaHatuaYaKwanza ? JSON.parse(metaHatuaYaKwanza) : {};
            let dataKurasaYa2 = dataHatuaYaPili ? JSON.parse(dataHatuaYaPili) : {};

            // C: Suka kifurushi kikuu kimoja chenye data zote za fomu zote tatu
            const kifurushiKikuuChaUpload = {
                jinaLaVideo: dataKurasaYa1.jina || "video_kipaji.mp4",
                ainaYaKipaji: dataKurasaYa2.ainaYaKipaji || "singeli",
                utaratibuWaVideo: dataKurasaYa2.utaratibuWaVideo || "challenge",
                maelezoYaCaption: captionText,
                alamaZaHashtags: tagsText,
                tareheYaMwisho: Date.now()
            };

            console.log("📦 Kifurushi Kamili cha JumanneTok TZ Kiko Tayari:", kifurushiKikuuChaUpload);
            
            // Hapa data zako zipo tayari! Unaweza kuzituma kwenye seva (backend) hapa mbeleni ukitaka.
            onyeshaUjumbeWaMuda("jumanne-final-error-toast", "🎉 Ushindi! Kazi imechapishwa. Tunasafisha simu...");

            // D: SAFISHA DATA ZOTE ZA NYUMA (SESSIONSTORAGE & INDEXEDDB)
            sessionStorage.clear();

            if (dbIndexedAkiba) {
                const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
                const duka = muamala.objectStore("jumannetok_chunks");
                const ombiFuta = duka.clear();
                
                // Mchakato wa kufuta ukikamilika salama kwenye diski ya simu...
                ombiFuta.onsuccess = function() {
                    console.log("🛡️ Kumbukumbu ya diski imesafishwa kikamilifu.");
                    // E: Mtupe mtumiaji kwenye ukurasa wa nyumbani (Home Feed) mnyofu!
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
                
                                        

    // Tunaacha mlango wazi wa function kuu chini yake ili kuongeza hatua zinazofuata
})();
        
