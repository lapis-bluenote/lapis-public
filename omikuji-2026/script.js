/**
 * Lapis AI Omikuji 2026
 * Classic Royal Kawaii Edition
 */

// FORTUNE DATA - Loaded from external JSON
let FORTUNE_DATA = null;

// DOM Elements
const appLayout = document.getElementById('app-layout');
const characterPane = document.getElementById('character-pane');
const contentPane = document.getElementById('content-pane');
const omikujiCard = document.getElementById('omikuji-card');
const inputView = document.getElementById('input-view');
const loadingView = document.getElementById('loading-view');
const resultView = document.getElementById('result-view');
const petalsContainer = document.getElementById('petals-container');

// Result Elements
const resultGrade = document.getElementById('result-grade');
const msgWork = document.getElementById('msg-work');
const msgLife = document.getElementById('msg-life');
const msgFun = document.getElementById('msg-fun');
const msgItem = document.getElementById('msg-item');
const msgGeneral = document.getElementById('msg-general');

// Character Images (Unified)
const lapisWaiting = document.getElementById('lapis-waiting');
const lapisResult = document.getElementById('lapis-result');

const loadingSvg = document.getElementById('loading-svg');

let isProcessing = false;

// UTILITIES
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// INITIALIZATION - Load fortune data
async function loadFortuneData() {
    try {
        const response = await fetch('data/fortune.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        FORTUNE_DATA = await response.json();
        console.log('Fortune data loaded successfully');
    } catch (error) {
        console.error('Failed to load fortune data:', error);
        // Keep FORTUNE_DATA as null to trigger error handling
        FORTUNE_DATA = null;
    }
}

// Show error message to user
function showErrorMessage() {
    // Hide all views
    inputView.classList.add('hidden');
    loadingView.classList.add('hidden');
    resultView.classList.add('hidden');

    // Show error view (reuse loading view for simplicity)
    loadingView.classList.remove('hidden');
    loadingView.classList.add('flex');
    loadingView.innerHTML = `
        <div class="flex flex-col items-center gap-6 py-12">
            <p class="text-lg font-bold text-coral">データの読み込みに失敗しました</p>
            <p class="text-sm text-sumi opacity-70 text-center px-4">
                おみくじデータを読み込めませんでした。<br>
                ページを再読み込みしてください。
            </p>
            <button id="btn-reload" class="btn-retry mt-4">
                ページを再読み込み
            </button>
        </div>
    `;

    // Add reload button handler
    const btnReload = document.getElementById('btn-reload');
    if (btnReload) {
        btnReload.addEventListener('click', () => {
            window.location.reload();
        });
    }
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', async () => {
    // Load fortune data
    await loadFortuneData();

    // Bind event handlers
    const btnDrawOmikuji = document.getElementById('btn-draw-omikuji');
    const btnReset = document.getElementById('btn-reset');

    if (btnDrawOmikuji) {
        btnDrawOmikuji.addEventListener('click', drawOmikuji);
    }

    if (btnReset) {
        btnReset.addEventListener('click', resetApp);
    }
});

// LOGIC
function determineFortune() {
    const r = Math.random();
    // 15% Great, 30% Good, 50% Normal, 5% Bad
    // 0.00 - 0.15 : Great
    // 0.15 - 0.45 : Good
    // 0.45 - 0.95 : Normal
    // 0.95 - 1.00 : Bad

    if (r < 0.15) return FORTUNE_DATA.great;
    if (r < 0.45) return FORTUNE_DATA.good;
    if (r < 0.95) return FORTUNE_DATA.normal;
    return FORTUNE_DATA.bad;
}

// ANIMATION
function spawnPetals() {
    petalsContainer.style.display = 'block';
    petalsContainer.innerHTML = '';

    // Color classes corresponding to CSS variables
    const colorClasses = ['petal-pink', 'petal-gold', 'petal-white'];

    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'petal';

        // Add random color class
        const colorClass = getRandom(colorClasses);
        p.classList.add(colorClass);

        // Position and size
        p.style.left = Math.random() * 100 + '%';
        const size = Math.random() * 8 + 8;
        p.style.width = size + 'px';
        p.style.height = size + 'px';

        // Opacity
        p.style.opacity = Math.random() * 0.5 + 0.3;

        // Animation
        const duration = Math.random() * 3 + 3;
        const delay = Math.random() * 2;
        p.style.animation = `fallRotate ${duration}s linear infinite`;
        p.style.animationDelay = delay + 's';

        petalsContainer.appendChild(p);
    }
}

function stopPetals() {
    petalsContainer.style.display = 'none';
    petalsContainer.innerHTML = '';
}

// MAIN ACTION
async function drawOmikuji() {
    if (isProcessing) return;

    // Check if data is loaded
    if (!FORTUNE_DATA) {
        showErrorMessage();
        return;
    }

    isProcessing = true;

    // Check if mobile or PC (simple viewport width check)
    const isMobile = window.innerWidth < 768;

    // 1. UI Transition (Input -> Loading)
    inputView.classList.add('hidden');
    inputView.classList.remove('fade-in-up');

    if (isMobile) {
        // Mobile: Hide character and card, show loading SVG in character pane
        lapisWaiting.classList.add('hidden');
        lapisResult.classList.add('hidden');
        loadingSvg.classList.remove('hidden');
        loadingSvg.classList.add('flex');
        // Hide the entire omikuji card (white box) on mobile during loading
        omikujiCard.classList.add('hidden');
    } else {
        // PC: Keep waiting character visible, show loading view with SVG in content pane
        loadingView.classList.remove('hidden');
        loadingView.classList.add('flex');
    }

    // 2. Start Animation
    spawnPetals();

    // 3. Wait (Simulate calculation & Bridge Time)
    await new Promise(r => setTimeout(r, 2000));

    // 4. Generate Result
    const fortune = determineFortune();

    // 5. Render Result
    resultGrade.textContent = fortune.rank;

    msgWork.textContent = getRandom(fortune.work);
    msgLife.textContent = getRandom(fortune.life);
    msgFun.textContent = getRandom(fortune.fun);
    msgItem.textContent = getRandom(fortune.items);
    msgGeneral.textContent = getRandom(fortune.general);

    // 6. UI Transition (Loading -> Result)

    if (isMobile) {
        // Mobile: Sequential animation - character first, then card
        // Step 1: Hide loading SVG and show waiting character
        loadingSvg.classList.add('hidden');
        loadingSvg.classList.remove('flex');
        lapisWaiting.classList.remove('hidden');

        // Step 2: Show result character with subtle fade-in animation
        lapisWaiting.classList.add('opacity-0'); // Hide waiting
        lapisResult.classList.remove('hidden');
        lapisResult.classList.remove('opacity-0'); // Show result
        lapisResult.classList.add('fade-in-character-subtle'); // Add subtle animation

        // Step 3: After character animation starts, show card with delay
        setTimeout(() => {
            omikujiCard.classList.remove('hidden');
            resultView.classList.remove('hidden');
            resultView.classList.add('fade-in-up');
        }, 400); // Shorter delay for better flow
    } else {
        // PC: Hide waiting character, then fade in result character naturally
        // Hide loading view
        loadingView.classList.add('hidden');
        loadingView.classList.remove('flex');

        // Step 1: Hide waiting character and omikuji card instantly
        lapisWaiting.classList.add('opacity-0');
        omikujiCard.style.opacity = '0'; // Briefly hide entire card

        // Step 2: After a longer pause, fade in result character and show card
        setTimeout(() => {
            lapisResult.classList.remove('opacity-0'); // Fade in result

            // Change layout alignment to top for result view on PC
            appLayout.classList.remove('md:items-center');
            appLayout.classList.add('md:items-start');

            // Also align character pane to start (top)
            characterPane.classList.remove('items-center');
            characterPane.classList.add('items-start');

            // Remove top padding from content pane for result view
            contentPane.classList.remove('md:py-12');
            contentPane.classList.add('md:py-0');

            // Show result view and restore card opacity simultaneously
            resultView.classList.remove('hidden');
            resultView.classList.add('fade-in-up');
            omikujiCard.style.opacity = '1'; // Restore card visibility at same time
        }, 800); // Longer pause after hiding waiting character for visible transition
    }

    isProcessing = false;
    setTimeout(stopPetals, 2000);
}

function resetApp() {
    // Scroll to top if impactful
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide loading SVG, reset to waiting character
    loadingSvg.classList.add('hidden');
    loadingSvg.classList.remove('flex');
    lapisResult.classList.add('opacity-0');
    lapisResult.classList.remove('fade-in-character-subtle'); // Remove animation class
    lapisWaiting.classList.remove('opacity-0');
    lapisWaiting.classList.remove('hidden');

    // Reset layout alignment to center
    appLayout.classList.remove('md:items-start');
    appLayout.classList.add('md:items-center');

    // Reset character pane alignment to center
    characterPane.classList.remove('items-start');
    characterPane.classList.add('items-center');

    // Reset content pane padding
    contentPane.classList.remove('md:py-0');
    contentPane.classList.add('md:py-12');

    // Reset omikuji card opacity
    omikujiCard.style.opacity = '1';

    resultView.classList.add('hidden');
    resultView.classList.remove('fade-in-up'); // Remove animation class
    inputView.classList.remove('hidden');
    inputView.classList.add('fade-in-up');

    isProcessing = false;
}
