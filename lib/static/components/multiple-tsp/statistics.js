'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {printNumber} from '../../modules/utils';
import globalOptions from '../../modules/multiple-tsp/global-options';

export default class MultipleTspStatistics extends React.Component {
    static propTypes = {
        game: PropTypes.object.isRequired
    };

    constructor() {
        super();

        this.state = {
            time: 0
        };
    }

    componentWillMount() {
        this.setState({
            players: new Array(this.props.game.playersCount).fill({
                visited: 0,
                distance: 0,
                nextTime: 0
            })
        });

        this.props.game.on('init', ({index}) => {
            const {players} = this.state;
            players[index] = {
                visited: 1,
                distance: 0,
                nextTime: 0
            };

            this.setState({players});
        });

        this.props.game.on('turn', ({time, nextTime, index}) => {
            const {players} = this.state;
            players[index] = {
                visited: players[index].visited + 1,
                distance: time,
                nextTime: nextTime
            };

            this.setState({time, players});
        });

        this.props.game.on('result', ({time, index}) => {
            const {players} = this.state;
            players[index] = {
                visited: players[index].visited,
                distance: time,
                nextTime: 0
            };

            this.setState({time, players});
        });

        this.props.game.on('disqualify', ({state, index, next, message}) => {
            console.log(`Игрок №${index + 1} исключен.`);
            switch (state) {
                case 'exception':
                    console.log(`Ход игрока завершился с ошибкой: ${message}`);
                    break;
                case 'init':
                    console.log(`Игрок вернул неверный номер выршины: ${next}`);
                    break;
                case 'turn':
                    console.log(`Игрок вернул номер вершины, который уже занят: ${next}`);
            }

            this.setState({[`error_${index}`]: true});
        });
    }

    render() {
        const {time, players} = this.state;
        const stats = [{name: 'Время', value: printNumber(time, 2)}];

        const playersStats = players.map(({visited, distance, nextTime}, index) => {
            nextTime = Math.max(nextTime - this.state.time, 0);

            const value = [
                `Кол-во вершин: ${visited}`,
                `Пройденное расстояние: ${printNumber(distance, 2)}`,
                `Следующая вершина через: ${printNumber(nextTime, 2)}`
            ].map((v, i) => (<span key={i} style={{display: 'block'}}>{v}</span>));

            return {
                name: `Игрок №${index + 1}`,
                value,
                color: globalOptions.players.colors[index]
            };
        });

        return stats.concat(playersStats).map(({name, value, color = 'black'}, index) => {
            const style = {color};
            if (this.state[`error_${index - 1}`]) {
                style.textDecoration = 'line-through';
            }

            return (
                <div className="row" key={name}>
                    <label>
                        <b style={style}>{name}</b>: {value}
                    </label>
                </div>
            );
        });
    }
}
