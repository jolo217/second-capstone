const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models/posts');
const {Comments} = require('../models/comments');
const User = require('../models/user');
const should = chai.should();
const {TEST_DATABASE_URL} = require('../config');
const {JWT_SECRET} = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

function seedBlogData() {
  console.info('seeding blog data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
      image: faker.image.image()
    });
  }
  const blogDatas = BlogPost.insertMany(seedData);

  const newUser = new User({
    email: 'abc@123.com',
    password: 'password',
    confirmPassword: 'password',
    firstName: 'Billy',
    lastName: 'Bob',
    username: 'username',
    role: 'Admin'
  });

  const user = newUser.save();
  const commentData = [];
  for (let i=1; i<=10; i++) {
    commentData.push({
      content: faker.lorem.text(),
      username: faker.internet.userName(),
    });
  }
  const commentDatas = Comments.insertMany(commentData);
  return Promise.all([blogDatas, newUser, commentDatas]);
}


describe('Blog API resource', function() {
  let user;

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function(done) {
    seedBlogData().then((data) => {
      user = data[1];
      done();
    });
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  describe('Blog post API endpoints', function() {
    it('should return all existing blogs', function() {
      let res;
      return chai.request(app)
      .get('/api/posts')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.should.have.lengthOf(count);
      });
    });

    it('should return blogs with right fields', function() {
      let resBlog;
      chai.request(app)
      .get('/posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.blogs.should.be.a('array');
        res.body.blogs.should.have.a.length.of.at.least(1);
        res.body.blogs.forEach(function(blog) {
          blog.should.be.a('object');
          blog.should.include.keys('title', 'author', 'content', 'comments');
        });
        resBlog = res.body.blogs[0];
        return BlogPost.findById(resBlogPost.id);
      })
      .then(function(restaurant) {
        resBlogPost.title.should.equal(blog.title);
        resBlogPost.content.should.equal(blog.content);
        resBlogPost.author.should.equal(blog.authorName);
      });
    });

    it('should add a new blog', function() {
      var token = jwt.sign({
       id: user._id,
     }, JWT_SECRET, { expiresIn: 60*60 });
      const newPost = {
        title: faker.lorem.sentence(),
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
        content: faker.lorem.text(),
        image: faker.image.image(),
        created: faker.date.past()
      };
      return chai.request(app)
      .post('/api/posts')
      .set('Authorization', 'BEARER ' + token)
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'title', 'author', 'content', 'image');
        res.body.title.should.equal(newPost.title);
        res.body.id.should.not.be.null;
        res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
        res.body.content.should.equal(newPost.content);
        return BlogPost.findById(res.body.id);
      })
      .then(function(post) {
        post.title.should.equal(newPost.title);
        post.content.should.equal(newPost.content);
        post.author.firstName.should.equal(newPost.author.firstName);
        post.author.lastName.should.equal(newPost.author.lastName);
      });
    });
    it('delete a blog by id', function() {
      var token = jwt.sign({
       id: user._id,
     }, JWT_SECRET, { expiresIn: 60*60 });
      let blog; 
      return BlogPost
      .findOne()
      .then(function(_blog) {
        blog = _blog;
        return chai.request(app).delete(`/api/posts/${blog.id}`).set('Authorization', 'BEARER ' + token);
      })
      .then(function(res) {
        res.should.have.status(204);
        return BlogPost.findById(blog.id);
      })
      .then(function(_blog) {
        should.not.exist(_blog);
      });
    });
  });

  describe('Blog post comments API endpoints', function() {
    it('should add a new comment', function() {
      var token = jwt.sign({
       id: user._id,
     }, JWT_SECRET, { expiresIn: 60*60 });
      const newComment = {
        content: faker.lorem.text(),
        username: 'username',
        postId: '53cb6b9b4f4ddef1ad47f943'
      };
      return chai.request(app)
      .post('/api/comments')
      .set('Authorization', 'BEARER ' + token)
      .send(newComment)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('username', 'content', '__v', '_id', 'postId');
        res.body._id.should.not.be.null;
        res.body.username.should.equal(newComment.username);
        res.body.content.should.equal(newComment.content);
        res.body.postId.should.equal(newComment.postId);
        return Comments.findById(res.body._id);
      })
      .then(function(post) {
        post.content.should.equal(newComment.content);
        post.username.should.equal(newComment.username);
      });
    });
    
    it('delete a comment by id', function() {
      var token = jwt.sign({
       id: user._id,
     }, JWT_SECRET, { expiresIn: 60*60 });
      let comment; 
      return Comments
      .findOne()
      .then(function(_comments) {
        comments = _comments;
        return chai.request(app).delete(`/api/comments/${comments._id}`).set('Authorization', 'BEARER ' + token);
      })
      .then(function(res) {
        res.should.have.status(204);
        return Comments.findById(comments._id);
      })
      .then(function(_comments) {
        should.not.exist(_comments);
      });
    });
  });
});
