const { response } = require('express');
const User = require('../Module/UserModule');
const jwt = require('jsonwebtoken');
const util = require('util');
const sendEmail = require('../Email');

exports.signup = async(request, response) => {
    try{
        let newUser = await User.create(request.body);

        response.status(201).json({
            status: "success",
            data: newUser,
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

exports.login = async(request, response) => {
    try{
        const email = request.body.email;
        const password = request.body.password;

        if(!email || !password){
            return response.status(400).json({
                status: "failed",
                message: " Please provide email and password for login!",
            });
        }

        const userDatabase = await User.findOne({email});

        if(!userDatabase || !(await userDatabase.comparePassword(password, userDatabase.password))){
            return response.status(400).json({
                status: "failed",
                message: "Incorrect email or password!",
            });
        }

        const token = jwt.sign({id: userDatabase._id}, process.env.SECRET_STR, {expiresIn: process.env.EXPIRATION_TIME});

        response.status(200).json({
            status: "success",
            token,
            data: userDatabase,
        });
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

exports.protect = async(request, response, next) => {
    try{
        const valueToken = request.headers.authorization;
        let token;
        if(valueToken && valueToken.startsWith('bearer')){
            token = valueToken.split(' ')[1];
        }

        if(!token){
            return response.status(401).json({
                status: "failed",
                message: "You are not logged in!",
            });
        }

        const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

        const currentUser = await User.findById(decodedToken.id);
        if(!currentUser){
            return response.status(401).json({
                status: "failed",
                message: "The user doesn't exist!",
            });
        }

        if(await currentUser.isPasswordChanged(decodedToken.iat)){
            return response.status(401).json({
                status: "failed",
                message: "The password was changed. Please login again!",
            });
        }

        request.user = currentUser;
        next();
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

exports.permission = async(request, response, next) => {
    if(request.user && request.user.role && request.user.role == 'admin'){
        next();
    }else{
        return response.status(403).json({
            status: "failed",
            message: "You don't have permission!",
        });
    }
}

exports.updateUserInfo = async(request, response) => {
    if(request.body.password){
        return response.status(400).json({
            status: "failed",
            message: "This route is not for password updated. Please access /updatePassword",
        });
    }

    const updatedUser = await User.findByIdAndUpdate(request.user.id, request.body, {new: true, runValidators: true});

    return response.status(200).json({
        status: "success",
        data: updatedUser,
    });
}

exports.updatePassword = async(request, response) => {
    const userData = await User.findById(request.user.id);

    if(!await userData.comparePassword(request.body.password, userData.password)){
        return response.status(404).json({
            status: "failed",
            message: "Incorrect current password!",
        });
    }

    userData.password = request.body.newPassword;
    userData.passwordChangedAt = Date.now();
    await userData.save();

    const JWT = jwt.sign(
        {id: userData._id},
        process.env.SECRET_STR,
        {expiresIn: process.env.EXPIRATION_TIME}
    );

    return response.status(200).json({
        status: "success",
        JWT,
        data: userData,
    });
}

exports.forgotPassword = async(request, response) => {
    const user = await User.findOne({email: request.body.email});
    if(!user){
        return response.status(404).json({
            status: "failed",
            message: "User not found!",
        });
    }

    const resetToken = await user.createNewPasswordToken();
    await user.save();

    const url = `${request.protocol}://${request.get('host')}/api/users/resetPassword/${resetToken}`;
    const message = `Follow this link to reset your password: ${url} \n\nThis reset password link will expire in 10 minutes.`

    try{
        await sendEmail({
            email: user.email,
            subject: 'Reset your password',
            message: message,
        });

        return response.status(200).json({
            status: "success",
            message: "Email sent to user!",
        });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save();
        response.status(500).json({
            status: "failed",
            message: "Error sending email!",
        });
    }
}

exports.resetPassword = async(request, response) => {
    const userData = await User.findOne({
        passwordResetToken: request.params.token,
        passwordResetTokenExpires: {$gt: Date.now()},
    });

    if(!userData){
        return response.status(400).json({
            status: "failed",
            message: "Token is invalid or has expired!",
        });
    }

    userData.password = request.body.password;
    userData.passwordResetToken = undefined;
    userData.passwordResetTokenExpires = undefined;
    userData.passwordChangedAt = Date.now();
    userData.save();

    const JWT = jwt.sign(
        {id: userData._id},
        process.env.SECRET_STR,
        {expiresIn: process.env.EXPIRATION_TIME},
    );

    return response.status(200).json({
        status: "success",
        JWT,
        data: userData,
    });
}

exports.getAllUsers = async(request, response) => {
    const currentUserId = request.user.id;
    const allUsers = await User.find({_id: {$ne: currentUserId}});

    return response.status(200).json({
        status: "success",
        count: allUsers.length,
        data: allUsers
    });
}

exports.getUserById = async(request, response) => {
    const userFound = await User.findById(request.params.id).lean().populate({
        path: 'shiftsList'
    }).populate({
        path: 'commentsList'
    });

    response.status(200).json({
        status: "success",
        data: userFound
    });
}

exports.deleteUserById = async(request, response) => {
    try{
        const userId = request.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if(!deletedUser){
            return response.status(404).json({
                status: "failed",
                message: "User not found!"
            });
        }

        response.status(200).json({
            status: "success",
            message: "User deleted successfully"
        })
    }catch(err){
        response.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}