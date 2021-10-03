const utils = require("utils");


module.exports.allActions = (room) => {
    for (const creep of utils.listCreepsOfRole(room.name, "filler")) {
        doActions(creep);
    }
}


function doActions(creep) {
    const structs = creep.room.find(FIND_MY_STRUCTURES, {
        filter: s => {
            if (s.structureType !== STRUCTURE_TOWER) {
                return false;
            } 
            if (s.store.getUsedCapacity(RESOURCE_ENERGY) < Math.round(s.store.getCapacity(RESOURCE_ENERGY) / 2)) {
                return true;
            }
        }
    });
    if (structs.length > 0) {
        fillTowers(structs);
    }

    else {
        const spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_STORAGE
        });
        if (!container) return;

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            const status = creep.withdraw(container, RESOURCE_ENERGY, creep.store.getFreeCapacity(RESOURCE_ENERGY));
            if (status === ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
            else if (status === ERR_NOT_ENOUGH_RESOURCES) {
                creep.withdraw(container, RESOURCE_ENERGY, container.store.getUsedCapacity(RESOURCE_ENERGY));
            }
        }
        else {
            if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                const status = creep.transfer(spawn, RESOURCE_ENERGY);
                if (status === ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn);
                }
            }
            else {
                const extension = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
                if (extension) {
                    const status = creep.transfer(extension, RESOURCE_ENERGY);
                    if (status === ERR_NOT_IN_RANGE) {
                        creep.moveTo(extension);
                    }
                }
                else {
                    const structs = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: s => {
                            if (s.structureType !== STRUCTURE_TOWER) {
                                return false;
                            } 
                            if (s.store.getUsedCapacity(RESOURCE_ENERGY) < s.store.getCapacity(RESOURCE_ENERGY)) {
                                return true;
                            }
                        }
                    });
                    fillTowers(creep, structs);
                }
            }
        }
    }
}


function fillTowers(creep, structs) {
    structs.sort((a, b) => {
        const aDiff = a.store.getCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY);
        const bDiff = b.store.getCapacity(RESOURCE_ENERGY) - b.store.getUsedCapacity(RESOURCE_ENERGY);
        return aDiff - bDiff;
    });
    structs.reverse();

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_STORAGE
        });

        if (container) {
            const status = creep.withdraw(container, RESOURCE_ENERGY, creep.store.getFreeCapacity(RESOURCE_ENERGY));
            if (status === ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
            else if (status === ERR_NOT_ENOUGH_RESOURCES) {
                creep.withdraw(container, RESOURCE_ENERGY, spawn.store.getUsedCapacity(RESOURCE_ENERGY));
            }
        }
    }
    else {
        const status = creep.transfer(structs[0], RESOURCE_ENERGY);
        if (status === ERR_NOT_IN_RANGE) {
            creep.moveTo(structs[0]);
        }
    }
}