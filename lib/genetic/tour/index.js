'use strict';

const {shuffle} = require('../../utils');

module.exports = class Tour {
    constructor(tourManager, tour) {
        this._tourManager = tourManager;
        this._distance = 0; //cache

        if (tour) {
            this._tour = tour.slice();
        } else {
            this._tour = new Array(tourManager.N);
        }
    }

    get N() {
        return this._tour.length;
    }

    generateTour() {
        for (let i = 0; i < this.N; i++) {
            this._tour[i] = i;
        }
        shuffle(this._tour);
        this._distance = 0; //cache
    }

    getVertex(pos) {
        return this._tour[pos];
    }

    setVertex(pos, v) {
        this._tour[pos] = v;
        this._distance = 0; //clear cache
    }

    findVertex(v) {
        return this._tour.indexOf(v);
    }

    swap(i, j) {
        [this._tour[i], this._tour[j]] = [this._tour[j], this._tour[i]];
        this._distance = 0; //clear cache
    }

    removeVertex(v) {
        const index = this.findVertex(v);
        if (index !== -1) {
            this._tour.splice(index, 1);
            this._distance = 0; //clear cache
        }
    }

    getFitness() {
        return 1 / this.getDistance();
    }

    containsVertex(v) {
        return this._tour.includes(v);
    }

    getDistance() {
        if (this._distance === 0) {
            for (let i = 0; i < this.N - 1; i++) {
                this._distance += this._tourManager.distance(this._tour[i], this._tour[i + 1]);
            }
            this._distance += this._tourManager.distance(this._tour[this.N - 1], this._tour[0]);
        }
        return this._distance;
    }

    getPath() {
        return this._tour.slice();
    }

    toString() {
        return this._tour.join('|');
    }

    clone() {
        const copy = new Tour(this._tourManager);
        copy._tour = this._tour.slice();
        return copy;
    }
};
