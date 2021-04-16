const crypto = require('crypto');
var request = require('request');
const db = require('./database/db.js')
const bcrypt = require('bcrypt');
const config = require('./config.js')
const jwt = require('jsonwebtoken');
const { has, use } = require('browser-sync');


module.exports = {
    register(req, res) {
        return res.render('register')
    },

    index(req, res) {
        return res.render('index')
    }, 

    async newUser(req, res) {
        let file = req.file

        let checkUsername = await db('user').select('*').where({username: req.body.username})
        console.log(checkUsername[0])
        if (checkUsername[0] != undefined) {
            res.json({ status: 'error', message: 'Nome de usuario indisponivel :('})
            return
        }

        if (req.body.name == '') {
            res.json({ status: 'error', message: 'Invalid input arguments!'})
            return
        } else if (req.body.username == '' || req.body.username.length < 6) {
            res.json({ status: 'error', message: 'Invalid input arguments!'})
            return
        } else if (req.body.password == '' || req.body.password.length < 6) {
            res.json({ status: 'error', message: 'Invalid input arguments!'})
            return
        } else if (file == '' || file == undefined) {
            res.json({ status: 'error', message: 'Invalid input arguments!'})
            return 
        }   

        var options = {
        'method': 'POST',
        'url': 'https://api.imgur.com/3/image',
        'headers': { 'Authorization': 'Client-ID 87175677baaed32'},
        'formData': {'image': file.buffer}};

        let hashPassword = await bcrypt.hash(req.body.password, 15)

        let hash = await crypto.randomBytes(15).toString('hex');
        let dataModel = JSON.stringify({
            seg: 0, 
            ter: 0,
            qua: 0,
            qui: 0,
            sex: 0,
            sab: 0,
            dom: 0
        })
        
        
        request(options, async function (error, response) {
            let body = JSON.parse(response.body);
            let link = body.data.link
            if (error) throw new Error(error);

            await db('user').insert({ username: req.body.username, password: hashPassword, name: req.body.name, image: link});
            await db('links').insert({tags: '{}', username: req.body.username})
            await db('analise').insert({username: req.body.username, data: dataModel, total: '0' })

            const token = jwt.sign({ username: req.body.username}, config.secret, {
                expiresIn: 86400
            })

            return res.json({ status: 'sucess', message: 'Conta criada com sucesso!', token: token })
        });
    },

    async login(req, res) {
        return res.render('login')
    },

    async checkLogin(req, res) {
        
        if (req.body.username == '' || req.body.username.length < 6) {
            return res.json({ status: 'error', message: 'Invalid input arguments!'})
        } else if (req.body.password == '' || req.body.password.length < 6) {
            return res.json({ status: 'error', message: 'Invalid input arguments!'})
        }
        
        let checkUsername = await db('user').select('password').where({username: req.body.username});
        console.log(checkUsername)
        if (checkUsername[0] == undefined) {
            return res.json({status: 'error', message: 'Nome de usuario não encontrado!'});
        } else if (checkUsername[0].password != undefined || checkUsername[0].password != '') {
            let comparePassword = await bcrypt.compare(req.body.password, checkUsername[0].password)

            if (comparePassword) {
                const token = jwt.sign({ username: req.body.username}, config.secret, {
                    expiresIn: 86400
                })
                return res.json({status: 'sucess', message: 'Login efetuado com sucesso!', token: token})
            } else if (!comparePassword) {
                return res.json({status: 'error', message: 'Senha inválida!'})
            }
        }
    },

    async userPageRender(req, res) {
        return res.render('admin')
    },


    async postNewTag(req, res) {
        let file = req.file

        console.log(req.username)

        if(req.username == '') {
            return res.json({status: 'error', message: 'Username invalido!'})
        }
        
        if (req.body.title == '' || req.body.url == '') {
            return res.json({status: 'error', message: 'Argumentos inválidos!'})
        }

        let tags = await db('links').select('tags').where({username: req.username})
        let obj = JSON.parse(tags[0].tags)
        console.log(obj)

        if (Object.keys(obj).length > 5) {
            return res.json({status: 'error', message: 'Limite de tags atingido!'})
        }

        console.log('passou')
        
        let hash = await crypto.randomBytes(15).toString('hex');
        
        if (file == undefined) {
            obj[hash.slice(0, 6)] = {
                title: req.body.title,
                icon: req.body.iconDefault,
                url: req.body.url
            }

            await db('links').update({tags: JSON.stringify(obj)}).where({username: req.username})

            return res.json({status: 'sucess', message: 'Tag criada com sucesso!', tag:hash.slice(0, 6), icon: req.body.url})
        }

        var options = {
            'method': 'POST',
            'url': 'https://api.imgur.com/3/image',
            'headers': { 'Authorization': 'Client-ID 87175677baaed32'},
            'formData': {'image': file.buffer}};
            
        request(options, async function (error, response) {
            let body = JSON.parse(response.body);
            let link = body.data.link

            obj[hash.slice(0, 6)] = {
                title: req.body.title,
                icon: link,
                url: req.body.url
            }
            
            await db('links').where({username: req.username}).update({ tags: JSON.stringify(obj)})
            
            return res.json({status: 'sucess', message: 'Tag criada com sucesso!', tag:hash.slice(0, 6), icon: link})
        });

       
    },

    async checkUser(req, res) {
        console.log(req.username)

        if(req.username.trim() == '') {
            return res.json({status: 'error', message: 'Username invalido!'})
        }

        let tags = await db('links').select('tags').where({username: req.username})
        let user = await db('user').select({image: 'image', name: 'name'}).where({username: req.username})
        console.log(user)
        if (tags[0] != undefined) {
            return res.json({ status: 'sucess', data: tags[0].tags, username: req.username, image: user[0].image, name: user[0].name})
        }
    },

    async deleteTag(req, res) {
        let username = req.username
        let tags = await db('links').select('tags').where({username: username})

        if (tags[0] == undefined){
            return res.json({status: 'error', message: 'Tag inválida!'})
        } 
        
        let obj = JSON.parse(tags[0].tags)

        delete obj[req.body.tag]
        
        await db('links').update({tags: JSON.stringify(obj)}).where({username: req.username})

        return res.json({status: 'sucess', message: 'Tag apagada :)'})
    },

    async userTagRender(req, res) {
        return res.render('usertag')
    },

    async getTags(req, res) {
        if (req.params == undefined) {
            return res.json({ status: 'error', message: 'Url de usuario não encontrado!'})
        }

        let username = req.params.username

        let tags = await db('links').select('tags').where({username: username})
        if (tags[0] != undefined) {
            let user = await db('user').select({name: 'name', image: 'image'}).where({username: username})
            console.log(user)
            return res.json({ status: 'sucess', tags: tags[0].tags, user: user[0]})
        } else {
            return res.json({ status: 'error', message: 'Url de usuario não encontrado!'})
        }
    },

    async countClient(req, res) {
        let username = req.params.username
        let date = new Date()
        let week = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
        let day = week[date.getDay()]

        let data = await db('analise').select({data: 'data', total: 'total'}).where({username: username})
        console.log(data)
        if (data[0] == undefined) {
            return res.json({status: 'error', message: 'user not found'})
        }
        let total = Number(data[0].total) + 1
        let obj = await JSON.parse(data[0].data)
        obj[day] = await Number(obj[day]) + 1

        await db('analise').where({username: username}).update({data: JSON.stringify(obj), total: total})

        return res.json({})
    },

    async getAnalise(req, res) {
        let username = req.username

        if (username == '') {
            return res.json({status: 'error', message: 'Usuario não encontrado'})
        } 

        let data = await db('analise').select({data: 'data', total: 'total'}).where({username: username})
        if (data[0] == undefined) {
            return res.json({status: 'error', message: 'user not found'})
        }

        return res.json({status: 'sucess', data: data[0]})
    },

    async changePass(req, res) {
        let username = req.username
        let password = req.body.password

        if (username == '') {
            return res.json({status: 'error', message: 'Usuario não encontrado'})
        } 

        if (password.length > 6 || password != '') {
            let hash = await bcrypt.hash(password, 15)

            await db('user').update({ password: hash }).where({ username: username })

            return res.json({status: 'sucess', message: 'Senha alterada com sucesso!'})
        }

    },
    
    async changeImage(req, res) {
        let username = req.username
        let file = req.file

        if (file == undefined || file == null) {
            return res.json({status: 'error', message: 'Imagem inválida!'})
        }

        if (username == '') {
            return res.json({status: 'error', message: 'Usuario não encontrado'})
        } 

        var options = {
            'method': 'POST',
            'url': 'https://api.imgur.com/3/image',
            'headers': { 'Authorization': 'Client-ID 87175677baaed32'},
            'formData': {'image': file.buffer}};

        request(options, async function (error, response) {
            let body = JSON.parse(response.body);
            let link = body.data.link
            if (error) throw new Error(error);

            await db('user').update({ image: link }).where({username: username})
            return res.json({ status: 'sucess', message: 'Imagem alterada com sucesso!', link: link})
        });
    },

    async changeUsername(req, res) {
        let checkUsername = await db('user').select('*').where({username: req.body.username})
        if (checkUsername[0] != undefined) {
            return res.json({ status: 'error', message: 'Nome de usuario indisponivel :('})
        }

        await db('user').update({username: req.body.username}).where({username: req.username})
        await db('links').update({username: req.body.username}).where({username: req.username})
        await db('analise').update({username: req.body.username}).where({username: req.username})

        const token = jwt.sign({ username: req.body.username}, config.secret, {
            expiresIn: 86400
        })

        return res.json({status: 'sucess', message: 'Nome de usuario alterado :)', token: token})
    }
} 
