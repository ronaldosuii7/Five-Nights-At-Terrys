// 恐怖脸闪烁效果
const getBasePath = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/FNAE-HTML5-1.2.2-fix/')) {
        return '/FNAE-HTML5-1.2.2-fix/';
    }
    return './';
};

const basePath = getBasePath();
let normalBackground = `${basePath}assets/images/menubackground.png`;
let scaryBackgrounds = [
    `${basePath}assets/images/scaryhawk.png`,
    `${basePath}assets/images/scaryep.png`,
    `${basePath}assets/images/scarytrump.png`
];

let scaryFaceInterval = null;
const preloadedImages = {};

// 预加载所有背景图片
function preloadBackgrounds() {
    if (!game || !game.assets.loaded) return;

    normalBackground = game.assets.images.menuBackground.src;
    scaryBackgrounds = [
        game.assets.images.scaryHawk.src,
        game.assets.images.scaryEp.src,
        game.assets.images.scaryTrump.src
    ];
    preloadedImages.normal = game.assets.images.menuBackground;
    preloadedImages['scary-0'] = game.assets.images.scaryHawk;
    preloadedImages['scary-1'] = game.assets.images.scaryEp;
    preloadedImages['scary-2'] = game.assets.images.scaryTrump;
}

function startScaryFaceFlicker() {
    if (scaryFaceInterval) {
        stopScaryFaceFlicker();
    }
    
    const mainMenu = document.getElementById('main-menu');
    if (!mainMenu) return;
    
    scaryFaceInterval = setInterval(() => {
        if (Math.random() < 0.1) {
            const bgIndex = Math.floor(Math.random() * 3);
            const scaryBg = scaryBackgrounds[bgIndex];
            
            mainMenu.style.backgroundImage = `url('${scaryBg}')`;
            
            const hideDelay = 50 + Math.random() * 150;
            setTimeout(() => {
                mainMenu.style.backgroundImage = `url('${normalBackground}')`;
            }, hideDelay);
        }
    }, 100);
}

function stopScaryFaceFlicker() {
    if (scaryFaceInterval) {
        clearInterval(scaryFaceInterval);
        scaryFaceInterval = null;
        
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.style.backgroundImage = `url('${normalBackground}')`;
        }
    }
}
