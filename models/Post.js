const mongoose = require('mongoose');



const PostSchema = new mongoose.Schema ({
    descr:{
        type:String,
        required:[true, 'please provide post description'],
        maxlength:500,
        trim:true
    },

    img:{
        type:String,
        trim:true,
    },
    likes:{
        type:[{type:mongoose.Schema.Types.ObjectId, ref: 'User'}],

    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
},{timestamps:true})

module.exports = mongoose.model('Post', PostSchema);