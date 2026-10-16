describe("Cursor Leader command availability", () => {
  let editor;
  beforeEach(async () => {
    jasmine.attachToDOM(lumine.workspace.getElement());
    await lumine.packages.activatePackage("cursor-leader");
    editor = await lumine.workspace.open();
  });
  afterEach(async () => {
    editor.destroy();
    await lumine.packages.deactivatePackage("cursor-leader");
  });
  it("keeps movement available readonly while declining text mutations", () => {
    editor.setReadOnly(true);
    expect(lumine.commands.canDispatch(editor.element, "cursor-leader:move-right")).toBe(true);
    for (const action of ["indent-selected-rows", "outdent-selected-rows", "toggle-line-comments"])
      expect(lumine.commands.canDispatch(editor.element, `cursor-leader:${action}`)).toBe(false);
  });
  it("keeps global mode meaningful while declining editor-dependent operations in an empty workspace", () => {
    editor.destroy();
    const target = lumine.workspace.getElement();
    expect(lumine.commands.canDispatch(target, "cursor-leader:power-global")).toBe(true);
    for (const action of ["power-editor", "toggle", "previous", "next"])
      expect(lumine.commands.canDispatch(target, `cursor-leader:${action}`)).toBe(false);
  });
});
