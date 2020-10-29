const { Schema, model } = require('mongoose')

const user = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  avatarURL: String,
  resetToken: String,
  resetTokenExp: Date,
  favoriteMemes: {
    items: [
      {
        memeId: {
          type: Schema.Types.ObjectId,
          ref: 'Meme',
          required: true,
        },
      },
    ],
  },
})

user.methods.addToFav = function (meme) {
  const items = [...this.favoriteMemes.items]
  const idx = items.findIndex(m => m.memeId.toString() === meme._id.toString())

  if (idx > -1) {
    return // Уже в избранном
  } else {
    items.push({
      memeId: meme._id, // Add to favorite
    })
  }

  this.favoriteMemes = { items }
  return this.save()
}

module.exports = model('User', user)
