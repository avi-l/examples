const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    members: {
      type: Array,
    },
    timestamp: Number,
  }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
