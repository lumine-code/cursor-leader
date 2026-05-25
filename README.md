# cursor-leader

Keyboard-driven multi-cursor creation and navigation commands.

![demo](https://github.com/asiloisad/pulsar-cursor-leader/blob/master/assets/demo.gif?raw=true)

## Features

- **Cursor creation**: Toggle new cursors anywhere.
- **Cursor navigation**: Switch between cursors.
- **Active cursor highlight**: Visual indicator when multiple cursors exist.
- **Single cursor movement**: Individual cursor movement and selection commands.
- **Power mode**: Temporarily isolate active cursor for all operations.
- **Cursor consolidation**: Merge all cursors to the active cursor position.
- **Overtype compatibility**: Works with [overtype-mode](https://github.com/asiloisad/pulsar-overtype-mode).
- **Column selection compatibility**: Works with [column-selection](https://github.com/asiloisad/pulsar-column-selection), including in power mode.

## Installation

To install `cursor-leader` search for [cursor-leader](https://web.pulsar-edit.dev/packages/cursor-leader) in the Install pane of the Pulsar settings or run `ppm install cursor-leader`. Alternatively, you can run `ppm install asiloisad/pulsar-cursor-leader` to install a package directly from the GitHub repository.

## Commands

Commands available in `atom-text-editor`:

- `cursor-leader:power-global`: toggle power mode for all editors,
- `cursor-leader:power-editor`: toggle power mode for the active editor,
- `cursor-leader:toggle`: toggle cursor instance,
- `cursor-leader:previous`: activate next cursor,
- `cursor-leader:next`: activate previous cursor,
- `cursor-leader:reset`,
- `cursor-leader:remove`,
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

## Power mode

Power mode isolates all editor operations to the active cursor only. When enabled, built-in commands (typing, deletion, indentation, etc.) as well as `cursor-leader` move and select commands affect only the active cursor, leaving all other cursors untouched.

There are two scopes:

- **Global** (`cursor-leader:power-global`): enables power mode for all open editors and any editor opened afterward. The ⚡ status bar icon reflects this state and clicking it toggles global power mode.
- **Editor** (`cursor-leader:power-editor`): toggles power mode for the active editor only, independently of the global state.

Use cases:

- Adjust one cursor's position without disturbing the others before a coordinated edit.
- Delete or select text on a single cursor while keeping remaining cursors in place.

## Customization

The style can be adjusted according to user preferences in the `styles.less` file:

- e.g. change active cursor highlight color:

```less
atom-text-editor .cursors .cursor.cursor-leader-highlight {
  border-left-color: @text-color-warning;
}
```

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
