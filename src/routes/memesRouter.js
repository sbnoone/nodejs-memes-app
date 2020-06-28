const { Router } = require('express')
const { validationResult } = require('express-validator')
const Meme = require('../models/meme')

const { isObjectId } = require('../utils/isValid')
const auth = require('../middleware/auth')
const { memeValidation } = require('../middleware/validators')
const router = Router()

function isOwner(meme, req) {
   return meme.userId.toString() === req.user._id.toString()
}

router.post('/remove', async (req, res) => {
   try {
      await Meme.deleteOne({
         _id: req.body.id,
         userId: req.user._id,
      })
      res.redirect('/memes')
   } catch (e) {
      console.log(e)
   }
})

router.post('/edit', memeValidation, async (req, res) => {
   const { id } = req.body
   delete req.body.id
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return res.status(422).redirect(`/memes/${id}/edit`)
   }

   try {
      const meme = await Meme.findById(id)
      if (!isOwner(meme, req)) {
         res.redirect('/memes')
      }
      Object.assign(meme, req.body)
      await meme.save()
      res.redirect(`/memes/${id}`)
   } catch (e) {
      console.log(e)
   }
})

router.get('/:id/edit', auth, async (req, res) => {
   try {
      const meme = await Meme.findById(req.params.id)

      if (!isOwner(meme, req)) {
         return res.redirect('/memes')
      }

      res.render('edit-meme', {
         isEdit: true,
         title: `Редактировать ${meme.title}`,
         meme,
      })
   } catch (e) {
      console.log(e)
   }
})

router.get('/:id', async (req, res) => {
   try {
      if (!isObjectId(req.params.id)) {
         res.status(404).render('404', {
            title: 'Страница не найдена',
         })
      }
      const meme = await Meme.findById(req.params.id)

      res.render('meme', {
         layout: 'empty',
         title: meme.title,
         meme,
      })
   } catch (e) {
      console.log(e)
   }
})

router.get('/', async (req, res) => {
   try {
      const memes = await Meme.find().populate('userId', 'email name')

      res.render('memes', {
         title: 'Memes',
         isMemes: true,
         userId: req.user ? req.user._id.toString() : null,
         memes,
      })
   } catch (e) {
      console.log(e)
   }
})

module.exports = router
