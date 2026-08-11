// ==========================================================================
// JUMANNETOK TZ - CORE REGISTER CONTROLLER (STEP 1: BARE-METAL DARK & FLAG LOGIC)
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

    // 2. INJINI YA KUAKISI HERUFI NA KUZIPAKA RANGI NNE MNDANI YA BOKSI LA INPUT
    function amshaRangiMndaniYaBoksi(inputElement, colorBoxId) {
        if (!inputElement) return;

        inputElement.addEventListener("input", (e) => {
            // PINGU YA KI-HARDWARE: Ondoa namba au alama zote, bakiza herufi tupu pekee!
            let maandishiGhafi = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            e.target.value = maandishiGhafi; 

            // UPASUAJI WA RANGI NNE ZA BENDERA YA TAIFA
            // Kijani (#1EB960), Njano (#FCD116), Nyeusi/Nyeupe ya giza (#FFFFFF), Bluu (#00A3DD)
            const rangiTanzania = ["#1EB960", "#FCD116", "#FFFFFF", "#00A3DD"];
            let herufiMchanganyiko = "";

            for (let i = 0; i < maandishiGhafi.length; i++) {
                if (maandishiGhafi[i] === " ") {
                    herufiMchanganyiko += " ";
                } else {
                    let rangiHusika = rangiTanzania[i % 4];
                    herufiMchanganyiko += `<span style="color: ${rangiHusika};">${maandishiGhafi[i]}</span>`;
                }
            }

            const kiooColorBox = document.getElementById(colorBoxId);
            if (kiooColorBox) {
                kiooColorBox.innerHTML = herufiMchanganyiko;
            }
        });
    }

    // 3. INJINI MPYA YA KUGEUZA RANGI NNE ZA BENDERA KWA MA-SELECT DROPDOWN
    function amshaRangiZaDropdown(selectElement) {
        if (!selectElement) return;

        // Lazimisha background iwe nyeusi ghafi ya kikomandoo kiasili
        selectElement.style.background = "#111";
        selectElement.style.color = "#fff";
        selectElement.style.fontWeight = "bold";

        selectElement.addEventListener("change", (e) => {
            const thamaniIliyochaguliwa = e.target.options[e.target.selectedIndex].text;
            
            if (e.target.value === "") {
                selectElement.style.color = "#fff";
                return;
            }

            // Pasua lile neno lililochaguliwa na kulichora kwa rangi ya kizalendo mlangoni
            const rangiTanzania = ["#1EB960", "#FCD116", "#00A3DD", "#1EB960"];
            // Tunachukua rangi ya kwanza ya mzunguko kulingana na urefu ili kuzuia fujo
            let rangiYaChapa = rangiTanzania[thamaniIliyochaguliwa.length % 4];
            
            // Piga rangi kwenye text ya select box mnyofu kioone ghafi
            selectElement.style.color = rangiYaChapa;
        });
    }

    // Amsha mitambo yote ya rangi kwenye maboksi na ma-select mnyofu juu ya chuma
    const firstNameBox = document.getElementById("jumanne-firstname");
    const lastNameBox = document.getElementById("jumanne-lastname");
    const talentSelectBox = document.getElementById("jumanne-talent-type");
    const roleSelectBox = document.getElementById("jumanne-account-role");
    
    amshaRangiMndaniYaBoksi(firstNameBox, "jumanne-fn-color-box");
    amshaRangiMndaniYaBoksi(lastNameBox, "jumanne-ln-color-box");
    amshaRangiZaDropdown(talentSelectBox);
    amshaRangiZaDropdown(roleSelectBox);

    // 4. KICHUJIO CHA KUZUIA MA-SCRIPT CHA KI-HARDWARE (ANTI-XSS SCRIPT SANITIZER)
    function safishaMaandishiGhafi(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;")
            .trim();
    }

    // 5. INJINI YA KUPITISHA DATA KWENDA STEP 2 (THE STEP 1 NAVIGATION ROUTER)
    const btnNext = document.getElementById("jumanne-btn-to-step2");
    if (btnNext) {
        btnNext.addEventListener("click", () => {
            const honeyInput = document.getElementById("jumanne-honey-username");
            if (honeyInput && honeyInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            if (!firstNameBox || !lastNameBox || !talentSelectBox || !roleSelectBox) return;

            if (!firstNameBox.value || !lastNameBox.value || !talentSelectBox.value || !roleSelectBox.value) {
                alert("Tafadhali jaza sehemu zote zilizoachwa wazi!");
                return;
            }

            const firstNameClean = safishaMaandishiGhafi(firstNameBox.value);
            const lastNameClean = safishaMaandishiGhafi(lastNameBox.value);

            if (firstNameClean.length > 8 || lastNameClean.length > 8) {
                alert("Makosa: Majina hayajatakiwa kuzidi herufi 8 kuzuia lag mtaani!");
                return;
            }

            const keteYaIdentity = {
                jinaKwanza: firstNameClean,
                jinaPili: lastNameClean,
                ainaKipaji: talentSelectBox.value,
                hadhiAkaunti: roleSelectBox.value
            };

            sessionStorage.setItem("jumannetok_reg_step1", JSON.stringify(keteYaIdentity));
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step2.html";
        });
    }
})();
