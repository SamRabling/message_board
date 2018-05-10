const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("express-flash");
var mongoose = require("mongoose");
var path = require("path");

// sessions
app.use(session({
    secret: "BuBbLeS_By_Huang_Yuxing",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10000 }
}));

//app use
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

// mongoose db
mongoose.connect("mongodb://localhost/message_board");

    // comment schema
var CommentSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    comment: { type: String, required: true, minlength: 10 }
},
    { timestamps: true });
mongoose.model("Comment", CommentSchema);

var Comment = mongoose.model("Comment");

    // message schema
var MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    message: { type: String, required: true, minlength: 10 },
    comment: [CommentSchema]
},
{ timestamps: true });
mongoose.model("Message", MessageSchema);

var Message = mongoose.model("Message");

// routes
app.get("/", function (req, res) {
    Message.find({}, function (err, messages) {
        res.render("index", { messages: messages });
    });
});

// new Message
app.post("/newMessage", function (req, res) {
    console.log("new message");
    var message = new Message({
        name: req.body.name,
        message: req.body.message,
    });
    message.save(function (err) {
        if (err) {
            console.log("oops! something went wrong", err);
            for (var key in err.errors) {
                req.flash('messages', err.errors[key].message);
            }
            res.redirect("/");
        } else {
            console.log("successfully added a message!");
            res.redirect("/");
        }
    });
});

// new Comment
app.post("/newComment/:id", function(req, res){
    var message = Message.findOne({ _id: req.body.id }, function (err, message){
        if (err) {
            for (var key in err.errors) {
                req.flash('comments', err.errors[key].comment);
            }
            res.redirect("/"); 
        }
        else{
            message.comment.push({ name: req.body.name, comment: req.body.comment });
            message.save(function(err){
                res.redirect("/"); 
            });

        }
    });  
});  

// port
app.listen(5000, function () {
    console.log("listening on port 5000");
});