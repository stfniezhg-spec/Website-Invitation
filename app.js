// ==========================================
// LUXE AFTER DARK - INVITATION LOGIC
// High-Fidelity VIP Customizer & Sound System
// ==========================================

// Global state of the VIP invitation details
let appState = {
    passcode: "BEER",
    name: "Agness",
    monogram: "A",
    heroWidth: "380",
    heroHeight: "320",
    age: "21",
    headline: "Agness' 21st Birthday",
    polaroidCaption: "she was born ready",
    introText: "Hello birthday girl! ✨\nThe main character is turning 21.\n\nSince you’ve always wanted a club night worth remembering, we decided to play fairy godmother and make your wish come true. ✨\n\nGet ready for a night of flashing lights, loud music, and unforgettable memories. Dress glamorous, bold, and effortlessly hot.\n\nAnd… don’t forget your glass slippers. 🪩\nAttendance is mandatory.",
    date: "Monday, June 1st, 2026",
    time: "9:00 PM MYT - LATE",
    place: "TBC",
    address: "TBC",
    mapsLink: "https://maps.google.com",
    dressMale: "",
    dressFemale: "",
    agendaList: "8:00 PM | Chauffeur Arrives\n9:00 PM | Champagne Greeting\n9:30 PM | VIP Lounge Kickoff\n10:30 PM | High-Fashion DJ Set\n12:00 AM | Cake & Toast 🥂",
    outroTitle: "LOCK IN YOUR NIGHT",
    outroSubtitle: "Don't be late. ave the drama for the dance floor!",
    rsvpContact: "+601172474764"
};

// Web Audio API context for premium synthesized game sounds
let audioCtx = null;
let synthInterval = null;

// Initialize the Application
window.addEventListener("DOMContentLoaded", () => {
    // 1. Check for URL parameters first
    parseUrlState();

    // 2. Render State to UI
    syncStateToUI();

    // 3. Setup Navigation & Slide Event Listeners
    setupNavigation();

    // 4. Setup Interactive Champagne Toast
    setupChampagneReveal();

    // 5. Setup Admin Panels disabled
    // setupAdminPanel();

    // 6. Setup Interactive Soundboard & Synthesizer
    setupSoundboard();

    // 7. Setup RSVP Button Mechanics
    setupRSVP();

    // 8. Start Countdown
    startCountdown();
});

// ==========================================
// STATE MANAGEMENT & URL ENCODING/DECODING
// ==========================================

// Parse encoded state from the URL query parameter 'p'
function parseUrlState() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('p');
    
    if (encodedData) {
        try {
            // Decodes UTF-8 base64 securely
            const decodedJson = decodeURIComponent(escape(atob(encodedData)));
            const parsedState = JSON.parse(decodedJson);
            
            // Merge decoded values into current state
            appState = { ...appState, ...parsedState };
        } catch (e) {
            console.error("Failed to decode custom party invitation link: ", e);
        }
    }
}

// Generate shareable URL with encoded state
function generateShareableLink() {
    const encodedState = btoa(unescape(encodeURIComponent(JSON.stringify(appState))));
    const shareableUrl = `${window.location.origin}${window.location.pathname}?p=${encodedState}`;
    return shareableUrl;
}

// Synchronize application state to both read-only elements and custom editor inputs
function syncStateToUI() {
    // Monogram Letter dynamically loaded from monogram
    const initial = (appState.monogram && appState.monogram.trim()) ? appState.monogram.trim().substring(0, 2).toUpperCase() : "A";
    const displayMonogram = document.getElementById("display-monogram-initial");
    if (displayMonogram) displayMonogram.innerText = initial;
    const displayMonogramFooter = document.getElementById("display-monogram-initial-footer");
    if (displayMonogramFooter) displayMonogramFooter.innerText = initial;

    // Hero image dimensions
    const heroImg = document.querySelector(".hero-image");
    if (heroImg) {
        heroImg.style.setProperty("--hero-width", (appState.heroWidth || "380") + "px");
    }

    // Display elements updates
    document.getElementById("display-headline").innerText = appState.headline;
    const displayAge = document.getElementById("display-age");
    if (displayAge) displayAge.innerText = appState.age;
    document.getElementById("display-polaroid-caption").innerText = appState.polaroidCaption;
    document.getElementById("display-intro-text").innerText = appState.introText;
    
    document.getElementById("display-date").innerText = appState.date;
    document.getElementById("display-time").innerText = appState.time;
    document.getElementById("display-place").innerText = appState.place;
    document.getElementById("display-address").innerText = appState.address;
    document.getElementById("display-maps-link").href = appState.mapsLink;
    
    const displayDressMale = document.getElementById("display-dress-male");
    if (displayDressMale) displayDressMale.innerText = appState.dressMale;
    const displayDressFemale = document.getElementById("display-dress-female");
    if (displayDressFemale) displayDressFemale.innerText = appState.dressFemale;

    document.getElementById("display-outro-title").innerText = appState.outroTitle;
    document.getElementById("display-outro-subtitle").innerText = appState.outroSubtitle;

    // Render Agenda Timeline
    const vibeListContainer = document.getElementById("display-agenda-list");
    vibeListContainer.innerHTML = "";
    appState.agendaList.split("\n").forEach(item => {
        if (item.trim()) {
            const li = document.createElement("li");
            li.className = "timeline-item";
            
            // Check for separator | or -
            let timeStr = "";
            let textStr = item;
            
            const separators = ["|", " - ", " : "];
            for (let sep of separators) {
                if (item.includes(sep)) {
                    const parts = item.split(sep);
                    timeStr = parts[0].trim();
                    textStr = parts.slice(1).join(sep).trim();
                    break;
                }
            }
            
            if (timeStr) {
                li.innerHTML = `
                    <span class="timeline-time font-serif">${timeStr}</span>
                    <span class="timeline-dot"></span>
                    <span class="timeline-text font-serif">${textStr}</span>
                `;
            } else {
                li.innerHTML = `
                    <span class="timeline-time font-serif">✦</span>
                    <span class="timeline-dot"></span>
                    <span class="timeline-text font-serif">${textStr}</span>
                `;
            }
            vibeListContainer.appendChild(li);
        }
    });

    // Admin Customizer inputs removed from DOM
}

// ==========================================
// INTERACTIVE SLIDE CONTROLLER (PAGINATION)
// ==========================================
let currentSlideIndex = 0;
const slides = document.querySelectorAll(".slide");
const navBadges = document.querySelectorAll(".nav-badge");

function setupNavigation() {
    navBadges.forEach(badge => {
        badge.addEventListener("click", () => {
            const targetIndex = parseInt(badge.getAttribute("data-slide"));
            goToSlide(targetIndex);
        });
    });

    // Keyboard Arrow navigation support
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            if (currentSlideIndex < slides.length - 1) goToSlide(currentSlideIndex + 1);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
        }
    });

    // Mobile Swipe gesture support
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener("touchstart", (e) => {
        touchStartY = e.changedTouches[0].screenY;
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener("touchend", (e) => {
        touchEndY = e.changedTouches[0].screenY;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, false);

    function handleSwipeGesture() {
        const deltaY = touchEndY - touchStartY;
        const deltaX = touchEndX - touchStartX;

        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.closest(".modal-content"))) {
            return; // Skip page transition
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > 60) {
                if (deltaX < 0 && currentSlideIndex < slides.length - 1) {
                    goToSlide(currentSlideIndex + 1);
                } else if (deltaX > 0 && currentSlideIndex > 0) {
                    goToSlide(currentSlideIndex - 1);
                }
            }
        } else {
            if (Math.abs(deltaY) > 60) {
                if (deltaY < 0 && currentSlideIndex < slides.length - 1) {
                    goToSlide(currentSlideIndex + 1);
                } else if (deltaY > 0 && currentSlideIndex > 0) {
                    goToSlide(currentSlideIndex - 1);
                }
            }
        }
    }
}

function goToSlide(index) {
    slides[currentSlideIndex].classList.remove("active");
    navBadges[currentSlideIndex].classList.remove("active");
    
    currentSlideIndex = index;
    
    slides[currentSlideIndex].classList.add("active");
    navBadges[currentSlideIndex].classList.add("active");
    
    // Play subtle classy navigation click
    playSynthSound(480, "sine", 0.05, 0.03);
}

// ==========================================
// AUDIO SYNTHESIZER ENGINE (WEB AUDIO API)
// ==========================================
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

// Plays synthesized sound using raw sound oscillators (zero external dependencies)
function playSynthSound(frequency, type = "sine", duration = 0.15, gainVal = 0.1) {
    try {
        initAudioContext();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio context blocked.");
    }
}

// Special synthesized crystal clink chime sound for fine champagne coupes!
function playCrystalClinkSound() {
    try {
        initAudioContext();
        const now = audioCtx.currentTime;
        
        // 1. Primary Bell Strike (High Resonant Sine)
        const primaryOsc = audioCtx.createOscillator();
        const primaryGain = audioCtx.createGain();
        primaryOsc.type = "sine";
        primaryOsc.frequency.setValueAtTime(1100, now); // 1.1 kHz high chime
        primaryGain.gain.setValueAtTime(0.18, now);
        primaryGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95); // Shimmering long tail decay

        // 2. High Overtone Strike (Harmonic Ring)
        const overtoneOsc = audioCtx.createOscillator();
        const overtoneGain = audioCtx.createGain();
        overtoneOsc.type = "sine";
        overtoneOsc.frequency.setValueAtTime(2200, now); // Double frequency octave harmonics
        overtoneGain.gain.setValueAtTime(0.08, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        // Connections
        primaryOsc.connect(primaryGain);
        primaryGain.connect(audioCtx.destination);
        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(audioCtx.destination);

        primaryOsc.start(now);
        primaryOsc.stop(now + 1.0);
        overtoneOsc.start(now);
        overtoneOsc.stop(now + 0.75);
    } catch(e) {
        console.warn("Web audio context failed or blocked: ", e);
    }
}

// Synthesizer loops: Smooth deep house bass pulse
function startSynthBeat() {
    if (synthInterval) clearInterval(synthInterval);
    
    let noteIndex = 0;
    // A soft, chic lounge deep house bass progression
    const houseBassNotes = [73.42, 73.42, 0, 73.42, 82.41, 82.41, 0, 98.00, 65.41, 65.41, 0, 65.41, 73.42, 73.42, 0, 0]; // D2, E2, G2, C2, D2 low bass notes
    
    synthInterval = setInterval(() => {
        const hasBass = document.getElementById("toggle-bass").checked;
        const soundBtn = document.getElementById("sound-toggle-btn");
        const soundEnabled = soundBtn.querySelector("i").classList.contains("fa-volume-high");

        if (hasBass && soundEnabled) {
            // Soft sine/triangle bass note for luxury vibes
            const note = houseBassNotes[noteIndex % houseBassNotes.length];
            if (note > 0) {
                playSynthSound(note, "triangle", 0.4, 0.12);
            }
        }
        noteIndex++;
    }, 380); // Classy 78 BPM deep house pulse
}

function stopSynthBeat() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
}

// ==========================================
// INTERACTIVE CHAMPAGNE REVEAL ENGINE
// ==========================================
function setupChampagneReveal() {
    const coupes = document.querySelectorAll(".champagne-coupe");
    const intelBoxes = document.querySelectorAll(".intel-box");

    coupes.forEach(coupe => {
        coupe.addEventListener("click", () => {
            const revealTarget = coupe.getAttribute("data-reveal");
            const targetBox = document.getElementById(`intel-${revealTarget}`);

            // Manage active/selected state visually
            coupes.forEach(c => c.classList.remove("selected"));
            coupe.classList.add("selected");

            if (coupe.classList.contains("sunk")) {
                // If already poured, just switch details tab to look back
                intelBoxes.forEach(box => box.classList.remove("active"));
                if (targetBox) {
                    targetBox.classList.add("active");
                }
                playSynthSound(600, "sine", 0.05, 0.03); // Play small clink
                return;
            }

            // 1. Mark as poured/full
            coupe.classList.add("sunk");

            // 2. Play beautiful crystal clink sound
            playCrystalClinkSound();

            // 3. Spawn golden champagne sparkle confetti on glass coordinates
            const rect = coupe.getBoundingClientRect();
            confetti({
                particleCount: 25,
                spread: 35,
                origin: { 
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                },
                colors: ['#dfba73', '#f4dfb5', '#ffffff', '#b8924b'],
                shapes: ['circle']
            });

            // 4. Slide-out detailed clipboard
            intelBoxes.forEach(box => box.classList.remove("active"));
            if (targetBox) {
                targetBox.classList.add("active");
            }
        });
    });
}

// ==========================================
// DYNAMIC SOUNDBOARD & SOUND CONTROLLER
// ==========================================
function setupSoundboard() {
    const soundToggle = document.getElementById("sound-toggle-btn");
    const icon = soundToggle.querySelector("i");

    soundToggle.addEventListener("click", () => {
        if (icon.classList.contains("fa-volume-xmark")) {
            icon.classList.remove("fa-volume-xmark");
            icon.classList.add("fa-volume-high");
            soundToggle.classList.add("active");
            initAudioContext();
            
            startSynthBeat();
            playCrystalClinkSound();
        } else {
            icon.classList.remove("fa-volume-high");
            icon.classList.add("fa-volume-xmark");
            soundToggle.classList.remove("active");
            stopSynthBeat();
        }
    });

    // Spotlight Toggle Switch
    const neonSwitch = document.getElementById("toggle-neon");
    neonSwitch.addEventListener("change", () => {
        playSynthSound(500, "sine", 0.05, 0.03);
        if (neonSwitch.checked) {
            document.body.style.filter = "none";
            document.querySelectorAll(".gold-glow").forEach(el => {
                el.style.textShadow = "";
            });
        } else {
            // Dim spotlight glow
            document.querySelectorAll(".gold-glow").forEach(el => {
                el.style.textShadow = "none";
            });
        }
    });

    // Sparkler Pop Toggle Switch
    const crowdSwitch = document.getElementById("toggle-crowd");
    crowdSwitch.addEventListener("change", () => {
        if (crowdSwitch.checked) {
            // Play champagne pop chime combo
            playCrystalClinkSound();
            setTimeout(() => playSynthSound(900, "sine", 0.3, 0.08), 80);
            setTimeout(() => playSynthSound(1400, "sine", 0.25, 0.05), 180);
        }
    });
}

// ==========================================
// RSVP YES/NO TICKETING SYSTEM
// ==========================================
function setupRSVP() {
    const yesBtn = document.getElementById("rsvp-yes-btn");
    const noBtn = document.getElementById("rsvp-no-btn");
    const noWayModal = document.getElementById("no-way-modal");
    const noWayCloseTrigger = document.getElementById("no-way-close-trigger");

    yesBtn.addEventListener("click", () => {
        // Play premium party chime synthesis chord
        playSynthSound(587.33, "sine", 0.15, 0.12); // D5
        setTimeout(() => playSynthSound(739.99, "sine", 0.15, 0.12), 100); // F#5
        setTimeout(() => playSynthSound(880.00, "sine", 0.15, 0.12), 200); // A5
        setTimeout(() => playSynthSound(1100.00, "sine", 0.35, 0.12), 300); // C#6
        
        // Shiny gold champagne-colored confetti splash
        const end = Date.now() + (2 * 1000);
        const colors = ['#dfba73', '#ffffff', '#b8924b', '#f4dfb5'];

        (function frame() {
            confetti({
                particleCount: 6,
                angle: 60,
                spread: 60,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 6,
                angle: 120,
                spread: 60,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        // Open custom SMS/WhatsApp text response link
        setTimeout(() => {
            const encodedMsg = encodeURIComponent(`YES, absolutely! I am coming! 🥂✨`);
            let contactLink = `https://wa.me/${appState.rsvpContact}?text=${encodedMsg}`;
            if (isNaN(appState.rsvpContact)) {
                contactLink = appState.rsvpContact;
            }
            window.open(contactLink, "_blank");
        }, 1500);
    });

    // When clicking NO, open funny Naah No Way popup
    noBtn.addEventListener("click", () => {
        playSynthSound(180, "sawtooth", 0.25, 0.12);
        noWayModal.classList.add("active");
    });

    // Close pop up and loop options back when clicking the picture
    noWayCloseTrigger.addEventListener("click", () => {
        playSynthSound(500, "sine", 0.05, 0.03);
        noWayModal.classList.remove("active");
    });
    
    noWayModal.addEventListener("click", (e) => {
        if (e.target === noWayModal) {
            playSynthSound(500, "sine", 0.05, 0.03);
            noWayModal.classList.remove("active");
        }
    });
}

// ==========================================
// LUXURY countdown CLOCK
// ==========================================
function startCountdown() {
    function updateClock() {
        let targetDate = new Date("2026-06-01T21:00:00");
        
        try {
            // Clean up ordinal suffixes (1st, 2nd, etc.)
            let dateStr = appState.date.replace(/(\d+)(st|nd|rd|th)/g, "$1");
            
            // Try to extract time (e.g. 9:00 PM)
            const timeMatch = appState.time.match(/(\d+:\d+\s*(?:AM|PM))/i);
            const timeStr = timeMatch ? timeMatch[1] : "9:00 PM";
            
            const parsed = Date.parse(`${dateStr} ${timeStr}`);
            if (!isNaN(parsed)) {
                targetDate = new Date(parsed);
            }
        } catch (e) {
            console.warn("Error parsing target date/time: ", e);
        }

        const now = new Date();
        const difference = targetDate - now;

        if (difference <= 0) {
            document.getElementById("party-countdown").innerHTML = `<h3 class="font-serif" style="color:var(--color-champagne-gold)">THE NIGHT OUT HAS COMMENCED! 🥂</h3>`;
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// ==========================================
// ADMIN CONTROL PANEL & SECURE CUSTOMIZER
// ==========================================
// Admin panel and customization features disabled
function setupAdminPanel() {}
