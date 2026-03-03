import bcrypt from "bcryptjs";

const password = "teste12345";
const saltRounds = 10;

const hash = await bcrypt.hash(password, saltRounds);
console.log(hash);
