const http = require("http");
const fs = require("fs");

const jsonPath = 'https://jsonhosting.com/api/json/021a0909';
const jsonKey = '97c03ab4c526c505de3a6cd936c4f6a3d253c13497580f75212c3614e8da87d1';
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
    console.log("done")
}

function appendObject(obj1,obj2){
    readJson()
    const keys = Object.keys(obj1);
    obj1[keys.length] = obj2;
    writeJson()
}
readJson()

const server = http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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
            appendObject(shareData,recieveData);
            readJson();
            res.end(JSON.stringify(shareData));
        });
    }
})

server.listen(3001,()=>{
    console.log("running")
});

const dataUpdate = setInterval(()=>{
    if(recieveData!=''){
        recieveData='';
    }
}, 100)

