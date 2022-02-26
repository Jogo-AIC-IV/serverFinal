import { Unit } from './unit.js';
import { defaultUnitTypes } from '../config/defaultUnitTypes.js';

class Table {
    constructor(userName, types, bot=false) {
        this.userName       = userName;
        this.unitTypes      = types || defaultUnitTypes.unitTypes;
        this.unitPrice      = 20;
        this.unitList       = [];
        this.enemyList      = [];
        this.gold           = 50;
        this.life           = 500;
        this.cycle          = 0;
        this.cycleActions   = [];
        this.bot            = bot;
        this.maxTier        = 0;
        this.socketId       = null;
    }
    surrender(socketInstance) {
        this.gold = 0;
        this.unitList.forEach((unit, unitIndex) => {
            this.life = 5;
            const actionList = [unit.applyDamage(unit.attributes.health.curr)];
            this.cycleActions.push({
                type:         'enemy',
                index:        0,
                targetIndex:  unitIndex,
                data:         actionList
            });
            this.desassociateSocketEvents(socketInstance);
        });
    }
    associateSocket(socketInstance) {
        const that = this;
        if(!this.bot){
            this.socketId = socketInstance.id;
            socketInstance.on('CLIENT_MATCH_UNIT_ADD', function() { that.addUnit() });
            socketInstance.on('CLIENT_MATCH_UNIT_UPGRADE', function(data) {
                const { index } = data;
                that.upgradeUnit(parseInt(index));
            });
            socketInstance.on('CLIENT_MATCH_SURRENDER', function() { that.surrender() });
        }
    }
    desassociateSocketEvents(socketInstance) {
        if(!this.bot){
            socketInstance.off('CLIENT_MATCH_UNIT_ADD', () => {});
            socketInstance.off('CLIENT_MATCH_UNIT_UPGRADE', () => {});
            socketInstance.off('CLIENT_MATCH_SURRENDER', () => {});
        }
    }
    applyDamage(damage) {
        return { damage,  health: this.life = Math.max(0, (this.life - damage).toFixed(2)) };
    }
    addUnit(ignoreMoney = false) {
        if(this.gold >= this.unitPrice || ignoreMoney){
            const type = this.unitTypes[Math.floor(Math.random()*this.unitTypes.length)];
            const newUnit = new Unit(type.name, type.price, type.attributes, type.description, type.targeting);
            this.unitList.push(newUnit);
            this.gold -= this.unitPrice;
            this.unitPrice += Math.floor(this.unitPrice/2);
            this.cycleActions.push({
                type:           'addUnit',
                index:          this.unitList.length,
                targetIndex:    -1,
                data:           {
                    newUnit,
                    gold: this.gold,
                    unitPrice: this.unitPrice
                }
            });
        }
    }
    upgradeUnit(index, ignoreMoney = false) {
        if(!this.bot) console.log('Attempting to upgrade unit...');
        if(this.unitList[index] && (this.gold >= this.unitList[index].price || ignoreMoney)) {
            this.gold -= this.unitList[index].price;
            this.unitList[index].executeUpgrade();
            this.cycleActions.push({
                type:           'upgradeUnit',
                index:          index,
                targetIndex:    -1,
                data:           {
                    newUnit: this.unitList[index],
                    gold: this.gold
                }     
            });
        }
    }
    addUnities(number) {
        for(var counter = 0; counter < number; counter += 1) {
            this.addUnit(true);
        }
    }
    addEnemy() {
        const tier = Math.sqrt(this.cycle/50);
        const newEnemy = new Unit('enemy', defaultUnitTypes.enemyTypes[0].price + Math.round(tier), defaultUnitTypes.enemyTypes[0].attributes);
        for(var i = 1; i < tier; i++) {
            newEnemy.executeUpgrade(true);
        }
        this.enemyList.push(newEnemy);
        this.cycleActions.push({
            type:           'addEnemy',
            index:          this.enemyList.length,
            targetIndex:    -1,
            data:           newEnemy
        });
    }
    addEnemies(number) {
        for(var counter = 0; counter < number; counter += 1) {
            this.addEnemy();
        }
    }
    executeCycle() {
        const ret = {
            enemiesKilled: 0,
            unititesKilled: 0
        };
        // Applying UnitList action
        this.unitList.forEach((unit, index) => {
            const targetIndex = unit.executeTargeting(this.enemyList);
            if(targetIndex != -1 && this.enemyList[targetIndex]) {
                const actionList = unit.executeAttack(this.enemyList[targetIndex]);
                if(actionList[actionList.length-1].health <= 0) {
                    this.gold += this.enemyList[targetIndex].price;
                    ret.enemiesKilled += 1;
                    this.enemyList.splice(targetIndex, 1);
                    this.cycleActions.push({
                        type:           'enemyDied',
                        index:          index,
                        targetIndex:    targetIndex,
                        data:           {
                            gold: this.gold
                        }
                    });
                }
                this.cycleActions.push({
                    type:           'unit',
                    index:          index,
                    targetIndex:    targetIndex,
                    data:           actionList
                });
            }
        });
        // Applying EnimyList action
        this.enemyList.forEach((unit, index) => {
            const targetIndex = unit.executeTargeting(this.unitList);
            if(targetIndex != -1 && this.unitList[targetIndex]) {
                const actionList = unit.executeAttack(this.unitList[targetIndex]);
                if(actionList[actionList.length-1].health <= 0) {
                    ret.unititesKilled += 1;
                    this.unitList.splice(targetIndex, 1);
                }
                this.cycleActions.push({
                    type:         'enemy',
                    index:        index,
                    targetIndex:  targetIndex,
                    data:         actionList
                });
            }else {
                const actionList = unit.executeAttack(this);
                this.cycleActions.push({
                    type:         'enemy',
                    index:        index,
                    targetIndex:  'user',
                    data:         actionList
                });
            }

        });
        // If should buy automatically
        if(this.bot) {
            this.addUnit();
            this.unitList.forEach((unit, index) => {
                if(unit.attributes.health.curr <= unit.attributes.health.max || this.gold > unit.price*10){
                    this.upgradeUnit(index);
                }
            });
        }
        this.cycle += 1;
        return ret;
    }
}

export { Table };