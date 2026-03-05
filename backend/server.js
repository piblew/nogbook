const http = require("http");

const jsonPath = process.env.JSON_PATH
const jsonKey = process.env.EDIT_KEY
const readKey = process.env.READ_KEY;
const writeKey = process.env.WRITE_KEY;

let recieveData = '';
let shareData;

function readJson(){
    fetch(jsonPath+"/raw",{method:"GET"})
    .then(response=>{return response.json()})
    .then(data=>shareData=data)
}
function writeJson(){
    fetch(jsonPath,{
        method:"PUT",
        headers : {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            editKey: jsonKey,
            data: shareData
        })
    })
        .then(response=>response.text())
        .then(text=>text ? JSON.parse(text) : null)
        .catch(err => console.error(err));
    console.log("wJ finished")
}
function appendItem(obj1,obj2){
    readJson()
    const keys = Object.keys(obj1);
    obj1[keys.length] = obj2;
    writeJson()
}
function deleteItem(obj,index){
    readJson()
    const valueArray = Object.values(obj)
    valueArray.splice(index,1)
    newObj={}
    valueArray.forEach((value,index)=>{
        newObj[index]=value;
    })
    shareData = newObj
    writeJson()
}
function userAuth(key){
    if(key===readKey){
        return "visitor";
    } else if(key===writeKey){
        return "editor"
    } else{
        return "unknown"
    }
}

const server = http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end();
        return;
    }
    if(req.method==="GET"){
        readJson();
        if(req.url.startsWith("/notes/")){
            res.writeHead(200,{"Content-Type":"application/json"})
            const noteId= req.url.slice(7);
            res.end(JSON.stringify(shareData[noteId]))
        } else{
            res.writeHead(200,{"Content-Type":"application/json"})
            res.end(JSON.stringify(shareData))
        }
    } else if(req.method==="POST"){
        res.writeHead(200)
        let body="";
        req.on("data",chunk=>{
            body+=chunk.toString();
        })
        req.on('end', () => {
            recieveData=JSON.parse(body)
            if(req.url==="/auth"){
                res.end(userAuth(recieveData.userInput))
            }else{
                appendItem(shareData,recieveData);
                readJson();
                res.end(JSON.stringify(shareData));
            }
        });
    } else if(req.method==="DELETE"){
        res.writeHead(200)
        noteId = req.url.slice(7)
        deleteItem(shareData,noteId)
        readJson()
        res.end(JSON.stringify(shareData))
    }
})

server.listen(3000,()=>{
    console.log("running")
    readJson()
});