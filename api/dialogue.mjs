import {actors} from "../lib/actors.mjs";
import {createDialogue} from "../lib/dialogue.mjs";

export default {
  fetch(request) {
    return createDialogue(actors, (process.env.GROQ_API_KEY || "").trim())(request);
  },
};
