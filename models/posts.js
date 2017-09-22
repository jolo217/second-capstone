const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now},
  comments: [],
  image: String

});


dataSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

dataSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created,
    comments: this.comments,
    image: this.image
  };
}

const BlogPost = mongoose.model('BlogPost', dataSchema);

module.exports = {BlogPost};