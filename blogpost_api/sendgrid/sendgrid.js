require("dotenv").config();
//const https = require("https")
const sgMail = require("@sendgrid/mail");
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
app.use(bodyParser.urlencoded({extended:true}))
//app.use(express.static("public"))
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req,res)=>{
    res.send("")
})

app.post('/' , (req,res)=>{
    //const firstname = req.body.first_name
    //const lastname = req.body.last_name
    const email = req.body.email
    const data= {
        email_address: email
    }
    console.log(data)

    const sendMail = async (msg) => {
        try{
            await sgMail.send(msg);
            console.log("message sent successfully!");
        }catch(error){
            console.error(error);
            if(error.respons){
                console.error(error.respons.body);
            }
        }
    };
    
    sendMail({
        to: data.email_address,
        from: "brianjcaldera@outlook.com",
        subject: "Welcome to BLOGPOST Newsletter!",
        text: "Thanks for subscribing.",
    });
})

app.listen(3001, function (request, response){})