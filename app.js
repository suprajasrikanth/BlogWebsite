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
	User = require('./models/users'),
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
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index",{blogs:blogs}); 
        }
    });
});

app.get("/blogs/new", function(req, res){
   res.render("new"); 
});
app.get("/blogs/:id/comments/new", function(req, res){
    // find campground by id
    console.log(req.params.id);
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {blog: blog});
        }
    });
});
app.post("/blogs", function(req, res){
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

app.get("/blogs/:id/edit", function(req, res){
   Blog.findById(req.params.id,function(err, blog){
       if(err){
           console.log(err);
           res.redirect("/");
       } else {
           res.render("edit", {blog: blog});
		   
       }
   });
});

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

app.get("/blogs/:id/comments/new", function(req,res){
	Blog.findById(req.params.id, function(err, blog){
	if(err){
           console.log(err);
       } else {
		   res.render("comments/new", {blog: blog});
	   }
	});
});

app.post("/blogs/:id/comments", function(req,res){
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
app.listen(9000,function(){
	console.log("The server has started");
});
/*app.listen(process.env.PORT, process.env.IP,function(){
	console.log("The server has started");
});*/