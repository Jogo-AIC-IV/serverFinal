import { db } from '../services/mongoose.js';
import { defaultUnitTypes } from '../config/defaultUnitTypes.js';

class User {
    constructor(io, socket) {
        this.id = socket.id;
        this._io = io;
        this._socket = socket;
        this.authenticated = false;
        this.userData;
        this.status = 'login';
        this.searchAttempts = 0;
        this.registerAuthenticationHandlers();
        this.registerMatchmakingHandlers();
        this.registerUnitTypesHandlers();
    }
    async saveUserData() {
        try {
            await db.users.update(this.userData);
        }catch(error) {
            console.log(error);
        }
    }
    forceLogoff() {
        if(this.userData) db.users.logoff(this.userData);
    }
    handleVictory() {
        this.userData.gold += 20;
        this._socket.emit('SERVER_MATCH_END', { won: true, gold: this.userData.gold });
        this.saveUserData();
    }
    handleDefeat() {
        this._socket.emit('SERVER_MATCH_END', { won: false, gold: this.userData.gold });
        this.saveUserData();
    }
    registerAuthenticationHandlers() {
        this._socket.on('CLIENT_REGISTER', async data => {
            const { username, email, password } = data;
            try {
                const userData = await db.users.register(username, email, password);
                this._socket.emit('SERVER_REGISTER_SUCCESS', { userData });
            } catch(error) {
                this._socket.emit('SERVER_ERROR', { error });
            }
        });
        this._socket.on('CLIENT_LOGIN', async data => {
            const { email, password } = data;
            try {
                const userData = await db.users.authenticate(email, password);
                this.userData = userData;
                this.authenticated = true;
                this.status = 'idle';
                this._socket.emit('SERVER_LOGIN_SUCCESS', { userData: this.userData, defaultUnitTypes });
            }catch(error) {
                this._socket.emit('SERVER_ERROR', { error });
            }
        });
        this._socket.on('CLIENT_LOGOFF', data => {
            db.users.logoff(this.userData);
            this.userData = {};
            this.status = 'login';
            this.authenticated = false;
        });
    }
    registerUnitTypesHandlers() {
        this._socket.on('CLIENT_UNLOCK_UNIT_TYPE', async data => {
            try {
                const { unitTypeName } = data;
                const unitExists = defaultUnitTypes.unitTypes.find(unit => unit.name == unitTypeName);
                if(!unitExists) { throw { error: 'Ops!', message: 'Erro ao desbloquear unidade' } };
                const unitLocked = !this.userData?.unlockedTypes.includes(unitTypeName);
                if(!unitLocked) { throw { error: 'Ops!', message: 'A unidade já foi desbloqueada' } };
                if(this.userData?.gold < unitExists.unlockPrice) { throw { error: 'Insuficient gold', message: `Dinheiro insuficiente ${this.userData?.gold}/${unitExists.unlockPrice}` }};
                this.userData.gold -= unitExists.unlockPrice;
                this.userData.unlockedTypes.push(unitTypeName);
                this._socket.emit('SERVER_UNLOCKED_UNIT_TYPES', { unlockedTypes: this.userData.unlockedTypes, gold: this.userData.gold });
                this.saveUserData();
            }catch(error) {
                console.log(error);
                this._socket.emit('SERVER_ERROR', { error });
            }
        })
        this._socket.on('CLIENT_SELECT_UNIT_TYPE', data => {
            try {
                const { unitTypeName } = data;
                const unitExists = this.userData?.unlockedTypes?.find(unitName => unitName == unitTypeName);
                if(!unitExists) { throw { error: 'Ops!', message: 'Erro ao selecionar unidade' } };
                const indexOf = this.userData?.selectedTypes?.findIndex(unitName => unitName == unitTypeName);
                if(indexOf != -1) {
                    this.userData?.selectedTypes?.splice(indexOf, 1);
                }else{
                    this.userData?.selectedTypes?.push(unitTypeName);
                }
                this._socket.emit('SERVER_SELECTED_UNIT_TYPES', { selectedTypes: this.userData.selectedTypes });
                this.saveUserData();
            }catch(error) {
                this._socket.emit('SERVER_ERROR', { error });
            }
        });
    }
    registerMatchmakingHandlers() {
        this._socket.on('CLIENT_SEARCH', data => {
            if(this.status != 'searching' && this.authenticated) {
                console.log(`${this.id} searching fot match...`);
                this.searchAttempts = 0;
                this.status = 'searching';
            }
        });
        this._socket.on('CLIENT_SEARCH_STOP', data => {
            console.log(`${this.id} stop searching`);
            if(this.status != 'idle') {
                this.status = 'idle';
            }
        });
    }
    joinRoom(roomId) {
        this._socket.join(roomId);
    }
}

export { User };