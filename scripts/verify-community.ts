import assert from "node:assert/strict";

import { communityCommentSchema, communityPostSchema } from "../src/lib/community/validation";
import { countReactions, nextReactionState, containsBlockedCommunityContent, transformCloudinaryUrl } from "../src/lib/community/helpers";

const post = communityPostSchema.parse({
  content: "Bella found a forever home today. The PawPrint family helped so much!",
  photos: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
  tag: "ADOPTION",
});
assert.equal(post.content.includes("forever home"), true);
assert.throws(() => communityPostSchema.parse({ content: "Read https://spam.example now", photos: [], tag: "RESCUE" }), /Links are not allowed/);
assert.throws(() => communityPostSchema.parse({ content: "x".repeat(501), photos: [], tag: "DAILY_JOY" }));
assert.throws(() => communityPostSchema.parse({ content: "Nice story", photos: ["https://a.lk/1.jpg", "https://a.lk/2.jpg", "https://a.lk/3.jpg", "https://a.lk/4.jpg"], tag: "REUNION" }));

const comment = communityCommentSchema.parse({ content: "So happy for this pup!" });
assert.equal(comment.content, "So happy for this pup!");
assert.throws(() => communityCommentSchema.parse({ content: "badword comment" }), /kind and friendly/);
assert.throws(() => communityCommentSchema.parse({ content: "visit http://spam.test" }), /Links are not allowed/);
assert.equal(containsBlockedCommunityContent("This is kind"), false);
assert.equal(containsBlockedCommunityContent("This has badword"), true);

const reactions = [
  { userId: "u1", type: "LOVE" as const },
  { userId: "u2", type: "LOVE" as const },
  { userId: "u3", type: "PAWPRINT" as const },
];
assert.deepEqual(countReactions(reactions), { LOVE: 2, CELEBRATE: 0, PAWPRINT: 1 });
assert.equal(nextReactionState("LOVE", "LOVE"), null);
assert.equal(nextReactionState("LOVE", "CELEBRATE"), "CELEBRATE");
assert.equal(nextReactionState(null, "PAWPRINT"), "PAWPRINT");

assert.equal(transformCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/v1/pawprint/x.jpg"), "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1/pawprint/x.jpg");
assert.equal(transformCloudinaryUrl("https://example.com/x.jpg"), "https://example.com/x.jpg");

console.log("Community verification checks passed");
