const { Schema, model } = require('mongoose')

const meme = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  comments: [
    {
      comment: {
        type: String,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
})

module.exports = model('Meme', meme)
