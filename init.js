const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main().then(() => {console.log("Connection Successful")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

let allChats = [
    {
        from:"Akshara",
        to:"Aviral",
        message:"Print these papers",
        created_at:new Date()
    },
    {
        from:"Peter",
        to:"Mary",
        message:"I love you",
        created_at:new Date()
    },
    {
        from:"Klaus",
        to:"caroline",
        message:"I intend to be your last love",
        created_at:new Date()
    },
    {
        from:"Damon",
        to:"Enzo",
        message:"You're my best friend",
        created_at:new Date()
    },

]

Chat.insertMany(allChats).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});
