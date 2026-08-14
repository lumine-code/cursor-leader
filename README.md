# cursor-leader

Keyboard-driven multi-cursor creation and navigation commands.

## Features

- **Cursor creation**: toggle new cursors anywhere.
- **Cursor navigation**: switch between cursors.
- **Active cursor highlight**: visual indicator when multiple cursors exist.
- **Single cursor movement**: individual cursor movement and selection commands.
- **Power mode**: temporarily isolate active cursor for all operations.
- **Overtype compatibility**: works with overtype cursor styling.

## Installation

To install `cursor-leader` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/cursor-leader`.

## Commands

Commands available in `lumine-workspace`:

- `cursor-leader:power-global`: toggle power mode for all editors,
- `cursor-leader:toggle`: toggle cursor instance,
- `cursor-leader:previous`: activate previous cursor,
- `cursor-leader:next`: activate next cursor.

Commands available in `lumine-text-editor`:

- `cursor-leader:power-editor`: toggle power mode for the active editor,
- `cursor-leader:reset`: activate the last cursor,
- `cursor-leader:remove`: remove the active cursor,
- `cursor-leader:move-up`,
- `cursor-leader:move-down`,
- `cursor-leader:move-left`,
- `cursor-leader:move-right`,
- `cursor-leader:move-to-top`,
- `cursor-leader:move-to-bottom`,
- `cursor-leader:move-to-beginning-of-screen-line`,
- `cursor-leader:move-to-beginning-of-line`,
- `cursor-leader:move-to-first-character-of-line`,
- `cursor-leader:move-to-end-of-screen-line`,
- `cursor-leader:move-to-end-of-line`,
- `cursor-leader:move-to-beginning-of-word`,
- `cursor-leader:move-to-end-of-word`,
- `cursor-leader:move-to-beginning-of-next-word`,
- `cursor-leader:move-to-previous-word-boundary`,
- `cursor-leader:move-to-next-word-boundary`,
- `cursor-leader:move-to-previous-subword-boundary`,
- `cursor-leader:move-to-next-subword-boundary`,
- `cursor-leader:skip-leading-whitespace`,
- `cursor-leader:move-to-beginning-of-next-paragraph`,
- `cursor-leader:move-to-beginning-of-previous-paragraph`,
- `cursor-leader:select-right`,
- `cursor-leader:select-left`,
- `cursor-leader:select-up`,
- `cursor-leader:select-down`,
- `cursor-leader:select-to-top`,
- `cursor-leader:select-to-bottom`,
- `cursor-leader:select-to-beginning-of-line`,
- `cursor-leader:select-to-first-character-of-line`,
- `cursor-leader:select-to-end-of-line`,
- `cursor-leader:select-to-end-of-buffer-line`,
- `cursor-leader:select-to-beginning-of-word`,
- `cursor-leader:select-to-end-of-word`,
- `cursor-leader:select-to-beginning-of-next-word`,
- `cursor-leader:select-to-previous-word-boundary`,
- `cursor-leader:select-to-next-word-boundary`,
- `cursor-leader:select-to-previous-subword-boundary`,
- `cursor-leader:select-to-nextsubword-boundary`,
- `cursor-leader:select-to-beginning-of-next-paragraph`,
- `cursor-leader:select-to-beginning-of-previous-paragraph`,
- `cursor-leader:select-word`,
- `cursor-leader:expand-over-word`,
- `cursor-leader:expand-over-line`,
- `cursor-leader:outdent-selected-rows`,
- `cursor-leader:toggle-line-comments`,
- `cursor-leader:indent-selected-rows`.

## Usage

Power mode isolates all editor operations to the active cursor only. When enabled, built-in commands (typing, deletion, indentation, etc.) as well as `cursor-leader` move and select commands affect only the active cursor, leaving all other cursors untouched.

There are two scopes:

- `Global` (`cursor-leader:power-global`): enables power mode for all open editors and any editor opened afterward. The status bar icon reflects this state and clicking it toggles global power mode.
- `Editor` (`cursor-leader:power-editor`): toggles power mode for the active editor only, independently of the global state.

Consolidating the selections of an editor also leaves its power mode, so the editor collapses to a single cursor instead of holding on to the ones power mode hid from it.

Use cases:

- Adjust one cursor's position without disturbing the others before a coordinated edit.
- Delete or select text on a single cursor while keeping remaining cursors in place.

## Customization

The active cursor highlight can be adjusted in your `styles.css` file, e.g. change its color:

```css
lumine-text-editor .cursors .cursor.cursor-leader-highlight {
  border-left-color: var(--text-color-warning);
}
```

## Services

- `status-bar`: consumed to display the power mode indicator tile on the right side of the status bar.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
