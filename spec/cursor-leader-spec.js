describe("cursor-leader", () => {
  let workspaceElement, editor, editorElement;

  beforeEach(async () => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    await atom.packages.activatePackage("cursor-leader");
    editor = await atom.workspace.open();
    editorElement = atom.views.getView(editor);
    editor.setText("aaa\nbbb\nccc\nddd\n");
  });

  function dispatch(command) {
    atom.commands.dispatch(editorElement, command);
  }

  function placeCursors(rows) {
    editor.setCursorBufferPosition([rows[0], 0]);
    for (const row of rows.slice(1)) {
      editor.addCursorAtBufferPosition([row, 0]);
    }
  }

  it("patches observed editors with leader helpers", () => {
    expect(typeof editor.getSuperCursor).toBe("function");
    expect(typeof editor.getSuperSelection).toBe("function");
    expect(editor.cursorIndex).toBe(0);
    expect(editor.cursorPower).toBe(false);
  });

  describe("power mode", () => {
    it("toggles power mode for a single editor", () => {
      placeCursors([0, 1]);
      dispatch("cursor-leader:power-editor");
      expect(editorElement.classList.contains("cursor-leader")).toBe(true);
      expect(editor.getCursors().length).toBe(1);

      dispatch("cursor-leader:power-editor");
      expect(editorElement.classList.contains("cursor-leader")).toBe(false);
      expect(editor.getCursors().length).toBe(2);
    });

    it("toggles power mode globally for all editors", async () => {
      const other = await atom.workspace.open();
      const otherElement = atom.views.getView(other);

      atom.commands.dispatch(workspaceElement, "cursor-leader:power-global");
      expect(editorElement.classList.contains("cursor-leader")).toBe(true);
      expect(otherElement.classList.contains("cursor-leader")).toBe(true);

      atom.commands.dispatch(workspaceElement, "cursor-leader:power-global");
      expect(editorElement.classList.contains("cursor-leader")).toBe(false);
      expect(otherElement.classList.contains("cursor-leader")).toBe(false);
    });
  });

  describe("cursor navigation", () => {
    it("switches the active cursor with previous, next and reset", () => {
      placeCursors([0, 1, 2]);
      expect(editor.getSuperCursor().getBufferPosition().row).toBe(2);

      dispatch("cursor-leader:previous");
      expect(editor.getSuperCursor().getBufferPosition().row).toBe(1);

      dispatch("cursor-leader:previous");
      expect(editor.getSuperCursor().getBufferPosition().row).toBe(0);

      dispatch("cursor-leader:next");
      expect(editor.getSuperCursor().getBufferPosition().row).toBe(1);

      dispatch("cursor-leader:reset");
      expect(editor.getSuperCursor().getBufferPosition().row).toBe(2);
    });

    it("moves only the active cursor", () => {
      placeCursors([0, 1]);
      dispatch("cursor-leader:move-right");
      const positions = editor.getCursorBufferPositions();
      expect(positions[0].isEqual([0, 0])).toBe(true);
      expect(positions[1].isEqual([1, 1])).toBe(true);
    });

    it("selects only with the active selection", () => {
      placeCursors([0, 1]);
      dispatch("cursor-leader:select-to-end-of-line");
      const texts = editor.selections.map((selection) => selection.getText());
      expect(texts).toEqual(["", "bbb"]);
    });

    it("removes the active cursor", () => {
      placeCursors([0, 1]);
      dispatch("cursor-leader:remove");
      const positions = editor.getCursorBufferPositions();
      expect(positions.length).toBe(1);
      expect(positions[0].isEqual([0, 0])).toBe(true);
    });
  });

  describe("consolidating selections", () => {
    it("leaves the most recent cursor, whichever one is active", () => {
      placeCursors([0, 1, 2]);
      dispatch("cursor-leader:previous");
      dispatch("editor:consolidate-selections");
      const positions = editor.getCursorBufferPositions();
      expect(positions.length).toBe(1);
      expect(positions[0].isEqual([2, 0])).toBe(true);
    });

    it("leaves power mode so the editor sees every cursor again", () => {
      placeCursors([0, 1, 2]);
      dispatch("cursor-leader:power-editor");
      expect(editor.cursorPower).toBe(true);

      dispatch("editor:consolidate-selections");
      expect(editor.cursorPower).toBe(false);
      expect(editorElement.classList.contains("cursor-leader")).toBe(false);
      const positions = editor.getCursorBufferPositions();
      expect(positions.length).toBe(1);
      expect(positions[0].isEqual([2, 0])).toBe(true);
    });
  });

  describe("cursor decoration", () => {
    function getHighlights() {
      return editor
        .getDecorations({ type: "cursor" })
        .filter((decoration) => decoration.getProperties().class === "cursor-leader-highlight");
    }

    it("decorates the active cursor when multiple cursors exist", () => {
      placeCursors([0, 1]);
      expect(getHighlights().length).toBe(1);
    });

    it("removes the decoration after the configured time", () => {
      placeCursors([0, 1]);
      expect(getHighlights().length).toBe(1);
      advanceClock(2001);
      expect(getHighlights().length).toBe(0);
    });

    it("does not decorate when the setting is disabled", () => {
      atom.config.set("cursor-leader.cursorDecoration", false);
      placeCursors([0, 1]);
      expect(getHighlights().length).toBe(0);
    });
  });

  describe("status bar integration", () => {
    let tile;

    beforeEach(async () => {
      await atom.packages.activatePackage("status-bar");
      tile = workspaceElement.querySelector(".cursor-leader-status");
    });

    it("adds a tile to the status bar", () => {
      expect(tile).not.toBeNull();
      expect(tile.querySelector(".icon-zap")).not.toBeNull();
    });

    it("toggles global power mode when the tile is clicked", () => {
      tile.click();
      expect(editorElement.classList.contains("cursor-leader")).toBe(true);
      expect(tile.querySelector(".icon").classList.contains("power")).toBe(true);

      tile.click();
      expect(editorElement.classList.contains("cursor-leader")).toBe(false);
      expect(tile.querySelector(".icon").classList.contains("power")).toBe(false);
    });
  });
});
