import bcrypt from "bcrypt"


async function main(){
    const hashedPassword = await bcrypt.hash('pass1234', 10);
    console.log(hashedPassword)
}

main()
