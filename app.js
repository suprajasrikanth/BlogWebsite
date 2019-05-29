var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require('method-override'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	Blog = require('./models/blogs'),
	Comment = require('./models/comments'),
	User = require('./models/user'),
	request = require("request"),
	seedDB = require('./seeds');
 
//seedDB();
mongoose.connect("mongodb+srv://supraja:supraja123@cluster0-xxhiq.mongodb.net/test?retryWrites=true",{
	useNewUrlParser:true,
	useCreateIndex:true
}).then(() => {
	console.log("Connected to DB");
}).catch(err => {
	console.log("Error",err.message);
});
app.use(bodyParser.urlencoded({extended: true}));
//app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));
mongoose.set('useFindAndModify', false);
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   //res.locals.success = req.flash('success');
   //res.locals.error = req.flash('error');
   next();
});

/*var blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    created:  {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);*/

/*Blog.create({
	title:"hiiii",
	body:"hjsf fg dfg dfg df",
	image:"https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516__340.jpg"
});*/
app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
	console.log(req.user);
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index",{blogs:blogs}); 
        }
    });
});

app.get("/blogs/new",isLoggedIn, function(req, res){
   res.render("new"); 
});
/*app.post("/blogs",function(req, res){
    //req.body.blog.body = req.sanitize(req.body.blog.body);
   var formData = req.body.blog;
   Blog.create(formData, function(err, newBlog){
       console.log(newBlog);
      if(err){
          res.render("new");
      } else {
          res.redirect("/blogs");
      }
   });
});*/
app.post("/blogs",isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
   var formData = req.body.blog;
   Blog.create(formData, function(err, newBlog){
       console.log(newBlog);
      if(err){
          res.render("new");
      } else {
          res.redirect("/blogs");
      }
   });
});
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id).populate("comments").exec(function(err, blog){
      if(err){
          res.redirect("/");
      } else {
		  console.log(blog);
          res.render("show", {blog: blog});
      }
   });
});

app.get("/blogs/:id/edit",isLoggedIn, function(req, res){
    console.log("IN EDIT!");
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else {
            res.render("edit", {blog:blog});
        }
    });
});
/*app.put("/blogs/:id", function(req, res){
	var newData = {name: req.body.name, image: req.body.image, body: req.body.body};
    Blog.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, blog){
   //Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
       if(err){
           console.log(err);
       } else {
         var showUrl = "/blogs/" + blog._id;
         res.redirect(showUrl);
       }
   });
});*/

app.put("/blogs/:id", function(req, res){
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
       if(err){
           console.log(err);
       } else {
         var showUrl = "/blogs/" + blog._id;
         res.redirect(showUrl);
       }
   });
});
app.delete("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, blog){
       if(err){
           console.log(err);
       } else {
           blog.remove();
           res.redirect("/blogs");
       }
   }); 
});
/////Comments routes

app.get("/blogs/:id/comments/new", isLoggedIn ,function(req,res){
	Blog.findById(req.params.id, function(err, blog){
	if(err){
           console.log(err);
       } else {
		   res.render("comments/new", {blog: blog});
	   }
	});
});

app.post("/blogs/:id/comments",isLoggedIn,function(req,res){
	Blog.findById(req.params.id, function(err, blog){
	if(err){
           console.log(err);
			res.redirect("/blogs");
       } else {
		   Comment.create(req.body.comment,function(err, comment){
			   blog.comments.push(comment);
			   blog.save();
			   res.redirect('/blogs/'+blog._id);
		   });
	   }
	});
});
//Auth routes
app.get("/register",function(req,res){
	res.render("register");		
});
app.post("/register",function(req,res){
	var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            //req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           //req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/blogs"); 
        });
    });
});
app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login",passport.authenticate("local", 
    {
        successRedirect: "/blogs",
        failureRedirect: "/login"
    }),function(req,res){
});
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/blogs");
});
function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        //req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
}
/*function checkUserBlog(req, res, next){
        if(req.isAuthenticated()){
            Blog.findById(req.params.id, function(err, blog){
               if(blog.author.id.equals(req.user._id)){
                   next();
               } else {
                   //req.flash("error", "You don't have permission to do that!");
                   console.log("BADD!!!");
                   res.redirect("/blogs/" + req.params.id);
               }
            });
        } else {
            //req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
}*/
/*app.listen(9000,function(){
	console.log("The server has started");
});*/
app.listen(process.env.PORT, process.env.IP,function(){
	console.log("The server has started");
});