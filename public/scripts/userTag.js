function goToLink(event) {
    let element = event.currentTarget
    let link = element.dataset.link
    window.open(link);
}

function renderTags(obj) {
    const path = window.location.pathname

    if (path.split('/')[1] != 'user') {
        return
    }

    let username = path.split('/')[2]

    let title = document.querySelector('.username').textContent = `@${username}`
    let name = document.querySelector('.userRealname').textContent = obj.user.name
    let image = document.querySelector('.userImage').style.backgroundImage = `url(${obj.user.image})`

    let tags = JSON.parse(obj.tags)

    console.log(tags)

    let container = document.querySelector('.tags-container')

    for (let i in tags) {
        container.innerHTML += `
        <div class = 'tagUnit fade' onclick="goToLink(event)" data-link = "${tags[i].url}">
            <div class = 'tagUnitPart1'>
                <img src="${tags[i].icon}" alt="icone"> 
                <div class = 'vertLine2'></div>
                <div class = 'unitText'>
                    <h1>${tags[i].title}</h1>
                    <p>${tags[i].url}</p>
                </div>
            </div>
        </div>
        `
    }
}

function countClient(username) {
    
    fetch(`/countClient/${username}`, {method: 'PATCH'})
        .then(async response => {
            console.log('Client contabilizado!')
        })
}

function getTags() {
    const path = window.location.pathname

    if (path.split('/')[1] != 'user') {
        return
    }

    let username = path.split('/')[2]

    let options = {
        method: 'GET'
    }

    console.log(username)

    fetch(`/getTags/${username}`, options)
        .then(async response => {
            let loading = document.querySelector('.loadingContainer').style.display = 'none'
            let obj = await response.json()
            
            if (obj.status == 'sucess') {
                document.querySelector('.all-container').style.display = 'flex'
                renderTags(obj)
                setTimeout(() => {
                    countClient(username)
                }, 5000)
            } else if (obj.status == 'error') {
                let all = document.querySelector('.all-container').style.display = 'none'
                let background = document.querySelector('.notFoundBack').style.display = 'flex'
                let text = document.querySelector('#notfound').style.display = 'flex'

            }
            
        })        
}