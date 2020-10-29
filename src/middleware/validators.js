const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidation = [
  body('email', 'Введите корректный email')
    .isEmail()
    .custom(async email => {
      try {
        const user = await User.findOne({ email })

        if (user) {
          return Promise.reject('Пользователь с таким email уже существует')
        }
      } catch (e) {
        console.log(e)
      }
    })
    .normalizeEmail(),
  body('password', 'Некорректный пароль').isAlphanumeric().isLength({ min: 6, max: 20 }).trim(),
  body('passwordConfirmation', 'Пароли должны совпадать').custom(async (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Пароли должны совпадать')
    }
    return true
  }),
  body('name', 'Имя должно быть не менее 2 символов').isAlphanumeric().isLength({ min: 2, max: 20 }).trim(),
]

exports.memeValidation = [
  body('title', 'Название не менее 2 символов').isLength({ min: 2, max: 100 }).isAscii(),
  body('image', 'Введите корректный URL картинки').isURL(),
]

exports.commentValidation = [
  body('comment', 'Не может быть пустым')
    .notEmpty({ ignore_whitespace: true })
    .isLength({ min: 1, max: 500 })
    .isAlphanumeric(),
]
