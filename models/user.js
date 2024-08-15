import {Schema,model,models} from "mongoose";

const UserSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    // password:{
    //     type:String,
    //     required:true,
    // },
    // isVerified:{
    //     type:Boolean,
    //     default:false,
    // },
    // isAdmin:{
    //     type:Boolean,
    //     default:false,
    // },
    // forgotPasswordToken: String,
    // forgotPasswordTokenExpiry: Date,
    // verifyToken: String,
    // verifyTokenExpiry: Date,
})

export default models.User|| model('User',UserSchema)