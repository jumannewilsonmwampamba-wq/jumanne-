// ==========================================================================
// JUMANNETOK TZ - INJINI YA PROFILE: HATUA YA 1 (USALAMA NA MENU TOGGLE)
// ==========================================================================

// A. KAZI YA SIRI YA KUWASHA DROO YA MENU JUU KULIA (DROPDOWN POPUP)
function togglesemuyamore() {
    const menuMenu = document.getElementById("jumanne-more-menu");
    if (!menuMenu) return;
    
    // Kama imefichwa inafungua, kama ipo wazi inaifunga sekunde sifuri
    if (menuMenu.style.display === "none" || menuMenu.style.display === "") {
        menuMenu.style.display = "block";
    } else {
        menuMenu.style.display = "none";
    }
}

// B. KAZI YA CHUMA YA ONDOKA KWENYE MFUMO (SECURE LOG OUT GATEWAY)
function ondokaKwenyeMfumo() {
    if (confirm("Mkuu, una uhakika unataka kuondoka (Log Out) kwenye akaunti yako halisi?")) {
        localStorage.clear(); // Futa Token na ma-ID yote kitaifa kwenye diski ya simu
        sessionStorage.clear(); // Safisha RAM Cache yote ya usajili
        alert("Umeshoka salama! Mfumo umerudi hatua ya kwanza ya usajili.");
        window.location.href = "register-step1.html"; // Mrejeshe usajili upya mlangoni
    }
}
// ==========================================================================
// INJINI YA NYUMA: BACKGROUND HYDRATION & UNIVERSAL LINKS ENABLER (HATUA YA 2)
// ==========================================================================
function washaInjiniYaWasifuKitaifa() {
    // 1. KAGUA KETE YA SIRI YA TOKEN (AUTHENTICATION SHIELD)
    const tokenKuu = localStorage.getItem("jumannetok_jwt_token");

    if (!tokenKuu) {
        console.warn("🛑 Usalama: Token haijapatikana! Rudisha mtu mlangoni.");
        alert("Tafadhali jisajili au ingia kwanza ili uonyeshe kipaji chako kitaifa!");
        window.location.href = "register-step1.html";
        return;
    }

    // 2. DAKA MA-ID YOTE YA MABOKSI YA HTML TULIYOYACHORA KIONONI
    const avatarBox = document.getElementById("jumanne-user-avatar");
    const nameText = document.getElementById("jumanne-user-name");
    const locationText = document.getElementById("jumanne-user-location");
    const roleBadge = document.getElementById("jumanne-user-role");
    const storyText = document.getElementById("jumanne-user-story");
    
    // Ma-span ya takwimu za ushindani (Analytics Grid)
    const followersCount = document.getElementById("jumanne-count-followers");
    const followingCount = document.getElementById("jumanne-count-following");
    const likesCount = document.getElementById("jumanne-count-likes");
    const votesCount = document.getElementById("jumanne-count-votes"); // Inasoma ID ya Kura halisi

    console.log("📡 Piga pigo la siri kwa nyuma kwenda Node.js Port 5000...");

    // 3. PIGA HODI SEVA YA NYUMA YA NODE.JS KUVUTA WASIFU & LINK 5 (API CALL)
    fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenKuu}`, // Tupa Token safi kwenye geti la siri
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("✅ Data zimeruka salama kutoka MongoDB Cloud!", data);
            const msanii = data.profile;
            const links = data.socialLinks; // Daka lile sanduku la link 5 za kijamii

            // [A] KUHUISHA DATA ZA PROFILE JUU KIONONI (HYDRATION)
            if (nameText) nameText.innerText = `@${msanii.usernameWasanii}`;
            if (roleBadge) roleBadge.innerText = msanii.hadhiYaAkaunti || "Msanii Chipukizi";
            if (storyText) storyText.innerText = msanii.shajaraYaMtaa || "Hujajaandika shajara ya mtaa ya leo bado...";
            
            // Inasoma Wilaya na Mtaa tu bila mkoa kama tulivyokubaliana kiume!
            if (locationText) locationText.innerHTML = `📍 <strong>${msanii.wilayaYako}</strong>, ${msanii.mtaaWako}`;

            // Pachika ile link fupi ya URL kutoka Cloudinary kwenye lile duara la kijani kishandisi
            if (avatarBox && msanii.pichaWasifuUrl !== "Haikupakizwa") {
                avatarBox.style.backgroundImage = `url('${msanii.pichaWasifuUrl}')`;
                avatarBox.style.backgroundSize = "cover";
                avatarBox.style.backgroundPosition = "center";
            }

            // Mwaga mahesabu ya ushindani kwenye maboksi ya namba
            if (followersCount) followersCount.innerText = msanii.idadiYaFollowers || 0;
            if (followingCount) followingCount.innerText = msanii.idadiYaFollowing || 0;
            if (likesCount) likesCount.innerText = msanii.zilizowekwaLikes ? msanii.zilizowekwaLikes.length : 0;
            if (votesCount) votesCount.innerText = msanii.totalPoints || 0; // Kura kutoka database

            // [B] 🔥 AKILI YA CHUMBA CHA LINK 5 ZA KIJAMII (DYNAMIC LINK ACTIVATOR)
            // Mtandao wa 1: TikTok
            amshaKitufeChaMitandao("jumanne-link-tiktok", links.tiktok, "#000000");
            // Mtandao wa 2: Instagram
            amshaKitufeChaMitandao("jumanne-link-instagram", links.instagram, "#e1306c");
            // Mtandao wa 3: YouTube
            amshaKitufeChaMitandao("jumanne-link-youtube", links.youtube, "#ff0000");
            // Mtandao wa 4: Facebook
            amshaKitufeChaMitandao("jumanne-link-facebook", links.facebook, "#1877f2");
            // Mtandao wa 5: LinkedIn
            amshaKitufeChaMitandao("jumanne-link-linkedin", links.linkedin, "#0077b5");

            // 🔥 MWALIKO WA KIPANDE CHA 3 CHA CHINI KINACHOFUATA (KUKAGUA VIDEO)
            amshaChujioLaVideoZaMsanii(data.videoZilizopo || []);

        } else {
            console.error("Mkwamo wa siri kutoka Server:", data.message);
            localStorage.clear(); // Safisha token feki
            window.location.href = "register-step1.html";
        }
    })
    .catch(error => {
        console.error("Dhoruba ya 4G! Server ya Node.js haipatikani mtaani:", error);
        amshaChujioLaVideoZaMsanii([]);
    });
}

// 🧠 KAZI YA NYONGEZA: Inawasha link na kubadili rangi ya ikoni ya Font Awesome kiotomatiki
function amshaKitufeChaMitandao(idYaElement, linkKutokaDatabase, rangiHalisiYaMtandao) {
    const kitufe = document.getElementById(idYaElement);
    if (!kitufe) return;

    if (linkKutokaDatabase && linkKutokaDatabase.trim() !== "") {
        kitufe.href = linkKutokaDatabase; // Pachika link halisi kwenye HTML href
        kitufe.style.color = rangiHalisiYaMtandao; // Washa rangi ya chama (TikTok, Insta n.k.)
        kitufe.style.pointerEvents = "auto"; // Ruhusu bofya ya shabiki
        kitufe.style.opacity = "1";
    } else {
        kitufe.href = "#";
        kitufe.style.color = "#444444"; // Rangi ya kijivu iliyofifia kama ipo tupu
        kitufe.style.pointerEvents = "none"; // Piga kufuli mtu asibonyeze bure
        kitufe.style.opacity = "0.4";
    }
}
// ==========================================================================
// INJINI YA VIDEO: CHUJIO LA DROO YA CHINI (JUMANNE EMPTY VIDEOS LOGIC)
// ==========================================================================
function amshaChujioLaVideoZaMsanii(videoZilizopo) {
    // Daka ma-ID mawili makubwa ya chujio la video tuliyoyachora HTML
    const videoGridBox = document.getElementById("jumanne-profile-video-grid");
    const emptyVideosBox = document.getElementById("jumanne-empty-videos");

    // 🔥 MTEGO WA CHUMA: Msanii akiwa hana hata video 1 kwenye database ya MongoDB Cloud
    if (!videoZilizopo || videoZilizopo.length === 0) {
        console.log("📢 Msanii hana video! Amsha boksi la jumanne-empty-videos mara moja.");
        
        if (videoGridBox) videoGridBox.style.display = "none";    // Ficha uwanja wa gridi ya video
        if (emptyVideosBox) emptyVideosBox.style.display = "block"; // Onyesha uwanja wa mwaliko wa kupost!
    } else {
        // 📱 MSANII AKIWA NA VIDEO: Ficha mwaliko na umwage video zote kwenye safu 3 za chuma
        if (emptyVideosBox) emptyVideosBox.style.display = "none";
        if (videoGridBox) {
            videoGridBox.style.display = "grid";
            videoGridBox.innerHTML = ""; // Safisha kioo cha maandishi ya 'Inapakia'

            videoZilizopo.forEach(video => {
                const divKadi = document.createElement("div");
                divKadi.className = "jumanne-video-item";
                divKadi.style.cssText = "position:relative; padding-top:130%; background:#111; overflow:hidden; border-radius:8px; border:1px solid #222;";
                
                // Inapachika picha ya juu ya lazima (Thumbnail (.jpg)) tuliyoiandika kwenye schema ya video
                divKadi.innerHTML = `
                
                    <img src="${video.pichaYaJuuUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; cursor:pointer;">
                    <div style="position:absolute; bottom:0; left:0; width:100%; background:linear-gradient(transparent, rgba(0,0,0,0.8)); padding:8px 5px; box-sizing:border-box; display:flex; justify-content:space-between; font-size:11px; color:#fff;">
                        <span>🔥 ${video.idadiYaViews || 0} Views</span>
                        <span>🗳️ ${video.idadiYaKura || 0} Kura</span>
                    </div>
                `;
                videoGridBox.appendChild(divKadi);
            });
        }
    }
}

// ==========================================================================
// 🚀 INAAMSHA RASMI MTAMBO MKUBWA WA PROFILE KIOONI KIVINJARI CHIKIFUNGUKA LEO 2026
// ==========================================================================
window.addEventListener("DOMContentLoaded", washaInjiniYaWasifuKitaifa);
