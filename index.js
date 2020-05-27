if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const methodOverride = require('method-override');


const app = express()
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


const initializePassport = require('./passport-config')
initializePassport(passport, 
                (email) => users.find(user => user.email === email),
                (id) => users.find(user => user.id === id))


const users = [{ id: '1590547790419',
name : 'aritra',
email: 'example',
password:
 '$2b$08$WdZUCVQbh6Al4OJaNbmntOYYeGRqOHPgFOPz3TN7pMePwod25U.02' }];



app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name : req.user.name })
})


//---------------------LOGIN---------------------------
app.get('/login', checkNotAuthenticated,(req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


//---------------------REGISTER---------------------------
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 8)
        users.push({
            id : Date.now().toString(),
            name : req.body.name,
            email : req.body.email,
            password : hashedPassword
        })
        res.redirect('/login');
    } catch(e){
        res.redirect('/register');
    }
    console.log(users[0]);
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }


app.listen(8000)