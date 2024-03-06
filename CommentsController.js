const Comment = require('../Module/CommentsModule');
const Shift = require('../Module/ShiftsModule');

exports.createComment = async(request, response) => {
    try{
        const newComment = await Comment.create(request.body);

        response.status(201).json({
            status: "success",
            data: newComment
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getCommentById = async(request, response) => {
    try{
        const comment = await Comment.findById(request.params.id);

        response.status(200).json({
            status: "success",
            data: comment
        });
    }catch(err){
        response.status(404).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.updateCommentById = async(request, response) => {
    try{
        const comment = await Comment.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true});

        response.status(201).json({
            status: "success",
            data: comment
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getAllCommentsCreatedByUser = async(request, response) => {
    try{
        const userId = request.params.userId;
        const comments = await Comment.find().populate({
            path: "shiftId",
            select: "title",
        }).populate({
            path: "userId",
            options: {projection: {email: 0, password: 0, age: 0, role: 0, products: 0, __v: 0}}
        });
;

        response.status(200).json({
            status: "success",
            length: comments.length,
            data: comments
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getAllCommentsFromAllUsers = async(request, response) => {
    try{
        const currentUser = request.user.id;
        const allComments = await Comment.find({createdBy: {$ne: currentUser}});

        response.status(200).json({
            status: "success",
            length: allComments.length,
            data: allComments
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.deleteCommentById = async(request, response) => {
    try{
        const deletedComment = await Comment.findByIdAndDelete(request.params.id);

        if(!deletedComment){
            return response.status(404).json({
                status: "failed",
                message: "Comment not found!"
            });
        }

        response.status(200).json({
            status: "success",
            message: "Comment deleted successfully!"
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}