// Make floating bar draggable

// Background Settings logic
class BGSettings {
    constructor(image = null, opacity = 0.5, scale = 100, posX = 50, posY = 50) {
        this.image = image;
        this.opacity = opacity;
        this.scale = scale;
        this.posX = posX;
        this.posY = posY;
    }

    static fromObject(obj) {
        if (!obj) return null;
        return new BGSettings(
            obj.image,
            obj.opacity !== undefined ? obj.opacity : 0.5,
            obj.scale || 100,
            obj.posX !== undefined ? obj.posX : 50,
            obj.posY !== undefined ? obj.posY : 50
        );
    }
}

// project data wrapper
class Project {
    constructor(content = "", font = "", size = "", lineHeight = undefined, theme = "light", timestamp = "", bgSettings = null, guidePos = 400, maxLen = 80) {
        this.content = content;
        this.font = font;
        this.size = size;
        this.lineHeight = lineHeight;
        this.theme = theme;
        this.timestamp = timestamp;
        this.bgSettings = bgSettings instanceof BGSettings ? bgSettings : BGSettings.fromObject(bgSettings);
        this.guidePos = guidePos;
        this.maxLen = maxLen;
    }

    toJSON() {
        // called by JSON.stringify automatically
        return {
            content: this.content,
            font: this.font,
            size: this.size,
            lineHeight: this.lineHeight,
            theme: this.theme,
            timestamp: this.timestamp,
            bgSettings: this.bgSettings,
            guidePos: this.guidePos,
            maxLen: this.maxLen
        };
    }

    static fromObject(obj) {
        if (!obj) return new Project();
        return new Project(
            obj.content || "",
            obj.font || "",
            obj.size || "",
            obj.lineHeight,
            obj.theme || "light",
            obj.timestamp || "",
            obj.bgSettings || null,
            obj.guidePos !== undefined ? obj.guidePos : 400,
            obj.maxLen !== undefined ? obj.maxLen : 80
        );
    }

    toJson() {
        return JSON.stringify(this, null, 2);
    }
}

function makeFloatingBarDraggable() {
    const bar = document.getElementById('floatingBar');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    bar.addEventListener('mousedown', function(e) {
        // Allow drag if clicked on bar itself or .grab-area-hint or its children
        const grabArea = e.target.closest('.grab-area-hint');
        if (e.target !== bar && !grabArea) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = bar.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        bar.style.transition = 'none';
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        bar.style.left = (startLeft + dx) + 'px';
        bar.style.top = (startTop + dy) + 'px';
        bar.style.transform = 'none';
    });
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            bar.style.transition = '';
            document.body.style.userSelect = '';
        }
    });
}
const editor = document.getElementById('editor');
const fontSelect = document.getElementById('fontSelect');
const fontSize = document.getElementById('fontSize');
const guidePosInput = document.getElementById('guidePos');
const maxLenInput = document.getElementById('maxLen');
const guideRule = document.getElementById('guideRule');

const palette = document.getElementById('symbolPalette');
const paletteButtons = document.getElementById('palette-buttons');
const lineHeight = document.getElementById('lineHeight');
const byteCounter = document.getElementById('byteCounter');

// Background parameters
const bgModal = document.getElementById('bgModal');
const bgPreview = document.getElementById('bgPreview');
const bgPreviewPlaceholder = document.getElementById('bgPreviewPlaceholder');
const bgInput = document.getElementById('bgInput');
const bgOpacity = document.getElementById('bgOpacity');
const bgScale = document.getElementById('bgScale');
const bgPosX = document.getElementById('bgPosX');
const bgPosY = document.getElementById('bgPosY');
const bgLayer = document.getElementById('editorBgLayer');

const SYMBOLS = [
    '█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', 
    '─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼',
    '═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬',
    '╱', '╲', '╳', '▲', '▼', '◀', '▶', '●', '○', '◆', '◇',
    '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'
];

const TOP_QUICK_SYMBOLS = ['█', '▓', '▒', '░', '─', '│'];

function init() {
    localeHelper = new LocaleHelper();
    const locale = localeHelper;

    const desktopMinWidth = 1024; // Standard threshold for desktop
    const hasAlerted = sessionStorage.getItem('deviceAlertShown');

    if (window.innerWidth < desktopMinWidth && !hasAlerted) {
        alert(locale.msg('deviceAlert'));
        sessionStorage.setItem('deviceAlertShown', 'true');
    }

    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // give the editor initial value from localStorage if present
    const saved = localStorage.getItem('utf8JisArtProject');
    if (saved) {
        try {
            const project = Project.fromObject(JSON.parse(saved));
            editor.value = project.content;
            fontSelect.value = project.font;
            fontSize.value = project.size;
            if (project.lineHeight && lineHeight) lineHeight.value = project.lineHeight;
            if (guidePosInput) guidePosInput.value = project.guidePos;
            if (maxLenInput) maxLenInput.value = project.maxLen;
            
            if (project.theme === 'dark') {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }

            // Ensure background settings are applied if they exist in the project data
            if (project.bgSettings) {
                applyBgSettingsFromData(project.bgSettings);
            }
        } catch (e) {
            console.warn('failed to parse autosaved project', e);
        }
    }

    // Build Side Palette
    SYMBOLS.forEach(sym => {
        const btn = document.createElement('button');
        btn.className = "w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 transition-colors font-mono";
        btn.innerText = sym;
        btn.onclick = () => insertAtCursor(sym);
        palette.appendChild(btn);
    });

    // Build Top Quick Bar
    // TOP_QUICK_SYMBOLS.forEach(sym => {
    //     const btn = document.createElement('button');
    //     btn.className = "w-8 h-8 flex items-center justify-center text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors font-mono";
    //     btn.innerText = sym;
    //     btn.onclick = () => insertAtCursor(sym);
    //     paletteButtons.appendChild(btn);
    // });

    // Set initial state
    updateFont();
    updateThemeIcons();
    updateByteCount();
    updateGuide();
    makeFloatingBarDraggable();
    
    // Ensure the background layer matches the editor on resize
    if (window.ResizeObserver && editor && bgLayer) {
        const ro = new ResizeObserver(() => {
            if (currentBgImage) {
                syncBgLayerSync();
            }
        });
        ro.observe(editor);
    }
}

function syncBgLayerSync() {
    if (!bgLayer || !editor) return;
    
    // Both are now contained in a relative parent with 100% size
    // We just ensure the bgLayer dimensions match the textarea's current bounding box
    const rect = editor.getBoundingClientRect();
    bgLayer.style.width = rect.width + 'px';
    bgLayer.style.height = rect.height + 'px';
}

function insertAtCursor(text) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const max = maxLenInput ? parseInt(maxLenInput.value) : 0;
    
    if (max > 0) {
        const currentText = editor.value;
        const lastNewline = currentText.lastIndexOf('\n', start - 1);
        const nextNewline = currentText.indexOf('\n', start);
        
        const lineContent = currentText.substring(
            lastNewline === -1 ? 0 : lastNewline + 1,
            nextNewline === -1 ? currentText.length : nextNewline
        );

        const lineContentAfter = lineContent.substring(0, start - (lastNewline === -1 ? 0 : lastNewline + 1)) + 
                                 text + 
                                 lineContent.substring(end - (lastNewline === -1 ? 0 : lastNewline + 1));

        if (lineContentAfter.length > max) {
            return;
        }
    }

    const currentText = editor.value;
    editor.value = currentText.substring(0, start) + text + currentText.substring(end);
    editor.focus();
    editor.selectionStart = editor.selectionEnd = start + text.length;
    updateByteCount();
    saveToLocalStorage();
}

function updateFont() {
    editor.style.fontFamily = fontSelect.value;
    editor.style.fontSize = fontSize.value + 'px';
    if (lineHeight) {
        editor.style.lineHeight = lineHeight.value;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    updateThemeIcons();
}

function updateGuide() {
    if (!guideRule || !guidePosInput) return;
    const pos = parseInt(guidePosInput.value);
    if (!isNaN(pos)) {
        guideRule.style.left = pos + 'px';
        if (pos > 0) {
            guideRule.classList.remove('hidden');
        } else {
            guideRule.classList.add('hidden');
        }
    }
}

function updateMaxLen() {
    saveToLocalStorage();
}

if (editor) {
    editor.addEventListener('beforeinput', (e) => {
        // console.log('beforeinput event:', e.inputType, e.data);

        if (!maxLenInput) return;
        const max = parseInt(maxLenInput.value);
        if (isNaN(max) || max <= 0) return;

        // Ignore pasted text to allow importing art from external sources
        if (e.inputType === 'insertFromPaste') {
            return;
        }

        let textToInsert = "";
        if (e.inputType === 'insertText') {
            textToInsert = e.data;
        } else {
            return;
        }

        if (!textToInsert) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const currentText = editor.value;

        // Simulation for single character typing
        const lastNewline = currentText.lastIndexOf('\n', start - 1);
        const nextNewline = currentText.indexOf('\n', start);
        
        const lineContent = currentText.substring(
            lastNewline === -1 ? 0 : lastNewline + 1,
            nextNewline === -1 ? currentText.length : nextNewline
        );

        const lineContentAfter = lineContent.substring(0, start - (lastNewline === -1 ? 0 : lastNewline + 1)) + 
                                 textToInsert + 
                                 lineContent.substring(end - (lastNewline === -1 ? 0 : lastNewline + 1));

        if (lineContentAfter.length > max) {
            e.preventDefault();
        }
    });
}

function updateThemeIcons() {
    const isDark = document.body.classList.contains('dark');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const visualContainer = document.getElementById('editorVisualContainer');
    
    if (sunIcon) sunIcon.classList.toggle('hidden', !isDark);
    if (moonIcon) moonIcon.classList.toggle('hidden', isDark);

    // Update the visual container colors
    if (visualContainer) {
        visualContainer.style.backgroundColor = isDark ? '#1f2937' : '#ffffff';
        visualContainer.style.borderColor = isDark ? '#374151' : '#e5e7eb';
        
        // If we have a background image, we can optionally make the container background 
        // a semi-transparent version of its current color to let the image show through
        // but now the image is *inside* the container, so we just want the container
        // to have the right background. The alpha logic below is for the OVERLAY
        // which we now apply to the editor textarea if needed.
    }

    // body background color is used for the page outside of Tailwind
    document.body.style.backgroundColor = isDark ? '#171717' : '#f5f5f5';

    // ensure the textarea remains transparent and shifts text color
    if (editor) {
        editor.style.backgroundColor = 'transparent';
        editor.style.color = isDark ? '#f5f5f5' : '#1f2937';

        // Apply an overlay transparency to the TEXTAREA itself to act as 
        // the "contrast blocker" for the background image underneath.
        if (currentBgImage) {
            const opacity = parseFloat(bgOpacity.value);
            const r = isDark ? 31 : 255;
            const g = isDark ? 41 : 255;
            const b = isDark ? 55 : 255;
            // The overlay alpha on the textarea helps with text readability
            const bgAlpha = 0.75; 
            editor.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${bgAlpha})`;
        }
    }
}

// File Management
function exportTxt() {
    downloadFile(editor.value, 'artwork.txt', 'text/plain');
}

const indicator = document.getElementById('savingIndicator');

let localeHelper; // global reference for updates

const toggleSavingIndicator = (show) => {
    if (!indicator) return;
    if (show) {
        indicator.classList.remove('opacity-0', 'pointer-events-none');
        indicator.classList.add('opacity-100');
    } else {
        indicator.classList.remove('opacity-100');
        indicator.classList.add('opacity-0', 'pointer-events-none');
    }
};

function updateByteCount() {
    if (!byteCounter || !editor) return;
    const text = editor.value;
    const bytes = new TextEncoder().encode(text).length;
    
    // Fallback to English if localeHelper isn't ready, otherwise use localized string
    const format = localeHelper ? localeHelper.msg('byteCount') : "{count} Bytes";
    byteCounter.textContent = format.replace('{count}', bytes);
}

const displayFailedAutoSave = () => {
    if (!indicator) return;
    const textEl = indicator.querySelector('.text-sm');

    indicator.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
    textEl.textContent = 'Failed!';

    setTimeout(() => { 
        indicator.classList.remove('bg-red-100', 'text-red-800', 'border-red-300');
        textEl.textContent = 'Saving...';
    }, 1100);
}

// auto save support
let autoSaveTimer = null;

// Background Image Logic
let currentBgImage = null;

function openBgModal() {
    bgModal.classList.remove('hidden');
}

function closeBgModal() {
    bgModal.classList.add('hidden');
}

function handleBgUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Restrictions: PNG/JPG, < 3MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        alert(localeHelper ? localeHelper.msg('errImgType') : "Only PNG and JPG/JPEG are allowed.");
        event.target.value = '';
        return;
    }

    if (file.size > 3 * 1024 * 1024) {
        alert(localeHelper ? localeHelper.msg('errImgSize') : "Image must be < 3MB.");
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentBgImage = e.target.result;
        bgPreview.style.backgroundImage = `url(${currentBgImage})`;
        bgPreviewPlaceholder.classList.add('hidden');
        updateBgPreview();
    };
    reader.readAsDataURL(file);
}

function updateBgPreview() {
    const opacity = bgOpacity.value;
    const scale = bgScale.value;
    const posX = bgPosX.value;
    const posY = bgPosY.value;

    document.getElementById('opacityVal').textContent = Math.round(opacity * 100) + '%';
    document.getElementById('scaleVal').textContent = scale + '%';
    document.getElementById('posXVal').textContent = posX + '%';
    document.getElementById('posYVal').textContent = posY + '%';

    if (currentBgImage) {
        bgPreview.style.opacity = opacity;
        bgPreview.style.backgroundSize = `${scale}%`;
        bgPreview.style.backgroundPosition = `${posX}% ${posY}%`;
    }
}

function clearBg() {
    currentBgImage = null;
    bgPreview.style.backgroundImage = 'none';
    bgPreviewPlaceholder.classList.remove('hidden');
    bgInput.value = '';
    
    // reset values
    bgOpacity.value = 0.5;
    bgScale.value = 100;
    bgPosX.value = 50;
    bgPosY.value = 50;
    updateBgPreview();
}

function applyBgSettings() {
    const settings = {
        image: currentBgImage,
        opacity: parseFloat(bgOpacity.value),
        scale: parseInt(bgScale.value),
        posX: parseInt(bgPosX.value),
        posY: parseInt(bgPosY.value)
    };
    
    applyBgSettingsToEditor(settings);
    // Explicitly update theme icons to apply the alpha overlay
    updateThemeIcons();
    saveToLocalStorage();
    closeBgModal();
}

function applyBgSettingsToEditor(settings) {
    if (!settings || !settings.image) {
        if (bgLayer) {
            bgLayer.style.backgroundImage = 'none';
            bgLayer.style.opacity = '0';
        }
        editor.style.backgroundImage = 'none';
        editor.style.backgroundColor = '';
        currentBgImage = null;
        updateThemeIcons();
        return;
    }

    currentBgImage = settings.image;
    
    if (bgLayer) {
        bgLayer.style.backgroundImage = `url(${settings.image})`;
        bgLayer.style.backgroundRepeat = 'no-repeat';
        
        // Use fixed pixel sizing for the background to prevent it Resizing when the window/textarea resizes.
        // We use a reference width (e.g., 1000px) as the 100% scale basis.
        const baseWidth = 1000; 
        const pixelWidth = (baseWidth * settings.scale) / 100;
        bgLayer.style.backgroundSize = `${pixelWidth}px auto`;
        
        bgLayer.style.backgroundPosition = `${settings.posX}% ${settings.posY}%`;
        bgLayer.style.backgroundOrigin = 'padding-box';
        bgLayer.style.opacity = settings.opacity;
        
        // Match the textarea dimensions/position relative to its container
        syncBgLayerSync();
    } else {
        // Fallback for safety
        editor.style.backgroundImage = `url(${settings.image})`;
        editor.style.backgroundRepeat = 'no-repeat';
        editor.style.backgroundAttachment = 'local';
        editor.style.backgroundSize = `${settings.scale}%`;
        editor.style.backgroundPosition = `${settings.posX}% ${settings.posY}%`;
    }
    
    // We update the background color to include opacity logic
    updateThemeIcons(); 
}

/** 
 * This helper populates the modal and applies settings from a data object 
 */
function applyBgSettingsFromData(settings) {
    if (!settings) return;
    
    currentBgImage = settings.image;
    bgOpacity.value = settings.opacity !== undefined ? settings.opacity : 0.5;
    bgScale.value = settings.scale || 100;
    bgPosX.value = settings.posX !== undefined ? settings.posX : 50;
    bgPosY.value = settings.posY !== undefined ? settings.posY : 50;

    if (currentBgImage) {
        bgPreview.style.backgroundImage = `url(${currentBgImage})`;
        bgPreviewPlaceholder.classList.add('hidden');
    }
    
    updateBgPreview();
    applyBgSettingsToEditor(settings);
}

function saveToLocalStorage() {
    try {
        const bg = currentBgImage ? new BGSettings(
            currentBgImage,
            parseFloat(bgOpacity.value),
            parseInt(bgScale.value),
            parseInt(bgPosX.value),
            parseInt(bgPosY.value)
        ) : null;

        const project = new Project(
            editor.value,
            fontSelect.value,
            fontSize.value,
            lineHeight ? lineHeight.value : undefined,
            document.body.classList.contains('dark') ? 'dark' : 'light',
            new Date().toISOString(),
            bg,
            guidePosInput ? parseInt(guidePosInput.value) : 400,
            maxLenInput ? parseInt(maxLenInput.value) : 80
        );
        localStorage.setItem('utf8JisArtProject', project.toJson());
        return true;
    } catch (e) {
        console.warn('save to localStorage failed', e);
        displayFailedAutoSave();
        return false;
    }
}

function scheduleAutoSave() {
    // clear previous timer and set a new one for 5 seconds later
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        toggleSavingIndicator(true);
        saveToLocalStorage();
        autoSaveTimer = null;
        setTimeout(() => toggleSavingIndicator(false), 1000);
    }, 5000);
}

// attach listeners that should trigger auto save
if (editor) {
    editor.addEventListener('input', () => {
        scheduleAutoSave();
        updateByteCount();
    });
}
if (fontSelect) {
    fontSelect.addEventListener('change', scheduleAutoSave);
}
if (fontSize) {
    fontSize.addEventListener('change', scheduleAutoSave);
}
if (lineHeight) {
    lineHeight.addEventListener('change', scheduleAutoSave);
}
// ensure theme toggle triggers an autosave after theme switch
function scheduleAutoSaveWithTheme() {
    toggleTheme();
    scheduleAutoSave();
}


function saveProject() {
    const bg = currentBgImage ? new BGSettings(
        currentBgImage,
        parseFloat(bgOpacity.value),
        parseInt(bgScale.value),
        parseInt(bgPosX.value),
        parseInt(bgPosY.value)
    ) : null;

    const project = new Project(
        editor.value,
        fontSelect.value,
        fontSize.value,
        lineHeight ? lineHeight.value : undefined,
        document.body.classList.contains('dark') ? 'dark' : 'light',
        new Date().toISOString(),
        bg,
        guidePosInput ? parseInt(guidePosInput.value) : 400,
        maxLenInput ? parseInt(maxLenInput.value) : 80
    );
    downloadFile(project.toJson(), 'art_project.json', 'application/json');
}

function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

// create a PNG snapshot of the textarea content using current font settings
function exportImage() {
    const text = editor.value || "";
    const lines = text.split("\n");
    const size = parseInt(fontSize.value, 10) || 16;
    const lh = lineHeight ? parseFloat(lineHeight.value) : 1;
    const font = fontSelect.value;

    // temporary canvas for measurement
    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d');
    mctx.font = size + 'px ' + font;

    let maxWidth = 0;
    lines.forEach(line => {
        const w = mctx.measureText(line).width;
        if (w > maxWidth) maxWidth = w;
    });

    const lineHeightPx = size * lh;
    const padding = 10;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(maxWidth) + padding * 2;
    canvas.height = Math.ceil(lineHeightPx * lines.length) + padding * 2;
    const ctx = canvas.getContext('2d');

    // background based on theme
    const bgColor = document.body.classList.contains('dark') ? '#000000' : '#ffffff';
    const fgColor = document.body.classList.contains('dark') ? '#f5f5f5' : '#000000';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = fgColor;
    ctx.font = size + 'px ' + font;
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
        ctx.fillText(line, padding, padding + i * lineHeightPx);
    });

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'artwork.png';
    a.click();
}

async function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    
    if (file.name.endsWith('.json')) {
        try {
            const data = JSON.parse(text);
            const project = Project.fromObject(data);
            editor.value = project.content;
            fontSelect.value = project.font;
            fontSize.value = project.size;
            if (project.lineHeight && lineHeight) lineHeight.value = project.lineHeight;
            if (project.bgSettings) {
                applyBgSettingsFromData(project.bgSettings);
            }
            if (project.theme === 'dark') {
                document.body.classList.add('dark');
            } else if (project.theme === 'light') {
                document.body.classList.remove('dark');
            }
            updateFont();
            updateThemeIcons();
        } catch (e) {
            alert("Error parsing JSON project file.");
        }
    } else {
        editor.value = text;
    }
    // Clear input so same file can be loaded again
    event.target.value = '';
}

// Shortcut: Tab key in textarea
editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('    ');
    }
});

document.addEventListener('DOMContentLoaded', init);