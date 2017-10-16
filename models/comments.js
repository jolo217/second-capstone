const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
  content:{
    type: String,
    required: true
  } ,
  postId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogPost"
  },
    username: {
    type: String,
  }
});

const Comments = mongoose.model('Comments', dataSchema);

module.exports = {Comments};