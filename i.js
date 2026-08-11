// index.html - Hatua ya 1: Injini ya Auth Gate (Token Verification)

(function () {
    "use strict";

    // 1. INJINI YA ULINZI: Kagua token ya siri mara tu ukurasa unapoanza kupumua
    function kaguaMgeniAuMwenyeji() {
        // Vuta token kutoka kwenye kumbukumbu ya kudumu ya diski ya simu
        const tokenYaSasa = localStorage.getItem("jumannetok_user_token");

        // Kama token haipo kabisa (Mteja ni Mgeni wa dharura)
        if (!tokenYaSasa || tokenYaSasa.trim() === "") {
            console.log("🛡️ Auth Gate: Umegundulika kuwa mgeni! Unahamishwa kwenda kusajiliwa...");
            
            // Msukumie mtumiaji ukurasa wa usajili hatua ya kwanza kibashara
            window.location.href = "register-step1.html";
            return;
        }

        // Kama token ipo, mteja ni Mwenyeji rasmi
        console.log("✅ Auth Gate: Karibu tena Mwenyeji! Token yako ipo hai.");
        
        // Hapa mbeleni tutaweka function ya kuamsha video za Feed
        // amshaMainFeedPlayer();
    }

    // Amsha ukaguzi huu wa kijasusi wa sekunde sifuri
    kaguaMgeniAuMwenyeji();

})();
