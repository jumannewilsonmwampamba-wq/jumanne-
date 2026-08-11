// ==========================================================================
// JUMANNETOK TZ - INJINI YA USAJILI: HATUA YA 4 (DUAL-CONTACT SECURITY GATES)
// ==========================================================================

let saaYaKikomoKilaSehemu = null;
let saaYaKiooniInterval = null;

// KAZI YA SAA YA VISUAL: Inashusha dakika 3 kiooni na kusafisha RAM
function amshaSAAHatuaYaNne() {
    if (saaYaKikomoKilaSehemu) clearTimeout(saaYaKikomoKilaSehemu);
    if (saaYaKiooniInterval) clearInterval(saaYaKiooniInterval);

    let sekundeZilizobaki = 3 * 60; // Sekunde 180 kamili (Dakika 3)
    const clockDisplay = document.getElementById("jumanne-countdown-clock");

    saaYaKiooniInterval = setInterval(() => {
        sekundeZilizobaki--;
        let mins = Math.floor(sekundeZilizobaki / 60);
        let secs = sekundeZilizobaki % 60;
        if (clockDisplay) {
            clockDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);

    saaYaKikomoKilaSehemu = setTimeout(() => {
        clearInterval(saaYaKiooniInterval);
        console.warn("Muda wa usalama wa Hatua ya Nne umeisha!");
        sessionStorage.removeItem("jumannetok_step4_data");
        document.getElementById("jumanne-step4-form").reset();
        alert("Muda wa dakika 3 wa kujaza sehemu hii umeisha! Mfumo umerudi hatua ya kwanza.");
        window.location.href = "register-step1.html"; 
    }, 3 * 60 * 1000);
}

// INJINI KUU YA SKRINI YA NNE (CONTACTS NA NAVIGATION)
function washaInjiniYaHatuaYaNne() {
    const btnNext = document.getElementById("jumanne-btn-to-step5");
    const btnBack = document.getElementById("jumanne-back-to-step3");
    const phoneInput = document.getElementById("jumanne-phone");
    const emailInput = document.getElementById("jumanne-email");

    if (!btnNext || !btnBack || !phoneInput || !emailInput) return;

    // Amsha saa ya dakika 3 mara tu ukurasa unapoamka kiooni
    amshaSAAHatuaYaNne();

    // KIASILI: Kulazimisha boksi la simu lisipokee herufi zaidi ya namba 10 kuzuia mkwamo
    phoneInput.maxLength = 10;

    // A. KITUFE CHA INAYOFUATA (NEXT LOGIC - DUAL VALIDATION GATES)
    btnNext.addEventListener("click", () => {
        // MTEGO WA KUZUIA BOTS (HONEYPOT FILTER)
        const honeyValue4 = document.getElementById("jumanne-honey-contact").value;
        if (honeyValue4.length > 0) {
            sessionStorage.clear();
            window.location.href = "register-step1.html";
            return;
        }

        // KUKAMATA DATA HALISI KIOONI
        const nambaSimu = phoneInput.value.trim();
        const baruaPepe = emailInput.value.trim();

        // 🛑 [A] UKAGUZI WA NAMBA YA SIMU
        if (!nambaSimu) {
            alert("Tafadhali andika namba yako ya simu kwanza!");
            return;
        }

        if (nambaSimu.length !== 10) {
            alert(`Namba ya simu lazima iwe na tarakimu 10 kamili! (Hivi sasa umeandika namba ${nambaSimu.length}).`);
            return;
        }

        const muundoSimuSahihi = /^(07|06|01)[0-9]{8}$/;
        if (!muundoSimuSahihi.test(nambaSimu)) {
            alert("Muundo wa namba ya simu sio sahihi! Lazima ianze na 07, 06, au 01 (Mfano: 0712345678).");
            return;
        }

        // 🛑 [B] UKAGUZI WA BARUA PEPE (EMAIL REGEX GATE)
        // Mkuu, hapa sasa tumefunga kuwa ya lazima, isipite ikiwa tupu kabisa!
        if (!baruaPepe) {
            alert("Tafadhali andika barua pepe (Email) yako! Ni ya lazima kwa uokoaji wa akaunti.");
            return;
        }

        // Mtego wa kiufundi wa kukagua kama email ina mfumo halisi (ina @ na nukta .)
        const muundoEmailSahihi = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!muundoEmailSahihi.test(baruaPepe)) {
            alert("Email uliyoweka haina muundo sahihi! Hakikisha ina alama ya @ na nukta (Mfano: juma@gmail.com).");
            return;
        }

        // STATE MANAGEMENT: Tunatunza data zote mbili kwa salama kwenye RAM Cache (SessionStorage)
        const dataYaHatuaYaNne = {
            nambaYaSimu: nambaSimu,
            baruaPepeHalisi: baruaPepe
        };
        sessionStorage.setItem("jumannetok_step4_data", JSON.stringify(dataYaHatuaYaNne));
        console.log("Hatua ya 4 imehifadhiwa salama kwenye RAM:", dataYaHatuaYaNne);

        // KUVUKA GOLI: Zima saa ya sasa na mrushe mtumiaji kwenda ukurasa wa Password
        if (saaYaKikomoKilaSehemu) clearTimeout(saaYaKikomoKilaSehemu);
        if (saaYaKiooniInterval) clearInterval(saaYaKiooniInterval);

        window.location.href = "register-password.html"; // Mvuko wa sekunde sifuri kuelekea Hatua ya 5!
    });

    // B. KITUFE CHA RUDI NYUMA (BACK LOGIC)
    btnBack.addEventListener("click", () => {
        if (saaYaKikomoKilaSehemu) clearTimeout(saaYaKikomoKilaSehemu);
        if (saaYaKiooniInterval) clearInterval(saaYaKiooniInterval);
        window.location.href = "register-step3.html"; // Mrejeshe nyuma kwenye kalenda ya umri
    });
}

window.addEventListener("DOMContentLoaded", washaInjiniYaHatuaYaNne);
