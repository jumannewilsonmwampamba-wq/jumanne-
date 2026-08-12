// register-avatar.js - Sehemu ya 1: Saa ya Ulinzi na Ma-Variable ya Juu

(function () {
    "use strict";

    // 1. INJINI YA SAA YA ULINZI (THE 3-MINUTE SECURE COUNTDOWN TIMER)
    let mudaUliobaki = 3 * 60; // Dakika 3 kamili (Sekunde 180 za chuma)
    const kiooSaa = document.getElementById("jumanne-countdown-clock");

    const mtamboWaSaa = setInterval(() => {
        mudaUliobaki--;
        let dakika = String(Math.floor(mudaUliobaki / 60)).padStart(2, '0');
        let sekunde = String(mudaUliobaki % 60).padStart(2, '0');
        if (kiooSaa) kiooSaa.textContent = `${dakika}:${sekunde}`;

        if (mudaUliobaki <= 0) {
            clearInterval(mtamboWaSaa);
            sessionStorage.clear();
            alert("Muda wa usalama umeisha! Tafadhali anza upya usajili.");
            window.location.reload();
        }
    }, 1000);

    // 2. MIFUMO YA MATUNZO YA DATA NA RANGI ZA TAIFA
    const rangiTanzania = ["#1EB960", "#FCD116", "#FFFFFF", "#00A3DD"];
    let dbIndexedAkiba = null;
    let failiLaPichaAsili = null;

    // Swichi za kurekebisha picha kioone (Visual Pan and Zoom States)
    let transformState = {
        scale: 1,
        translateX: 0,
        translateY: 0,
        isDragging: false,
        startX: 0,
        startY: 0
    };

    // 3. VIOO VYA MALEFA: Kunyakua ma-element yote ya kioo hapa juu kabisa
    const avatarInput = document.getElementById("jumanne-avatar");
    const avatarPreviewBox = document.getElementById("jumanne-avatar-preview");
    const placeholderIcon = document.getElementById("jumanne-preview-placeholder");
    let zoomSlider = null;

        // ==========================================================================
    // SEHEMU YA 2: INJINI YA DATABASE (INDEXEDDB) NA KUCHORA JINA LA MSANII 🇹🇿
    // ==========================================================================

    // A: FUNGUA DATABASE YA REAL HARDWARE (INDEXEDDB CACHE LAYER)
    function amshaDukaLaAvatarLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
                db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
            }
        };

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Database ya IndexedDB imefunguka salama kwenye Step 6!");
            rejeshaAvatarKamaIpo();
        };

        ombiDuka.onerror = function () {
            console.error("❌ IndexedDB imegoma kufunguka kwenye hatua ya avatar.");
        };
    }

    // B: FUNCTION YA KUCHORA MAANDISHI KWA RANGI NNE ZA TAIFA
    function pigaChapaRangi(maandishiGhafi) {
        let herufiMchanganyiko = "";
        for (let i = 0; i < maandishiGhafi.length; i++) {
            if (maandishiGhafi[i] === " ") {
                herufiMchanganyiko += " &nbsp; ";
            } else {
                let rangiHusika = rangiTanzania[i % 4];
                herufiMchanganyiko += `<span style="color: ${rangiHusika}; font-weight: bold;">${maandishiGhafi[i]}</span>`;
            }
        }
        return herufiMchanganyiko;
    }

    // C: INJINI YA KUCHORA JINA LA MSANII DIRECT CHINI YA PICHA YA AVATAR (STRICT COLUMN WRAPPER)
    function wekaJinaLaMsaniiChini() {
        if (!avatarPreviewBox) return;

        // KAZA LUGA YA FLEXBOX: Lazimisha mzazi mkuu anyooshe vitu chini kwa chini (Column)
        const mzaziWaPreview = avatarPreviewBox.parentElement;
        mzaziWaPreview.style.display = "flex";
        mzaziWaPreview.style.flexDirection = "column";
        mzaziWaPreview.style.alignItems = "center";
        mzaziWaPreview.style.width = "100%";

        let jinaLaMsaniiKamilifu = "MSANII GHAFI";

        try {
            const dataStep1 = sessionStorage.getItem("jumannetok_reg_step1");
            if (dataStep1) {
                const keteIdentity = JSON.parse(dataStep1);
                if (keteIdentity.jinaKwanza && keteIdentity.jinaPili) {
                    jinaLaMsaniiKamilifu = `${keteIdentity.jinaKwanza} ${keteIdentity.jinaPili}`.toUpperCase();
                }
            }
        } catch (e) {
            console.error("Mkwamo wa kusoma jina kutoka memory:", e);
        }

        const nameContainer = document.createElement("div");
        nameContainer.id = "jumanne-artist-name-display";
        nameContainer.style.cssText = "margin-top: 15px; font-size: 16px; font-weight: bold; text-align: center; letter-spacing: 1px; text-shadow: 1px 1px 2px #000; text-transform: uppercase; width: 100%; display: block;";
        nameContainer.innerHTML = pigaChapaRangi(jinaLaMsaniiKamilifu);

        mzaziWaPreview.appendChild(nameContainer);
    }
    // ==========================================================================
    // SEHEMU YA 3: INTERACTIVE ZOOM SLIDER NA MOBILE DRAG/PAN SENSOR (TOUCH FIX)
    // ==========================================================================
    function injectZoomSlider() {
        if (zoomSlider || !avatarPreviewBox) return;
        const mzaziWaPreview = avatarPreviewBox.parentElement;

        const sliderWrapper = document.createElement("div");
        sliderWrapper.id = "jumanne-avatar-zoom-wrapper";
        sliderWrapper.style.cssText = "width: 100%; max-width: 220px; margin: 20px auto 0 auto; display: flex; align-items: center; gap: 12px; color: #fff; font-size: 12px; font-weight: bold; justify-content: center; box-sizing: border-box;";
        
        const labelMinus = document.createElement("span");
        labelMinus.textContent = "➖";
        
        zoomSlider = document.createElement("input");
        zoomSlider.type = "range";
        zoomSlider.min = "1";
        zoomSlider.max = "3";
        zoomSlider.step = "0.01";
        zoomSlider.value = "1";
        zoomSlider.style.cssText = "flex: 1; accent-color: #00f2fe; cursor: pointer; background: #222; height: 6px; border-radius: 3px; outline: none; margin: 0;";

        const labelPlus = document.createElement("span");
        labelPlus.textContent = "➕";

        sliderWrapper.appendChild(labelMinus);
        sliderWrapper.appendChild(zoomSlider);
        sliderWrapper.appendChild(labelPlus);
        
        mzaziWaPreview.appendChild(sliderWrapper);

        zoomSlider.addEventListener("input", (e) => {
            transformState.scale = parseFloat(e.target.value);
            applyImageTransformations();
        });
    }

    function applyImageTransformations() {
        if (!avatarPreviewBox) return;
        const imgElement = avatarPreviewBox.querySelector("img");
        if (imgElement) {
            imgElement.style.transform = `translate(${transformState.translateX}px, ${transformState.translateY}px) scale(${transformState.scale})`;
        }
    }

    // Amsha uwezo wa kukokota picha kwa kidole au mouse (Drag & Pan Setup)
    function wekaMitamboYaKukokota(img) {
        img.style.cursor = "move";
        img.style.transformOrigin = "center center";
        img.style.transition = "transform 0.05s ease-out";

        // COMPUTER MOUSE INPUT
        img.addEventListener("mousedown", (e) => {
            transformState.isDragging = true;
            transformState.startX = e.clientX - transformState.translateX;
            transformState.startY = e.clientY - transformState.translateY;
            e.preventDefault();
        });

        window.addEventListener("mousemove", (e) => {
            if (!transformState.isDragging) return;
            transformState.translateX = e.clientX - transformState.startX;
            transformState.translateY = e.clientY - transformState.startY;
            applyImageTransformations();
        });

        window.addEventListener("mouseup", () => {
            transformState.isDragging = false;
        });

        // 🔥 SULUHISHO LA GITHUB MOBILE TOUCH: Daka index [0] ya kidole cha mteja kwa usahihi
        img.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                transformState.isDragging = true;
                transformState.startX = e.touches[0].clientX - transformState.translateX;
                transformState.startY = e.touches[0].clientY - transformState.translateY;
            }
        });

        img.addEventListener("touchmove", (e) => {
            if (!transformState.isDragging || e.touches.length !== 1) return;
            transformState.translateX = e.touches[0].clientX - transformState.startX;
            transformState.translateY = e.touches[0].clientY - transformState.startY;
            applyImageTransformations();
            e.preventDefault(); 
        });

        img.addEventListener("touchend", () => {
            transformState.isDragging = false;
        });
}    // ==========================================================================
    // SEHEMU YA 4: INJINI YA KUCHORA PICHA KIONI, NAVIGATION & TIMING LOCK 🛡️
    // ==========================================================================
    function wekaPichaKioni(fileOrBlob) {
        if (!avatarPreviewBox) return;
        try {
            const pichaZamani = avatarPreviewBox.querySelector("img");
            if (pichaZamani && pichaZamani.src) {
                URL.revokeObjectURL(pichaZamani.src);
                pichaZamani.remove();
            }

            const urlYaPicha = URL.createObjectURL(fileOrBlob);
            if (placeholderIcon) placeholderIcon.style.display = "none";

            const imgElement = document.createElement("img");
            imgElement.src = urlYaPicha;
            imgElement.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; user-select: none; -webkit-user-drag: none;";
            
            avatarPreviewBox.appendChild(imgElement);

            transformState.scale = 1;
            transformState.translateX = 0;
            transformState.translateY = 0;
            if (zoomSlider) zoomSlider.value = "1";

            injectZoomSlider();
            wekaMitamboYaKukokota(imgElement);
            applyImageTransformations();
        } catch (err) {
            console.error("Mkwamo wa kuchora preview ya picha:", err);
        }
    }

    if (avatarInput) {
        avatarInput.addEventListener("change", (e) => {
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            if (!faili.type.startsWith("image/")) {
                alert("Makosa: Tafadhali chagua faili la picha halisi pekee!");
                e.target.value = "";
                return;
            }

            const kikomoChaMb5 = 5 * 1024 * 1024;
            if (faili.size > kikomoChaMb5) {
                alert("Picha yako ni nzito mno! Mfumo unaruhusu mwisho wa MB 5 pekee.");
                e.target.value = "";
                return;
            }

            failiLaPichaAsili = faili;
            wekaPichaKioni(faili);
        });
    }

    function rejeshaAvatarKamaIpo() {
        if (!dbIndexedAkiba) return;
        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        const ombiDaka = duka.get("jumanne_current_avatar_draft");

        ombiDaka.onsuccess = function (e) {
            const data = e.target.result;
            if (data && data.avatarBlobData) {
                console.log("♻️ State Restored: Picha ya wasifu imepatikana ghafi kwenye IndexedDB!");
                failiLaPichaAsili = data.avatarBlobData;
                wekaPichaKioni(data.avatarBlobData);
            }
        };
    }

    const btnBack = document.getElementById("jumanne-back-to-step5");
    const btnNext = document.getElementById("jumanne-btn-to-step7");

    if (btnBack) {
        btnBack.addEventListener("click", () => {
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step5.html";
        });
    }

    if (btnNext) {
    btnNext.addEventListener("click", () => {
        const honeyInput = document.getElementById("jumanne-honey-avatar");
        if (honeyInput && honeyInput.value.length > 0) {
            sessionStorage.clear();
            window.location.reload();
            return;
        }

        if (!failiLaPichaAsili) {
            alert("Tafadhali pakia picha yako ya wasifu kwanza! Ni lazima ili mashabiki wakutambue mtaani.");
            return;
        }

        if (dbIndexedAkiba) {
            // Badilisha kitufe kuonyesha kazi inafanyika kuzuia kubonyeza mara mbili
            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasafiri...';

            // 🔥 MTAMBO WA CHUMA: Geuza picha kuwa Base64 String ili kuondoa kufuli la GitHub Pages!
            const msomajiMafaili = new FileReader();
            
            msomajiMafaili.onload = function (event) {
                const pichaBase64 = event.target.result;

                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaAvatarDraft = {
                    id: "jumanne-avatar-base64-draft", // Suka ID mpya nyepesi ya maandishi
                    jinaLaPicha: failiLaPichaAsili.name || "avatar.jpg",
                    ukubwaWaPicha: failiLaPichaAsili.size,
                    avatarMaandishiData: pichaBase64, // Hifadhi kama maandishi safi yasiyozuiliwa!
                    panX: transformState.translateX,
                    panY: transformState.translateY,
                    zoomScale: transformState.scale,
                    tareheSajili: Date.now()
                };

                const ombiLaza = duka.put(dataYaAvatarDraft);
                
                ombiLaza.onsuccess = function() {
                    console.log("💾 Wasifu Umelock: Picha ya Base64 imelazwa IndexedDB hewani GitHub!");
                    sessionStorage.setItem("jumannetok_avatar_meta", JSON.stringify({ hasBlobDraft: true }));
                    
                    clearInterval(mtamboWaSaa);
                    // Mtoe mnyofu akamalizie mkataba wa mwisho mtaani!
                    window.location.href = "index.html"; 
                };

                ombiLaza.onerror = function() {
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Inayofuata <i class="fas fa-arrow-right"></i>';
                    clearInterval(mtamboWaSaa);
                    window.location.href = "register-step9.html";
                };
            };

            msomajiMafaili.onerror = function() {
                console.error("❌ Hitilafu ya kugeuza picha kuwa Base64.");
                window.location.href = "register-step7.html";
            };

            // Anza kusoma faili ghafi hapa mnyofu
            msomajiMafaili.readAsDataURL(failiLaPichaAsili);

        } else {
            window.location.href = "register-step1.html";
        }
    });
}

// 🔥 TIMING PROTOCOL: Subiri HTML iishe kusomwa ndipo uwashe injini ya kioo
document.addEventListener("DOMContentLoaded", function() {
    amshaDukaLaAvatarLocal();
    wekaJinaLaMsaniiChini();
});

})();
        
