require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const chalk = require("chalk");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers");
const port = process.env.PORT || 80;
const { json } = require("express");

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(chalk.blue(process.env.SECRET_KEY));

app.get('/', (req, res) =>{
    res.render("index");
});

app.get('/login', (req, res) =>{
    res.render("login");
});

app.get('/secret', auth, (req, res) =>{
    // console.log(`this cookie is awesome ${req.cookies.jwt}`);
    res.render("secret");
});

app.get('/logout', auth, async (req, res) =>{
    try {
        // console.log(req.user);

        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token === req.tooken;
        })

        res.clearCookie("jwt");
        console.log(chalk.blue("logout sucessfully! "));

        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/register', (req, res) =>{
    res.render("register");
});



app.post('/register', async (req, res) =>{
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password === cpassword)
        {
            const registerEmployee = new Register({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                phone: req.body.phone
            })

            const token = await registerEmployee.generateAuthToken();
            // console.log("token is "+token);

            //stores cookie value while registering
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly:true
            });
            // console.log(cookie);

            const registered = await registerEmployee.save();
            // console.log(registered);

            res.status(201).render("login");
        }
        else{
            res.send("Try Again Buddy!");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});





app.post('/login', async(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    try {
        const useremail = await Register.findOne({email: email});
        const isMatch = await bcryptjs.compare(password, useremail.password);
        // console.log(useremail);

        const token = await useremail.generateAuthToken();
        console.log("new token is "+ token);

        //stores cookie value while login
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly:true
            // secure: true
        });



        if(isMatch)
        {
            res.status(201).render("secret");
        }
        else
        {
            prompt("password not matching", "try again ");
        }
    } catch (error) {
        res.status(400).send("Invalid ");
    }
});


//create a token and authenticate the user

// const createToken = async()=>{
//     const token = await jwt.sign({_id : "6113f0af22af4d1174dbfd46"}, "mynameispriyaguptaandiamverygoodgirlfromjharkhand", {
//         expiresIn: "2 hours"
//     });
//     // console.log(token);
//     const userVer = await jwt.verify(token, "mynameispriyaguptaandiamverygoodgirlfromjharkhand");
//     console.log(userVer);
// }
//
// createToken();








//use bcrypt for securing password

// const securepassword = async(password)=>{
//     const newpassword = await bcryptjs.hash(password, 10);
//     console.log(newpassword);
//     const matchpassword = await bcryptjs.compare(password, newpassword);
//     console.log(matchpassword);
// }
// securepassword("priya");

app.listen(port, ()=>{
    console.log(chalk.yellow(`app runs successfully on port ${port}`));
});