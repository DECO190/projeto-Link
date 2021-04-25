let token = localStorage.getItem('token')
if (token != null || token != undefined) {
    window.location.href = '/userpageRender'
}

async function makeLogin() {
    let token = localStorage.getItem('token')

    if (token != null || token != undefined) {
        return 
    }
    

    let username = document.querySelector('#username')
    let password = document.querySelector('#password')

    if (username.value == '' || username.value.length <= 6) {
        return alertBox('Username inválido!', 'images/cancel.svg', 'rgb(233, 61, 61)')
    } else if (password.value == '' || password.value.length <= 6) {
        return alertBox('Senha inválida!', 'images/cancel.svg', 'rgb(233, 61, 61)')
    }

    let data = new URLSearchParams()
    data.append('username', username.value)
    data.append( 'password', password.value)

    let options = {
        method: 'POST',
        body: data
    }

    document.querySelector('.submit-bttn p').style.display = 'none'
    document.querySelector('.submit-bttn img').style.display = 'block'
    fetch('/checkLogin', options)
        .then(async (response) => {
            document.querySelector('.submit-bttn p').style.display = 'block'
            document.querySelector('.submit-bttn img').style.display = 'none'

            let obj = await response.json();

            if (obj.status == 'error') {
                alertBox(obj.message, 'images/cancel.svg', 'rgb(233, 61, 61)')
            } else if (obj.status == 'sucess') {
                alertBox(obj.message, 'images/checked.svg', 'rgb(3, 217, 140)')
                localStorage.removeItem('token')
                localStorage.setItem('token', obj.token)

                setTimeout(() => {
                    window.location.href = '/userpageRender'
                }, 3500)
                console.log(obj)
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