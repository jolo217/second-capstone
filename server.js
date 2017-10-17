const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const passport = require('passport');
const User = require('./models/user')
const jwt = require('jsonwebtoken');

const {BlogPost} = require('./models/posts');
const {DATABASE_URL, PORT, JWT_SECRET} = require('./config');
const {Comments} = require('./models/comments');

app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('public'));
app.use(bodyParser.json());

// Initialize passport for use
app.use(passport.initialize());

// Create API group routes
var apiRoutes = express.Router();

// Bring in defined Passport Strategy
require('./users/passport')(passport);

// Register new users
apiRoutes.post('/register', function(req, res) {
  if(!req.body.email || !req.body.password || !req.body.confirmPassword || !req.body.firstName || !req.body.lastName || !req.body.username) {
    res.status(400).json({ success: false, message: 'Please enter in all the fields.' });
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username
    });

    // Attempt to save the user
    newUser.save(function(err) {
      if (err) {
        return res.status(400).json({ success: false, message: 'That username or email address already exists.'});
      }
      res.json({ success: true, message: 'Successfully created new user.' });
    });
  }
});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(400).json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign({username: user.username, role: user.role}, JWT_SECRET, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, token: 'BEARER ' + token });
        } else {
          res.status(400).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.send('It worked! User id is: ' + req.user._id + '.');
});

// Bring in passport strategy we just defined
require ('./users/passport')(passport);

apiRoutes.get('/posts', (req, res) => {
  BlogPost.aggregate([{
    $lookup: {
        from: 'comments', // collection name in db
        localField: '_id',
        foreignField: 'postId',
        as: 'postComments'
    }
}]).then(posts => {
      res.json(posts);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
	});

apiRoutes.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
});

apiRoutes.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'created', 'image']
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      created: req.body.created,
      image: req.body.image,
      comments: req.body.comments
    })
    .then(blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});


apiRoutes.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
});


apiRoutes.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author', 'image'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});


apiRoutes.delete('/posts/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});

apiRoutes.post('/comments', (req, res) => {
   const requiredFields = ['content', 'postId']
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Comments
    .create({
      content: req.body.content,
      postId: mongoose.Types.ObjectId(req.body.postId),
      username: req.body.username
    })
    .then(comment => res.status(201).json(comment)
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    }));
});

apiRoutes.delete('/comments/:id', (req, res) => {
  Comments
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted comments post with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

// Set url for API group routes
app.use('/api', apiRoutes);

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};