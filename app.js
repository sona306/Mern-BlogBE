const express  = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")

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
                        res.json({"status":"success","userID":response[0]._id})
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
app.listen(8088,()=>{
    console.log("server running..")
    })

