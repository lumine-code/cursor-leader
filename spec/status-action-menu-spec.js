describe("cursor-leader status actions", () => {
  const { createRequire } = require("node:module");
  const coreRequire = createRequire(
    require("node:path").join(lumine.application.getResourcePath(), "package.json"),
  );
  const { humanizeKeystroke } = coreRequire("@lumine-code/underscore-plus");
  const primary = process.platform === "darwin" ? "cmd" : "ctrl";
  const globalStroke = `${primary}-k c g`;
  const editorStroke = `${primary}-k c e`;
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
    const dispatch = spyOn(lumine.commands, "dispatch").and.callThrough();
    const [tooltip] = lumine.tooltips.findTooltips(element);
    expect(tooltip.options.keyBindingCommand).toBe("cursor-leader:power-global");
    expect(tooltip.options.keyBindingExtra).toBeUndefined();
    expect(tooltip.getTitle()).toContain("Click to toggle.");
    element.dispatchEvent(new MouseEvent("click", { button: 2 }));
    expect(main.global).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
    element.click();
    expect(menu().map((item) => item.checked)).toEqual([true, true]);
    element.dispatchEvent(new MouseEvent("click", { button: 0, shiftKey: true }));
    expect(dispatch.calls.allArgs().map(([, command]) => command)).toEqual(
      menu().map((item) => item.command),
    );
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

  it("shows the editor shortcut without changing the global shortcut", async () => {
    expect(menu().map((item) => item.keyBindingLabel)).toEqual([
      humanizeKeystroke(globalStroke),
      humanizeKeystroke(editorStroke),
    ]);
    await lumine.workspace.getActivePane().destroyItem(editor, true);
    expect(menu().map((item) => item.keyBindingLabel)).toEqual([
      humanizeKeystroke(globalStroke),
      "",
    ]);
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
      expect(menu()[1].keyBindingLabel).toBe(humanizeKeystroke(editorStroke));
      item.getActiveEmbeddedTextEditor = () => undefined;
      expect(menu()[1].enabled).toBe(false);
      expect(menu()[1].keyBindingLabel).toBe("");
      lumine.commands.dispatch(resources.widget, "cursor-leader:power-editor");
      expect(editor.cursorPower).toBe(false);
    } finally {
      await pane.destroyItem(item, true);
      registration.dispose();
      fragment.destroy();
    }
  });
});
