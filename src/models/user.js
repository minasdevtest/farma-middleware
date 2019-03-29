import { Schema, model, Model } from "mongoose";
import Roles from './roles'
import { genSalt, hash, compare } from "bcryptjs";
import { rejectIfEmpty } from "../lib/util";
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const SALT_WORK_FACTOR = 10

export function hashPassword(password, ...args) {
    console.log('CALL', password, args)
    return genSalt(SALT_WORK_FACTOR)
        .then(salt => hash(password, salt, null))
}

const UserSchema = new Schema({
    email: { type: String, required: 'Email é obrigatório', trim: true, unique: [true, 'Email já registrado'], match: [EMAIL_REGEX, 'Email Inválido'] },
    name: { type: String, required: 'Nome é obrigatório', trim: true },
    password: { type: String, required: 'Senha é obrigatória' },
    roles: {
        type: [String],
        validate: [({ length }) => length > 0, 'Função é obrigatória'],
        enum: { values: Roles.getRolesList(), message: 'Função inválida' },
        required: 'Função é obrigatória'
    },
}, { timestamps: true })

Object.assign(UserSchema.statics, {
    /**
     * @memberof User
     * @param {String} email 
     * @param {Function} cb 
     * @returns {Promise}
     */
    findByEmail(email, cb) {
        return this.findOne({ email }, cb);
    },
    /**
     * @memberof User
     * @alias authenticate
     * @param {Object} { email, password }
     * @param {Function} cb
     * @returns {Promise}
     */
    authenticate({ email, password }) {
        let userFound = null
        return hashPassword(password)
            .then(password => {
                console.log('XOXO', email, password)
                return this.findOne({ email })
            })
            .then(rejectIfEmpty('User not found'))
            .then(user => userFound = user)
            .then(() => compare(password, userFound.password))
            .then((auth) => auth ? userFound : Promise.reject('Invalid password'))
    }
})




function passwordFix(next) {
    console.log("\n\n\n\nHashing password\n\n\n\n")
    console.log(this.password)
    const user = this;
    if (!user.isModified('password')) return next();

    return hashPassword(user.password)
        .then(hash => user.password = hash)
        .then(() => next())
        .catch(err => next(err))
}

UserSchema.post('save', (error, doc, next) => {
    // return next(error)
    console.error(error)
    if (error.name === 'MongoError' && error.code === 11000 && error.message.match(/email/g))
        return next(Object.assign(new Error(), {
            errors: {
                email: {
                    message: "Email Duplicado",
                    name: "MongoError",
                    properties: {
                        message: "Email Duplicado",
                        type: "duplicate",
                        path: "email"
                    },
                    kind: "duplicate",
                    path: "email"
                }
            },
            _message: "User validation failed",
            message: "User validation failed: email: Email Duplicado",
            name: "MongoError"
        }));
    return next();
});

// UserSchema.pre('save', passwordFix)
// UserSchema.pre('update', passwordFix)
// UserSchema.pre('updateOne', passwordFix)
// // UserSchema.pre('updateMany', passwordFix)
// UserSchema.pre('findOneAndUpdate', passwordFix)



/**
 * @namespace User
 */
const User = model("User", UserSchema)

User.findB
export default User