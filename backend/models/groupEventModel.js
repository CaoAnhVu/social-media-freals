// models/groupEventModel.js
import mongoose from "mongoose";
const eventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  startDate: Date,
  endDate: Date,
  location: {
    type: String,
    required: true,
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ["going", "maybe", "not_going"],
        default: "going",
      },
    },
  ],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const GroupEvent = mongoose.model("GroupEvent", eventSchema);
export default GroupEvent;
