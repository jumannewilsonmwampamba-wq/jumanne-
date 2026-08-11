// ==========================================================================
// JUMANNETOK TZ - CORE REGISTER CONTROLLER (GENDER CONTROL & NATIONAL PAINTS)
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

    // 2. INJINI YA MANUVA YA RANGI ZA TAIFA KWENYE DROPDOWN YA JINSIA
    const genderSelect = document.getElementById("jumanne-gender");

    if (genderSelect) {
        // Piga giza la chuma kiasili kwenye lile box mlangoni
        genderSelect.style.background = "#111";
        genderSelect.style.color = "#fff";
        genderSelect.style.fontWeight = "bold";

        // Manuva ya ndani: Paka rangi maalum za bendera kwenye machaguo ya ndani (Options)
        const machaguo = genderSelect.options;
        for (let i = 0; i < machaguo.length; i++) {
            machaguo[i].style.background = "#111";
            machaguo[i].style.fontWeight = "bold";
            
            if (machaguo[i].value === "Mume") {
                machaguo[i].style.color = "#1EB960"; // Kijani ya ushindi wa kiume kitaifa
            } else if (machaguo[i].value === "Mke") {
                machaguo[i].style.color = "#00A3DD"; // Bluu ya thamani ya kike bahari kuu
            } else {
                machaguo[i].style.color = "#888"; // Rangi ya msaada kwa ile option ya kwanza tupu
            }
        }

        // Mtandao ukibadilika, badilisha na rangi ya kichwa cha select box papo hapo kioone
        genderSelect.addEventListener("change", (e) => {
            if (e.target.value === "Mume") {
                genderSelect.style.color = "#1EB960";
            } else if (e.target.value === "Mke") {
                genderSelect.style.color = "#00A3DD";
            } else {
                genderSelect.style.color = "#fff";
            }
        });
    }

    // 3. INJINI YA KUVUKA HATUA NA KURUDI NYUMA (THE ROUTING MANAGER)
    const btnBack = document.getElementById("jumanne-back-to-profile-pic");
    const btnNext = document.getElementById("jumanne-btn-to-step7");

    if (btnBack) {
        btnBack.addEventListener("click", () => {
            clearInterval(mtamboWaSaa);
            // Inarudi nyuma mnyofu kwenye Hatua ya 6 ya picha ya avatar
            window.location.href = "register-step6.html";
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            // Mtego wa siri wa ma-robot (Honeypot Enforcement)
            const honeyInput = document.getElementById("jumanne-honey-gender");
            if (honeyInput && honeyInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            if (!genderSelect || genderSelect.value === "") {
                alert("Tafadhali chagua jinsia yako kwanza ili kukamilisha wasifu!");
                return;
            }

            // Hifadhi kete nyepesi ya unyoya ndani ya memory ya sessionStorage (0% Memory Overload)
            const keteYaJinsia = {
                jinsia: genderSelect.value
            };

            sessionStorage.setItem("jumannetok_reg_gender", JSON.stringify(keteYaJinsia));

            // Zima saa na mvute mtumiaji kuelekea Hatua ya 7 ya mwisho kabisa ya masharti ya kibilionea
            clearInterval(mtamboWaSaa);
            window.location.href = "register-step6.html";
        });
    }
})();
