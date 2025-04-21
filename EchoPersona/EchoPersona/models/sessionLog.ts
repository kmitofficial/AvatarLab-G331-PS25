// /model/sessionLog.js
import mongoose from "mongoose";

const SessionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
  },
  textInput: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SessionLog = mongoose.models.SessionLog || mongoose.model("SessionLog", SessionLogSchema);
export default SessionLog;