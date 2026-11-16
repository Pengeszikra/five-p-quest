import profiles from "../actors.js";

export const actors = new Map(profiles.map(actor => [actor.id, actor]));
