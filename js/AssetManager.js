const IMAGE_ASSET_VERSION = '20261019-1';

// 资源管理器
class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loaded = false;
        this.failedImages = [];
        this.loadAttempt = 0;
        
        // 分类音量设置
        this.volumeSettings = this.loadVolumeSettings();
    }
    
    // 从 localStorage 加载音量设置
    loadVolumeSettings() {
        const saved = localStorage.getItem('fnae_volume_settings');
        if (saved) {
            return JSON.parse(saved);
        }
        // 默认音量设置
        return {
            master: 0.7,
            gameBg: 0.7,
            menuMusic: 0.7,
            jumpscare: 0.7,
            ventCrawling: 0.7
        };
    }
    
    // 保存音量设置
    saveVolumeSettings() {
        localStorage.setItem('fnae_volume_settings', JSON.stringify(this.volumeSettings));
    }
    
    // 设置特定类型的音量
    setVolume(type, volume) {
        this.volumeSettings[type] = Math.max(0, Math.min(1, volume));
        this.saveVolumeSettings();
    }
    
    // 获取特定类型的音量
    getVolume(type) {
        return this.volumeSettings[type] || 0.7;
    }
    
    // 获取所有音量设置
    getAllVolumes() {
        return this.volumeSettings;
    }

    async loadAssets(onProgress) {
        // 获取当前脚本的基础路径
        const basePath = this.getBasePath();
        
        // 从 Unity 提取的资源
        const imagePaths = {
            office: `${basePath}assets/images/original.png`,
            cam1: `${basePath}assets/images/Cam1.png`,
            cam2: `${basePath}assets/images/Cam2.png`,
            cam3: `${basePath}assets/images/Cam3.png`,
            cam4: `${basePath}assets/images/Cam4.png`,
            cam5: `${basePath}assets/images/Cam5.png`,
            cam6: `${basePath}assets/images/Cam6.png`,
            cam7: `${basePath}assets/images/Cam7.png`,
            cam8: `${basePath}assets/images/Cam8.png`,
            cam9: `${basePath}assets/images/Cam9.png`,
            cam10: `${basePath}assets/images/Cam10.png`,
            cam11: `${basePath}assets/images/Cam11.png`,
            jumpscare: `${basePath}assets/images/jump.png`, // EP跳杀图片
            trumpJumpscare: `${basePath}assets/images/jumptrump.png`, // Trump跳杀图片
            hawkingJumpscare: `${basePath}assets/images/scaryhawking.png`, // Hawking跳杀图片
            goldenStephen: `${basePath}assets/images/goldenstephen.png`,
            winScreen: `${basePath}assets/images/winscreen.png`,
            cameraMap: `${basePath}assets/images/FNAE-Map-layout.png`,
            epBack: `${basePath}assets/images/enemyep1.png`,
            epFront: `${basePath}assets/images/ep1.png`,
            epClose: `${basePath}assets/images/ep4.png`,
            epBackClose: `${basePath}assets/images/enemyep4.png`,
            trumpCharacter: `${basePath}assets/images/jumptrump.png`,
            menuBackground: `${basePath}assets/images/menubackground.png`,
            scaryHawk: `${basePath}assets/images/scaryhawk.png`,
            scaryEp: `${basePath}assets/images/scaryep.png`,
            scaryTrump: `${basePath}assets/images/scarytrump.png`,
            cutscene: `${basePath}assets/images/cutscene.png`,
            ventIcon: `${basePath}assets/images/fa3.png`,
            star: `${basePath}assets/images/star.png`,
        };

        const soundPaths = {
            static: `${basePath}assets/sounds/Static_sound.ogg`,
            staticLoop: `${basePath}assets/sounds/Static_sound.ogg`,
            vents: `${basePath}assets/sounds/vents.ogg`,
            ventCrawling: `${basePath}assets/sounds/vent-crawling.mp3`,
            jumpscare: `${basePath}assets/sounds/jumpcare.ogg`,
            hawkingJumpscare: `${basePath}assets/sounds/stephenjumpscare.ogg`, // Hawking跳杀音效
            blip: `${basePath}assets/sounds/Blip.ogg`,
            win: `${basePath}assets/sounds/winmusic.ogg`,
            chimes: `${basePath}assets/sounds/chimes.ogg`,
            crank1: `${basePath}assets/sounds/Crank1.ogg`,
            crank2: `${basePath}assets/sounds/Crank2.ogg`,
            ekg: `${basePath}assets/sounds/ekg.wav`,
            hawking_shock: `${basePath}assets/sounds/hawking_shock.wav`,
            goldenstephenscare: `${basePath}assets/sounds/goldenstephenscare.ogg`, // Golden 霍金音效
        };

        const imageAliases = {
            trumpCharacter: 'trumpJumpscare'
        };
        this.loaded = false;
        this.failedImages = [];
        const loadAttempt = ++this.loadAttempt;
        const imageEntries = Object.entries(imagePaths);
        let completedImages = 0;
        let nextImageIndex = 0;

        const loadNextImage = async () => {
            while (nextImageIndex < imageEntries.length) {
                const [key, path] = imageEntries[nextImageIndex++];
                const aliasedImage = this.images[imageAliases[key]];

                if (aliasedImage?.complete && aliasedImage.naturalWidth > 0) {
                    this.images[key] = aliasedImage;
                    completedImages++;
                    if (typeof onProgress === 'function') {
                        onProgress(completedImages / imageEntries.length * 100);
                    }
                    continue;
                }

                if (this.images[key]?.complete && this.images[key].naturalWidth > 0) {
                    completedImages++;
                    if (typeof onProgress === 'function') {
                        onProgress(completedImages / imageEntries.length * 100);
                    }
                    continue;
                }

                try {
                    this.images[key] = await this.loadImageWithRetry(path, loadAttempt);
                } catch (error) {
                    this.failedImages.push({ key, path });
                    console.warn(`Failed to load image after retries: ${path}`, error);
                }

                completedImages++;
                if (typeof onProgress === 'function') {
                    onProgress(completedImages / imageEntries.length * 100);
                }
            }
        };

        await Promise.all([
            loadNextImage(),
            loadNextImage()
        ]);

        if (this.failedImages.length > 0) {
            throw new Error(`Could not load required images: ${this.failedImages.map(({ key }) => key).join(', ')}`);
        }

        // 加载音频
        for (const [key, path] of Object.entries(soundPaths)) {
            try {
                this.sounds[key] = new Audio(path);
            } catch (e) {
                console.warn(`Failed to load sound: ${path}`);
            }
        }

        this.loaded = true;
    }

    async loadImageWithRetry(src, loadAttempt) {
        const maxRetries = 2;
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.loadImage(src, attempt === 0 && loadAttempt === 1 ? 0 : loadAttempt * 10 + attempt);
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
                }
            }
        }

        throw lastError;
    }

    getBasePath() {
        // 检查是否在 iframe 中
        const currentPath = window.location.pathname;
        if (currentPath.includes('/FNAE-HTML5-1.2.2-fix/')) {
            return '/FNAE-HTML5-1.2.2-fix/';
        }
        // 本地开发环境
        return './';
    }

    loadImage(src, retryToken = 0) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const imageUrl = new URL(src, window.location.href);
            imageUrl.searchParams.set('v', IMAGE_ASSET_VERSION);
            if (retryToken > 0) {
                imageUrl.searchParams.set('retry', retryToken.toString());
            }

            const timeoutId = setTimeout(() => {
                img.src = '';
                reject(new Error(`Image load timed out: ${src}`));
            }, 20000);
            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };
            img.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Image request failed: ${src}`));
            };
            img.src = imageUrl.href;
        });
    }

    playSound(key, loop = false, volume = 1.0) {
        if (this.sounds[key]) {
            this.sounds[key].loop = loop;
            
            // 根据音效类型应用对应的音量
            let categoryVolume = this.volumeSettings.master;
            
            if (key === 'music' || key === 'music3') {
                categoryVolume *= this.volumeSettings.menuMusic;
            } else if (key === 'jumpscare' || key === 'hawkingJumpscare' || key === 'trumpJumpscare') {
                categoryVolume *= this.volumeSettings.jumpscare;
            } else if (key === 'ventCrawling') {
                categoryVolume *= this.volumeSettings.ventCrawling;
            } else if (key === 'vents' || key === 'ambience' || key === 'staticLoop' || key === 'static' || key === 'blip' || key === 'Blip') {
                // 游戏背景音乐：包括通风口声音、静态噪声、摄像机切换声等
                categoryVolume *= this.volumeSettings.gameBg;
            }
            
            this.sounds[key].volume = Math.min(1, volume * categoryVolume);
            this.sounds[key].play();
        }
    }

    stopSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].pause();
            this.sounds[key].currentTime = 0;
        }
    }

    setSoundVolume(key, volume) {
        if (this.sounds[key]) {
            this.sounds[key].volume = volume;
        }
    }
}
