const defaultUnitTypes = {
    "unitTypes": [
        {
            "name": "lancer",
            "unlockPrice": 100,
            "price": 5,
            "attributes": {
                "tier":       { "curr": 1,      "max": 1,     "progress": 1  },
                "health":     { "curr": 80,     "max": 80,    "progress": 25 },
                "combo":      { "curr": 0,      "max": 0,     "progress": 1  },
                "attack":     { "curr": 1.5,    "max": 1.5,   "progress": 1.4  },
                "deffense":   { "curr": 1.5,    "max": 1.5,   "progress": 0.6  }
            },
            "targeting": "health",
            "description": "Ataca o inimigo com mais saúde."
        },
        {
            "name": "archer",
            "unlockPrice": 100,
            "price": 5,
            "attributes": {
                "tier":       { "curr": 1,      "max": 1,     "progress": 1   },
                "health":     { "curr": 100,    "max": 100,   "progress": 30  },
                "combo":      { "curr": 0,      "max": 0,     "progress": 0   },
                "attack":     { "curr": 2,      "max": 2,     "progress": 1.5 },
                "deffense":   { "curr": 1,      "max": 1,     "progress": 0.25 }
            },
            "targeting": "-health",
            "description": "Ataca o inimigo com menos saúde."
        },
        {
            "name": "warrior",
            "unlockPrice": 100,
            "price": 5,
            "attributes": {
                "tier":       { "curr": 1,      "max": 5,     "progress": 1     },
                "health":     { "curr": 200,    "max": 200,   "progress": 40    },
                "combo":      { "curr": 0,      "max": 0,     "progress": 0     },
                "attack":     { "curr": 1.5,    "max": 1.5,   "progress": 1.35  },
                "deffense":   { "curr": 2,      "max": 2,     "progress": 1.1   }
            },
            "targeting": "random",
            "description": "Ataca um inimigo aleatório."
        },
        {
            "name": "mage",
            "unlockPrice": 100,
            "price": 35,
            "attributes": {
                "tier":       { "curr": 1,      "max": 5,     "progress": 1     },
                "health":     { "curr": 90,     "max": 90,    "progress": 30    },
                "combo":      { "curr": 0,      "max": 0,     "progress": 0     },
                "attack":     { "curr": 4,      "max": 4,     "progress": 1.8   },
                "deffense":   { "curr": 1,      "max": 1,     "progress": 0.25  }
            },
            "targeting": "random",
            "description": "Mais caro, mais dano, aleatório."
        },
        {
            "name": "thief",
            "unlockPrice": 100,
            "price": 20,
            "attributes": {
                "tier":       { "curr": 1,      "max": 1,     "progress": 1   },
                "health":     { "curr": 75,     "max": 75,    "progress": 30  },
                "combo":      { "curr": 0,      "max": 0,     "progress": 0   },
                "attack":     { "curr": 3,      "max": 3,     "progress": 1.8 },
                "deffense":   { "curr": 1,      "max": 1,     "progress": 0.25 }
            },
            "targeting": "-health",
            "description": "Ataca o inimigo com menos saúde."
        },
        {
            "name": "pigeon",
            "unlockPrice": 100,
            "price": 55,
            "attributes": {
                "tier":       { "curr": 1,      "max": 1,     "progress": 1    },
                "health":     { "curr": 200,    "max": 200,   "progress": 150  },
                "combo":      { "curr": 0,      "max": 0,     "progress": 0    },
                "attack":     { "curr": 3,      "max": 3,     "progress": 7    },
                "deffense":   { "curr": 3,      "max": 3,     "progress": 1    }
            },
            "targeting": "random",
            "description": "Só um pombo, eu acho..."
        }
    ],
    "enemyTypes": [
        {
            "name": "enemy",
            "price": 8,
            "attributes": {
                "tier":       { "curr": 1,      "max": 1,     "progress": 1   },
                "health":     { "curr": 22,     "max": 22,    "progress": 22  },
                "combo":      { "curr": 0,      "max": 0,     "progress": 0   },
                "attack":     { "curr": 2,      "max": 2,     "progress": 1.5 },
                "deffense":   { "curr": 1.5,    "max": 1.5,   "progress": 0.5 }
            },
            "targeting": "random"
        }
    ]
}

export { defaultUnitTypes };