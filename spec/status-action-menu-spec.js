describe("cursor-leader status actions", () => {
  let main, resources, editor, window;
  const menu = () => lumine.contextMenu.templateForElement(resources.widget);
  beforeEach(async () => {
    window = lumine.workspace.getMainWindow();
    jasmine.attachToDOM(window.getElement());
    main = (await lumine.packages.activatePackage("cursor-leader")).mainModule;
    editor = await lumine.workspace.open();
    resources = main.createStatusBarResources({ addRightTile: () => ({ destroy() {} }) }, window);
    window.getElement().appendChild(resources.widget);
  });
  afterEach(async () => {
    main.destroyStatusBarConnection(resources);
    await lumine.packages.deactivatePackage("cursor-leader");
  });
  it("shares the global and local commands with mouse shortcuts", () => {
    const element = resources.widget;
    expect(menu().map((item) => item.command)).toEqual([
      "cursor-leader:power-global",
      "cursor-leader:power-editor",
    ]);
    expect(menu().map((item) => item.mouseBindingLabel)).toEqual(["LMB", "Shift+LMB"]);
    const [tooltip] = lumine.tooltips.findTooltips(element);
    expect(tooltip.options.keyBindingCommand).toBe("cursor-leader:power-global");
    expect(tooltip.options.keyBindingExtra).toBeUndefined();
    expect(tooltip.getTitle()).toContain("Click to toggle.");
    element.dispatchEvent(new MouseEvent("click", { button: 2 }));
    expect(main.global).toBe(false);
    element.click();
    expect(menu().map((item) => item.checked)).toEqual([true, true]);
    element.dispatchEvent(new MouseEvent("click", { button: 0, shiftKey: true }));
    expect(menu().map((item) => item.checked)).toEqual([true, false]);
    lumine.commands.dispatch(element, "cursor-leader:power-editor");
    expect(editor.cursorPower).toBe(true);
  });
  it("toggles a detached editor once without affecting the active editor", () => {
    const detached = lumine.workspace.buildTextEditor();
    const registration = lumine.textEditors.add(detached, { role: "fragment" });
    jasmine.attachToDOM(detached.getElement());
    try {
      lumine.commands.dispatch(detached.getElement(), "cursor-leader:power-editor");
      expect(detached.cursorPower).toBe(true);
      expect(editor.cursorPower).toBe(false);
    } finally {
      registration.dispose();
      detached.destroy();
    }
  });
  it("retires its menu with its tile", () => {
    const element = resources.widget;
    main.destroyStatusBarConnection(resources);
    expect(lumine.contextMenu.templateForElement(element)).toEqual([]);
  });

  it("uses the active embedded editor and disables the local action without one", async () => {
    const fragment = lumine.workspace.buildTextEditor();
    const registration = lumine.textEditors.add(fragment, { role: "fragment" });
    const item = {
      element: document.createElement("div"),
      getTitle: () => "Embedded editor",
      getActiveEmbeddedTextEditor: () => fragment,
    };
    const pane = lumine.workspace.getActivePane();
    try {
      pane.activateItem(item);
      lumine.commands.dispatch(resources.widget, "cursor-leader:power-editor");
      expect(fragment.cursorPower).toBe(true);
      expect(editor.cursorPower).toBe(false);
      expect(menu()[1].checked).toBe(true);
      item.getActiveEmbeddedTextEditor = () => undefined;
      expect(menu()[1].enabled).toBe(false);
      lumine.commands.dispatch(resources.widget, "cursor-leader:power-editor");
      expect(editor.cursorPower).toBe(false);
    } finally {
      await pane.destroyItem(item, true);
      registration.dispose();
      fragment.destroy();
    }
  });
});
