import { UserModel } from '../models/User.js';
import { encrypt, decrypt } from '../libs/cryptoJs.js';

const userList = [];

const db = {
    users: {
        // find: async (filter) => {
        //     return UserModel.find({filter});
        // },
        logoff: async (userData) => {
            if(userList.includes(userData.email)) {
                const indexOf = userList.indexOf(userData.email);
                userList.splice(indexOf, 1);
            }
        },
        authenticate: async (email, password) => {
            if(userList.includes(email)) { throw { error: 'Não autorizado', message: 'Usuário autenticado em outro dispositivo.'}}
            const user = await UserModel.findOne({email: email}).exec();
            if(!user) { throw { error: 'Não autorizado', message: 'Usuário e/ou senha inválidos.' } }
            const decryptPassword = decrypt(user.password);
            if(password != decryptPassword) { throw { error: 'Não Autorizado', message: 'Usuário e/ou senha inválidos.' } }
            delete user.password;
            userList.push(email);
            return user;
        },
        register: async (username, email, password) => {
            const existing = await UserModel.findOne({email: email}).exec();
            if(existing) { throw { error: 'Email em uso', message: 'Já existe uma conta com esse e-mail' } }
            const encryptPassword = encrypt(password);
            const userData = await UserModel.create({
                username,
                email,
                password: encryptPassword
            });
            delete userData.password;
            return userData;
        },
        update: async (userData) => {
            const updated = await UserModel.findOneAndUpdate({email: userData.email}, userData);
            return updated;
        }
    }
}

export { db };