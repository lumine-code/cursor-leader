const { CompositeDisposable } = require("atom");

/**
 * Super Cursor Package
 * Provides enhanced multi-cursor functionality with individual cursor control.
 * Allows movement, selection, and manipulation of specific cursors independently.
 */
module.exports = {
  /**
   * Activates the package and registers cursor control commands.
   */
  activate() {
    // initialize
    this.target = null;
    this.editor = null;
    this.global = false;
    this.statusBar = null;
    this.statusBarTile = null;
    this.statusBarItem = null;

    // commands
    this.disposables = new CompositeDisposable();
    this.disposables.add(
      atom.commands.add("atom-workspace", {
        "cursor-leader:power-global": () => {
          this.powerGlobal();
        },
      }),
      atom.commands.add("atom-text-editor", {
        "cursor-leader:power-editor": (e) => {
          this.powerEditor(e);
        },
        // Leave power mode before the editor collapses its cursors. This
        // listener runs ahead of the editor's own, which then sees every
        // selection again and keeps the most recent one.
        "editor:consolidate-selections": (e) => {
          this.event(e);
          this.power(this.editor, false);
        },
        "cursor-leader:toggle": (e) => {
          this.event(e);
          this.toggle();
        },
        "cursor-leader:previous": (e) => {
          this.event(e);
          this.previous();
        },
        "cursor-leader:next": (e) => {
          this.event(e);
          this.next();
        },
        "cursor-leader:reset": (e) => {
          this.event(e);
          this.reset();
        },
        "cursor-leader:remove": (e) => {
          this.event(e);
          this.remove();
        },
        "cursor-leader:move-up": (e) => {
          this.event(e);
          this.moveUp();
        },
        "cursor-leader:move-down": (e) => {
          this.event(e);
          this.moveDown();
        },
        "cursor-leader:move-left": (e) => {
          this.event(e);
          this.moveLeft();
        },
        "cursor-leader:move-right": (e) => {
          this.event(e);
          this.moveRight();
        },
        "cursor-leader:move-to-top": (e) => {
          this.event(e);
          this.moveToTop();
        },
        "cursor-leader:move-to-bottom": (e) => {
          this.event(e);
          this.moveToBottom();
        },
        "cursor-leader:move-to-beginning-of-screen-line": (e) => {
          this.event(e);
          this.moveToBeginningOfScreenLine();
        },
        "cursor-leader:move-to-beginning-of-line": (e) => {
          this.event(e);
          this.moveToBeginningOfLine();
        },
        "cursor-leader:move-to-first-character-of-line": (e) => {
          this.event(e);
          this.moveToFirstCharacterOfLine();
        },
        "cursor-leader:move-to-end-of-screen-line": (e) => {
          this.event(e);
          this.moveToEndOfScreenLine();
        },
        "cursor-leader:move-to-end-of-line": (e) => {
          this.event(e);
          this.moveToEndOfLine();
        },
        "cursor-leader:move-to-beginning-of-word": (e) => {
          this.event(e);
          this.moveToBeginningOfWord();
        },
        "cursor-leader:move-to-end-of-word": (e) => {
          this.event(e);
          this.moveToEndOfWord();
        },
        "cursor-leader:move-to-beginning-of-next-word": (e) => {
          this.event(e);
          this.moveToBeginningOfNextWord();
        },
        "cursor-leader:move-to-previous-word-boundary": (e) => {
          this.event(e);
          this.moveToPreviousWordBoundary();
        },
        "cursor-leader:move-to-next-word-boundary": (e) => {
          this.event(e);
          this.moveToNextWordBoundary();
        },
        "cursor-leader:move-to-previous-subword-boundary": (e) => {
          this.event(e);
          this.moveToPreviousSubwordBoundary();
        },
        "cursor-leader:move-to-next-subword-boundary": (e) => {
          this.event(e);
          this.moveToNextSubwordBoundary();
        },
        "cursor-leader:skip-leading-whitespace": (e) => {
          this.event(e);
          this.skipLeadingWhitespace();
        },
        "cursor-leader:move-to-beginning-of-next-paragraph": (e) => {
          this.event(e);
          this.moveToBeginningOfNextParagraph();
        },
        "cursor-leader:move-to-beginning-of-previous-paragraph": (e) => {
          this.event(e);
          this.moveToBeginningOfPreviousParagraph();
        },
        "cursor-leader:select-right": (e) => {
          this.event(e);
          this.selectRight();
        },
        "cursor-leader:select-left": (e) => {
          this.event(e);
          this.selectLeft();
        },
        "cursor-leader:select-up": (e) => {
          this.event(e);
          this.selectUp();
        },
        "cursor-leader:select-down": (e) => {
          this.event(e);
          this.selectDown();
        },
        "cursor-leader:select-to-top": (e) => {
          this.event(e);
          this.selectToTop();
        },
        "cursor-leader:select-to-bottom": (e) => {
          this.event(e);
          this.selectToBottom();
        },
        "cursor-leader:select-to-beginning-of-line": (e) => {
          this.event(e);
          this.selectToBeginningOfLine();
        },
        "cursor-leader:select-to-first-character-of-line": (e) => {
          this.event(e);
          this.selectToFirstCharacterOfLine();
        },
        "cursor-leader:select-to-end-of-line": (e) => {
          this.event(e);
          this.selectToEndOfLine();
        },
        "cursor-leader:select-to-end-of-buffer-line": (e) => {
          this.event(e);
          this.selectToEndOfBufferLine();
        },
        "cursor-leader:select-to-beginning-of-word": (e) => {
          this.event(e);
          this.selectToBeginningOfWord();
        },
        "cursor-leader:select-to-end-of-word": (e) => {
          this.event(e);
          this.selectToEndOfWord();
        },
        "cursor-leader:select-to-beginning-of-next-word": (e) => {
          this.event(e);
          this.selectToBeginningOfNextWord();
        },
        "cursor-leader:select-to-previous-word-boundary": (e) => {
          this.event(e);
          this.selectToPreviousWordBoundary();
        },
        "cursor-leader:select-to-next-word-boundary": (e) => {
          this.event(e);
          this.selectToNextWordBoundary();
        },
        "cursor-leader:select-to-previous-subword-boundary": (e) => {
          this.event(e);
          this.selectToPreviousSubwordBoundary();
        },
        "cursor-leader:select-to-nextsubword-boundary": (e) => {
          this.event(e);
          this.selectToNextSubwordBoundary();
        },
        "cursor-leader:select-to-beginning-of-next-paragraph": (e) => {
          this.event(e);
          this.selectToBeginningOfNextParagraph();
        },
        "cursor-leader:select-to-beginning-of-previous-paragraph": (e) => {
          this.event(e);
          this.selectToBeginningOfPreviousParagraph();
        },
        "cursor-leader:select-word": (e) => {
          this.event(e);
          this.selectWord();
        },
        "cursor-leader:expand-over-word": (e) => {
          this.event(e);
          this.expandOverWord();
        },
        "cursor-leader:expand-over-line": (e) => {
          this.event(e);
          this.expandOverLine();
        },
        "cursor-leader:outdent-selected-rows": (e) => {
          this.event(e);
          this.outdentSelectedRows();
        },
        "cursor-leader:toggle-line-comments": (e) => {
          this.event(e);
          this.toggleLineComments();
        },
        "cursor-leader:indent-selected-rows": (e) => {
          this.event(e);
          this.indentSelectedRows();
        },
      }),
    );

    // observe text editors
    this.disposables.add(
      atom.textEditors.observe((editor) => {
        this.update(editor);
        this.power(editor, this.global);
      }),
      atom.config.observe("cursor-leader.cursorDecoration", (value) => {
        this.cursorDecoration = value;
      }),
      atom.config.observe("cursor-leader.decorationTime", (value) => {
        this.decorationTime = value;
      }),
    );
  },

  event(e) {
    this.target = e.target;
    const element = this.target.closest("atom-text-editor");
    const editor = element.getModel();
    this.update(editor);
  },

  update(editor) {
    this.editor = editor;

    // check if patch is needed
    if (Number.isInteger(editor.cursorIndex)) {
      return;
    }

    // patch editor
    editor.cursorIndex = 0;
    editor.cursorPower = false;
    editor.cursorDecoration = null;

    // extra function
    editor.getSuperCursor = () => {
      return editor.cursors[editor.cursors.length - 1 - editor.cursorIndex];
    };

    // overwrite
    editor.getCursors = () => {
      editor.createLastSelectionIfNeeded();
      if (editor.cursorPower) {
        return [editor.cursors[editor.cursors.length - 1 - editor.cursorIndex]];
      } else {
        return editor.cursors.slice();
      }
    };

    // overwrite
    editor.getLastCursor = () => {
      editor.createLastSelectionIfNeeded();
      return editor.cursors[Math.max(0, editor.cursors.length - 1 - editor.cursorIndex)];
    };

    // extra function
    editor.getSuperSelection = () => {
      return editor.selections[editor.selections.length - 1 - editor.cursorIndex];
    };

    // overwrite
    editor.getSelections = () => {
      editor.createLastSelectionIfNeeded();
      if (editor.cursorPower) {
        return [editor.selections[editor.cursors.length - 1 - editor.cursorIndex]];
      } else {
        return editor.selections.slice();
      }
    };

    // overwrite
    editor.getLastSelection = () => {
      editor.createLastSelectionIfNeeded();
      return editor.selections[Math.max(0, editor.cursors.length - 1 - editor.cursorIndex)];
    };

    // custom highlight
    editor.cursorHighlight = () => {
      if (editor.cursorDecoration) {
        editor.cursorDecoration.destroy();
      }
      if (!this.cursorDecoration || editor.cursors.length <= 1) {
        return;
      }
      let marker = editor.getSuperCursor().getMarker();
      let decoration = editor.decorateMarker(marker, {
        type: "cursor",
        class: "cursor-leader-highlight",
      });
      editor.cursorDecoration = decoration;
      if (this.decorationTime) {
        setTimeout(() => {
          decoration.destroy();
        }, this.decorationTime);
      }
    };

    // observe count of cursors
    editor.disposables.add(
      editor.onDidAddCursor(() => {
        editor.cursorIndex = 0;
        editor.cursorHighlight();
      }),
      editor.onDidRemoveCursor(() => {
        editor.cursorIndex = 0;
        editor.cursorHighlight();
      }),
    );
  },

  deactivate() {
    for (const element of document.getElementsByTagName("atom-text-editor")) {
      const editor = element.getModel();
      editor.cursorIndex = 0;
      editor.cursorPower = false;
    }
    this.deactivateStatusBar();
    this.disposables.dispose();
  },

  power(editor, state) {
    this.update(editor);
    if (typeof state === "boolean") {
      editor.cursorPower = state;
    } else {
      editor.cursorPower = !editor.cursorPower;
    }
    if (editor.cursorPower) {
      editor.element.classList.add("cursor-leader");
    } else {
      editor.element.classList.remove("cursor-leader");
    }
  },

  powerEditor(e) {
    const element = e.target.closest("atom-text-editor");
    const editor = element.getModel();
    this.power(editor);
  },

  powerGlobal() {
    this.global = !this.global;
    for (const element of document.getElementsByTagName("atom-text-editor")) {
      const editor = element.getModel();
      this.power(editor, this.global);
    }
    if (this.statusBarItem) {
      this.updateStatusBar();
    }
  },

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;
    this.activateStatusBar();
  },

  activateStatusBar() {
    if (!this.statusBar) {
      return;
    }
    this.statusBarItem = this.createStatusBarItem();
    // Editor-mode band, see the priority convention in the status-bar package
    // README.
    this.statusBarTile = this.statusBar.addRightTile({ item: this.statusBarItem, priority: 210 });
    this.tooltipDisposable = atom.tooltips.add(this.statusBarItem, {
      title: () => `Power mode is ${this.global ? "enabled" : "disabled"}`,
      keyBindingCommand: "cursor-leader:power-global",
      keyBindingTarget: atom.views.getView(atom.workspace),
    });
    this.updateStatusBar();
  },

  deactivateStatusBar() {
    if (!this.statusBarTile) {
      return;
    }
    this.tooltipDisposable?.dispose();
    this.tooltipDisposable = null;
    this.statusBarTile.destroy();
    this.statusBarTile = null;
    this.statusBarItem = null;
  },

  createStatusBarItem() {
    const element = document.createElement("div");
    element.classList.add("cursor-leader-status", "inline-block");
    const iconSpan = document.createElement("span");
    iconSpan.classList.add("icon", "is-icon-only", "icon-zap");
    element.appendChild(iconSpan);
    element.onclick = () => {
      this.powerGlobal();
    };
    element.iconSpan = iconSpan;
    return element;
  },

  updateStatusBar() {
    if (!this.statusBarItem) {
      return;
    }
    if (this.global) {
      this.statusBarItem.iconSpan.classList.add("power");
    } else {
      this.statusBarItem.iconSpan.classList.remove("power");
    }
  },

  previous() {
    this.editor.cursorIndex = Math.max(
      0,
      Math.min(this.editor.cursors.length - 1, this.editor.cursorIndex + 1),
    );
    this.editor.cursorHighlight();
  },

  next() {
    this.editor.cursorIndex = Math.max(
      0,
      Math.min(this.editor.cursors.length - 1, this.editor.cursorIndex - 1),
    );
    this.editor.cursorHighlight();
  },

  reset() {
    this.editor.cursorIndex = 0;
    this.editor.cursorHighlight();
  },

  toggle() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      const selection = this.editor.getSuperSelection();
      let buffPos = cursor.getBufferPosition();
      for (let isel of this.editor.selections) {
        if (isel === selection) {
          continue;
        } else if (isel.getBufferRange().containsPoint(buffPos)) {
          isel.destroy();
          return;
        }
      }
      let lastRow = this.editor.getLastBufferRow();
      for (let i = 0; i <= lastRow; i++) {
        for (let j = 0; j <= this.editor.lineTextForBufferRow(i).length; j++) {
          let marker = this.editor.selectionsMarkerLayer.markBufferPosition([i, j], {
            invalidate: "never",
          });
          if (marker) {
            this.editor.getLastCursor().setBufferPosition(buffPos);
            this.editor.cursorHighlight();
            return;
          }
        }
      }
    }
  },

  remove() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.destroy();
    }
  },

  moveUp() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveUp();
    }
  },

  moveDown() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveDown();
    }
  },

  moveLeft() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveLeft();
    }
  },

  moveRight() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveRight();
    }
  },

  moveToTop() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToTop();
    }
  },

  moveToBottom() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBottom();
    }
  },

  moveToBeginningOfScreenLine() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBeginningOfScreenLine();
    }
  },

  moveToBeginningOfLine() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBeginningOfLine();
    }
  },

  moveToFirstCharacterOfLine() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToFirstCharacterOfLine();
    }
  },

  moveToEndOfScreenLine() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToEndOfScreenLine();
    }
  },

  moveToEndOfLine() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToEndOfLine();
    }
  },

  moveToBeginningOfWord() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBeginningOfWord();
    }
  },

  moveToEndOfWord() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToEndOfWord();
    }
  },

  moveToBeginningOfNextWord() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBeginningOfNextWord();
    }
  },

  moveToPreviousWordBoundary() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToPreviousWordBoundary();
    }
  },

  moveToNextWordBoundary() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToNextWordBoundary();
    }
  },

  moveToPreviousSubwordBoundary() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToPreviousSubwordBoundary();
    }
  },

  moveToNextSubwordBoundary() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToNextSubwordBoundary();
    }
  },

  skipLeadingWhitespace() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.skipLeadingWhitespace();
    }
  },

  moveToBeginningOfNextParagraph() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBeginningOfNextParagraph();
    }
  },

  moveToBeginningOfPreviousParagraph() {
    const cursor = this.editor.getSuperCursor();
    if (cursor) {
      cursor.moveToBeginningOfPreviousParagraph();
    }
  },

  selectRight() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectRight();
    }
  },

  selectLeft() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectLeft();
    }
  },

  selectUp() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectUp();
    }
  },

  selectDown() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectDown();
    }
  },

  selectToTop() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToTop();
    }
  },

  selectToBottom() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToBottom();
    }
  },

  selectToBeginningOfLine() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToBeginningOfLine();
    }
  },

  selectToFirstCharacterOfLine() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToFirstCharacterOfLine();
    }
  },

  selectToEndOfLine() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToEndOfLine();
    }
  },

  selectToEndOfBufferLine() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToEndOfBufferLine();
    }
  },

  selectToBeginningOfWord() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToBeginningOfWord();
    }
  },

  selectToEndOfWord() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToEndOfWord();
    }
  },

  selectToBeginningOfNextWord() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToBeginningOfNextWord();
    }
  },

  selectToPreviousWordBoundary() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToPreviousWordBoundary();
    }
  },

  selectToNextWordBoundary() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToNextWordBoundary();
    }
  },

  selectToPreviousSubwordBoundary() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToPreviousSubwordBoundary();
    }
  },

  selectToNextSubwordBoundary() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToNextSubwordBoundary();
    }
  },

  selectToBeginningOfNextParagraph() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToBeginningOfNextParagraph();
    }
  },

  selectToBeginningOfPreviousParagraph() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectToBeginningOfPreviousParagraph();
    }
  },

  selectWord() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.selectWord();
    }
  },

  expandOverWord() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.expandOverWord();
    }
  },

  expandOverLine() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.expandOverLine();
    }
  },

  outdentSelectedRows() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.outdentSelectedRows();
    }
  },

  toggleLineComments() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.toggleLineComments();
    }
  },

  indentSelectedRows() {
    const selection = this.editor.getSuperSelection();
    if (selection) {
      selection.indentSelectedRows();
    }
  },
};
