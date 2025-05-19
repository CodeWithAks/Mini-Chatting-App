const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));//static files ko frontend(client) ko serve krne k liye 
app.use(express.urlencoded({extended:true})); //for parsing the data that comes from post reuest
app.use(methodOverride("_method"));

main().then(() => {console.log("Connection Successful")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

//Index Route - to see all the chats
app.get("/chats",async(req,res) => {
  try{
    let chats = await Chat.find();//to extract all the data
    res.render("index.ejs",{chats});
  } catch(err) {
    next(err);
  }
});

//New Chat Route - sends get request to/chats/new and opens up a form to create new chat
app.get("/chats/new",(req,res) => {
  // throw new ExpressError(404,"Page not found");
  res.render("form.ejs");
});

//Create Route - sends post request to /chats for inserting the data in db and showing it on screen from the form
app.post("/chats", asyncWrap(async (req,res,next) => {
    let{from,to,message} = req.body;
    let newChat = new Chat({
    from:from,
    to:to,              //taaki ussi chat format mein show ho (basically data is inserted in mongodb)
    message:message,
    created_at:new Date()
  });
  await newChat.save();
  res.redirect("/chats");
}));

function asyncWrap(fn) {
  return function(req,res,next){
    fn(req,res,next).catch((err) => next(err));
  };
}


//NEW - Show route
app.get("/chats/:id",async(req,res,next) => {
  try{
  let {id} = req.params;
  let chat = await Chat.findById(id);
  if(!chat) {
    next(new ExpressError(500,"Chat not found")); //agr id glt h to ye error hum throw krenge
  }
  res.render("edit.ejs",{chat});
} catch(err){
  next(err); //agr casting(moongoose id converting) err h to vo catch ho jaayega
}
});

//Edit Route - will display a edit form to edit our message(sends get request)
app.get("/chats/:id/edit", asyncWrap(async (req,res) => {
  let {id} = req.params;
  let chat = await Chat.findById(id); //db mein vo specific id dhundne k liye
  res.render("edit.ejs",{chat});
}));

//update route - will update the changes in db made in edit section(permanent change in db)
app.put("/chats/:id", asyncWrap(async (req,res) => {
  let {id} = req.params;
  let {message : newmsg} = req.body; //req.body mein jo cheez change kri h jaise message to sirf wahi jaayega
  console.log(newmsg);
  let updatedChat = await Chat.findByIdAndUpdate(id,
    {message:newmsg,
    updated_at:new Date},   //to update the updated_at() by randomly generating a new date
    {runValidator:true},    //findByIdAndUpdate() only takes two main arguments
    {new:true});
  console.log(updatedChat);
  res.redirect("/chats");
}));

//Delete route - delete a chat with its id
app.delete("/chats/:id",asyncWrap(async(req,res) => {
  let {id} = req.params;
  let deletedChat = await Chat.findByIdAndDelete(id);
  console.log(deletedChat);
  res.redirect("/chats");
}));

app.get("/",(req,res) => {
  res.send("Working");
});

const handleValidationError = (err) => {
  console.log("This was a validation error");
  console.dir(err.message);
  return err;
}

app.use((err,req,res,next) => {
  console.log(err.name);
  if(err.name=="ValidationError") {
    err = handleValidationError(err);
  }
  next(err);
});


//Error handling middleware
app.use((err,req,res,next) => {
  let {status=500,message="Some error occured"} = err;
  res.status(status).send(message);
});

app.listen(8080,() => {
    console.log("Server is listening");
});
