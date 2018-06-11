'use strict';

const PriorityQueue = require('priorityqueuejs');
const EventEmitter = require('events');

const PlayerTour = require('./player-tour');
const PlayerEmitter = require('./player-emitter');
const {range} = require('./utils');

module.exports = class Game extends EventEmitter {
    constructor(tourManager, players) {
        super();

        this._tourManager = tourManager;
        this._players = players;
        this._tours = players.map(() => new PlayerTour(tourManager));
        this._verticies = {
            empty: new Set(range(0, tourManager.N - 1)),
            visited: new Set()
        };
        this._queue = new PriorityQueue((p1, p2) => p2.time - p1.time);
        this._emitter = new PlayerEmitter(players);
        this._finished = false;
        this._inited = false;
    }

    init() {
        this._players.forEach((player, index) => {
            const vertex = player.doInit();
            const queueObject = {
                time: 0,
                index,
                player,
                tour: this._tours[index]
            };

            if (this._assertVertexSoft(queueObject, vertex)) {
                this._addVertex(queueObject, vertex);
                this._queue.enq(queueObject);
                this._emitter.postpone(player, vertex);

                this.emit('init', {index, player, vertex});
            }
        });

        this._emitter.notify();
        this._inited = true;
    }

    get isInited() {
        return this._inited;
    }

    doTurn() {
        if (this.isFinished) {
            return;
        }

        const queueObject = this._queue.deq();
        const {player, tour, index} = queueObject;

        let nextVertex;
        try {
            nextVertex = player.doTurn();
        } catch (e) {
            this.emit('disqualify', {
                state: 'exception',
                message: e.message,
                index,
                player,
                tour: tour.block()
            });
        }

        if (nextVertex !== undefined && this._assertVertex(queueObject, nextVertex)) {
            const currentVertex = queueObject.tour.lastVertex;

            this._addVertex(queueObject, nextVertex);
            const currentTime = queueObject.time;
            queueObject.time = tour.distance;

            this._queue.enq(queueObject);
            this._emitter.notify(player, nextVertex);

            this.emit('turn', {
                index: queueObject.index,
                player,
                time: currentTime,
                nextTime: queueObject.time,
                current: currentVertex,
                next: nextVertex
            });
        }

        if (this._verticies.empty.size === 0) {
            this.emit('end', {success: true});
            this._finish();

            return;
        }
        if (this._queue.isEmpty()) {
            this.emit('end', {success: false});
            this._finish();
        }
    }

    _finish() {
        this._finished = true;

        while (this._queue.size() !== 0) {
            const queueObject = this._queue.deq();
            queueObject.tour.finish();

            queueObject.tour = queueObject.tour.clone();
            this.emit('result', queueObject);
        }
    }

    getTour(index) {
        const tour = this._tours[index].clone();
        tour.block();
        return tour;
    }

    get isFinished() {
        return this._finished;
    }

    get playersCount() {
        return this._players.length;
    }

    _addVertex({tour}, v) {
        this._verticies.empty.delete(v);
        this._verticies.visited.add(v);
        tour.addVertex(v);
    }

    _assertVertexSoft({index, player, tour}, vertex) {
        if (!Number.isInteger(vertex) || vertex < 0 || vertex >= this._tourManager.N) {
            this.emit('disqualify', {
                state: 'init',
                index,
                player,
                tour: tour.block(),
                next: vertex
            });

            return false;
        }
        return true;
    }

    _assertVertex(queueObject, vertex) {
        if (!this._assertVertexSoft(queueObject, vertex)) {
            return false;
        }

        if (!this._verticies.empty.has(vertex)) {
            this.emit('disqualify', {
                state: 'turn',
                index: queueObject.index,
                player: queueObject.player,
                tour: queueObject.tour.block(),
                next: vertex
            });

            return false;
        }
        return true;
    }
};
