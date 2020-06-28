const crypto = require('crypto')
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const router = Router()
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const { registerValidation } = require('../middleware/validators')

const keys = require('../keys')

const transporter = nodemailer.createTransport(
   sendgrid({
      auth: { api_key: keys.SENDGRID_API_KEY },
   })
)

router.post('/login', async (req, res) => {
   const { email, password } = req.body

   try {
      const user = await User.findOne({ email })

      if (user) {
         const isCorrectPassword = await bcrypt.compare(password, user.password)

         if (isCorrectPassword) {
            req.session.user = user
            req.session.isAuthenticated = true
            req.session.save(err => {
               if (err) {
                  throw err
               }
               res.redirect('/')
            })
         } else {
            req.flash('loginError', 'Введите корректный email и пароль')
            res.redirect('/auth/login#login')
         }
         // Поле req.session появляется после установки пакета експресс-сессия
      } else {
         req.flash('loginError', 'Введите корректный email и пароль')
         res.redirect('/auth/register#register')
      }
   } catch (e) {
      console.log(e)
   }
})

router.post('/register', registerValidation, async (req, res) => {
   try {
      const { email, password, name } = req.body

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
         req.flash('registerError', errors.array()[0].msg)
         return res.status(422).redirect('/auth/register#register')
      }

      const hashPassword = await bcrypt.hash(password, 10)
      const newUser = new User({
         email,
         password: hashPassword,
         name,
         favoriteMemes: { items: [] },
      })
      await newUser.save()
      res.redirect('/auth/login#login')
      await transporter.sendMail(regEmail(email))
   } catch (e) {
      console.log(e)
   }
})

router.post('/password', async (req, res) => {
   try {
      const user = await User.findOne({
         _id: req.body.userId,
         resetToken: req.body.token,
         resetTokenExp: { $gt: Date.now() },
      })

      if (user) {
         user.password = await bcrypt.hash(req.body.password, 10)
         user.resetToken = undefined
         user.resetTokenExp = undefined
         await user.save()
         res.redirect('/auth/login')
      } else {
         req.flash('loginError', 'Время жизни токена истекло')
         res.redirect('/auth/login')
      }
   } catch (e) {
      console.log(e)
   }
})

router.get('/password/:token', async (req, res) => {
   if (!req.params.token) {
      return res.redirect('/auth/login')
   }

   try {
      const user = await User.findOne({
         resetToken: req.params.token,
         resetTokenExp: { $gt: Date.now() },
      })

      if (!user) {
         return res.redirect('/auth/login')
      } else {
         return res.render('password', {
            title: 'Восстановить доступ',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token,
         })
      }
   } catch (e) {
      console.log(e)
   }

   res.render('reset', {
      title: 'Забыли пароль?',
      error: req.flash('error'),
   })
})

router.get('/reset', (req, res) => {
   res.render('reset', {
      title: 'Забыли пароль?',
      error: req.flash('error'),
   })
})

router.post('/reset', (req, res) => {
   try {
      crypto.randomBytes(32, async (err, buffer) => {
         if (err) {
            req.flash(
               'error',
               'Что-то пошло не так, пожалуйста повторите попытку.'
            )
            return res.redirect('/auth/reset')
         }

         const token = buffer.toString('hex')
         const candidate = await User.findOne({ email: req.body.email })

         if (candidate) {
            candidate.resetToken = token
            candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
            await candidate.save()
            await transporter.sendMail(resetEmail(candidate.email, token))
            res.redirect('/auth/login')
         } else {
            req.flash('error', 'Такого email нет.')
            res.redirect('/auth/reset')
         }
      })
   } catch (e) {
      console.log(e)
   }
})

router.get('/logout', async (req, res) => {
   req.session.destroy(() => {
      res.redirect('/auth/login')
   })
})

router.get('/register', async (req, res) => {
   res.render('login', {
      title: 'Login',
      isLogin: true,
      registerError: req.flash('registerError'),
      loginError: req.flash('loginError'),
   })
})

router.get('/login', async (req, res) => {
   res.render('login', {
      title: 'Login',
      isLogin: true,
      registerError: req.flash('registerError'),
      loginError: req.flash('loginError'),
   })
})

module.exports = router
