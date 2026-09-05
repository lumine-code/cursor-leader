describe("cursor-leader", () => {
  const patchedProperties = [
    "cursorIndex",
    "cursorPower",
    "cursorDecoration",
    "getSuperCursor",
    "getCursors",
    "getLastCursor",
    "getSuperSelection",
    "getSelections",
    "getLastSelection",
    "cursorHighlight",
  ];
  let workspaceElement, editor, editorElement, mainModule;

  beforeEach(async () => {
    workspaceElement = lumine.views.getView(lumine.workspace);
    jasmine.attachToDOM(workspaceElement);
    const pack = await lumine.packages.activatePackage("cursor-leader");
    mainModule = pack.mainModule;
    editor = await lumine.workspace.open();
    editorElement = lumine.views.getView(editor);
    editor.setText("aaa\nbbb\nccc\nddd\n");
  });

  function dispatch(command) {
    lumine.commands.dispatch(editorElement, command);
  }

  function placeCursors(rows) {
    editor.setCursorBufferPosition([rows[0], 0]);
    for (const row of rows.slice(1)) {
      editor.addCursorAtBufferPosition([row, 0]);
    }
  }

  function highlightsFor(targetEditor) {
    return targetEditor
      .getDecorations({ type: "cursor" })
      .filter((decoration) => decoration.getProperties().class === "cursor-leader-highlight");
  }

  function ownDescriptorsFor(targetEditor) {
    return new Map(
      patchedProperties.map((property) => [
        property,
        Object.getOwnPropertyDescriptor(targetEditor, property),
      ]),
    );
  }

  function expectOwnDescriptors(targetEditor, descriptors) {
    for (const [property, descriptor] of descriptors) {
      expect(Object.getOwnPropertyDescriptor(targetEditor, property)).toEqual(descriptor);
    }
  }

  it("patches observed editors with leader helpers", () => {
    expect(typeof editor.getSuperCursor).toBe("function");
    expect(typeof editor.getSuperSelection).toBe("function");
    expect(editor.cursorIndex).toBe(0);
    expect(editor.cursorPower).toBe(false);
  });

  it("unpatches after the last registration and watches a re-added editor only once", () => {
    const detached = lumine.workspace.buildTextEditor();
    const originalDescriptors = ownDescriptorsFor(detached);
    let firstRegistration;
    let secondRegistration;
    let reRegistration;

    try {
      firstRegistration = lumine.textEditors.add(detached, { role: "fragment" });
      const patchedGetCursors = detached.getCursors;
      secondRegistration = lumine.textEditors.add(detached, { role: "fragment" });

      expect(detached.getCursors).toBe(patchedGetCursors);
      firstRegistration.dispose();
      expect(detached.getCursors).toBe(patchedGetCursors);

      secondRegistration.dispose();
      expectOwnDescriptors(detached, originalDescriptors);

      reRegistration = lumine.textEditors.add(detached, { role: "fragment" });
      const highlight = spyOn(detached, "cursorHighlight").and.callThrough();
      detached.setText("one\ntwo");
      detached.setCursorBufferPosition([0, 0]);
      detached.addCursorAtBufferPosition([1, 0]);

      expect(highlight).toHaveBeenCalledTimes(1);
      expect(highlightsFor(detached)).toHaveLength(1);

      reRegistration.dispose();
      expectOwnDescriptors(detached, originalDescriptors);
      expect(highlightsFor(detached)).toHaveLength(0);
      expect(() => detached.addCursorAtBufferPosition([0, 1])).not.toThrow();
    } finally {
      firstRegistration?.dispose();
      secondRegistration?.dispose();
      reRegistration?.dispose();
      detached.destroy();
    }
  });

  it("restores registered and unregistered editors when deactivated", async () => {
    const detached = lumine.workspace.buildTextEditor();
    const detachedDescriptors = ownDescriptorsFor(detached);
    mainModule.update(detached);
    detached.setText("one\ntwo");
    detached.addCursorAtBufferPosition([1, 0]);

    placeCursors([0, 1]);
    dispatch("cursor-leader:power-editor");
    expect(editorElement.classList.contains("cursor-leader")).toBe(true);
    expect(highlightsFor(editor)).toHaveLength(1);
    expect(highlightsFor(detached)).toHaveLength(1);

    await lumine.packages.deactivatePackage("cursor-leader");

    expectOwnDescriptors(detached, detachedDescriptors);
    for (const property of patchedProperties) {
      expect(Object.prototype.hasOwnProperty.call(editor, property)).toBe(false);
    }
    expect(editorElement.classList.contains("cursor-leader")).toBe(false);
    expect(highlightsFor(editor)).toHaveLength(0);
    expect(highlightsFor(detached)).toHaveLength(0);
    expect(() => detached.addCursorAtBufferPosition([0, 1])).not.toThrow();
    detached.destroy();
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
      const other = await lumine.workspace.open();
      const otherElement = lumine.views.getView(other);

      lumine.commands.dispatch(workspaceElement, "cursor-leader:power-global");
      expect(editorElement.classList.contains("cursor-leader")).toBe(true);
      expect(otherElement.classList.contains("cursor-leader")).toBe(true);

      lumine.commands.dispatch(workspaceElement, "cursor-leader:power-global");
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

    it("acts on a select-list mini editor when no document editor is active", async () => {
      const host = lumine.workspace.addSelectList({
        items: ["one", "two"],
        renderItem: (item) => ({ primary: item }),
      });
      const list = host.getModel();
      const miniEditor = list.getQueryEditor();
      const miniElement = miniEditor.getElement();
      const nonEditorItem = document.createElement("div");

      try {
        host.show();
        miniEditor.setText("abcd");
        miniEditor.setCursorBufferPosition([0, 0]);
        miniEditor.addCursorAtBufferPosition([0, 2]);
        lumine.workspace.getActivePane().activateItem(nonEditorItem);

        expect(lumine.workspace.getActiveTextEditor()).toBeUndefined();
        expect(lumine.workspace.getTextEditorForElement(miniElement)).toBe(miniEditor);

        lumine.commands.dispatch(miniElement, "cursor-leader:move-right");
        expect(miniEditor.getCursorBufferPositions()).toEqual([
          [0, 0],
          [0, 3],
        ]);

        miniElement.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
        );
        expect(miniEditor.getCursorBufferPositions()).toEqual([[0, 3]]);
        expect(host.isVisible()).toBe(true);
      } finally {
        await host.destroy();
        lumine.workspace.getActivePane().activateItem(editor);
      }
    });
  });

  describe("cursor decoration", () => {
    it("decorates the active cursor when multiple cursors exist", () => {
      placeCursors([0, 1]);
      expect(highlightsFor(editor).length).toBe(1);
    });

    it("removes the decoration after the configured time", () => {
      placeCursors([0, 1]);
      expect(highlightsFor(editor).length).toBe(1);
      advanceClock(2001);
      expect(highlightsFor(editor).length).toBe(0);
    });

    it("does not decorate when the setting is disabled", () => {
      lumine.config.set("cursor-leader.cursorDecoration", false);
      placeCursors([0, 1]);
      expect(highlightsFor(editor).length).toBe(0);
    });
  });

  describe("status bar integration", () => {
    let tile;

    beforeEach(async () => {
      await lumine.packages.activatePackage("status-bar");
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
