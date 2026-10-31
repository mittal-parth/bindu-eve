import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "A fact saved in one session is recalled in a later session.",
  tags: ["model"],
  async test(t) {
    const saved = await t.send(
      "Save this to long-term memory and do not answer until you have saved it: my favorite tea is gyokuro.",
    );
    saved.succeeded();
    saved.calledTool("file__save_memory");

    const recalled = await t.send("What is my favorite tea? Reply with the tea name only.");
    recalled.succeeded();
    t.check(recalled.reply, includes(/gyokuro/i));
  },
});
