const userModel = require('../Models/userModel')
const jwt = require('jsonwebtoken')
const {isValidRequest,
    isValidMail,
    isValid,
    isValidTitle,
    isValidPhone,
    isValidPassword,
    isValidPincode,
    isValidName} = require('../Validator/userValidation') 

    //----------------------------------create User----------------------------------
const createUser = async function(req,res){
    try{
        
       //validating the body part if the body is empty
         if(!isValidRequest(req.body)){
            return res
                    .status(400)
                    .send({status: false, message:"Enter a Valid Input"})
         }

         let {title, name, phone, email, password, address} = req.body;
         let user = {}
         
         //title validation
         if(title){
            title = title.trim()
            if(!isValidTitle(title)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid Title"})
            }else{
                user.title = title
            }
         }else{ return res
         .status(400)
         .send({status:false, message:"Title is required"})
         }

         //name validation
         if(name){
            name = name.trim()
            if(!isValidName(name)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a Valid Name"})
            }else{
                user.name = name
            }
         }else{ return res
            .status(400)
            .send({status:false, message:"Name is required"})
        }


      //Validation of phone for +91 and 0
        if(phone && typeof phone === "string"){
            phone = phone.trim()
            if(!isValidPhone(phone)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid phone Number"})
            }
            let userPhone = await userModel.find()

            //incase phone number is starting from +91 in body
            if(phone.startsWith("+91",0)== true){
                phone = phone.substring(4,14)
                for(i=0; i<userPhone.length; i++){
                    if(userPhone[i].phone.startsWith("+91")){
                        if(userPhone[i].phone.startsWith(phone, 4)== true){
                            return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                        }
                    }
        
                    if(userPhone[i].phone.startsWith(0)){
                        if(userPhone[i].phone.startsWith(phone, 1)== true){
                            return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                        }
                    }
        
                    if(userPhone[i].phone.startsWith(phone, 0)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
                user.phone = phone
            }
        
            //incase phone number is starting from 0 in body
            if(phone.startsWith("0",0)== true){
                phone = phone.substring(1,12)
                for(i=0; i<userPhone.length; i++){
                    if(userPhone[i].phone.startsWith("+91")){
                        if(userPhone[i].phone.startsWith(phone, 4)== true){
                            return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                        }
                    }
        
                    if(userPhone[i].phone.startsWith(0)){
                        if(userPhone[i].phone.startsWith(phone, 1)== true){
                            return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                        }
                    }
        
                    if(userPhone[i].phone.startsWith(phone, 0)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
                user.phone = phone
            }
            
            //incase there is just the phone number without prefix
            if(phone){
                for(i=0; i<userPhone.length; i++){
                    if(userPhone[i].phone.startsWith("+91")){
                        if(userPhone[i].phone.startsWith(phone, 4)== true){
                            return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                        }
                    }
        
                    if(userPhone[i].phone.startsWith(0)){
                        if(userPhone[i].phone.startsWith(phone, 1)== true){
                            return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                        }
                    }
        
                    if(userPhone[i].phone.startsWith(phone, 0)== true){
                        return res.status(409).send({status:false, message:`${phone} phone number is already in use`})
                    }
                }
                user.phone = phone
            }
            
        }else{
            return res
                    .status(400)
                    .send({status:false, message:"Phone number is required or enter the number in string"})
        }

        //email validation
        if(email){
            email = email.trim()
            if(!isValidMail(email)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid email"})
            }
        }else{ return res
            .status(400)
            .send({status:false, message:"Email is required"})
       }

       //checking for duplicacy of eamil
       const isDuplicate = await userModel.findOne({email:email})
       if(isDuplicate){
        return res
                .status(409)                  
                .send({status:false, message:`${email}email already in use`})
       }
       
       user.email = email

       //password validation
       if(password){
        password = password.trim()
            if(!isValidPassword(password)){
                return res
                    .status(400)
                    .send({status:false, message:"Password should contain min 8 and max 15 characters a number and a special character"})
            }else{
                user.password = password
            }
       }else{ return res
         .status(400)
         .send({status:false, message:"Password is required"})
         }

         //address validation if address is present
         if(address !== undefined){
            user.address = address

            //validating street if there
            if(req.body.address.street !== undefined){
                if(!isValid(req.body.address.street)){
                    return res
                    .status(400)
                    .send({status:false, message:"Enter valid street in address"})
                }else user.address.street = req.body.address.street
            }

            //validating city if there
            if(req.body.address.city !== undefined){
                if(!isValid(req.body.address.city)){
                    return res
                    .status(400)
                    .send({status:false, message:"Enter valid city in address"})
                }else user.address.city = req.body.address.city
            }

            //validation pincode if there
            if(req.body.address.pincode !== undefined){
                if(!isValidPincode(req.body.address.pincode)){
                    return res
                    .status(400)
                    .send({status:false, message:"Enter a valid pincode of six characters"})
                }else user.address.pincode = req.body.address.pincode
            }
         }

         //creating user data
         const newUser = await userModel.create(user)
         return res
                    .status(201)
                    .send({status:true, message:"Success", data: newUser })

    }
    catch(error){
        return res
                .status(500)
                .send({status:false, message: error.message})
    }
}

//genearting the token 
const login = async function (req, res) {
    try {
  
      if (!isValidRequest(req.body)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide login details" });
      }
      let {email, password} = req.body;
  
      // validating the email
      if(email){
        if (!isValidMail(email))
          return res
            .status(400)
            .send({ status: false, message: "Entered mail ID is not valid" });
      }else return res
                .status(400)
                .send({ status: false, message: "email is required" });

      // validating the password
      if(password){
        if (!isValidPassword(password))
          return res.status(400).send({
            status: false,
            message: "Passwrod is not valid",
          });
      }else return res
                .status(400)
                .send({ status: false, message: "password is required" });
  
      // finding for the user with email and password
      let user = await userModel.findOne({
        email: email,
        password: password,
      });
      if (!user)
        return res.status(400).send({
          status: false,
          message: "Username and password are not matched",
        });
  
      // JWT creation
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          expiresIn: "24h"
        },
        "book-management36"
      );
      res.header("x-api-key", token);
      return res
        .status(200)
        .send({ status: true, message: "Success", data: token });
    } catch (err) {
      return res.status(500).send({status: false, message: err.message});
    }
  };
 

module.exports = {createUser, login}

