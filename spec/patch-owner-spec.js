describe("Cursor Leader editor patch ownership", () => {
  let main, editor, cleanups, bar;
  beforeEach(async () => {
    jasmine.attachToDOM(lumine.workspace.getElement());
    cleanups = [];
  });
  afterEach(async () => {
    cleanups.forEach((cleanup) => cleanup());
    await lumine.packages.deactivatePackage("cursor-leader");
    editor?.destroy();
    bar?.destroy();
  });

  it("does not patch a new editor from a copied retired registry observer", async () => {
    const earlier = lumine.textEditors.observe(() => main?.deactivate());
    cleanups.push(() => earlier.dispose());
    main = (await lumine.packages.activatePackage("cursor-leader")).mainModule;
    editor = await lumine.workspace.open();
    expect(Object.hasOwn(editor, "getCursors")).toBe(false);
    expect(Object.hasOwn(editor, "cursorPower")).toBe(false);
    expect(main.editorStates.size).toBe(0);
  });

  it("does not call removed helpers from a copied cursor-change callback", async () => {
    editor = await lumine.workspace.open();
    editor.setText("abcd");
    const earlier = editor.onDidAddCursor(() => main.deactivate());
    cleanups.push(() => earlier.dispose());
    main = (await lumine.packages.activatePackage("cursor-leader")).mainModule;
    let error;
    try {
      editor.addCursorAtBufferPosition([0, 2]);
    } catch (value) {
      error = value;
    }
    expect(error).toBeUndefined();
    expect(Object.hasOwn(editor, "cursorIndex")).toBe(false);
    expect(Object.hasOwn(editor, "cursorHighlight")).toBe(false);
  });

  it("preserves a newer activation created during real status tile cleanup", async () => {
    editor = await lumine.workspace.open();
    main = (await lumine.packages.activatePackage("cursor-leader")).mainModule;
    await lumine.packages.activatePackage("status-bar");
    const StatusBarView =
      lumine.packages.getActivePackage("status-bar").mainModule.statusBar.constructor;
    bar = new StatusBarView();
    const lease = main.consumeStatusBar(bar);
    cleanups.push(() => lease.dispose());
    const tile = bar
      .getRightTiles()
      .find((value) => value.getItem().matches?.(".cursor-leader-status"));
    const destroy = tile.destroy.bind(tile);
    spyOn(tile, "destroy").and.callFake(() => {
      main.activate();
      main.powerGlobal();
      const currentLease = main.consumeStatusBar(bar);
      cleanups.push(() => currentLease.dispose());
      destroy();
    });
    main.deactivate();
    expect(main.editorStates.has(editor)).toBe(true);
    expect(editor.cursorPower).toBe(true);
    expect(editor.getCursors()).toEqual([editor.cursors.at(-1)]);
  });

  it("keeps another owner's wrapper and lets its retired delegate use the original method", async () => {
    editor = await lumine.workspace.open();
    main = (await lumine.packages.activatePackage("cursor-leader")).mainModule;
    const delegate = editor.getLastCursor;
    const wrapper = function () {
      return delegate.call(this);
    };
    editor.getLastCursor = wrapper;
    await lumine.packages.deactivatePackage("cursor-leader");
    expect(editor.getLastCursor).toBe(wrapper);
    expect(wrapper.call(editor)).toBe(editor.cursors.at(-1));
    delete editor.getLastCursor;
  });

  it("does not navigate an old editor when a non-text pane owns the menu command", async () => {
    editor = await lumine.workspace.open();
    editor.setText("abcd");
    main = (await lumine.packages.activatePackage("cursor-leader")).mainModule;
    editor.addCursorAtBufferPosition([0, 2]);
    const item = {
      getTitle: () => "Owned non-text surface",
      element: document.createElement("div"),
    };
    lumine.workspace.getActivePane().activateItem(item);
    expect(lumine.workspace.getActiveTextEditor()).toBeUndefined();
    const before = editor.cursorIndex;
    lumine.commands.dispatch(lumine.workspace.getElement(), "cursor-leader:previous");
    expect(editor.cursorIndex).toBe(before);
    lumine.workspace.getActivePane().destroyItem(item);
  });
});
