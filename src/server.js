const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const pages = require('./pages.js')
const bodyParser = require('body-parser')
var multer  = require('multer')
var upload = multer() 
const jwt = require('jsonwebtoken')
const config = require('./config.js')

function checkToken(req, res, next) {
    const key = req.headers.token 

    if (key == '' || key== undefined) {
        return res.json({status: 'error', message: 'Token jwt invalido!1'})
    }

    if (key.length < 10) {
        return res.json({status: 'error', message: 'Token jwt invalido!2'})
    } 

    jwt.verify(key, config.secret, (err, decoded) => {
        if (err) {
            return res.json({status: 'error', message: 'Token jwt invalido!'})
        }

        req.username = decoded.username
        return next()
    })
}


app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'))
app.engine('html', require('ajs').renderFile)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))

// ========================================= REGISTER
app.get('/register', pages.register)
app.post('/registerNewUser', upload.single('img'), pages.newUser)
// =========================================


// ========================================= LOGIN
app.get('/', pages.login)
app.get('/login', pages.login)
app.post('/checkLogin', pages.checkLogin)
// ========================================= 

// ========================================= USER PAGE
app.get('/userpageRender', pages.userPageRender)
app.post('/newTag', checkToken, upload.single('icon'), pages.postNewTag)
app.get('/checkUser', checkToken, pages.checkUser)
app.patch('/deleteTag', checkToken, pages.deleteTag)
app.get('/deleteTag', checkToken, pages.deleteTag)
app.get('/getAnalise', checkToken, pages.getAnalise)
// ========================================= 

// ========================================= USER PAGE
app.get('/user/:username', pages.userTagRender)
app.get('/getTags/:username', pages.getTags)
app.patch('/countClient/:username', pages.countClient)
app.patch('/changePass', checkToken, pages.changePass)
app.patch('/changeImage', checkToken, upload.single('img'), pages.changeImage)
app.patch('/changeUsername', checkToken, pages.changeUsername)
// ========================================= 

server.listen(process.env.PORT)
