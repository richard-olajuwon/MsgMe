const formidable = require('formidable');
const validator = require('validator');
const registerModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

module.exports.userRegister = (req, res) => {
    
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
        

        const { userName, email, password, confirmPassword } = fields;
        const error = [];

        if (!userName || userName === '') {
            error.push('please provide your user name');
        }
        else if (!email || email === "") {
            error.push('please provide your email');
        }
        else if (email && !validator.isEmail(email)) {
            error.push('please provide your valid email');
        }
        else if (!password || password === '') {
            error.push('please provide your password');
        }
        else if (!confirmPassword || confirmPassword === '') {
            error.push('please provide user confirm password');
        }
        else if (password && confirmPassword && password !== confirmPassword) {
            error.push('your password and confirm password not same')
        }
        else if (password && password.length < 8) {
            error.push('please provide password must be 8 charecter');
        }
        else if (Object.keys(files).length === 0) {
            error.push('please provide user image');
        }
        
        if (error.length > 0) {
            return res.status(400).json({ error: { errorMessage: error } })
        } 


        try {

            const image = files.image;            

            const result = await cloudinary.uploader.upload(image.path, {
                folder: "Images",
            });

            const imagesUrl = result.secure_url
            
            const checkUser = await registerModel.findOne({ email: email });
            if (checkUser) {
                res.status(404).json({
                    error: {
                        errorMessage: ['Email already exist']
                    }
                });
            } 
            else {
                const userCreate = await registerModel.create({
                    userName,
                    email,
                    password: await bcrypt.hash(password, 10),
                    image: imagesUrl
                });

                const token = jwt.sign({
                    id: userCreate._id,
                    email: userCreate.email,
                    userName: userCreate.userName,
                    image: userCreate.image,
                    registerTime: userCreate.createAt
                }, process.env.SECRET, {
                    expiresIn: process.env.TOKEN_EXP
                });

                const options = {
                    expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                }

                res.status(201).cookie('authToken', token, options).json({
                    successMessage: 'Registration Successful',
                    token
                })
            }
        } 
        catch (error) {
            console.log("Error with User Registration: ", error)
            res.status(404).json({
                error: {
                    errorMessage: ['Internal server error']
                }
            })
        }

    })

}

module.exports.userLogin = async (req, res) => {

    const error = [];
    const { email, password } = req.body;

    if (!email) {
        error.push('Please provide your email')
    }
    else if (!password) {
        error.push('Please provide your password')
    }
    else if (email && !validator.isEmail(email)) {
        error.push('Please provide your valid email');
    }

    if (error.length > 0) {
        res.status(400).json({
            error: {
                errorMessage: error
            }
        });
    } else {
        try {
            const checkUser = await registerModel.findOne({
                email: email
            }).select('+password');

            if (checkUser) {
                const matchPassword = await bcrypt.compare(password, checkUser.password);

                if (matchPassword) {
                    const token = jwt.sign({
                        id: checkUser._id,
                        email: checkUser.email,
                        userName: checkUser.userName,
                        image: checkUser.image,
                        registerTime: checkUser.createAt
                    }, process.env.SECRET, {
                        expiresIn: process.env.TOKEN_EXP
                    });

                    const options = {
                        expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                    }

                    res.status(200).cookie('authToken', token, options).json({
                        successMessage: 'Your login successfull',
                        token
                    })
                } else {
                    res.status(400).json({
                        error: {
                            errorMessage: ['Invalid Email or Password']
                        }
                    });
                }
            } else {
                res.status(400).json({
                    error: {
                        errorMessage: ['Invalid Email or Password']
                    }
                });
            }

        } catch (error) {
            res.status(404).json({
                error: {
                    errorMessage: ['Internal server error']
                }
            });
        }
    }

}

module.exports.userLogout = (req,res)=>{
    res.status(200).cookie('authToken', '').json({
        success : true
    })
}