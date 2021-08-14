const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const employeeSchema =new mongoose.Schema({
    name : {
        type: String,
        required:true
    },
    email : {
        type: String,
        required: true,
        unique:true
    },
    password : {
        type: String,
        required: true
    },
    confirmpassword : {
        type: String,
        required: true
    },
    phone :{
        type: Number,
        required: true,
        unique: true
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }
    }]
})

const jwt = require("jsonwebtoken");

employeeSchema.methods.generateAuthToken = async function (){
    try {
        const token = await jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part is"+error);
        console.log("the error part is"+error);
    }
}


//before saving run this function
employeeSchema.pre("save", async function(next) {

    if(this.isModified("password"))
    {
        // console.log(`The current password is ${this.password}`);
        this.password = await bcryptjs.hash(this.password, 10);
        this.confirmpassword = await bcryptjs.hash(this.password, 10);
        // console.log(`The bcrypt password is ${this.password}`);
        // this.confirmpassword = undefined;
        next();
    }

})

const Register = new mongoose.model('Register', employeeSchema);

module.exports = Register;