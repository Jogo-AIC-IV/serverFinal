import Express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { User } from "./src/controllers/user.js";
import { Match } from "./src/controllers/match.js";
import { defaultUnitTypes } from './src/config/defaultUnitTypes.js';

import mongoose from "mongoose";

mongoose.connect('mongodb+srv://admin:admin@sistemasinternet.mw31i.mongodb.net/tinytowers?retryWrites=true&w=majority', async () => {
    console.log('Connected to MongoDb');
});

const express = Express();
const httpServer = createServer(express);
const io = new Server(httpServer, { cors: { origin: '*' }});

const maxSearchAttemps = 2;
const users = [];
var matches = [];
var doneMatches = [];

// Matchmaking
setInterval(() => {
    users.forEach((user, userIndex) => {
        //console.log(`Checking user ${user.id} - ${user.status}`);
        if(user.status == 'searching') {
            var roomId = `${user.id}`;
            //console.log(`Looking for oponent`);
            const oponent = users.find((op, opIndex) => (op.authenticated && opIndex != userIndex && op.status == 'searching'));
            if(!oponent) { console.log(`Oponent not found, ${maxSearchAttemps - user.searchAttempts} attempts left...`); }
            if(!oponent && (user.searchAttempts += 1) >= maxSearchAttemps) { // 30 segundos procurando
                user.status = 'playing';
                user.joinRoom(roomId);

                var userUnities = defaultUnitTypes.unitTypes.filter(unit => user.userData.selectedTypes.includes(unit.name));

                const userConfig = {
                    id:       user.id,
                    username: user.username,
                    rank:     user.rank,
                    types:    userUnities
                };

                const botConfig = {
                    id:       null,
                    username: null,
                    rank:     null,
                    types:    null
                }
                
                console.log(`Starting match with bot on room #${roomId}`);
                matches.push(new Match(io, roomId, userConfig, botConfig));
            }
            if(oponent) {
                //console.log(`Oponent found!`);
                roomId += `${oponent.id}`;
                user.status = 'playing';
                user.joinRoom(roomId);

                oponent.status = 'playing';
                oponent.joinRoom(roomId);
                //console.log(`Starting match with #${oponent.id} on room #${roomId}`);
                var userUnities = defaultUnitTypes.unitTypes.filter(unit => user.userData.selectedTypes.includes(unit.name));
                var oponentUnities = defaultUnitTypes.unitTypes.filter(unit => oponent.userData.selectedTypes.includes(unit.name));

                const userConfig = {
                    id:       user.id,
                    username: user.userData.username,
                    rank:     user.userData.rank,
                    types:    userUnities
                };
                const oponentConfig = {
                    id:       oponent.id,
                    username: oponent.userData.oponentname,
                    rank:     oponent.userData.rank,
                    types:    oponentUnities
                };

                
                matches.push(new Match(io, roomId, userConfig, oponentConfig));
            }
        }
    });
}, 3000);

// Match executing
setInterval(() => {
    // Executing and Removing done matches
    // console.log("matches: ", matches)
    matches.forEach((match, matchIndex) => {
        switch(match.status) {
            case 'waiting':
                match.init(1, 1);
            break;
            case 'running':
                match.executeCycle();
            break;
            case 'finished':
                const userOne = match.userOne.id != 'bot' ? users.filter(user => user.id == match.userOne.id) : null;
                const userTwo = match.userTwo.id != 'bot' ? users.filter(user => user.id == match.userTwo.id) : null;
                const matchUsers = [userOne, userTwo]
                match.tables.forEach((table, tableIndex) => {
                    if(!matchUsers[tableIndex] || !matchUsers[tableIndex][0] || !matchUsers[tableIndex][0]._socket) return;
                    table.desassociateSocketEvents(matchUsers[tableIndex][0]._socket);
                    if(table.life > 0) {
                        matchUsers[tableIndex][0].handleVictory();
                    }else {
                        matchUsers[tableIndex][0].handleDefeat();
                    }
                });
                doneMatches.push(matchIndex);
            break;
        }
    });
    doneMatches.forEach(id => {
        doneMatches.splice(id, 1)
        matches.splice(id, 1);
    })
}, 500);

const onConnection = (socket) => {
    console.log(`Socket #${socket.id} connected`);
    users.push(new User(io, socket));
    const userIndex = users.length - 1;
    socket.on('disconnect', async () => {
        await users[userIndex].forceLogoff();
        matches.forEach((match, matchIndex) => {
            const userTableIndex = match.tables.findIndex(table => table.socketId == socket.id);
            if(userTableIndex != -1) {
                match.tables[userTableIndex].surrender(socket);
                match.tables.filter(table => table.socketId != socket.id).forEach(otherTable => {
                    if(otherTable.socketId == null) return;
                    var otherTableUserIndex = users.findIndex(user => user._socket.id == otherTable.socketId);
                    users[otherTableUserIndex].handleVictory();
                });
                matches.splice(matchIndex, 1);
            }
        });
        console.log(`Socket #${socket.id} disconnected`);
        users.splice(userIndex, 1);
    })
}

io.on("connection", onConnection);
httpServer.listen(process.env.PORT || 5000);
console.log(`Server up on PORT ${process.env.PORT || 5000}`);