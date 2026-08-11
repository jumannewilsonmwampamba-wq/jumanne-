// A. SWICHI ZOTE ZA KIUSALAMA ZA RAM CHENYE ULINZI WA SEVA
let isFetchingVideos = false;
let sasaHiviPage = 1;
const kikomoChaVideoNne = 4; 
let dbIndexedAkiba = null;
const KIKOMO_CHA_VIDEO_AKIBA = 50; 
let drooYaKumbukumbuYaNyuma = {};
let mtafutajiMkuuWaMeneja = null; 


function amshaDrooYaIndexedDB() {
    const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

    ombiDuka.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
            const duka = db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
            duka.createIndex("index_tarehe", "tareheYaKuhifadhi", { unique: false });
            console.log("🗄️ 1. Jedwali la IndexedDB Feed Cache limesimikwa upya RAM...");
        }
    };

    ombiDuka.onsuccess = function(e) {
        dbIndexedAkiba = e.target.result;
        console.log("✅ 2. IndexedDB ipo imara na ipo macho kulinda bando kitaifa!");
        
        fungaGoliLaRefreshKienyeji();
    };

    ombiDuka.onerror = function() {
        console.error("❌ Mkwamo! Kivinjari kimegoma kufungua IndexedDB.");
        anzaKuswagaMlishoWaVideo();
    };
}


function fungaGoliLaRefreshKienyeji() {
    window.addEventListener("keydown", (e) => {
        if (e.key === "F5" || (e.ctrlKey && e.key === "r") || (e.metaKey && e.key === "r")) {
            e.preventDefault();
            console.warn("🛡️ Ulinzi: Refresh ya keyboard imepigwa kufuli!");
        }
    });

    window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
        e.returnValue = "Mkwamo! Je, una uhakika unataka kusitisha mlisho?";
    });
    
    console.log("🔒 3. Mageti yote ya kukata refresh kienyeji yameshafunga goli!");
    
    // Anza kuamsha mlisho sasa hivi
    anzaKuswagaMlishoWaVideo();
}

function hifadhiVideoKwenyeAkiba(videoZilizovutwa) {
    if (!dbIndexedAkiba || !videoZilizovutwa || videoZilizovutwa.length === 0) return;

    const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
    const duka = muamala.objectStore("jumannetok_feed_cache");

    // 1. SWAGA VIDEO MPYA NDANI YA DISKI YA SIMU
    videoZilizovutwa.forEach(video => {
        const dataYaKusave = {
            id: video._id, 
            videoData: video,
            tareheYaKuhifadhi: Date.now() 
        };
        duka.put(dataYaKusave);
    });

    
    const indexMuda = duka.index("index_tarehe");
    const ombiHesabu = duka.count();

    ombiHesabu.onsuccess = function() {
        const jumlaYaSasa = ombiHesabu.result;
        console.log(`📊 Idadi ya video zilizopo akiba kwenye diski ya simu: ${jumlaYaSasa}`);

        if (jumlaYaSasa > KIKOMO_CHA_VIDEO_AKIBA) {
            const idadiYaKufuta = jumlaYaSasa - KIKOMO_CHA_VIDEO_AKIBA;
            console.warn(`🛑 Tahadhari: Video zimevuka 50! Mtambo unafuta video ${idadiYaKufuta} za zamani kabisa...`);

            let hesabuYaKufutwa = 0;
            indexMuda.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor && hesabuYaKufutwa < idadiYaKufuta) {
                    const idYaKufuta = cursor.value.id;
                    duka.delete(idYaKufuta); // Futa video ya kwanza ya zamani ghafi
                    hesabuYaKufutwa++;
                    cursor.continue(); 
                }
            };
        }
    };

    muamala.oncomplete = function() {
        console.log("✅ Muamala wa IndexedDB umekamilika. Video 50 zinalindwa kwa chuma!");
    };

    muamala.onerror = function(err) {
        console.error("❌ Mkwamo wa kuandika data IndexedDB:", err);
    };
}


// HATUA YA 3: FETCH WITH ABORTCONTROLLER, UNDERDOG BOOST & LOCATION BIAS

function anzaKuswagaMlishoWaVideo() {
    if (mtafutajiMkuuWaMeneja) {
        mtafutajiMkuuWaMeneja.abort();
        console.warn("🛡️ Ulinzi wa Seva: Bomba la mtandao la zamani limekatwa hewani kulinda bando!");
    }

    mtafutajiMkuuWaMeneja = new AbortController();
    const ishaaraYaSiri = mtafutajiMkuuWaMeneja.signal;

    // Zuia trafiki ya marudio ya mpigo 
    if (isFetchingVideos) return;
    isFetchingVideos = true;
    
    // 🔥 PIGO LA KIJASUSI: Kwangua Token na Wilaya ya msanii kutoka LocalStorage!
    const tokenKuu = localStorage.getItem("jumannetok_jwt_token");
    const wilayaYaMtumiaji = localStorage.getItem("jumannetok_user_district") || "Ilala"; 

    const emptyFeedBox = document.getElementById("jumanne-empty-feed");
    const videoScrollBox = document.getElementById("jumanne-video-scroll-wrapper");

    console.log(`📡 Inavuta video nne nne... Page: ${sasaHiviPage} | Wilaya Preference: ${wilayaYaMtumiaji}`);

    // PIGA HODI NODE.JS PORT 5000 UKIWA UMEBEBA LOCATION BIAS NA UNDERDOG BOOST RECS
    fetch(`http://localhost:5000/api/videos/feed?page=${sasaHiviPage}&limit=${kikomoChaVideoNne}&wilaya=${encodeURIComponent(wilayaYaMtumiaji)}&underdog_boost=true`, {
        method: 'GET',
        signal: ishaaraYaSiri, 
        headers: {
            'Authorization': tokenKuu ? `Bearer ${tokenKuu}` : '',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        isFetchingVideos = false;

        if (data.success) {
            const videoZilizoruka = data.videoList || [];

            if (sasaHiviPage === 1 && videoZilizoruka.length === 0) {
                if (emptyFeedBox) emptyFeedBox.style.display = "flex";
                if (videoScrollBox) videoScrollBox.style.display = "none";
                return;
            }

            if (emptyFeedBox) emptyFeedBox.style.display = "none";
            if (videoScrollBox) videoScrollBox.style.display = "block";

            hifadhiVideoKwenyeAkiba(videoZilizoruka);
            choraVideoKwenyeKioo(videoZilizoruka);
            sasaHiviPage++;
        } else {
            isFetchingVideos = false;
        }
    })
    .catch(error => {
        isFetchingVideos = false;
        
        if (error.name === 'AbortError') {
            console.log("✅ Bomba limepiga abort salama. RAM ya simu na bando vimeokolewa upesi!");
            return; 
        }
        
        console.error("Dhoruba ya 4G! Seva haipatikani:", error);
        vutaVideoKutokaIndexedDBKamaMtandaoUmekufa();
    });
}

//  INJINI YA KUCHORA VIDEO KIONI + OPTIMISTIC REACTION TOGGLE
function choraVideoKwenyeKioo(videoZilizovutwa) 

// 🧠 KAZI YA NYONGEZA 1: INTERACTION YA CHUMA YA UNAPENDELEA (+1 / -1 LOCAL TOGGLE)
function pigaKeteYaUpvote(videoId, elementKitufe) {
    const counterText = elementKitufe.parentElement.querySelector(".upvote-counter-txt");
    if (!counterText) return;

    let kuraZaSasa = parseInt(counterText.innerText);

    // Mtego wa kubadili rangi na hesabu papo hapo kwa sekunde sifuri (Optimistic State Toggle)
    if (elementKitufe.style.color === "rgb(0, 230, 118)" || elementKitufe.style.color === "#00e676") {
        elementKitufe.style.color = "#ffffff"; // Zima kurudi nyeupe
        kuraZaSasa--;
        counterText.innerText = kuraZaSasa;
        console.log(`🏆 Unlike/Decrement -1 piga RAM kwa video ID: ${videoId}`);
    } else {
        elementKitufe.style.color = "#00e676"; // Washa rangi ya Kijani ya bendera ya TZ
        kuraZaSasa++;
        counterText.innerText = kuraZaSasa;
        console.log(`🏆 Like/Increment +1 piga RAM kwa video ID: ${videoId}`);
    }
}

//: INTERACTION YA HUPENDELEI (LOCAL DOWNVOTE SHIELD)
function pigaKeteYaDownvote(videoId, elementKitufe) {
    if (elementKitufe.style.color === "rgb(255, 82, 82)" || elementKitufe.style.color === "#ff5252") {
        elementKitufe.style.color = "#ffffff";
    } else {
        elementKitufe.style.color = "#ff5252"; // Washa rangi ya onyo nyekundu
        console.log(`nimekuelewa bos wang kwa sasa hivi nitakuletea video kama hiz: ${videoId}`);
    }
}

//PLUS BUTTON FOLLOWER ACTION LOCK
function pigaFollowKikomandoo(msaniiId, elementButton) {
    if (!msaniiId) return;
    elementButton.style.transform = "scale(0)"; 
    // Kitendo kikikamilika, kadi inayeyuka upesi kiononi
    setTimeout(() => { elementButton.style.display = "none"; }, 200);
    console.log(` Msanii ${msaniiId} amefuatwa salama!`);
}


// HATUA YA 12: DYNAMIC BOTTOM SHEET COMMENTS (2 PER CHUNK + AVATAR + USERNAME)
function funguaDrooYaComments(videoId) {
    let sasaHiviCommentPage = 1;
    const kikomoChaCommentMbili = 2;
    // 🔥 CHUJIO LA MBILI MBILI TU KULINDA RAM
    let isFetchingComments = false;

    let drooCommentBox = document.getElementById("jumanne-comment-sheet-popup");
    if (!drooCommentBox) {
        drooCommentBox = document.createElement("div");
        drooCommentBox.id = "jumanne-comment-sheet-popup";
        drooCommentBox.style.cssText = "position:fixed; bottom:0; left:0; width:100%; height:60vh; background:#111; border-top:2px solid #222; border-radius:15px 15px 0 0; z-index:10000; box-sizing:border-box; padding:15px; display:flex; flex-direction:column; transform:translateY(100%); transition:transform 0.3s ease-out; overflow:hidden;";
        document.body.appendChild(drooCommentBox);
    }

    drooCommentBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;">
            <span style="font-size:14px; font-weight:bold; color:#00e676;">Maoni ya Mtaani (Chunk of 2)</span>
            <button type="button" onclick="fungaDrooYaCommentsKikomandoo()" style="background:none; border:none; color:#ff5252; font-size:16px; font-weight:bold; cursor:pointer;">X</button>
        </div>
        <div id="jumanne-comments-loading-area" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
            <p style="text-align:center; margin-top:20px; font-size:12px; color:#666;">🔄 Inavuta maoni mbili mbili...</p>
        </div>
    `;

    setTimeout(() => { drooCommentBox.style.transform = "translateY(0)"; }, 10);

    // INJINI NDOGO YA KUVUTA MAONDO (SUB-QUERY PAGINATION)
    function vutaMzungukoWaCommentMbili() {
        if (isFetchingComments) return;
        isFetchingComments = true;
        const areaPakia = document.getElementById("jumanne-comments-loading-area");

        fetch(`http://localhost:5000/api/comments/video/${videoId}?page=${sasaHiviCommentPage}&limit=${kikomoChaCommentMbili}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            isFetchingComments = false;
            if (data.success && data.commentsList && data.commentsList.length > 0) {
                if (sasaHiviCommentPage === 1) areaPakia.innerHTML = ""; // Safisha neno la inapakia
                
                data.commentsList.forEach(c => {
                    const mstari = document.createElement("div");
                    mstari.style.cssText = "border-bottom:1px solid #1a1a1a; padding:10px 0; display:flex; align-items:flex-start; gap:10px;";
                    
                    // 🔥 PICHA YA MSANII ALIYECOMMET: Inatoka direct kwenye database
                    const avatar = (c.mshabikiId && c.mshabikiId.pichaWasifuUrl) ? c.mshabikiId.pichaWasifuUrl : "css/avatar.jpg";
                    
                    mstari.innerHTML = `
                        <!-- PICHA YA MDUARA KUSHOTO -->
                        <div style="width:32px; height:32px; border-radius:50%; background-image:url('${avatar}'); background-size:cover; background-position:center; flex-shrink:0; border:1px solid #333;"></div>
                        
                        <!-- MAJINA NA MAANDISHI KULIA -->
                        <div style="flex:1;">
                            <strong style="color:#00e676; font-size:12px; display:block;">@${c.utambulishoWaMshabiki}</strong>
                            <span style="color:#ddd; font-size:13px; display:block; margin-top:2px; word-break:break-word; line-height:1.4;">${c.maandishiYaMaoni}</span>
                        </div>
                    `;
                    areaPakia.appendChild(mstari);
                });
                sasaHiviCommentPage++; // Songa ukurasa mbele ya comment 2 zinazofuata
            } else if (sasaHiviCommentPage === 1) {
                areaPakia.innerHTML = `<p style="text-align:center; margin-top:20px; font-size:12px; color:#444;">Hakuna maoni bado.</p>
                        <!-- FOMU GHAFI YA KUTUMA COMMENT MPYA MTAANI -->
        <div style="display:flex; gap:8px; border-top:1px solid #222; padding-top:10px; margin-top:10px;">
            <input type="text" id="jumanne-new-comment-input" placeholder="Andika maoni hapa..." maxlength="100" style="flex:1; padding:10px; background:#000; border:1px solid #333; color:#fff; border-radius:6px; font-size:13px;">
            <button type="button" id="jumanne-send-comment-btn" onclick="LipuaCommentMpyaMtaani('${videoId}')" style="padding:10px 15px; background:#00e676; color:#000; border:none; border-radius:6px; font-weight:bold; font-size:13px; cursor:pointer;">Tuma</button>
        </div>
`;
            }
        })
        .catch(() => { isFetchingComments = false; });
    }

    // Washa mzunguko wa kwanza upesi mlangoni
    vutaMzungukoWaCommentMbili();

    // MTEGO WA KUSWIP CHINI NDANI YA DROO KUVUTA MBILI ZINGINE
    setTimeout(() => {
        const areaPakia = document.getElementById("jumanne-comments-loading-area");
        if (areaPakia) {
            areaPakia.addEventListener("scroll", () => {
                if (areaPakia.scrollTop + areaPakia.clientHeight >= areaPakia.scrollHeight - 10) {
                    vutaMzungukoWaCommentMbili();
                }
            });
        }
    }, 50);
}



// 🚀 INAAMSHA RASMI MTAMBO MKUBWA WA HOME FEED KIVINJARI CHIKIFUNGUKA
    const rulaYaMacho = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const vId = entry.target.getAttribute("data-video-id");
            let videoKazi = entry.target.querySelector(".jumanne-native-player");

            // [A] VIDEO IKIINGIA MBELE YA MACHO (HYDRATE / MEMORY RESTORATION WINDOW)
            if (entry.isIntersecting) {
                console.log(`📹 RAM Active: Video ya kadi ${vId} ipo mbele ya kioo...`);
                
                // MTEGO WA RESTORATION: Kama ilifutwa RAM, itengeneze upya upesi kiononi
                if (!videoKazi) {
                    const videoUrlSafi = entry.target.getAttribute("data-video-url");
                    const chumbaChaVideo = entry.target.querySelector(".jumanne-video-player-container");
                    if (chumbaChaVideo) {
                        chumbaChaVideo.innerHTML = `
                            <video class="jumanne-native-player" loop muted playsinline preload="metadata" ondblclick="pigaDoubleTapToLike(this)" style="width:100%; height:100%; object-fit:cover;">
                                <source src="${videoUrlSafi}" type="video/mp4">
                            </video>
                        `;
                        videoKazi = chumbaChaVideo.querySelector(".jumanne-native-player");
                    }
                }

                if (videoKazi) {
                    videoKazi.muted = !mfumoUmekataMuteKitaifa;
                    
                    // 🔥 REKODI YA SIRI: Kagua kama mtumiaji alishaiangalia hii video mwanzo akirudi juu
                    if (drooYaKumbukumbuYaNyuma[vId]) {
                        videoKazi.currentTime = drooYaKumbukumbuYaNyuma[vId]; // Rejesha sekunde aliyoishia!
                        console.log(`♻️ State Restored: Video ${vId} imerudishwa sekunde ya: ${drooYaKumbukumbuYaNyuma[vId]}`);
                    }
                    
                    videoKazi.play().catch(() => {});
                }
            } 
            // [B] VIDEO IKITOKA MBELE YA MACHO (DEHYDRATE / SAVE CURRENT TIME STATE)
            else {
                if (videoKazi) {
                    // 🔥 PIGO LA CHUMA: Save sekunde ya sasa hivi kabla ya kuinyonga video player RAM!
                    drooYaKumbukumbuYaNyuma[vId] = videoKazi.currentTime; 
                    
                    videoKazi.pause();
                    videoKazi.remove(); // Safisha RAM ya simu isipate moto
                    
                    const chumbaChaVideo = entry.target.querySelector(".jumanne-video-player-container");
                    if (chumbaChaVideo) chumbaChaVideo.innerHTML = ""; 
                    console.log(`♻️ RAM Recycled: Video ${vId} imefutwa, sekunde imehifadhiwa.`);
                }
            }
        });
    }, mipangilioObserver);


// HATUA YA 6: DYNAMIC CACHE VALIDATION SHIELD (HTTP DATA SAVER GATEWAY)
// ==========================================================================

function kaguaKamaKunaVideoMpyaDatabase() {
    const tokenKuu = localStorage.getItem("jumannetok_jwt_token");
    
    // Daka ID ya video ya mwisho kabisa tuliyoihifadhi kwenye diski ya simu
    if (!dbIndexedAkiba) return;
    
    const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
    const duka = muamala.objectStore("jumannetok_feed_cache");
    const indexMuda = duka.index("index_tarehe");
    
    indexMuda.openCursor(null, "prev").onsuccess = function(e) {
        const cursor = e.target.result;
        // Kama duka lipo tupu kabisa, piga fetch mnyofu bila ukingo
        if (!cursor) {
            anzaKuswagaMlishoWaVideo();
            return;
        }
        
        const idYaVideoYaMwisho = cursor.value.id;
        console.log(`📡 Inakagua ustawi wa server kwa kutumia kete ya video ya mwisho: ${idYaVideoYaMwisho}`);
        
        // PIGA PIGO FUPI LA SIRI LA KUNUSA UPDATE (HEAD-REQUEST SHIELD)
        fetch(`http://localhost:5000/api/videos/check-update?last_id=${idYaVideoYaMwisho}`, {
            method: 'GET',
            headers: {
                'Authorization': tokenKuu ? `Bearer ${tokenKuu}` : '',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            // 🔥 MTEGO WA CHUMA: Kama server ikisema hakuna video mpya (HTTP 304 au is_updated == false)
            if (res.status === 304) {
                console.log("🔒 Server imethibitisha: Hakuna video mpya kitaifa! Washa video za IndexedDB fasta.");
                vutaVideoKutokaIndexedDBKamaMtandaoUmekufa(); // Washa akiba kuokoa bando la mtumiaji
            } else {
                // Kama kuna mzigo mpya umepandishwa mtaani, piga bomba la fetch upesi
                console.log("🚀 Kuna video mpya database! Washa roketi ya kuvuta mzigo...");
                anzaKuswagaMlishoWaVideo();
            }
        })
        .catch(() => {
            // Kama mtandao ukikata kabisa kabisa, kimbilia kwenye akiba ya simu direct
            vutaVideoKutokaIndexedDBKamaMtandaoUmekufa();
        });
    };
}

// ==========================================================================
// HATUA YA 7: SCROLL THROTTLING, 800MS DEBOUNCE & ONE-FLIGHT LOCK
// ==========================================================================

// Variable ya siri ya kushikilia saa ya ulinzi ya sekunde sifuri hewani
let saaYaUlinziDebounce = null;

function amshaMtegoWaThrottlingKwenyeScroll() {
    const uwanjaWaScroll = document.getElementById("jumanne-video-scroll-wrapper");
    if (!uwanjaWaScroll) return;

    uwanjaWaScroll.addEventListener("scroll", () => {
        // [A] ONE-FLIGHT CONNECTION LOCK: Kama kuna ombi lipo njiani mtandao, piga kufuli!
        if (isFetchingVideos) {
            console.warn("🛡️ Lock Active: Mfumo umeziba ombi la marudio, subiri video za mwanzo zitue!");
            return;
        }

        // [B] AKILI YA 800MS DEBOUNCE: Kila mtumiaji anaposwip, futa saa ya zamani fasta
        clearTimeout(saaYaUlinziDebounce);

        // Washa saa mpya ya ulinzi. Mtambuko utaruka TU akitulia kwa milisekunde 800
        saaYaUlinziDebounce = setTimeout(() => {
            
            // Piga rula kujua kama mtumiaji amekaribia ukingo wa mwisho wa video 4
            const nafasiYaSasa = uwanjaWaScroll.scrollTop + uwanjaWaScroll.clientHeight;
            const urefuWaDiski = uwanjaWaScroll.scrollHeight;

            // Ukurasa ukibakiza pixel 100 tu ufikie mwisho, lipua roketi ya kuvuta video 4 zingine
            if (nafasiYaSasa >= urefuWaDiski - 100) {
                console.log("🚀 Mtumiaji ametulia mwisho wa reli! Lipua fetch ya video 4 zinazofuata...");
                anzaKuswagaMlishoWaVideo(); // Piga pigo safi Node.js Port 5000
            }

        }, 800); // Milisekunde 800 za chuma kulinda MongoDB Atlas isipate presha!
    });
}

// ==========================================================================
// HATUA YA 8: INJINI YA GESTURE - DOUBLE TAP TO LIKE & HEART ANIMATION POPUP
// ==========================================================================
function pigaDoubleTapToLike(elementVideo) {
    const kadiKuu = elementVideo.parentElement;
    if (!kadiKuu) return;

    console.log("💖 Double tap imegundulika juu ya kioo cha video!");

    // 1. AMRE YA CHUMA: Tafuta kile kitufe cha upvote pembeni na ukipige pigo la chuma
    const upvoteBtn = kadiKuu.querySelector(".upvote-btn");
    const counterText = kadiKuu.querySelector(".upvote-counter-txt");
    
    if (upvoteBtn && counterText) {
        // Kama mtumiaji alikuwa hajalike bado (rangi ikiwa nyeupe), gonga mchezo wa Like upesi!
        if (upvoteBtn.style.color !== "rgb(0, 230, 118)" && upvoteBtn.style.color !== "#00e676") {
            pigaKeteYaUpvote(upvoteBtn.getAttribute("onclick").split("'")[1], upvoteBtn);
        }
    }

    // 2. CHORA MOYO WA POPUP KATIKATI YA SKRINI (DYNAMIC ANIMATION BLIP)
    const popupContainer = kadiKuu.querySelector(".jumanne-heart-popup-container");
    if (popupContainer) {
        const moyoChuma = document.createElement("i");
        moyoChuma.className = "fas fa-heart";
        // Piga ma-style ghafi ya chuma kurusha moyo mkubwa mwekundu unaometa na kupot:condition ? true : falseea
        moyoChuma.style.cssText = "font-size: 80px; color: #ff5252; opacity: 0; transform: scale(0.5); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: inline-block;";
        
        popupContainer.appendChild(moyoChuma);

        // Blip ya kwanza: Amsha ukubwa na uwazi (Fade In & Scale Up)
        setTimeout(() => {
            moyoChuma.style.opacity = "0.9";
            moyoChuma.style.transform = "scale(1.2) rotate(-15deg)"; // Piga mgeuko kidogo wa kisanii
        }, 10);

        // Blip ya pili: Fifisha na upoteze moyo upesi (Fade Out & Fly Up) after milisekunde 500
        setTimeout(() => {
            moyoChuma.style.opacity = "0";
            moyoChuma.style.transform = "scale(0.8) translateY(-40px)";
            // Futa kabisa frame ili kulinda RAM ya simu isijae takataka
            setTimeout(() => { moyoChuma.remove(); }, 300);
        }, 500);
    }
}

// HATUA YA 6: DYNAMIC WEBSOCKET VOTE SYNC & BATCHING BUFFER ENGINE (LIVE)

let socketMrijaWaRedio = null;
let kikapuChaKuraBuffer = {};

function amshaMrijaWaWebSocketsKitaifa() {
    // 1. Kagua kama maktaba ya siri ya io ipo macho (Inasoma kutoka kwa Node.js Seva)
    if (typeof io === "undefined") {
        console.warn("📡 WebSocket Guard: Maktaba ya Socket.io haijafungwa bado seva ya nyuma.");
        return;
    }
    
    // 2. Fungua mawasiliano ya kudumu kwenda Node.js Port 5000 ya leo mwaka 2026
    socketMrijaWaRedio = io("http://localhost:5000");
    
    // 3. DNISHA SIKIO KUSIKILIZA PIGO LA KURA MPYA KUTOKA MKOANI
    socketMrijaWaRedio.on("kura_mpya_kitaifa", (dataKura) => {
        const { videoId, idadiYaKuraMpya } = dataKura;
        console.log(`📡 WebSocket Imepokea kura mpya hewani kwa video: ${videoId} -> ${idadiYaKuraMpya}`);
        
        kikapuChaKuraBuffer[videoId] = idadiYaKuraMpya;
        
        amshaMtamboWaKudondoshaKuraKwenyeKioo();
    });
}

let saaYaBufferTimer = null;

function amshaMtamboWaKudondoshaKuraKwenyeKioo() {
    // Kama saa ipo njiani tayari, iache itamaliza yenyewe kulinda processor ya simu
    if (saaYaBufferTimer) return;
    
    saaYaBufferTimer = setTimeout(() => {
        console.log("♻️ Buffer Flush: Mtambo unamwaga kura zote zilizokusanywa kwenda kiononi kwa mpigo mmoja!");
        
        // Pitia kila video ID iliyopo kwenye kikapu na uiswage mnyofu kioni
        for (const videoId in kikapuChaKuraBuffer) {
            const kuraSafi = kikapuChaKuraBuffer[videoId];
            
            // Tafuta kadi maalum ya video hiyo iliyopo kioone mwa skrini yako ya AnyCast
            const kadiHusika = document.querySelector(`[data-video-id="${videoId}"]`);
            if (kadiHusika) {
                const counterTxt = kadiHusika.querySelector(".upvote-counter-txt");
                if (counterTxt) {
                    counterTxt.innerText = kuraSafi; // Sasisha namba sekunde sifuri!
                    counterTxt.style.transform = "scale(1.2)"; // Mdundo mdogo wa kisanii
                    setTimeout(() => { counterTxt.style.transform = "scale(1)"; }, 150);
                }
            }
        }
        
        kikapuChaKuraBuffer = {}; 
        saaYaBufferTimer = null;
    }, 5000); 
}

// HATUA YA 12.5: ANTI-SPAM LOCK & LIVE NAUGHTY WORDS FILTER ENGINE
window.LipuaCommentMpyaMtaani = function(videoId) {
    const inputKazi = document.getElementById("jumanne-new-comment-input");
    const btnTuma = document.getElementById("jumanne-send-comment-btn");
    
    if (!inputKazi || !btnTuma || isFetchingVideos) return;

    const maandishiGhafi = inputKazi.value.trim();
    if (!maandishiGhafi) {
        alert("Mkwamo! Huwezi kutuma comment tupu mtaani.");
        return;
    }

    // Orodha ghafi ya maneno yaliyopigwa marufuku kimaadili nchini
    const dukaLaMatusi = ["kuma", "mume", "shoga", "malaya", "punda", "fala", "bwege"]; 
    
    let nenoChafuLipo = false;
    const manenoKazi = maandishiGhafi.toLowerCase().split(" ");
    
    for (let i = 0; i < manenoKazi.length; i++) {
        if (dukaLaMatusi.includes(manenoKazi[i])) {
            nenoChafuLipo = true;
            break;
        }
    }

    if (nenoChafuLipo) {
        alert("🛑 Usalama wa Maadili: Comment yako imezuiwa! Inajumuisha maneno yasiyo na nidhamu mtaani.");
        inputKazi.value = ""; // Safisha uwanja upesi
        return;
    }

    // [B] RATE LIMITER SHIELD: Piga kufuli la sekunde 3 kulinda Seva Port 5000
    console.log("🚀 Mfumo umerusha comment mpya safi kwenda Node.js Backend...");
    btnTuma.disabled = true;
    btnTuma.style.background = "#444444";
    btnTuma.innerText = "⏳ Wait";

  
    setTimeout(()=>{
        btnTuma.disabled = false;
        btnTuma.style.background = "#00e676";
        btnTuma.innerText = "Tuma";
        inputKazi.value = ""; // Safisha sanduku
        console.log("🔒 Lock Released: Shabiki ameruhusiwa kuandika tena comment ya pili.");
    }, 300000); 
};


//UNIVERSAL SHARE POPUP WITH FACEBOOK-STYLE CUSTOM SLUG LINK
window.funguaUniversalShareMenu = function(videoId, utambulishoWaMsanii) {
    console.log(`📤 Amsha droo ya chini ya Share kwa video ya @${utambulishoWaMsanii}`);

    let drooShareBox = document.getElementById("jumanne-share-sheet-popup");
    if (!drooShareBox) {
        drooShareBox = document.createElement("div");
        drooShareBox.id = "jumanne-share-sheet-popup";
        drooShareBox.style.cssText = "position:fixed; bottom:0; left:0; width:100%; background:#111111; border-top:2px solid #222; border-radius:15px 15px 0 0; z-index:10001; box-sizing:border-box; padding:20px; display:flex; flex-direction:column; gap:15px; transform:translateY(100%); transition:transform 0.3s ease-out;";
        document.body.appendChild(drooShareBox);
    }

   
       // Link fupi ya kisasa yenye mchanganyiko wa jina na namba kama Facebook!
    const hashNambaSiri = videoId.substring(videoId.length - 6);
    const jinaSafiSlug = utambulishoWaMsanii.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const linkYaKushare = `https://jumannetok.co.tz{jinaSafiSlug}-${hashNambaSiri}`;

    drooShareBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; padding-bottom:10px;">
            <strong style="font-size:14px; color:#00e676;">Sambaza Kipaji cha @${utambulishoWaMsanii}</strong>
            <button type="button" onclick="fungaDrooYaShareKikomandoo()" style="background:none; border:none; color:#ff5252; font-size:16px; font-weight:bold; cursor:pointer;">X</button>
        </div>
        
        <div style="display:flex; justify-content:space-around; align-items:center; padding:10px 0;">
            <a href="https://whatsapp.com{encodeURIComponent('Tazama kipaji hiki kipya JumanneTok: ' + linkYaKushare)}" target="_blank" style="text-align:center; text-decoration:none; color:#fff; font-size:12px;">
                <i class="fab fa-whatsapp" style="font-size:28px; color:#25d366; display:block; margin-bottom:5px;"></i>WhatsApp
            </a>
            <a href="https://facebook.com{encodeURIComponent(linkYaKushare)}" target="_blank" style="text-align:center; text-decoration:none; color:#fff; font-size:12px;">
                <i class="fab fa-facebook" style="font-size:28px; color:#1877f2; display:block; margin-bottom:5px;"></i>Facebook
            </a>
            <a href="https://linkedin.com{encodeURIComponent(linkYaKushare)}" target="_blank" style="text-align:center; text-decoration:none; color:#fff; font-size:12px;">
                <i class="fab fa-linkedin" style="font-size:28px; color:#0077b5; display:block; margin-bottom:5px;"></i>LinkedIn
            </a>
            <div onclick="pigaNakalaYaLinkMtaani('${linkYaKushare}', 'TikTok')" style="text-align:center; color:#fff; font-size:12px; cursor:pointer;">
                <i class="fab fa-tiktok" style="font-size:28px; color:#000000; display:block; margin-bottom:5px; background:#fff; border-radius:50%; width:28px; height:28px; line-height:28px;"></i>TikTok
            </div>
            <div onclick="pigaNakalaYaLinkMtaani('${linkYaKushare}', 'YouTube')" style="text-align:center; color:#fff; font-size:12px; cursor:pointer;">
                <i class="fab fa-youtube" style="font-size:28px; color:#ff0000; display:block; margin-bottom:5px;"></i>YouTube
            </div>
        </div>

        <div id="jumanne-owner-delete-zone" style="text-align:center; margin-top:10px; border-top:1px solid #222; padding-top:15px; display:none;">
            <button type="button" onclick="LipuaOnyoLaKufutaVideo('${videoId}')" style="width:100%; padding:10px; background:#ff5252; color:#fff; border:none; border-radius:6px; font-weight:bold; font-size:13px; cursor:pointer;">
                <i class="fas fa-trash-alt"></i> Futa Video Hii Milele Database
            </button>
        </div>
    `;

    setTimeout(() => { drooShareBox.style.transform = "translateY(0)"; }, 10);

    const tokenKuu = localStorage.getItem("jumannetok_jwt_token");
    if (tokenKuu) {
        try {
            const tokenVipande = tokenKuu.split('.');
            const dataYaToken = JSON.parse(atob(tokenVipande[1]));
            const kadiKazi = document.querySelector(`[data-video-id="${videoId}"]`);
            if (kadiKazi) {
                const idYaMmilikiMuda = kadiKazi.getAttribute("data-artist-id");
                if (dataYaToken.id === idYaMmilikiMuda) {
                    document.getElementById("jumanne-owner-delete-zone").style.display = "block";
                }
            }
        } catch (e) { console.error("Mkwamo wa kusoma Token:", e); }
    }
};

window.pigaNakalaYaLinkMtaani = function(link, jinaLaMtandao) {
    navigator.clipboard.writeText(link).then(() => {
        alert(`Ushindi! Link ya video imenakiliwa kwenye simu yako. Mfumo unafungua ${jinaLaMtandao}, nenda ka-paste direct kwenye wasifu wako upesi!`);
        fungaDrooYaShareKikomandoo();
    }).catch(() => { alert("Mkwamo! Kivinjari kimegoma kunakili link."); });
};

window.fungaDrooYaShareKikomandoo = function() {
    const box = document.getElementById("jumanne-share-sheet-popup");
    if (box) {
        box.style.transform = "translateY(100%)";
        setTimeout(() => { box.remove(); }, 300);
    }
};

window.LipuaOnyoLaKufutaVideo = function(videoId) {
    if (confirm("Mkuu, una uhakika unataka kufuta video hii? !")) {
        const tokenKuu = localStorage.getItem("jumannetok_jwt_token");
        fetch(`http://localhost:5000/api/videos/futa/${videoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenKuu}`, 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Video imefutwa salama!");
                window.location.reload();
            } else { alert(`Mkwamo: ${data.message}`); }
        });
    }
};

//LIVE VIEWPORT RETENTION (VIPAJI UNAVYOPENDELEA)
let saaYaKipajiRetention = null;

function amshaMtegoWaKipajiRetention(kadiElement) {
    const ainaYaKipaji = kadiElement.getAttribute("data-talent-type");
    if (!ainaYaKipaji) return;

    clearTimeout(saaYaKipajiRetention);

    saaYaKipajiRetention = setTimeout(() => {
        console.log(`🎰 AI Preference Sync: Mtumiaji anakazia macho kipaji cha [${ainaYaKipaji}]. Hifadhi tabia hii!`);
        localStorage.setItem("jumannetok_favorite_talent", ainaYaKipaji);
    }, 8000); // Sekunde 8 kamili za chuma (Retention Hold Gate)
}



// 🚀 INAAMSHA RASMI MTAMBO MKUBWA WA HOME FEED KIVINJARI CHIKIFUNGUKA
window.addEventListener("DOMContentLoaded", () => {
    amshaDrooYaIndexedDB(); 
    amshaMtamboWaKuchezaVideoKwaMacho();
    amshaMtegoWaKipajiRetention(entry.target);

    amshaMtegoWaThrottlingKwenyeScroll(); 
    amshaMrijaWaWebSocketsKitaifa();
});



