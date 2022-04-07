var express = require('express');
const { route } = require('express/lib/application');
var router = express.Router();
var {MongoClient} = require("mongodb")
const nodemailer = require("nodemailer")
var {comparePassword,hashPassword} = require("../hashComponent")
var dburl = "mongodb+srv://kiran:hpREzgaFj3L072Ou@cluster0.p1ibm.mongodb.net/test?authSource=admin&replicaSet=atlas-hz9vwo-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true"
let databaseName = "users-Database"
let adminDatabase = "user-admin"
let client = new MongoClient(dburl)
/* GET users listing. */


// signup router
router.post("/signup",async (req,res)=>{
  let response = await client.connect()
  let db = await response.db(databaseName)
  let table = await db.collection("table")
  let user = await table.find({email:req.body.email}).toArray()
  console.log(user)
  if(user.length){
    res.send("user already exists")
  }else{
    let modifyPassword = await hashPassword(req.body.password)
    req.body.password  = modifyPassword
    let insertUser = await table.insertOne(req.body)
    res.send("SignUp successfull")
  }
})


// login router
router.post("/login",async (req,res)=>{
   let response = await client.connect()
   let db = await response.db(databaseName)
   let table = await db.collection("table") 
   let user = await table.find({email:req.body.email}).toArray()
   console.log(user)
    if(user.length){
            let checkedPasswordResult = await comparePassword(req.body.password,user[0].password)
            if(checkedPasswordResult){
              res.send("Login SuccessFull")
            }else{
              res.send("Incorrect Password")
            }
    }else{
      res.send("User Does Not Exists")
    }
})



// emailverification router 
router.post("/emailverification",async (req,res)=>{
  let response = await client.connect()
  let db = await response.db(databaseName)
  let table = await db.collection("table")
  let user = await table.find({email:req.body.email}).toArray()
  if(user.length){
      let transpoter = nodemailer.createTransport({
        service:"gmail",
        auth:{
          user:"nodejs500@gmail.com",
          pass:"kiran@7624"
        }
      })

      let randomOTP = (Math.random()*1000000).toFixed(0)
      let insertOTP = await table.updateOne({email:user[0].email},{$set:{otp:randomOTP}})
      let mailoptions = {
        from:"nodejs500@gmail.com",
        to:`${user[0].email}`,
        subject:"OTP Verification Mail",
        text:`Hello User,
        This is mail for Your Password reset Please Enter the below otp to reset the password
        OTP - ${randomOTP} `
      }

      transpoter.sendMail(mailoptions,(err,info)=>{
        if(err){
          res.send("error")
        }
        else{
          res.send("Mail sent")
        }
      })
  }else{
    res.send("Email Id Does Not Exists")
  }
})




// otp verification router 
router.post("/otpverification",async (req,res)=>{
  let response = await client.connect()
  let db = await response.db(databaseName)
  let table = await db.collection("table")
  let user = await table.find({email:req.body.email}).toArray()
  if(user.length){
      if(req.body.otp == user[0].otp){
        let removeOTP = await table.updateOne({email:user[0].email},{$unset:{otp:req.body.otp}})
          res.send("Correct Otp")
      }else{
        res.send("Incorrect OTP")
      }
  }else{
    res.send("Email id does not exists")
  }
})




// reset password router 
router.post("/resetpassword",async (req,res)=>{
    let response = await client.connect()
    let db = await response.db(databaseName)
    let table = await db.collection("table")
    let user = await table.find({email:req.body.email}).toArray()
    console.log(user)
    if(user.length){
      let modifyPassword = await hashPassword(req.body.password1)
      let updatePassword = await table.updateOne({email:user[0].email},{$set:{password:modifyPassword}})
      res.send("Password Updated")
    }else{
      res.send("user not found")
    }
})



// admin signup 
router.post("/adminsignup",async (req,res)=>{
  let response = await client.connect()
  let db = await response.db(adminDatabase)
  let table = await db.collection("table")
  let user = await table.find({email:req.body.email}).toArray()
  if(user.length){
    res.send("AdminId already Exists")
  }else{
    let modifyPassword = await hashPassword(req.body.password)
    req.body.password = modifyPassword
    let insertAdminData = await table.insertOne(req.body)
    res.send("Admin SignUp successfull")
  }
})



// admin login
router.post("/adminlogin",async (req,res) => {
  let response = await client.connect()
  let db = await response.db(adminDatabase)
  let table = await db.collection("table")
  let user = await table.find({email:req.body.email}).toArray()
  if(user.length){
    let checkedPasswordResult = await comparePassword(req.body.password,user[0].password)
    if(checkedPasswordResult){
      res.send("Login SuccessFull")
    }else{
      res.send("Incorrect Password")
    }
  }else{
    res.send("AdminId Does Not Exists")
  }
})

// after payment 
router.post("/paymentticket",async (req,res)=>{
  let response = await client.connect()
  let db = await response.db(databaseName)
  let table = await db.collection("table")
  let user = await table.find({email:req.body.userid.email}).toArray()
  console.log(user)
  if(user.length){
      let updateFilmDetails = await table.updateOne({email:user[0].email},{$set:{filmsDetails:req.body}})
      res.send("done")
  }else{
    res.send("Session Expired Please Login Again")
  }
})


router.post("/savefilms",async (req,res)=>{
  let response = await client.connect()
  let db = await response.db("filmslist")
  let table = await db.collection("table")
  let insertfilmsList = await table.insertMany(req.body)
})
module.exports = router;
