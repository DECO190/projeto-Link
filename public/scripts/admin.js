var analiseData = false

let token = localStorage.getItem('token')

if (token == null) {
    window.location.href = '/login'
}

var user;


function deleteTag(event) {
    let token = localStorage.getItem('token')
    
    let element = event.currentTarget
    let data =  new URLSearchParams()
    data.append('tag', element.dataset.tag)
    console.log( element.dataset.tag)

    let headers = new FormData()
    headers.append('token', token)

    let options = {
        method: 'PATCH',
        body: data,
        headers: headers
    }

    fetch('/deleteTag', options)
        .then(async response =>{
            let obj = await response.json()

            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')
                
                element.parentNode.classList.add('disfade')
                element.parentNode.classList.remove('fade')
                
                let yaa = document.getElementById(`${element.dataset.tag}`)
                console.log(yaa)
                yaa.remove()
                

                setTimeout(() => {
                    element.parentNode.remove()
                }, 590)
            }
        })
}

function renderTags(data) {
    let container = document.querySelector('.tags-container')
    let obj = JSON.parse(data)
    for (let i in obj) {
        container.innerHTML += `
        <div class = 'tagUnit'>
            <div class = 'tagUnitPart1'>
                <img class = 'tagIconAdmin' src="${obj[i].icon}" alt="icone"> 
                <div class = 'vertLine2'></div>
                <div class = 'unitText'>
                    <h1>${obj[i].title}</h1>
                    <p>${obj[i].url}</p>
                </div>
             </div>
            
            <img data-tag = '${i}' onclick = 'deleteTag(event)' class = 'deletebttn' src="images/deletebox.svg" alt="">
        </div>
        `
    }
    
}

function renderAdmin() {
    console.log(user)
    let container = document.querySelector('.perfil')

    container.innerHTML = `
    <div class = 'userImage'></div>
    <p class = 'usernameTitle'>@${user.username}</p>
    <p class = 'userRealname'>${user.name}</p>
    <div class = 'horLine'></div>

    <div class = 'input-unit'>
        <img src="images/undefinedUserImg.svg">
        <input type="text" placeholder="Mudar username..." id = 'username'  autocomplete="off">
        <button onclick="changeUsername()">Alterar</button>
    </div>

    <div class = 'input-unit'>
        <img src="images/padlock.svg">
        <input type="text" placeholder="Mudar senha..." id = 'password'  autocomplete="off">
        <button onclick="changePass()">Alterar</button>
    </div>
    
    
    <div class = 'changeImgInput'>
        <input type="file"  id="image" hidden>
        <label for="image">
            <img src="images/upload.svg" alt="">
            <p>Imagem</p>
        </label>
        <button class = 'changeImgBttn' onclick="changeImage()">Alterar foto</button>
    </div>
    <div class = 'horLine extraLine'></div>
    <div class = 'copyContainer'>
        <div class = 'copyInput'>
            <input type="text" readonly="readonly" value = 'https://projetolink.herokuapp.com/user/${user.username}' id = 'userLink'  autocomplete="off">
            <div onclick= "copyLink()" class = 'dataCopy'>
                <img class = 'pasteIcon' src="images/paste.svg" alt="">
            </div>
        </div>
        <div class = 'qr-container'>
            <div id="qrcode"></div>
        </div>
    </div>

    <div class = 'logOutContainer'>
        <img onclick = 'logOut()' src="images/logout.svg" alt="">
        <p onclick = 'logOut()'>Finalizar Sessão</p>
    </div>

    ` 

    let image = document.querySelector('.userImage')
    image.style.backgroundImage = `url(${user.image})`

    let qrcode = new QRCode("qrcode");
    qrcode.makeCode(`https://projetolink.herokuapp.com/user/${user.username}`);
}

function checkUser() {
    document.querySelector('.loadingContainer').style.display = 'flex'
    let token = localStorage.getItem('token')

    let headers = new FormData()
    headers.append('token', token)

    let options = {
        method: 'GET',
        headers: headers
    }

    fetch('/checkUser', options)
    .then(async (response) => {
            document.querySelector('.loadingContainer').style.display = 'none'
            let obj = await response.json();

            if (obj.status == 'error') {
                document.querySelector('.loadingContainer').style.display = 'none'
                window.location.href = '/login'
                localStorage.removeItem('token')
                console.log(obj)
            } else if (obj.status == 'sucess') {
                document.querySelector('.loadingContainer').style.display = 'none'
                document.querySelector('.all-container').style.display = 'flex'
                document.querySelector('.all-container').classList.add('fade')
                
                
                user = obj
                renderTags(obj.data)
                renderAdmin()

            }

        })
}

function postTag() {
    let token = localStorage.getItem('token')

    if (token == undefined || token.trim() == '') {
        return window.location.href = '/login'
    }

    let headers = new FormData()
    headers.append('token', token)

    let title = document.querySelector('#tagTitle').value
    let url = document.querySelector('#tagUrl').value
    let icon = document.querySelector('#iconInput')

    
    if (title == '' || title.length <= 2) {
        return alertBox('Titulo invalido!', 'images/cancel.svg', 'rgb(233, 61, 61)')
    } else if (url == '' || url.length <= 2) {
        return alertBox('Url invalida!', 'images/cancel.svg', 'rgb(233, 61, 61)')
    } 
    
    let data = new FormData()
    data.append('url', url)
    data.append('title', title)

    if (icon.files[0] == '' || icon.files[0] == undefined) {
        data.append('iconDefault', 'https://i2.paste.pics/C6KND.png')
    } else {
        data.append('icon', icon.files[0])
    }

    let options = {
        method: 'POST',
        body: data,
        headers: headers
    }
    document.querySelector('.addBttn p').style.display = 'none'
    document.querySelector('.addBttn img').style.display = 'block'
    fetch('/newTag', options)
        .then(async response => {
            document.querySelector('.addBttn p').style.display = 'block'
            document.querySelector('.addBttn img').style.display = 'none'
            let obj = await response.json()
            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')
                let container = document.querySelector('.tags-container')
                container.innerHTML += `
                <div class = 'tagUnit fade'>
                    <div class = 'tagUnitPart1'>
                        <img src="${obj.icon}" class = 'tagIconAdmin' alt="icone"> 
                        <div class = 'vertLine2'></div>
                        <div class = 'unitText'>
                            <h1>${title}</h1>
                            <p>${url}</p>
                        </div>
                    </div>
                    <img data-tag = '${obj.tag}' onclick = 'deleteTag(event)' class = 'deletebttn' src="images/deletebox.svg" alt="">
                </div>
                `

                console.log(user, '<<<<<<<<<<<<<<<<<<<<<<')

                if (user.premium == 'false' || user.premium == undefined) {
                    return
                }

                let tagsContainerAnalise= document.querySelector('.tagsAnaliseContainer')

                tagsContainerAnalise.innerHTML += `
                    <div class = 'tagUnit analiseTag' id = "${obj.tag}">
                        <div class = 'tagUnitPart1'>
                            <img class = 'tagIconAdmin' src="${obj.icon}" alt="icone"> 
                            <div class="vertLine2"></div>
                            <div class = 'unitText'>
                                <h1>${title}</h1>
                                <p>${url}</p>
                            </div>
                        </div>
                        <div class = 'clickVisits'>
                            <h1>Visitas: </h1>
                            <p>0</p>
                        </div>
                    </div>
                ` 
            }
        })
}

function alertBox(text, url, color) {
    let container = document.querySelector('.alertBox-container');
    let line = document.querySelector('.countLine');

    let textElem = document.querySelector('.alertBox-container main p').textContent = text
    let image = document.querySelector('.alertBox-container main img').src = url

    container.style.display = 'flex';
    container.classList.add('appear');
    container.classList.remove('disappear');
    
    line.classList.add('width')
    line.style.backgroundColor = color

    setTimeout(() => {
        container.classList.remove('appear');
        container.classList.add('disappear');

        setTimeout(() => {
            container.style.display = 'none';
        }, 980)
    }, 4980)

}

function changeMenu(event) {
    
    let allSections = document.querySelectorAll('.menuSection-container')
    console.log(allSections)
    for (let i in allSections) {
        try {
            allSections[i].style.display = 'none'
        } catch (e) {
            continue
        }
    }
    
    let menus = document.querySelectorAll('.menu-unit')
    for (let i in menus) {
        try {
            menus[i].classList.remove('activeMenu')
        } catch(e) {
            continue
        }
    }

    let element = event.currentTarget

    element.classList.add('activeMenu')

    if (element.textContent == 'Analise') {
        analise()
    } else if (element.textContent == 'Tags') {
        document.querySelector('.tags').style.display = 'block'
        document.querySelector('.analise').style.display = 'none'
        document.querySelector('.perfil').style.display = 'none'
    } else if (element.textContent == 'Perfil') {
        document.querySelector('.tags').style.display = 'none'
        document.querySelector('.analise').style.display = 'none'
        document.querySelector('.perfil').style.display = 'flex'
    }
}

function renderAnalise(analiseData) {
    let daysObj = JSON.parse(analiseData.data.data) 
    console.log(daysObj)
    var maior = 0
    var menor = 100000000000000000000000000000
    var weektotal = 0

    for (let a in daysObj) {
        weektotal += daysObj[a]
        
        if (daysObj[a] > maior) {
            maior = daysObj[a]
        } 
        if (daysObj[a] < menor) {
            menor = daysObj[a]
        }
    }

    console.log(maior, menor, weektotal)

    let mainContainer = document.querySelector('.analise') 
    mainContainer.innerHTML += `
        <p class="totalText">Total da semana: <p class = 'totalTextV'>${weektotal} visitas</p></p>
        <p class="totalText">Total: <p class = 'totalTextV'>${analiseData.data.total} visitas</p></p>
    ` 

    var data = {
        labels: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'],
        series: [
            [daysObj['dom'], daysObj['seg'], daysObj['ter'], daysObj['qua'], daysObj['qui'], daysObj['sex'], daysObj['sab']]
        ]
    };

    var options = {
        high: maior + 10,
        low: menor,
    };

    new Chartist.Bar('.ct-chart', data, options);

    if (user.premium == 'false') {
        return
    }
    

    let tagsContainer = document.querySelector('.tagsAnaliseContainer')

    let obj = JSON.parse(user.data)

    console.log(obj, 'dsadsad')

    for (let o in obj) {
        tagsContainer.innerHTML += `
            <div class = 'tagUnit analiseTag' id = "${o}">
                <div class = 'tagUnitPart1'>
                    <img class = 'tagIconAdmin' src="${obj[o].icon}" alt="icone"> 
                    <div class="vertLine2"></div>
                    <div class = 'unitText'>
                        <h1>${obj[o].title}</h1>
                        <p>${obj[o].url}</p>
                    </div>
                </div>
                <div class = 'clickVisits'>
                    <h1>Visitas: </h1>
                    <p>${obj[o].count}</p>
                </div>
            </div>
        ` 
    }
    
} 

function analise() {
    if (!analiseData) {
        document.querySelector('.analise').style.display = 'flex'
        console.log('fez a requisição')
        let token = localStorage.getItem('token')
        
        let dataF = new FormData()
        dataF.append('token', token)

        fetch('/getAnalise', {method: 'GET', headers: dataF})
            .then(async response => {
                document.querySelector('.loadingContainer').style.display = 'none'
                let obj = await response.json()
                
                if (obj.status == 'sucess') {
                    renderAnalise(obj)
                    analiseData = true
                } else if (obj.status == 'error') {
                    console.log(obj.message)
                }
            })
    } else if (analiseData) {
        document.querySelector('.analise').style.display = 'flex'
    }
}

function changePass() {
    document.querySelector('.loadingContainer').style.display = 'flex'
    let token = localStorage.getItem('token')

    if (token == undefined || token.trim() == '') {
        return window.location.href = '/login'
    }

    let password = document.querySelector('#password').value
    
    if (password == '' || password.length <= 6) {
        alertBox('Senha inválida!', 'images/cancel.svg', 'rgb(233, 61, 61)')
    }

    let headers = new FormData()
    headers.append('token', token)

    let data = new URLSearchParams()
    data.append('password', password)


    fetch('/changePass', {method: 'PATCH', body: data, headers: headers})
        .then(async response => {
            document.querySelector('.loadingContainer').style.display = 'none'
            let obj = await response.json()
            
            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')
            }
        })

}

function changeImage() {
    document.querySelector('.loadingContainer').style.display = 'flex'
    let token = localStorage.getItem('token')

    if (token == undefined || token.trim() == '') {
        return window.location.href = '/login'
    }

    let image = document.querySelector('#image');

    if (image.files[0] == '' || image.files[0] == undefined) {
        document.querySelector('.loadingContainer').style.display = 'none'
        return alertBox('Imagem não selecionada!', 'images/cancel.svg', 'rgb(233, 61, 61)')
         
    }   

    let headers = new FormData()
    headers.append('token', token)

    let data = new FormData();
    data.append('img',  image.files[0])

    let options = {
        method: 'PATCH',
        body: data,
        headers: headers
    }

    fetch('/changeImage', options)
        .then(async response => {
            document.querySelector('.loadingContainer').style.display = 'none'
            let obj = await response.json()
            document.querySelector('.loadingContainer').style.display = 'none'
            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                user.image = obj.link
                renderAdmin()
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')
            }
        })
}

function copyLink() {
    let a = document.querySelector('#userLink')

    a.select();
    a.setSelectionRange(0, 99999); 
    document.execCommand("copy");
}

function changeUsername() {
    document.querySelector('.loadingContainer').style.display = 'flex'
    let token = localStorage.getItem('token')

    if (token == undefined || token.trim() == '') {
        return window.location.href = '/login'
    }

    let username = document.querySelector('#username').value
    
    if (password == '' || password.length <= 6) {
        alertBox('Senha inválida!', 'images/cancel.svg', 'rgb(233, 61, 61)')
    }

    let headers = new FormData()
    headers.append('token', token)

    let data = new URLSearchParams()
    data.append('username', username)

    let options = {
        method: 'PATCH',
        body: data,
        headers: headers
    }

    fetch('/changeUsername', options)
        .then(async response => {
            document.querySelector('.loadingContainer').style.display = 'none'
            let obj = await response.json()
            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')

                localStorage.removeItem('token')
                localStorage.setItem('token', obj.token)

                user.username = username

                renderAdmin()
            }
        })
}

function logOut() {
    localStorage.removeItem('token')
    window.location.href = '/login'
}