const mongoose = require("mongoose");
const chalk = require("chalk");

mongoose.connect("mongodb://localhost:27017/youtubeRegistration", {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
    console.log(chalk.green(`Connection sucessfull`));
}).catch((e)=>{
    console.log(chalk.red(`no connection`));
})