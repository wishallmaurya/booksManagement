const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken")
const { isValidEmail, isValidName, isValidPhone, isValid, isValidPassword, isValidPincode } = require("../validation/validator");


const createUser = async function (req, res) {
    try {
        let data = req.body;
        const { title } = req.body

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ msg: "Body should not be empty" })
        }
        

        if (!("title" in data) || !("name" in data) || !("phone" in data) || !("email" in data) || !("password" in data)) return res.status(400).send({ status: false, msg: "title,name,phone,email,password and address all are required" })

        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "The Title Attributes should not be empty" })
        if (title !== "Mr") {
            if (title !== "Mrs") {
                if (title !== "Miss") {
                    return res.status(400).send({ status: false, msg: "Title Should be Mr , Mrs , Miss" })
                }
            }
        }

        if (!isValid(data.name)) return res.status(400).send({ status: false, msg: "The name Attributes should not be empty" })
        if (!isValidName(data.name)) return res.status(400).send({ status: false, msg: "Pls Enter Valid Name" })

        if (!isValid(data.phone))
            return res.status(400).send({ status: false, msg: "The phone Attributes should not be empty" })
        if (!isValidPhone(data.phone))
            return res.status(400).send({ status: false, msg: "Pls Enter Valid phone" })

        let checkuniquephone = await userModel.findOne({ phone: data.phone })
        if (checkuniquephone) return res.status(400).send({ status: false, msg: "This phone Already Exists Pls Use Another" })

        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "The email Attributes should not be empty" })
        if (!isValidEmail(data.email)) return res.status(400).send({ status: false, msg: "Pls Enter Email in valid Format" })

        let checkuniqueemail = await userModel.findOne({ email: data.email })
        if (checkuniqueemail) return res.status(400).send({ status: false, msg: "This Email Id Already Exists Pls Use Another" })

        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "The Password Attributes should not be empty" })

        if (!isValidPassword(data.password)) return res.status(400).send({ status: false, msg: "Password is not valid- your password should be 8 to 15 digit long and contain Uppercase,Lowercase,Symbol and digit" })
        if (req.body.address) {
            if (!isValidName(req.body.address.city)) return res.status(400).send({ status: false, msg: "Pls Enter Valid city Name" })
            if(req.body.address.street!=undefined)
            if (!isValid(req.body.address.street)) return res.status(400).send({ status: false, msg: "The street Attributes should not be empty" })

            if (req.body.address.pincode !== undefined) {
                if (!isValidPincode(req.body.address.pincode)) return res.status(400).send({ status: false, msg: "Pls Enter Valid Pincode" })
            }
        }
        let savedData = await userModel.create(data);
        res.status(201).send({ status: true, msg: "Success", data: savedData });
    }

    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};

//........................................................ User Login 
const userLogin = async function (req, res) {
    let value = req.body
    let userName = value.email
    let password = value.password
    //................................................... Empty Body Validation 
    if (!("email" in value) || !("password" in value)) return res.status(400).send({ status: false, msg: "Pls Enter Email And Password" })
    //....................................................Empty Attributes Validation
    if (!isValid(userName) || !isValid(password)) return res.status(400).send({ status: false, msg: "Pls Provide data in Email And Password" })

    let user = await userModel.findOne({ $and: [{ email: userName, password: password }] })
    if (!user) return res.status(400).send({ status: false, msg: "Pls Use Valid Credentials" })

    let token = jwt.sign({
        userId: user._id.toString()
    }, "functionup-radon")

    res.status(200).send({ status: true, msg: "success", token: token })

}


module.exports.userLogin = userLogin
module.exports.createUser = createUser