const { response } = require('express');
const Shifts = require('../Module/ShiftsModule');
const User = require('../Module/UserModule');

exports.addShift = async(request, response) => {
    try{
        let newShift = await Shifts.create(request.body);

        response.status(201).json({
            message: "Shift added successfully!",
            data: newShift
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getShiftById = async(request, response) => {
    try{
        let shift = await Shifts.findById(request.params.id).lean().populate({
            path: "commentsList",
            select: "description -shiftId"
        });

        response.status(200).json({
            status: "success",
            data: shift
        });
    }catch(err){
        response.status(404).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.updateShiftById = async(request, response) => {
    try{
        let shift = await Shifts.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true});

        response.status(201).json({
            status: "success",
            data: shift
        });
    }catch(err){
        response.status(404).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getAllShiftsCreatedByCurrentUser = async(request, response) => {
    try{
        const currentUser = request.user;
        const shift = await Shifts.find({createdBy: currentUser._id});

        response.status(200).json({
            status: "success",
            length: shift.length,
            data: shift
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getAllShiftsFromAllUsers = async(request, response) => {
    try{
        const currentUserId = request.user.id;
        const allShifts = await Shifts.find({createdBy: {$ne: currentUserId}});

        response.status(200).json({
            status: "success",
            length: allShifts.length,
            data: allShifts
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.deleteShiftById = async(request, response) => {
    try{
        const deletedShift = await Shifts.findByIdAndDelete(request.params.id);

        if(!deletedShift){
            return response.status(404).json({
                status: "failed",
                message: "Shift not found!"
            });
        }

        response.status(200).json({
            status: "success",
            message: "Shift deleted successfully!"
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}