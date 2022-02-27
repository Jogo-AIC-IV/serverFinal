import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username:       {
        type: String,
        required: true
    },
    password:       {
        type: String,
        required: true
    },
    email:          {
        type: String,
        required: true
    },
    rank:           {
        type: Number,
        default: 1,
        required: true
    },
    rankCurrent: {
        type: Number,
        default: 1,
        required: true
    },
    rankNext:       {
        type: Number,
        default: 3,
        required: true
    },
    gold:           {
        type: Number,
        default: 100,
        required: true
    },
    unlockedTypes:  {
        type: Array,
        default: ['warrior', 'thief'],
        required: true
    },
    selectedTypes: {
        type: Array,
        default: ['warrior', 'thief'],
        required: true
    }
}, {
    timestamps: true,
    autoIndex:  true
});

const UserModel = mongoose.model('user', UserSchema);

export { UserModel };