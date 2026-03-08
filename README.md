# ToDo
- [x] Add ruler guide
- [x] Grid guide should be synced with the text size and line height settings
- [x] Add a Save Button
- [ ] Change render scale without altering font-size
- [ ] Customize character palette bar
- [ ] Add a "Help" section with instructions and keyboard shortcuts
- [ ] Add a "Tips" section with tips for creating JIS art and using the editor
- [x] Add hard limit for characters per line setting
- [x] Show a saving indicator when saving to local storage
- [x] Autosave contents and config to local storage
- [x] Read only mode
- [x] Fix theme toggle not working on the text input
- [x] Allow Resizing the text input
- [x] Fix textarea width
- [ ] Export files with current timestamp
- [ ] Allow naming file
- [ ] Add custom character palette
- [ ] Add custom themes
- [x] Add "Export as Image" option

## Features & Implementation Notes
### Grid Synchronization
When the "Sync with Font" option is enabled, the grid adjusts automatically using the following formulas:
- **Grid X (Horizontal):** `FontSize / 2` (approximate width for half-width characters).
- **Grid Y (Vertical):** `FontSize * LineHeight` (matches the exact row height).