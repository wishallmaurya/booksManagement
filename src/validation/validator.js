const isValidEmail=(mail)=>{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    return true
}
const isValidName=(name)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name))
    return true
}
const isValid=(value)=>{
    if(typeof value==="undefined" || value=== null ) return false
    if(typeof value==="string" && value.trim().length===0) return false
    return true
}
const isValidPhone = (mobile) => {
    if (/^([+]\d{2})?\d{10}$/.test(mobile))
        return true
}
    // const isValidPincode = (pin) => {
    //   if (/^[1-9][0-9]{5}$}*$/.test(pin))
const isValidPincode = (pin) => {
    if (/^[1-9][0-9]{5}$}*$/.test(pin))
        return true
}
const isValidPassword=(pw)=>{
    if (/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(pw))
    
    return true
}
const isValidTitle=(title)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/.test(title))
    return true
}
const isValidBody=(body)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/.test(body))
    return true
}






module.exports={isValidPincode,isValidPhone,isValidEmail,isValidName,isValid,isValidPassword,isValidTitle,isValidBody}