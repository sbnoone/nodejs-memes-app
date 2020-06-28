const { Router } = require('express')
const { validationResult } = require('express-validator')
const Meme = require('../models/meme')
const auth = require('../middleware/auth')
const { memeValidation } = require('../middleware/validators')
const router = Router()

router.post('/', auth, memeValidation, async (req, res) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return res.status(422).render('add', {
         title: 'Добавить мем',
         isAdd: true,
         error: errors.array()[0].msg,
         data: {
            title: req.body.title,
            image: req.body.image,
         },
      })
   }

   const meme = new Meme({
      title: req.body.title,
      image: req.body.image,
      userId: req.user._id,
   })

   try {
      await meme.save()
      res.redirect('/memes')
   } catch (e) {
      console.log(e)
   }
})

router.get('/', auth, (req, res) => {
   res.render('add', {
      title: 'Добавить мем',
      isAdd: true,
   })
})

module.exports = router
