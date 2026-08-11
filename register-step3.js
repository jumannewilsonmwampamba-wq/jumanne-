// ==========================================================================
// JUMANNETOK TZ - CORE REGISTER CONTROLLER (STEP 3: DRUM SCROLL CONTROL)
// ==========================================================================

(function () {
    "use strict";

    // 1. INJINI YA SAA YA ULINZI (THE 3-MINUTE SECURE COUNTDOWN TIMER)
    let mudaUliobaki = 3 * 60; 
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

    // 2. MTAMBO WA KUJAZA NAMBA ZA DRUM NA KUZIPAKA RANGI NNE ZA TANZANIA
    const rangiTanzania = ["#1EB960", "#FCD116", "#FFFFFF", "#00A3DD"];

    function jazaNaChoraDrum(drumId, mwanzo, mwisho) {
        const drum = document.getElementById(drumId);
        if (!drum) return;

        // Tafuta ule mstari wa mwisho wa nafasi (Spacer) ili kuingiza namba katikati
        const spacerYaMwisho = drum.lastElementChild;
        let indexRangi = 0;

        for (let i = mwanzo; i <= mwisho; i++) {
            const nambaSafi = String(i).padStart(2, '0');
            const rangiHusika = rangiTanzania[indexRangi % 4];
            indexRangi++;

            const keteElement = document.createElement("div");
            keteElement.setAttribute("data-value", nambaSafi);
            keteElement.style.cssText = `height: 40px; line-height: 40px; font-size: 18px; font-weight: bold; color: ${rangiHusika}; scroll-snap-align: center; cursor: pointer; transition: transform 0.2s;`;
            keteElement.textContent = nambaSafi;

            drum.insertBefore(keteElement, spacerYaMwisho);
        }
    }

    // Lipua na ujaze ma-drum yote matatu upesi ki-hardware RAM inapowaka
    jazaNaChoraDrum("drum-siku", 1, 31);
    jazaNaChoraDrum("drum-mwezi", 1, 12);
    jazaNaChoraDrum("drum-mwaka", 1970, 2016); // Challenge Week inaruhusu miaka hii ya ushindani

    // 3. INJINI YA KUSOMA NAMBA ILIYOCHAGULIWA (THE SCROLL ACQUISITION TRACKER)
    function dakaThamaniYaDrum(drumId) {
        const drum = document.getElementById(drumId);
        if (!drum) return "01";
        
        // Piga hesabu ya mstari uliolala katikati ya kioo kulingana na scroll position
        const indexUrefu = Math.round(drum.scrollTop / 40);
        const vipengele = drum.querySelectorAll("[data-value]");
        
        if (vipengele[indexUrefu]) {
            return vipengele[indexUrefu].getAttribute("data-value");
        }
        return "01";
    }

    // 4. INJINI YA VIFUNGO VYA NAVIGATION (THE ROUTING AND STORAGE LOCK)
    const btnBack = document.getElementById("jumanne-back-to-step2");
    const btnNext = document.getElementById("jumanne-btn-to-step4");

    if (btnBack) {
        btnBack.addEventListener("click", () => {
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step2.html";
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            // Mtego wa siri wa ma-robot (Honeypot Enforcement)
            const honeyInput = document.getElementById("jumanne-honey-dob");
            if (honeyInput && honeyInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            // Daka namba zote tatu zilizosimama katikati ya kioo kwa sekunde ya sifuri
            const sikuFinal = dakaThamaniYaDrum("drum-siku");
            const mweziFinal = dakaThamaniYaDrum("drum-mwezi");
            const mwakaFinal = dakaThamaniYaDrum("drum-mwaka");

            const tareheKamilifu = `${mwakaFinal}-${mweziFinal}-${sikuFinal}`;

            // Hifadhi kete ya unyoya ndani ya memory ya sessionStorage
            const keteYaUmri = {
                tareheKuzaliwa: tareheKamilifu,
                mwakaSajili: mwakaFinal
            };

            sessionStorage.setItem("jumannetok_reg_step3", JSON.stringify(keteYaUmri));

            // Zima saa na mvute mtumiaji kuelekea Hatua ya 4 ya reli
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step4.html";
        });
    }
})();
