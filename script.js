console.log("chaching");

const server = "http://localhost:3001";
const headerBox = document.getElementById("header-box");
const submitButton = document.getElementById("submit-button");
const refreshButton = document.getElementById("refresh-button");
const titleBox = document.getElementById("head");
const descBox = document.getElementById("body");

function updateHeaderBox(obj){
    headerBox.innerHTML = '';
    Object.keys(obj).forEach(entryNum=>{
        headerBox.innerHTML+=`<div class="note-subjects" id="note-${entryNum}">${obj[entryNum].head}</div>`
    })
}

headerBox.addEventListener("click",(e)=>{
    if (event.target===event.currentTarget){
        return
    }
    noteId = event.target.id.slice(5)
    fetch(`${server}/notes/${noteId}`)
        .then(response=>response.json())
        .then(data=>{
            document.body.innerHTML = `
                <div>${data.head}</div>
                <div>${data.body}</div>
            `
        })
    history.pushState({id:noteId},'',`/notes/${noteId}`);
    
})

window.addEventListener('popstate', (event) => {
    if (event.state) {
        loadPage(event.state.id);
    }
});


submitButton.addEventListener("click",()=>{
    if(titleBox.value===""){
        return
    }
    const load = {
                    head:titleBox.value,
                    body:descBox.value
                };
    fetch(server,{
        method:"POST",
        body:JSON.stringify(load)
    })
        .then(response=>response.json())
        .then(data=>{
            console.log(data);
            //updateHeaderBox(data)
        })
    titleBox.value = "";
    descBox.value = "";
    
})
refreshButton.addEventListener("click",()=>{
    fetch(server)
        .then(response=>response.json())
        .then(data=>updateHeaderBox(data))
})


refreshButton.click()
