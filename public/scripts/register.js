let token = localStorage.getItem('token')
if (token != undefined || token.trim() != '') {
    window.location.href = '/userpageRender'
}
async function makeRegister() {

    let name = document.querySelector('#name');
    let username = document.querySelector('#username');
    let password = document.querySelector('#password');
    let image = document.querySelector('#image');

    if (name.value == '') {
        alertBox('Nome inválido!', 'images/cancel.svg', 'rgb(233, 61, 61)')
        return
    } else if (username.value == '' || username.value.length <= 6) {
        alertBox('Username inválido!', 'images/cancel.svg', 'rgb(233, 61, 61)')
        return
    } else if (password.value == '' || password.value.length <= 6) {
        alertBox('Senha inválida!', 'images/cancel.svg', 'rgb(233, 61, 61)')
        return
    } else if (image.files[0] == '' || image.files[0] == undefined) {
        alertBox('Imagem não selecionada!', 'images/cancel.svg', 'rgb(233, 61, 61)')
        return 
    }   

    let data = new FormData();
    data.append('name', name.value)
    data.append('username', username.value)
    data.append('password', password.value)
    data.append('img',  image.files[0])

    let options = {
        method: 'POST',
        body: data
    }

    document.querySelector('.submit-bttn p').style.display = 'none'
    document.querySelector('.submit-bttn img').style.display = 'block'

    fetch('/registerNewUser', options)
        .then(async response => {
            document.querySelector('.submit-bttn p').style.display = 'block'
            document.querySelector('.submit-bttn img').style.display = 'none'

            let obj = await response.json()

            console.log(obj)

            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')
                localStorage.removeItem('token')
                localStorage.setItem('token', obj.token)

                setTimeout(() => {
                    window.location.href = '/userpageRender'
                }, 4000)
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