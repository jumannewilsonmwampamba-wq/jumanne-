// ==========================================================================
// JUMANNETOK TZ - CORE REGISTER CONTROLLER (STEP 4: CONTACT & EMAIL VALIDATOR)
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

    // 2. INJINI YA KUAKISI HERUFI NA KUZIPAKA RANGI NNE MNDANI YA BOKSI LA INPUT
    function amshaRangiMndaniYaBoksi(inputElement, colorBoxId) {
        if (!inputElement) return null;

        const mzazi = inputElement.parentElement;
        mzazi.style.position = "relative";

        const colorBox = document.createElement("div");
        colorBox.id = colorBoxId;
        colorBox.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; padding:12px; font-size:15px; font-weight:bold; pointer-events:none; white-space:pre; background:transparent; display:flex; align-items:center; box-sizing:border-box; letter-spacing:0.5px;";
        mzazi.insertBefore(colorBox, inputElement);

        inputElement.style.cssText = "width:100%; padding:12px; font-size:15px; font-weight:bold; background:#111; border:1px solid #222; border-radius:6px; color:transparent; caret-color:#fff; box-sizing:border-box; letter-spacing:0.5px;";

        return colorBox;
    }

    // Amsha mitambo ya siri ya urembo mlangoni
    const phoneInput = document.getElementById("jumanne-phone");
    const emailInput = document.getElementById("jumanne-email");

    const phoneColorBox = amshaRangiMndaniYaBoksi(phoneInput, "jumanne-phone-color-box");
    const emailColorBox = amshaRangiMndaniYaBoksi(emailInput, "jumanne-email-color-box");

    // 3. MCHUJO KALI WA NAMBA TU PALE USER ANAPOANDIKA (STRICT NUMERIC FILTER)
    if (phoneInput && phoneColorBox) {
        phoneInput.addEventListener("input", (e) => {
            // Pingu ya ki-hardware: Ondoa herufi zote, bakiza namba tupu pekee!
            let nambaGhafi = e.target.value.replace(/[^0-9]/g, "");
            
            // Ukomo wa Namba za Simu TZ ni tarakimu 10 pekee kuzuia lag
            if (nambaGhafi.length > 10) {
                nambaGhafi = nambaGhafi.slice(0, 10);
            }
            
            e.target.value = nambaGhafi;
            phoneColorBox.innerHTML = pigaChapaRangi(nambaGhafi);
        });
    }

    // 4. MCHUJO WA EMAIL PALE USER ANAPOANDIKA
    if (emailInput && emailColorBox) {
        emailInput.addEventListener("input", (e) => {
            let herufiEmail = e.target.value.trim();
            emailColorBox.innerHTML = pigaChapaRangi(herufiEmail);
        });
    }

    // 5. INJINI YA KUVUKA GOLI NA KURUDI NYUMA (THE ROUTING MANAGER)
    const btnBack = document.getElementById("jumanne-back-to-step3");
    const btnNext = document.getElementById("jumanne-btn-to-step5");

    if (btnBack) {
        btnBack.addEventListener("click", () => {
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step3.html";
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            // Mtego wa siri wa ma-robot (Honeypot Enforcement)
            const honeyInput = document.getElementById("jumanne-honey-contact");
            if (honeyInput && honeyInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            if (!phoneInput || !emailInput) return;

            const nambaSimu = phoneInput.value.trim();
            const baruaPepe = emailInput.value.trim();

            // 🔥 UKUTA WA ULINZI 1: Uhakiki mkali wa namba ya simu ya Tanzania (Strict Regex)
            const mtegoNambaTz = /^(07|06)[0-9]{8}$/;
            if (!mtegoNambaTz.test(nambaSimu)) {
                alert("Makosa: Namba ya simu haieleweki! Lazima iwe na tarakimu 10 kamili na ianze na 07 au 06!");
                return;
            }

            // 🔥 UKUTA WA ULINZI 2: Uhakiki mkali wa muundo wa barua pepe (Strict Email Regex)
            if (baruaPepe.length > 0) {
                const mtegoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!mtegoEmail.test(baruaPepe)) {
                    alert("Makosa: Muundo wa Email hauereweki! Hakikisha ina @ na kuishia na .com au mfumo wake sahihi!");
                    return;
                }
            }

            // Hifadhi kete nyepesi za unyoya ndani ya memory ya sessionStorage (0% Memory Overload)
            const keteYaMawasiliano = {
                simu: nambaSimu,
                email: baruaPepe || "tupu"
            };

            sessionStorage.setItem("jumannetok_reg_step4", JSON.stringify(keteYaMawasiliano));
            
            // Zima saa na vuta mtumiaji kwenda Hatua ya 5 ya ulinzi wa password
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step5.html";
        });
    }
})();
