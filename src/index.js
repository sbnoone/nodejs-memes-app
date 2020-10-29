const path = require('path'),
  express = require('express'),
  mongoose = require('mongoose'),
  exphbs = require('express-handlebars'),
  csrf = require('csurf'),
  helmet = require('helmet'),
  compression = require('compression'),
  flash = require('connect-flash'),
  session = require('express-session'),
  MongoStore = require('connect-mongodb-session')(session),
  varMiddleware = require('./middleware/variables'),
  errorHandler = require('./middleware/error'),
  fileMiddleware = require('./middleware/file'),
  userMiddleware = require('./middleware/user'),
  memesRouter = require('./routes/memesRouter'),
  authRouter = require('./routes/authRouter'),
  profileRouter = require('./routes/profile'),
  addRouter = require('./routes/addRouter'),
  favoriteRouter = require('./routes/favorite'),
  _handlebars = require('handlebars'),
  keys = require('./keys'),
  { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const app = express()
const PORT = process.env.PORT || 7777

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(_handlebars),
  helpers: require('./utils/hbs-helpers'),
})

const store = new MongoStore({
  collection: 'session',
  uri: keys.MONGODB_URI,
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
)

app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/favorite', favoriteRouter)
app.use('/profile', profileRouter)
app.use('/auth', authRouter)
app.use('/add', addRouter)
app.use('/', memesRouter)

app.use(errorHandler)

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}
start()
