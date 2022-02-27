import { Table } from './table.js';

class Match {
    // Receives both users ID and UnitTypes (null will create a bot user)
    constructor(io, roomName, userOne, userTwo) {
        this._io = io;
        this.roomName = roomName;
        this.roomClients =  io.in(roomName).clients;
        this.status = 'waiting';
        this.cycle = 0;
        this.cycleEnemy = 0;
        this.cycleEnemyMax = 60;
        this.tables = [];

        this.userOne = userOne;
        this.userTwo = userTwo;
    }
    // Emit cycle information to the room
    emitCycle() {
        if(this.tables){
            this._io.to(this.roomName).emit('SERVER_MATCH_CYCLE', { tables: this.tables.map(table => table.cycleActions) });
            this.tables.forEach(table => table.cycleActions = []);
        }
    }

    // Emit initilization information to the room
    emitInit() {
        // console.log(`Emiting SERVER_MATCH_INIT on room #${this.roomName}`);
        this._io.to(this.roomName).emit('SERVER_MATCH_INIT', { tables: this.tables });
    }

    // Logs both tables from the match
    log() {
        this.tables.forEach(table => table.log());
    }

    // Initialize the match with [unityNumber] random unities and [enemyNumber] enemies on both tables
    init(unitNumber, enemyNumber) {
        this.tables = [
            new Table(this.userOne.id, this.userOne.username, this.userOne.rank, this.userOne.types),
            new Table(this.userTwo.id, this.userTwo.username, this.userTwo.rank, this.userTwo.types)
        ];
        this.cycleEnemy = 0;
        this.cycle = 0;
        //console.log(`Initializing tables for match #${this.roomName}`);
        this.tables.forEach((table, tableIndex) =>  {
            const userId = tableIndex == 0 ? this.userOne.id : this.userTwo.id;
            if(!userId) { return; }
            //console.log(`\t Adding unitites for match #${this.roomName}`);
            table.addUnities(unitNumber);
            //console.log(`\t Adding enemies for match #${this.roomName}`);
            table.addEnemies(enemyNumber);
            //console.log(`\t Associating socket #${table.userId} (${this._io.sockets.sockets})`);
            const socketInstance = this._io.sockets.sockets.get(userId);
            table.associateSocket(socketInstance);
            table.cycleActions = [];
        })
        this.status = 'running';
        this.emitInit();
    }

    // Verify if should spawn enemy now
    executeEnemySpawn() {
        if((this.cycleEnemy += 1) >= this.cycleEnemyMax) {
            this.tables.forEach(table => table.addEnemy());
            this.cycleEnemy = 0;
        }
    }

    // Execute both tables cycles and apply results to other tables
    executeEnemyTransfer() {
        if(this.tables){
            const results = this.tables.map(table => table.executeCycle());
            this.tables.forEach((table, tableIndex) => {
                results.forEach((result, resultIndex) => {
                    if(resultIndex != tableIndex) {
                        table.addEnemies(result.enemiesKilled);
                    }
                })
            });
        }
    }

    // Execute the complete cycle, enemy spawning and enemy transfering routine
    executeCycle() {
        this.executeEnemySpawn();
        this.executeEnemyTransfer();
        this.emitCycle();
        this.status = this.isRunning() ? 'running' : 'finished';
    }

    // Returns false if there is any table with health bellow zero
    isRunning() { return !this.tables || this.tables.reduce((acc, curr) => acc && curr.life > 0, true); }
}

export { Match };