// Helpers
const createAttribute = (data) => {
    const { curr, max, progress } = data;
    return {
    curr: parseFloat(curr),
    max: parseFloat(max),
    progress: parseFloat(progress),
    upgrade(setCurrent = true) {
        this.max = parseFloat(this.max) + parseFloat(progress);
        this.curr = setCurrent ? this.max : this.curr;
        this.progress = parseFloat(this.progress) * 2;
    }
}};

const createAttributeList = (attributes) => {
    const { tier, health, combo, attack, deffense } = attributes;
    return {
        tier:       createAttribute(tier),
        health:     createAttribute(health),
        combo:      createAttribute(combo),
        attack:     createAttribute(attack),
        deffense:   createAttribute(deffense),
    };
}


class Unit {
    constructor(type, price, attributes, description = 'Sem descrição', targetingFunction = 'random') {
        this.type       = type;
        this.price      = parseFloat(price);
        this.description = description;
        this.targetingFunction = targetingFunction;
        this.attributes = createAttributeList(attributes || {
            tier:       { curr: 1,      max: 5,     progress: 1 },
            health:     { curr: 25,     max: 500,   progress: 2 },
            combo:      { curr: 0,      max: 2,     progress: 1 },
            attack:     { curr: 1,      max: 30,    progress: 1 },
            deffense:   { curr: 1,      max: 30,    progress: 1 },
        });
    }
    /* CHECKERS */
    // Returns if unit is alive
    isAlive() { return this.attributes.health.curr > 0; }

    /* SETTERS */
    // Set current health to 0 or value, returns value
    setHealth(health) { return this.attributes.health.curr = Math.max(health, 0); }

    /* APPLIERS */
    // Apply damage to unit healths
    applyDamage(damage) {
        const healthCurr    = this.attributes.health.curr;
        const deffenseCurr  = this.attributes.deffense.curr;
        const damageFinal   = Math.max(1, (damage - deffenseCurr/2).toFixed(2));
        return { damage: damageFinal, health: this.setHealth(healthCurr - damageFinal) };
    }

    /* EXECUTERS */
    // Execute unit attack on target ( verify for combo applyance )
    executeAttack(target) {
        const combo = this.attributes.combo;
        if(combo.curr > combo.max) { return this.executeCombo(target); }
        return [target.applyDamage(this.attributes.attack.curr)];
    }

    // Execute a sequence of attacks on target
    executeCombo(target) {
        const combo = this.attributes.combo;
        const attacks = [];
        for(var comboAttack = 0; comboAttack < combo.curr; comboAttack -= 1) {
            attacks.push(target.applyDamage(this.attributes.attack.curr));
        }
        return attacks;
    } 

    // Define the next target based on the targetList
    executeTargeting(targetList) {
        if(this.targetingFunction == 'random') {
            var randomIndex = Math.floor(targetList.length * Math.random());
            return randomIndex;
        }else{
            var order = this.targetingFunction.includes('-') ? -1 : 1;
            var attribute = this.targetingFunction.replace('-','');
            var selectedValue = 0;
            var selectedIndex = -1;
            targetList.forEach((target, targetIndex) => {
                const curr = target.attributes[attribute]?.curr || 0;
                if(curr * order > selectedValue || selectedIndex == -1){
                    selectedValue = curr;
                    selectedIndex = targetIndex;
                }
            });
            return selectedIndex;
        }


    }

    // Upgrades tier, attributes and price
    executeUpgrade(ignoreMoney = false) {
        this.attributes.tier.curr += 1;

        this.attributes.health.upgrade(true);
        this.attributes.deffense.upgrade(true);
        this.attributes.attack.upgrade(true);

        if(!ignoreMoney) { this.price *= 2 };
    }
}

export { Unit };