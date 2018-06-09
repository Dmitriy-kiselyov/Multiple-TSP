'use strict';

import globalOptions from './global-options';
import {set, get} from '../preferences';

const PREFIX = 'tanysha-multiple-tsp-';
const POINTS = `${PREFIX}points`;
const PLAYERS = `${PREFIX}players`;
const POPULATION = `${PREFIX}population`;
const MUTATION_RATE = `${PREFIX}mutation_rate`;
const EVOLVE_FIRST_STEP = `${PREFIX}evolve_fist_step`;
const EVOLVE_PER_STEP = `${PREFIX}evolve_per_step`;
const GAME_SPEED = `${PREFIX}game_speed`;

module.exports = {
    getPoints: () => get(POINTS, null, JSON.parse),
    setPoints: (points) => set(POINTS, JSON.stringify(points)),

    getPlayers: () => get(PLAYERS, globalOptions.players.value, Number.parseInt),
    setPlayers: (players) => set(PLAYERS, players),

    getPopulation: () => get(POPULATION, globalOptions.population.value, Number.parseInt),
    setPopulation: (population) => set(POPULATION, population),

    getMutationRate: () => get(MUTATION_RATE, globalOptions.mutationRate.value, Number.parseFloat),
    setMutationRate: (rate) => set(MUTATION_RATE, rate),

    getEvolveFirstStep: () => get(EVOLVE_FIRST_STEP, globalOptions.evolveFirstStep.value, Number.parseInt),
    setEvolveFirstStep: (count) => set(EVOLVE_FIRST_STEP, count),

    getEvolvePerStep: () => get(EVOLVE_PER_STEP, globalOptions.evolvePerStep.value, Number.parseInt),
    setEvolvePerStep: (count) => set(EVOLVE_PER_STEP, count),

    getGameSpeed: () => get(GAME_SPEED, globalOptions.gameSpeed.value, Number.parseInt),
    setGameSpeed: (speed) => set(GAME_SPEED, speed)
};
