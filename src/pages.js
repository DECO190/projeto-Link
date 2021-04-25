const crypto = require('crypto');
var request = require('request');
const db = require('./database/db.js')
const bcrypt = require('bcrypt');
const config = require('./config.js')
const jwt = require('jsonwebtoken');

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

        if (req.body.name == '' || req.body.name.length > 100) {
            res.json({ status: 'error', message: 'Invalid input arguments!'})
            return
        } else if (req.body.username == '' || req.body.username.length < 6 || req.body.username.length > 60) {
            res.json({ status: 'error', message: 'Invalid input arguments!'})
            return
        } else if (req.body.password == '' || req.body.password.length < 6 || req.body.password.length > 50 ) {
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
        
        if (req.body.username == '' || req.body.username.length < 6 || req.body.username.length > 60) {
            return res.json({ status: 'error', message: 'Invalid input arguments!'})
        } else if (req.body.password == '' || req.body.password.length < 6 || req.body.password.length > 50) {
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

        if(req.username == '' || req.username == undefined) {
            return res.json({status: 'error', message: 'Username invalido!'})
        }
        
        if (req.body.title == '' || req.body.url == '' || req.body.title.length > 60 || req.body.url.length > 150) {
            return res.json({status: 'error', message: 'Argumentos inválidos!'})
        }

        let tags = await db('links').select('tags').where({username: req.username})
        let obj = JSON.parse(tags[0].tags)
        console.log(obj)

        if (Object.keys(obj).length >= 5) {
            let checkPremium = await db('user').select('premium').where({ username: req.username })
            if (checkPremium[0].premium == 'false') {
                return res.json({status: 'error', message: 'Limite de tags atingido!'})
            }
        }

        console.log('passou')
        
        let hash = await crypto.randomBytes(15).toString('hex');
        
        if (file == undefined) {
            obj[hash.slice(0, 6)] = {
                title: req.body.title,
                icon: req.body.iconDefault,
                url: req.body.url,
                count: 0
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
                url: req.body.url,
                count: 0
            }
            
            await db('links').where({username: req.username}).update({ tags: JSON.stringify(obj)})
            
            return res.json({status: 'sucess', message: 'Tag criada com sucesso!', tag:hash.slice(0, 6), icon: link})
        });

       
    },

    async checkUser(req, res) {
        console.log(req.username)

        if(req.username == '' || req.username == undefined) {
            return res.json({status: 'error', message: 'Username invalido!'})
        }

        let tags = await db('links').select('tags').where({username: req.username})
        let user = await db('user').select({image: 'image', name: 'name', premium: 'premium'}).where({username: req.username})
        let obj;
        let premium = user[0].premium

        if (user[0].premium == 'true') {
            obj = tags[0].tags
        } else if (user[0].premium == 'false') {
            let tagParsed = JSON.parse(tags[0].tags)
            obj = {}
            for (let i in tagParsed) {
                obj[i] = {icon: tagParsed[i].icon, url: tagParsed[i].url, title: tagParsed[i].title}
            }
            obj = JSON.stringify(obj)
        }
        
        if (tags[0] != undefined) {
            return res.json({ status: 'sucess', data: obj, username: req.username, image: user[0].image, name: user[0].name, premium: premium})
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
            let user = await db('user').select({name: 'name', image: 'image', premium: 'premium', verified: 'verified'}).where({username: username})
            let tagParsed = JSON.parse(tags[0].tags)
            let obj = {}
            for (let i in tagParsed) {
                obj[i] = {icon: tagParsed[i].icon, url: tagParsed[i].url, title: tagParsed[i].title}
            }
            return res.json({ status: 'sucess', tags: JSON.stringify(obj), user: user[0]})
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

        if (password.length > 6 && password != '' && req.body.password.length <= 50) {
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
        if (req.body.username == '' || req.body.username.length < 6 || req.body.username.length > 60) {
            return res.json({ status: 'error', message: 'Nome de usuario indisponivel :('})
        }

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
    },

    async countLinkClick(req, res) {
        let username = req.body.username
        let tagId = req.body.tagId
        let data = await db('links').select('tags').where({username: username})
        if (data[0] == undefined) {
            return res.json({status: 'error', message: 'user not found'})
        }

        let obj = JSON.parse(data[0].tags)
        obj[tagId].count = Number(obj[tagId].count) + 1

        await db('links').update({tags: JSON.stringify(obj)}).where({username: username})
        return res.send('ok')
    }
} 