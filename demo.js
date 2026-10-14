// Authentic package usage. Run with lumine/script/demo.js; fixtures stay in demo/.
module.exports = {
  version: 1,
  dependencies: ["language-javascript"],
  viewport: { width: 1100, height: 730 },
  async before() {},
  async prepare(context) {
    const { lumine, state, fixture, open } = context;
    state.editor = await open("editing/signal.js");
    await lumine.project.setPaths([fixture("editing")]);
    state.editor.setSelectedBufferRanges([
      [
        [2, 4],
        [2, 4],
      ],
      [
        [6, 4],
        [6, 4],
      ],
      [
        [11, 4],
        [11, 4],
      ],
    ]);
  },
  scenes: [
    {
      id: "scene-1",
      file: "demo.png",
      caption: "Control one cursor independently while retaining the other editing positions.",
      timeout: 60000,
      async run(context) {
        const { lumine, state } = context;
        {
          lumine.commands.dispatch(
            lumine.views.getView(state.editor),
            "cursor-leader:power-editor",
          );
        }
      },
      ready(context) {
        const { state } = context;
        return Boolean(state.editor.getElement().classList.contains("cursor-leader"));
      },
    },
  ],
  async cleanup(context) {
    const { lumine } = context;
    lumine.packages.deactivatePackage("cursor-leader");
  },
};
