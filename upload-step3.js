
// upload-step3.js - Core Publishing Engine with National Color Syntax & Intel

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let uploadInterval = null;

    // Daka ma-element yote ya HTML kutoka kwenye ukurasa wako wa Step 3
    const playerStep3 = document.getElementById("jumanne-step3-preview-player");
    const captionBox = document.getElementById("jumanne-video-caption");
    const tagsCounter = document.getElementById("jumanne-tags-counter");
    const wordCounter = document.getElementById("jumanne-word-counter");

    const progressZone = document.getElementById("jumanne-upload-progress-zone");
    const progressBar = document.getElementById("jumanne-upload-progress-bar");
    const statusText = document.getElementById("jumanne-upload-status-text");

    const btnPublish = document.getElementById("jumanne-final-publish-btn");
    const btnAbort = document.getElementById("jumanne-abort-btn");

    // ==========================================================================
    // HATUA YA 1: INJINI YA KUVUTA VIPANDE VYOTE KWA MPANGILIO KUTOKA DISK
    // ==========================================================================
    function vutaVipandeKutokaKwenyeDiski() {
        const jumlaYaVipandeStr = sessionStorage.getItem("jumannetok_total_chunks");
        if (!jumlaYaVipandeStr || !dbIndexedAkiba) return;

        const jumlaYaVipande = parseInt(jumlaYaVipandeStr, 10);
        const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readonly");
        const duka = muamala.objectStore("jumannetok_chunks");
        
        let mfululizoWaVipande = [];
        let index = 0;

        function dakaKipandeKwenyeDiski() {
            if (index >= jumlaYaVipande) {
                unganishaVipandeNaWashaPlayer(mfululizoWaVipande);
                return;
            }
            const ombi = duka.get(index);
            ombi.onsuccess = function (e) {
                if (e.target.result) mfululizoWaVipande.push(e.target.result.maandishi_base64);
                index++;
                dakaKipandeKwenyeDiski();
            };
        }
        dakaKipandeKwenyeDiski();
    }

    function unganishaVipandeNaWashaPlayer(vipandeVyaMaandishi) {
        try {
            const maBlobYote = vipandeVyaMaandishi.map(base64Str => {
                const sehemu = base64Str.split(',');
                const byteCharacters = atob(sehemu);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: "video/mp4" });
            });

            const videoKamiliBlob = new Blob(maBlobYote, { type: "video/mp4" });
            if (playerStep3) {
                playerStep3.src = URL.createObjectURL(videoKamiliBlob);
                playerStep3.load();
                playerStep3.play().catch(() => {});
                console.log("🏆 Video imelupuka vizuri Step 3!");
            }
        } catch (err) {
            console.error("❌ Hitilafu ya kuunganisha kioo Step 3:", err);
        }
    }

    // ==========================================================================
    // HATUA YA 2 & 3: INJINI YA AKILI - MARUFUKU YA NAMBA, HESABU & RANGI ZA TAIFA 🇹🇿
    // ==========================================================================
    function amshaUsimamiziWaCaptionNaHesabu() {
        if (!captionBox) return;

        // Mtego wa kuzuia namba zote kabisa zisikanyagwe kwenye keyboard
        captionBox.addEventListener("keydown", function (e) {
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault(); // Kataa namba papo hapo isionekane
            }
        });

        captionBox.addEventListener("input", function () {
            let maandishi = captionBox.innerText;

            // Ulinzi wa ziada kama mtumiaji amepaste maandishi yenye namba
            if (/\d/.test(maandishi)) {
                captionBox.innerText = maandishi.replace(/\d/g, '');
                wekaCursorMwishoni(captionBox);
                return;
            }

            // Tenga maneno pamoja na nafasi zake ili muundo usivunjike
            let vipandeManeno = maandishi.split(/(\s+)/); 
            let manenoHalisi = vipandeManeno.filter(w => w.trim().length > 0);
            let tags = manenoHalisi.filter(w => w.startsWith("#"));

            if (wordCounter) wordCounter.textContent = `Maneno: ${manenoHalisi.length} / 50`;
            if (tagsCounter) tagsCounter.textContent = `Tags: ${tags.length} / 8`;

            // Daka nafasi ya sasa ya cursor kabla ya kuweka rangi ili isirudi nyuma
            let nafasiYaCursor = wekaSafiNaDakaCursor(captionBox);

            let manenoNaRangi = vipandeManeno.map(neno => {
                if (neno.trim().startsWith("#")) {
                    return choraRangiZaTanzania(neno);
                }
                return neno; // Maandishi ya kawaida yanabaki meupe safi
            }).join("");

            captionBox.innerHTML = manenoNaRangi;
            rejeshaCursor(captionBox, nafasiYaCursor);
        });
    }

    function choraRangiZaTanzania(hashtag) {
        let herufi = hashtag.split("");
        let rangiSafi = ["#00e676", "#ffeb3b", "#aaaaaa", "#2196f3"]; // Kijani, Njano, Nyeupe (kwa ajili ya giza), Bluu
        let matokeoYaRangi = "";

        herufi.forEach((char, index) => {
            let rangiYaSasa = rangiSafi[index % rangiSafi.length];
            matokeoYaRangi += `<span style="color: ${rangiYaSasa}; font-weight: bold;">${char}</span>`;
        });

        return matokeoYaRangi;
    }

    function wekaSafiNaDakaCursor(element) {
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

    function rejeshaCursor(element, nafasi) {
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
    // HATUA YA 4: INJINI YA UPLOAD, PROGRESS BAR, NA KUSAFISHA DATA ZOTE
    // ==========================================================================
    function amshaMchakatoWaKurushaMdundo() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function () {
            let maandishiText = captionBox ? captionBox.innerText.trim() : "";
            if (maandishiText === "") {
                alert("Mkuu, andika angalau neno moja au hashtag kuelezea kipaji chako!");
                return;
            }

            // Ficha vifungo vya kawaida vya navigation, onyesha uwanja wa progress bar
            const actionButtons = document.getElementById("jumanne-action-buttons");
            if (actionButtons) actionButtons.style.display = "none";
            if (progressZone) progressZone.style.display = "block";

            let asilimiaYaSasa = 0;

            // Simulizi ya urushaji wa data kwa kasi ya 5G kwenda seva kuu
            uploadInterval = setInterval(function () {
                asilimiaYaSasa += Math.floor(Math.random() * 8) + 2;
                
                if (asilimiaYaSasa >= 100) {
                    asilimiaYaSasa = 100;
                    clearInterval(uploadInterval);
                    if (progressBar) progressBar.style.width = "100%";
                    if (statusText) statusText.textContent = "🚀 Mdundo Umefika Seva Kuu: 100%!";
                    
                    setTimeout(kamilishaKaziNaSafishaDataZote, 1200); 
                } else {
                    if (progressBar) progressBar.style.width = `${asilimiaYaSasa}%`;
                    if (statusText) statusText.textContent = `⏳ Inarusha mdundo: ${asilimiaYaSasa}%`;
                }
            }, 200);
        });

        if (btnAbort) {
            btnAbort.addEventListener("click", function () {
                clearInterval(uploadInterval);
                if (progressZone) progressZone.style.display = "none";
                const actionButtons = document.getElementById("jumanne-action-buttons");
                if (actionButtons) actionButtons.style.display = "flex";
                if (progressBar) progressBar.style.width = "0%";
                alert("Upload imesitishwa! Bando lako lipo salama mkuu.");
            });
        }
    }

    function kamilishaKaziNaSafishaDataZote() {
        alert("Hongera! Video yako ya Kipaji imechapishwa rasmi JumanneTok TZ! 🏆");

        // 1. Safisha SessionStorage yote iliyobeba takataka
        sessionStorage.clear();


// 2. Futa kabisa duka la IndexedDB ili simu ibake safi
if (dbIndexedAkiba) {
const muamala = dbIndexedAkiba.transaction(["jumannetok_chunks"], "readwrite");
const duka = muamala.objectStore("jumannetok_chunks");
const ombiFuta = duka.clear();
ombiFuta.onsuccess = function() {
console.log("🛡️ Diski imesafishwa kikamilifu.");
window.location.href = "index.html"; // Mtupe mtumiaji index ya nyumbani direct!
};
ombiFuta.onerror = function() {
window.location.href = "index.html";
};
} else {
window.location.href = "index.html";
}
}
// ==========================================================================
// 🔥 INJINI YA KASHA: DOMCONTENTLOADED INAYOWASHA MITUNGI YOTE MARA MOJA SAFU
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
console.log("🚀 Mtambo Mkuu wa JumanneTok Step 3 Unawaka...");
// 1. Amsha database na uanze kuvuta vipande vya video kioo cha Step 3
const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);
ombiDuka.onsuccess = function (e) {
dbIndexedAkiba = e.target.result;
console.log("✅ Database imefunguka vizuri ndani ya Listener!");
vutaVipandeKutokaKwenyeDiski();
};
ombiDuka.onerror = function () {
console.error("❌ Imeshindikana kufungua database ndani ya Listener.");
};
// 2. Washa injini ya akili ya caption (Rangi za Taifa 🇹🇿 na marufuku ya namba)
amshaUsimamiziWaCaptionNaHesabu();
// 3. Washa injini ya kurusha mdundo na progress bar
amshaMchakatoWaKurushaMdundo();
});
})();


