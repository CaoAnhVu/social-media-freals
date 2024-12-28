// models/groupPollModel.js
import mongoose from "mongoose";
const pollSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      text: String,
      votes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  ],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  endDate: Date,
  multipleChoice: {
    type: Boolean,
    default: false,
  },
});
const GroupPoll = mongoose.model("GroupPoll", pollSchema);
export default GroupPoll;
