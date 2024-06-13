const express  = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const {blogmodel}=require("./models/blog")

const app =express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://sonasabu:sonavi306@cluster0.ejzjjq6.mongodb.net/mernblogdb?retryWrites=true&w=majority&appName=Cluster0")


const generateHashedPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password,salt)
}

app.post("/signup",async (req,res)=>{
    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    console.log(hashedPassword)
    input.password = hashedPassword
    let blog = new blogmodel(input)
    blog.save()
    res.json({"status":"success"})
})

app.post("/signin",(req,res)=>{
    let input = req.body
    blogmodel.find({"emailid":req.body.emailid}).then(

        (response)=>{
            if (response.length>0) 
            {
                let dbPassword = response[0].password
                bcrypt.compare(input.password,dbPassword,(error,isMatch)=>{
                    if (isMatch) 
                    {
                        jwt.sign({email:input.emailid},"blog-app",{expiresIn:"1d"},
                        (error,token)=>{
                            if (error) 
                            {
                                res.json({"status":"unable to create token"})
                            } else 
                            {
                                res.json({"status":"success","userID":response[0]._id,"token":token})
                            }
                        })
                    } else 
                    {
                        res.json({"status":"incorrect"})
                    }
                })
            } else 
            {
                res.json({"status":"user not found"})
            }
        }

    ).catch()
} )

app.post("/viewusers",(req,res)=>{
    let token = req.headers["token"]
    jwt.verify(token,"blog-app",(error,decoded)=>{
        if (error)
        {
            res.json({"status":"unauthorized access"})
        } else 
        {
            if (decoded) 
            {
                blogmodel.find().then(
                    (response)=>{
                        res.json(response)
                    }
                ).catch()
            }       
            
        }
    })
})

app.listen(8088,()=>{
    console.log("server running..")
    })

