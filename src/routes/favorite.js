const { Router } = require('express')
const auth = require('../middleware/auth')
const Meme = require('../models/meme')
const User = require('../models/user')
const router = Router()

function mapFavMemes(memes) {
   return memes.map(m => ({
      ...m.memeId._doc,
   }))
}

//@path /memes/favorite/remove
router.post('/remove', async (req, res) => {
   const user = await User.findById(req.user).lean()

   const updatedUser = new User({
      ...user,
      favoriteMemes: {
         items: user.favoriteMemes.items.filter(
            m => m.memeId.toString() !== req.body.id.toString()
         ),
      },
   })
   console.log(updatedUser)
   await User.findByIdAndUpdate(req.user, updatedUser)
   res.redirect('/memes/favorite')
})

// @path /memes/favorite/add
router.post('/add', async (req, res) => {
   try {
      const meme = await Meme.findById(req.body.id)
      await req.user.addToFav(meme)
      res.redirect('/memes/favorite')
   } catch (e) {
      console.log(e)
   }
})

//@route GET /memes/favorite
router.get('/', auth, async (req, res) => {
   try {
      // Получаем избранные мемы пользователя
      const user = await req.user
         .populate('favoriteMemes.items.memeId')
         .execPopulate()

      const memes = mapFavMemes(user.favoriteMemes.items)

      res.render('favorite', {
         isFavorite: true,
         title: 'Избранное',
         userId: req.user ? req.user._id.toString() : null,
         memes,
      })
   } catch (e) {
      console.log(e)
   }
})

module.exports = router
