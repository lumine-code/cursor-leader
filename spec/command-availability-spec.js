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
  it("finishes worker-owned comment changes before its command resolves", async () => {
    jasmine.useRealClock();
    const execution = lumine.grammars.syntaxExecution;
    try {
      lumine.grammars.syntaxExecution = "worker";
      await lumine.packages.activatePackage("language-javascript");
      editor.setText("const value = 1;");
      lumine.grammars.assignGrammar(
        editor.getBuffer(),
        lumine.grammars.grammarForScopeName("source.js"),
      );
      await editor.whenGrammarSettled();
      expect(editor.getBuffer().getLanguageMode().asynchronousSyntax).toBeTrue();
      editor.selectAll();
      await lumine.commands.dispatch(editor.element, "cursor-leader:toggle-line-comments");
      expect(editor.getText()).toBe("// const value = 1;");
      editor.undo();
      expect(editor.getText()).toBe("const value = 1;");
    } finally {
      lumine.grammars.syntaxExecution = execution;
    }
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
