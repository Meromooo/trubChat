const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    room:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // populated to show the username
    content: { type: String, required: true },
  },
  { timestamps: true } // createdAt is used to sort messages and show the time sent
)

module.exports = mongoose.model('Message', messageSchema)
