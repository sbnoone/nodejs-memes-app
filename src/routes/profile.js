const { Router } = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')

const router = Router()

router.get('/', auth, async (req, res) => {
   res.render('profile', {
      title: 'Профиль',
      isProfile: true,
      user: req.user.toObject(),
   })
})
// Dan Abramov picture => https://d2eip9sf3oo6c2.cloudfront.net/instructors/avatars/000/000/032/square_480/oapgW_Fp_400x400.jpg

router.post('/', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user._id)

      const toChange = {
         name: req.body.name,
      }

      if (req.file) {
         toChange.avatarURL = req.file.filename
      }
      Object.assign(user, toChange)
      await user.save()

      res.redirect('/profile')
   } catch (e) {
      console.log('Load image ERROR', e)
   }
})

module.exports = router
