//register-avatar.js - Fixed Scope & Interactive Layout

// ==========================================================================// JUMANNETOK TZ - CORE REGISTER CONTROLLER (STEP 6: FIXED SCOPE AND LAYOUT)// ==========================================================================

(function () {
    "use strict";

    // 1. INJINI YA SAA YA ULINZI (THE 3-MINUTE SECURE COUNTDOWN TIMER)
    let mudaUliobaki = 3 * 60; // Dakika 3 kamili (Sekunde 180)
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

    // Rangi nche rasmi za Bendera ya Tanzania: Kijani, Njano, Nyeusi/Nyeupe, na Bluu
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

    // 🔥 VIOO VYA MALEFA: Unanyakua ma-element yote ya kioo HAPA JUU KWANZA kabisa ili yajulikane kote kwenye file!
    const avatarInput = document.getElementById("jumanne-avatar");
    const avatarPreviewBox = document.getElementById("jumanne-avatar-preview");
    const placeholderIcon = document.getElementById("jumanne-preview-placeholder");
    let zoomSlider = null;

    // FUNGUA DATABASE YA REAL HARDWARE (INDEXEDDB CACHE LAYER)
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

    // FUNCTION YA KUCHORA MAANDISHI KWA RANGI NNE ZA TAIFA
    function pigaChapaRangi(maandishiGhafi) {
        let herufiMchanganyiko = "";
        for (let i = 0; i < maandishiGhafi.length; i++) {
            if (maandishiGhafi[i] === " ") {
                herufiMchanganyiko += " &nbsp; ";
            } else {
                let rangiHusika = rangiTanzania[i % 4];

                herufiMchanganyiko += `<span style="color: ${rangiHusika};">${maandishiGhafi[i]}</span>`;
            }
        }
        return herufiMchanganyiko;
    }

    // 2. INJINI YA KUCHORA JINA LA MSANII DIRECT CHINI YA PICHA YA AVATAR (STRICT COLUMN WRAPPER)
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


    // 3. INJINI YA INTERACTIVE SCROLL/PAN NA ZOOM SLIDER CHINI KABISA (FIXED COLLISION)
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
        
        // PUSH CHINI KABISA KANGA YA LAYOUT: Weka chini kabisa ya jina la msanii
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

        // SIMU ZA MKONONI TOUCH INPUT (TIKTOK / INSTAGRAM STYLE)
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
    }

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

    // STATE RESTORATION KUTOKA INDEXEDDB (USER AKIBONYEZA RUDI NYUMA)
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

    // 4. INJINI YA NAVIGATION YA VIFUNGO VYA CHUMA (DIRECT BLOB SAVE)
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
                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaAvatarDraft = {

                    id: "jumanne_current_avatar_draft",
                    jinaLaPicha: failiLaPichaAsili.name || "avatar.jpg",
                    ukubwaWaPicha: failiLaPichaAsili.size,
                    avatarBlobData: failiLaPichaAsili,
                    panX: transformState.translateX,
                    panY: transformState.translateY,
                    zoomScale: transformState.scale,
                    tareheSajili: Date.now()
                };

                duka.put(dataYaAvatarDraft);

                const ombiDaka2 = duka.get("jumanne_current_avatar_draft");
                ombiDaka2.onsuccess = function () {
                    console.log("💾 Wasifu Umelock: Original Blob ghafi imelazwa IndexedDB salama!");
                    sessionStorage.setItem("jumannetok_avatar_meta", JSON.stringify({ hasBlobDraft: true }));
                        function applyImageTransformations() {
        if (!avatarPreviewBox) return;
        const imgElement = avatarPreviewBox.querySelector("img");
        if (imgElement) {
            imgElement.style.transform = `translate(${transformState.translateX}px, ${transformState.translateY}px) scale(${transformState.scale})`;
        }
    }

    // Amsha uwezo wa kukokota picha kwa kidole au mouse (Drag & Pan Setup Fixed)
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

        // 🔥 FIX YA GITHUB MOBILE TOUCH: Weka index [0] ya kidole cha kwanza kuzuia crash
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
    }

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
                const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
                const duka = muamala.objectStore("jumannetok_feed_cache");

                const dataYaAvatarDraft = {
                    id: "jumanne_current_avatar_draft",
                    jinaLaPicha: failiLaPichaAsili.name || "avatar.jpg",
                    ukubwaWaPicha: failiLaPichaAsili.size,
                    avatarBlobData: failiLaPichaAsili,
                    panX: transformState.translateX,
                    panY: transformState.translateY,
                    zoomScale: transformState.scale,
                    tareheSajili: Date.now()
                };

                // 🔥 SULUHISHO KUU: Weka amri ya kuokoa na kusafiri ndani ya onsuccess ya duka mnyofu!
                const ombiLaza = duka.put(dataYaAvatarDraft);
                
                ombiLaza.onsuccess = function() {
                    console.log("💾 Wasifu Umelock: Original Blob ghafi imelazwa IndexedDB salama!");
                    sessionStorage.setItem("jumannetok_avatar_meta", JSON.stringify({ hasBlobDraft: true }));
                    
                    clearInterval(mtamboWaSaa);
                    // Hapa kabadilishe kulingana na jina la ukurasa wako wa mbele (Mkataba/Final Step)
                    window.location.href = "register-step7.html"; 
                };

                ombiLaza.onerror = function() {
                    clearInterval(mtamboWaSaa);
                    window.location.href = "register-step7.html";
                };

            } else {
                window.location.href = "register-step1.html";
            }
        });
    }

    // 🔥 SULUHISHO: Amsha mitambo kwa usalama mara tu ukurasa unapomaliza kusoma HTML
    document.addEventListener("DOMContentLoaded", function() {
        amshaDukaLaAvatarLocal();
        wekaJinaLaMsaniiChini();
    });
})();
                
