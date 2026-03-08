class LocaleHelper {
    static EN = {
        title: "About — AA Studio",
        headerTitle: "AA Studio",
        navEditor: "Editor",
        navAbout: "About",
        aboutHeading: "About",
        aboutPara1: "<strong>AA Studio</strong> is a minimal, standalone web app for crafting blocky or UTF‑8 art in your browser. No installation, no backend, no build tools—just open <code>index.html</code> and start creating.",
        feature1: "Draw with any Unicode symbols in a textarea",
        feature2: "Export/import your art as JSON files",
        feature3: "Change fonts, font size, and color themes",
        feature4: "Customizable symbol palette",
        feature5: "Mobile and desktop friendly",
        builtWith: "Built with vanilla JavaScript and styled using <a href=\"https://tailwindcss.com/\" class=\"text-blue-600 dark:text-blue-400 hover:underline\" target=\"_blank\" rel=\"noopener\">Tailwind CSS</a> via CDN.",
        exploreHeading: "Explore More Art",
        explorePara: "You can find some examples of UTF-8 art <a href=\"http://anime.en.utf8art.com/tag/patchouli-knowledge\" class=\"text-blue-600 dark:text-blue-400 hover:underline\" target=\"_blank\" rel=\"noopener\">in this link.</a>",
        footerCopy: "&copy; 2024 AA Studio. MIT License.",
        byteCount: "{count} Bytes",
        deviceAlert: "This site is optimized for desktop. Your current screen size may affect the experience.",
        guidePos: "Guide (px)",
        catStandard: "Standard Symbols",
        catJIS: "JIS Art Symbols",
        maxLen: "Max line characters",
        showAllSymbols: "Show All",
        symbolGalleryTitle: "Symbol Gallery",
        close: "Close",
        errImgType: "Only PNG and JPG/JPEG images are allowed.",
        errImgSize: "Image size must be less than 3MB.",
        gridToggle: "Toggle Grid Guide",
        gridX: "Grid X",
        gridY: "Grid Y",
        syncWithFont: "Sync with Font",
        copyPasteJson: "Copy/Paste JSON",
        jsonModalTitle: "Copy/Paste Project JSON",
        jsonModalDesc: "View, copy, or paste your project data in JSON format.",
        copyToClipboard: "Copy to Clipboard",
        applyJson: "Apply JSON",
        save: "Save",
        saved: "Saved!",
        readOnly: "Read Only Mode",
        locked: "Locked",
        unlocked: "Unlocked"
    };

    static ES = {
        title: "Acerca de — AA Studio",
        headerTitle: "AA Studio",
        navEditor: "Editor",
        navAbout: "Acerca de",
        aboutHeading: "Acerca de",
        aboutPara1: "<strong>AA Studio</strong> es una aplicación web minimalista e independiente para crear arte de bloques o UTF‑8 en tu navegador. Sin instalación, sin backend, sin herramientas de construcción: solo abre <code>index.html</code> y comienza a crear.",
        feature1: "Dibuja con cualquier símbolo Unicode en un área de texto",
        feature2: "Exporta/importa tu arte como archivos JSON",
        feature3: "Cambia fuentes, tamaño de fuente y temas de color",
        feature4: "Paleta de símbolos personalizable",
        feature5: "Compatible con móviles y escritorio",
        builtWith: "Construido con JavaScript puro y estilizado usando <a href=\"https://tailwindcss.com/\" class=\"text-blue-600 dark:text-blue-400 hover:underline\" target=\"_blank\" rel=\"noopener\">Tailwind CSS</a> a través de CDN.",
        exploreHeading: "Explora más arte",
        explorePara: "Puedes encontrar algunos ejemplos de arte UTF-8 <a href=\"http://anime.en.utf8art.com/tag/patchouli-knowledge\" class=\"text-blue-600 dark:text-blue-400 hover:underline\" target=\"_blank\" rel=\"noopener\">en este enlace.</a>",
        footerCopy: "&copy; 2024 AA Studio. Licencia MIT.",
        byteCount: "{count} Bytes",
        deviceAlert: "Este sitio está optimizado para escritorio. El tamaño de pantalla actual puede afectar la experiencia.",
        guidePos: "Guía (px)",
        catStandard: "Símbolos Estándar",
        catJIS: "Símbolos JIS Art",
        maxLen: "Máx caract/línea",
        showAllSymbols: "Ver todo",
        symbolGalleryTitle: "Galería de Símbolos",
        close: "Cerrar",
        errImgType: "Solo se permiten imágenes PNG y JPG/JPEG.",
        errImgSize: "La imagen debe ser menor a 3MB.",
        gridToggle: "Alternar Guía de Cuadrícula",
        gridX: "Cuadrícula X",
        gridY: "Cuadrícula Y",
        syncWithFont: "Sincronizar con Fuente",
        copyPasteJson: "Copiar/Pegar JSON",
        jsonModalTitle: "Copiar/Pegar JSON del Proyecto",
        jsonModalDesc: "Ver, copiar o pegar los datos de tu proyecto en formato JSON.",
        copyToClipboard: "Copiar al Portapapeles",
        applyJson: "Aplicar JSON",
        save: "Guardar",
        saved: "¡Guardado!",
        readOnly: "Modo Solo Lectura",
        locked: "Bloqueado",
        unlocked: "Desbloqueado"
    };

    constructor() {
        if (navigator.language.startsWith('es')) {
            this.lang = LocaleHelper.ES;
        } else {
            this.lang = LocaleHelper.EN;
        }
    }

    msg(k) {
        if (k in this.lang) {
            return this.lang[k];
        }
        // Fallback to English if current lang is not English
        if (this.lang !== LocaleHelper.EN && k in LocaleHelper.EN) {
            return LocaleHelper.EN[k];
        }
        throw new Error('value for ' + k + ' not found in lang dictionary');
    }

    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.msg(key);
            if (el.tagName === 'TITLE') {
                document.title = translation;
            } else if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        });
    }
}

// Auto-init for pages that include this script
document.addEventListener('DOMContentLoaded', () => {
    // Only apply if we are not on the index page or if specifically requested
    // For about.html, we definitely want to apply it.
    if (window.location.pathname.includes('about.html')) {
        const locale = new LocaleHelper();
        locale.apply();
    }
});
