// Make floating bar draggable
function makeFloatingBarDraggable() {
    const bar = document.getElementById('floatingBar');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    bar.addEventListener('mousedown', function(e) {
        // Only drag if clicked on header background, not child elements
        if (e.target !== bar) return;
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
const palette = document.getElementById('symbolPalette');
const paletteButtons = document.getElementById('palette-buttons');

const SYMBOLS = [
    '█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', 
    '─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼',
    '═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬',
    '╱', '╲', '╳', '▲', '▼', '◀', '▶', '●', '○', '◆', '◇',
    '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'
];

const TOP_QUICK_SYMBOLS = ['█', '▓', '▒', '░', '─', '│'];

function init() {
    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Build Side Palette
    SYMBOLS.forEach(sym => {
        const btn = document.createElement('button');
        btn.className = "w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 transition-colors font-mono";
        btn.innerText = sym;
        btn.onclick = () => insertAtCursor(sym);
        palette.appendChild(btn);
    });

    // Build Top Quick Bar
    TOP_QUICK_SYMBOLS.forEach(sym => {
        const btn = document.createElement('button');
        btn.className = "w-8 h-8 flex items-center justify-center text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors font-mono";
        btn.innerText = sym;
        btn.onclick = () => insertAtCursor(sym);
        paletteButtons.appendChild(btn);
    });

    // Set initial state
    updateFont();
    updateThemeIcons();
    makeFloatingBarDraggable();
}

function insertAtCursor(text) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const currentText = editor.value;
    editor.value = currentText.substring(0, start) + text + currentText.substring(end);
    editor.focus();
    editor.selectionStart = editor.selectionEnd = start + text.length;
}

function updateFont() {
    editor.style.fontFamily = fontSelect.value;
    editor.style.fontSize = fontSize.value + 'px';
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.body.classList.contains('dark');
    document.getElementById('sun-icon').classList.toggle('hidden', !isDark);
    document.getElementById('moon-icon').classList.toggle('hidden', isDark);

    // body background color is used for the page outside of Tailwind
    document.body.style.backgroundColor = isDark ? '#171717' : '#f5f5f5';

    // ensure the textarea switches colors even if Tailwind dark mode isn't applied
    // (this acts as a fallback and keeps inline styles in sync with the class)
    if (editor) {
        editor.style.backgroundColor = isDark ? '#1f2937' : '#ffffff';
        editor.style.color = isDark ? '#f5f5f5' : '#1f2937';
    }
}

// File Management
function exportTxt() {
    downloadFile(editor.value, 'artwork.txt', 'text/plain');
}

function saveProject() {
    const project = {
        content: editor.value,
        font: fontSelect.value,
        size: fontSize.value,
        theme: document.body.classList.contains('dark') ? 'dark' : 'light',
        timestamp: new Date().toISOString()
    };
    downloadFile(JSON.stringify(project, null, 2), 'art_project.json', 'application/json');
}

function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

async function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    
    if (file.name.endsWith('.json')) {
        try {
            const data = JSON.parse(text);
            editor.value = data.content || "";
            if (data.font) fontSelect.value = data.font;
            if (data.size) fontSize.value = data.size;
            if (data.theme === 'dark') {
                document.body.classList.add('dark');
            } else if (data.theme === 'light') {
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