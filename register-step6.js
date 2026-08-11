// ==========================================================================
// JUMANNETOK TZ - CORE REGISTER CONTROLLER (STEP 5: IRONCLAD SECURITY GRID)
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

    // Rangi nne rasmi za Bendera ya Tanzania: Kijani, Njano, Nyeusi/Nyeupe, na Bluu
    const rangiTanzania = ["#1EB960", "#FCD116", "#FFFFFF", "#00A3DD"];

    // FUNCTION YA KUCHORA MAANDISHI KWA RANGI NNE ZA TAIFA
    function pigaChapaRangi(maandishiGhafi) {
        let herufiMchanganyiko = "";
        for (let i = 0; i < maandishiGhafi.length; i++) {
            if (maandishiGhafi[i] === " ") {
                herufiMchanganyiko += " ";
            } else {
                let rangiHusika = rangiTanzania[i % 4];
                herufiMchanganyiko += `<span style="color: ${rangiHusika};">${maandishiGhafi[i]}</span>`;
            }
        }
        return herufiMchanganyiko;
    }

    // 2. INJINI YA KUAKISI NA KUFICHA PASSWORD KWA KUTUMIA MA-DOTS YA RANGI NNE
    function amshaRangiMndaniYaPassword(inputElement, colorBoxId) {
        if (!inputElement) return null;

        const mzazi = inputElement.parentElement;
        mzazi.style.position = "relative";

        const colorBox = document.createElement("div");
        colorBox.id = colorBoxId;
        colorBox.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; padding:12px; font-size:22px; font-weight:bold; pointer-events:none; white-space:pre; background:transparent; display:flex; align-items:center; box-sizing:border-box; letter-spacing:4px;";
        mzazi.insertBefore(colorBox, inputElement);

        // Lazimisha kisanduku kiwe transparent ili ma-dots ya nyuma yaonekane
        inputElement.style.cssText = "width:100%; padding:12px; font-size:15px; font-weight:bold; background:#111; border:1px solid #222; border-radius:6px; color:transparent; caret-color:#fff; box-sizing:border-box; letter-spacing:0.5px;";

        inputElement.addEventListener("input", (e) => {
            // PINGU YA KI-HARDWARE: Ondoa herufi, bakiza namba tupu pekee!
            let nambaGhafi = e.target.value.replace(/[^0-9]/g, "");
            e.target.value = nambaGhafi;

            // Badilisha namba kuwa Alama ya doti ya siri ya kiwango cha WhatsApp/TikTok (●)
            let maDotsGhafi = "●".repeat(nambaGhafi.length);
            colorBox.innerHTML = pigaChapaRangi(maDotsGhafi);
        });
    }

    // 3. INJINI YA KUPAKA RANGI DROPDOWN YA SWALI LA SIRI
    function amshaRangiSwaliSiri(selectElement) {
        if (!selectElement) return;
        selectElement.style.background = "#111";
        selectElement.style.color = "#fff";
        selectElement.style.fontWeight = "bold";

        const options = selectElement.options;
        for (let i = 0; i < options.length; i++) {
            options[i].style.background = "#111";
            options[i].style.color = "#00A3DD"; // Bluu ya uokoaji
        }
    }

    // 4. INJINI YA KUCHUJA JIBU LA SIRI (TEXT ONLY)
    function amshaRangiJibuSiri(inputElement, colorBoxId) {
        if (!inputElement) return null;
        const mzazi = inputElement.parentElement;
        mzazi.style.position = "relative";

        const colorBox = document.createElement("div");
        colorBox.id = colorBoxId;
        colorBox.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; padding:12px; font-size:15px; font-weight:bold; pointer-events:none; white-space:pre; background:transparent; display:flex; align-items:center; box-sizing:border-box; letter-spacing:0.5px;";
        mzazi.insertBefore(colorBox, inputElement);

        inputElement.style.cssText = "width:100%; padding:12px; font-size:15px; font-weight:bold; background:#111; border:1px solid #222; border-radius:6px; color:transparent; caret-color:#fff; box-sizing:border-box; letter-spacing:0.5px;";

        inputElement.addEventListener("input", (e) => {
            let herufiTu = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            e.target.value = herufiTu;
            colorBox.innerHTML = pigaChapaRangi(herufiTu);
        });
    }

    // Amsha mitambo yote ya manuva mlangoni pa kioo giza
    const passMain = document.getElementById("jumanne-password-main");
    const passBackup = document.getElementById("jumanne-password-backup");
    const secretQuestion = document.getElementById("jumanne-secret-question");
    const secretAnswer = document.getElementById("jumanne-secret-answer");

    amshaRangiMndaniYaPassword(passMain, "jumanne-pass-main-box");
    amshaRangiMndaniYaPassword(passBackup, "jumanne-pass-backup-box");
    amshaRangiSwaliSiri(secretQuestion);
    amshaRangiJibuSiri(secretAnswer, "jumanne-answer-box");

    // 5. INJINI YA KUVUKA GOLI NA KURUDI NYUMA (THE ROUTING MANAGER)
    const btnBack = document.getElementById("jumanne-back-to-step4");
    const btnNext = document.getElementById("jumanne-btn-to-step6");

    if (btnBack) {
        btnBack.addEventListener("click", () => {
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step4.html";
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            // Mtego wa siri wa ma-robot (Honeypot Enforcement)
            const honeyInput = document.getElementById("jumanne-honey-security");
            if (honeyInput && honeyInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            if (!passMain || !passBackup || !secretQuestion || !secretAnswer) return;

            const vPassMain = passMain.value.trim();
            const vPassBackup = passBackup.value.trim();
            const vQuestion = secretQuestion.value;
            const vAnswer = secretAnswer.value.trim().toLowerCase();

            if (!vPassMain || !vPassBackup || !vQuestion || !vAnswer) {
                alert("Tafadhali jaza vyumba vyote vya ulinzi ili kulinda akaunti yako!");
                return;
            }

            // 🔥 UKUTA WA ULINZI 1: Lazimisha Password Kuu iwe na namba 8 kamili
            if (vPassMain.length !== 8) {
                alert("Makosa: Password Kuu lazima iwe na tarakimu 8 za namba kamili kuzuia udukuzi!");
                return;
            }

            // 🔥 UKUTA WA ULINZI 2: Lazimisha PIN ya uokoaji iwe na namba 4 kamili
            if (vPassBackup.length !== 4) {
                alert("Makosa: PIN ya uokoaji lazima iwe na tarakimu 4 za namba kamili!");
                return;
            }

            // Hifadhi kete ya unyoya ndani ya memory ya sessionStorage (0% Memory Overload)
            const keteYaUlinzi = {
                ngomeKuu: vPassMain,
                ngomeZiada: vPassBackup,
                swaliCode: vQuestion,
                jibuCode: vAnswer
            };

            sessionStorage.setItem("jumannetok_reg_step5", JSON.stringify(keteYaUlinzi));

            // Zima saa na mvute mtumiaji kuelekea Hatua ya 6 ya kupakia Picha ya Avatar
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step8.html";
        });
    }
})();
