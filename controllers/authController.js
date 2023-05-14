const jwt = require("jsonwebtoken");
// const User = require("../models/user");
// const filterObj = require("../utils/filterObj");
const crypto = require("crypto");
const { promisify } = require("util");

// function to return jwt token
const signToken = (userId) => jwt.sign({ userId }, process.env.SECRET_KEY);


const authController = {
    login: async (req, res, next) => {
        try {
          const { email, password } = req.body;
          // console.log(email, password, "ffffffffffffff");
    
          if (!email || !password) {
            res.status(400).json({
              status: "error",
              message: "Both are required",
            });
          }
    
          const userDoc = await User.findOne({ email: email }).select("+password");
    
          // console.log(userDoc, "userDoc");
    
          if (
            !userDoc ||
            !(await userDoc.correctPassword(password, userDoc.password))
          ) {
            res.status(400).json({
              status: "error",
              message: "Email or Password is Incorect",
            });
          }
    
          const token = signToken(userDoc._id);
          console.log(token,"dddddddddddddd")
          res.status(200).json({
            status: "Success",
            message: "Logged In.",
            token,
            user_id: userDoc._id
          });
        } catch (err) {
          // return res.status(500).json({ msg: err.message });
        }
      },
      register: async (req, res, next) => {
        try {
          console.log("hittttttttttt", req.body)
          const { firstName, lastname, email, password } = req.body;
    
          const filterBody = filterObj(
            req.body,
            "firstName",
            "lastName",
            "password",
            "email"
          );
    
          const existing_user = await User.findOne({ email: email });
    
          if (existing_user && existing_user.verified) {
            res.status(400).json({
              status: "error",
              message: "User already registered. Please Login.",
            });
          } else if (existing_user) {
            await User.findOneAndUpdate({ email: email }, filterBody, {
              new: true,
              validateModifyOnly: true,
            });
    
            req.userId = existing_user._id;
            next();
          } else {
            const new_user = await User.create(filterBody);
    
            req.userId = new_user._id;
            next();
          }
        } catch (err) {
          return res.status(500).json({ msg: err.message });
        }
      },
      protect: async (req, res, next) => {
        try {
          // 1)  getting token (jwt) and check if it's available
    
          let token;
    
          if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
          ) {
            token = req.headers.authorization.split(" ")[1];
          } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
          } 
    
          if (!token) {
            return res.status(401).json({
              message: "You are not logged in! Please log in to get access."
            });
          }
    
          // 2) verification of token
    
          const decoded = await promisify(jwt.verify)(
            token,
            process.env.SECRET_KEY
          );
          console.log(decoded,"decoded jwt token");
          // 3) check if user still exist
    
          const this_user = await User.findById(decoded.userId);
    
          if (!this_user) {
            res.status(400).json({
              status: "error",
              message: "The user belonging to this token does not exist.",
            });
          }
    
          req.user = this_user;
          next();
        } catch (error) {
          return res.status(500).json({ msg: error.message });
        }
      },
 }

module.exports = authController;