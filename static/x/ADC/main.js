var game = {
    board: document.getElementById('board'),
    ui: document.getElementById('ui'),
    attack: document.getElementById('attack'),
    defend: document.getElementById('defend'),
    conquer: document.getElementById('conquer'),
    reset: document.getElementById('reset'),

    currentPlayer: 'player1',
    opponentPlayer: 'player2',

    player1Color: [100, 200, 240],
    player2Color: [240, 100, 150],

    cols: 5,
    rows: 6,

    start: function() {
        game.cell.count = game.cols * game.rows;
        game.ui.classList.add(game.currentPlayer);

        // create cells
        for (var y = 0; y < game.rows; y++) {
            var row = document.createElement('tr');
            game.board.appendChild(row);
            game.cell.array.push([]);
            for (var x = 0; x < game.cols; x++) {
                var cell = game.cell.create(x, y, row);
                game.cell.array[y].push(cell);
                cell.draw();
            }
        }
        // events
        game.input(game.attack, game.clickUI);
        game.input(game.defend, game.clickUI);
        game.input(game.conquer, game.clickUI);

        game.input(game.reset, game.clickResetUI);
    },

    clickUI: function(e) {
        game.ui.querySelector('.current').classList.remove('current');
        e.target.classList.add('current');
    },

    clickBoard: function(e) {
        var target = e.target;
        var current = game.ui.querySelector('.current').id;

        var last = game.board.querySelector('.last');
        if (last) {
            last.classList.remove('last')
        };
        target.classList.add('last');

        if (!target.textContent) {
            if (target.classList.contains(game.currentPlayer)) {
                if (current == 'attack') {
                    game.clickAttackBoard(target);
                }
                if (current == 'defend') {
                    game.clickDefendBoard(target);
                }
            }
            if (current == 'conquer') {
                game.clickConquerBoard(target);
            }
        }
    },

    clickAttackBoard: function(target) {
        var current = game.ui.querySelector('.current').id;
        target.textContent = game[current].textContent;

        var x = Number(target.dataset.x);
        var y = Number(target.dataset.y);

        console.log({
            x,
            y
        })

        game.attackLoop(0, y, x + 1, game.cols, 1); // left
        game.attackLoop(0, y, x - 1, -1, -1); // right
        game.attackLoop(x, 0, y + 1, game.rows, 1); // down
        game.attackLoop(x, 0, y - 1, -1, -1); // up

        game.changePlayer();
    },

    attackLoop: function(x, y, start, end, step) {
        for (var i = start; i !== end; i += step) {
            var t = game.cell.array[i][x];
            if (y) {
                t = game.cell.array[y][i];
            }

            if (t.el.classList.contains(game.opponentPlayer) &&
                t.el.textContent == game.defend.textContent) {
                break;
            } else {
                t.el.classList.remove(game.opponentPlayer);
                t.el.classList.add(game.currentPlayer);
            }
        }
    },

    clickDefendBoard: function(target) {
        var current = game.ui.querySelector('.current').id;
        target.textContent = game[current].textContent;
        game.changePlayer();
    },

    clickConquerBoard: function(target) {
        var current = game.ui.querySelector('.current').id;
        target.textContent = game[current].textContent;
        target.classList.remove(game.opponentPlayer);
        target.classList.add(game.currentPlayer);

        var cell = game.cell.get(target);

        var neighbors = cell.getNeighbors();

        for (var n = 0; n < neighbors.length; n++) {
            var neighbor = neighbors[n].el;
            if (neighbor.textContent == '') {
                neighbor.classList.remove(game.opponentPlayer);
                neighbor.classList.add(game.currentPlayer);
            }
        }
        game.changePlayer();
    },

    changePlayer: function() {
        game.ui.classList.remove(game.currentPlayer);
        game.ui.classList.add(game.opponentPlayer);

        if (game.currentPlayer == 'player2') {
            game.currentPlayer = 'player1';
            game.opponentPlayer = 'player2';
        } else {
            game.currentPlayer = 'player2';
            game.opponentPlayer = 'player1';
        }

        game.draw();
    },

    draw: function() {
        var count = 0;
        for (var y = 0; y < game.rows; y++) {
            for (var x = 0; x < game.cols; x++) {
                var cell = game.cell.array[y][x];
                cell.draw();
                if (cell.el.textContent != '') {
                    count++;
                }
            }
        }
        if (count == game.cell.count) {
            game.end();
        }
    },

    end: function() {
        var player1Score = 0;
        var player2Score = 0;

        for (var y = 0; y < game.rows; y++) {
            for (var x = 0; x < game.cols; x++) {
                var cell = game.cell.array[y][x];
                if (cell.el.classList.contains('player1')) {
                    player1Score++;
                }
                if (cell.el.classList.contains('player2')) {
                    player2Score++;
                }
            }
        }

        setTimeout(function() {
            if (player1Score > player2Score) {
                alert('Player 1 wins!');
            }
            if (player1Score < player2Score) {
                alert('Player 2 wins!');
            }
            if (player1Score == player2Score) {
                alert('Draw game');
            }

            game.reset();
        }, 200);
    },

    cell: {
        array: [],

        create: function(x, y, row) {
            var td = document.createElement('td');
            row.appendChild(td);

            var el = document.createElement('button');
            td.appendChild(el);

            el.dataset.x = x;
            el.dataset.y = y;

            game.input(el, game.clickBoard);

            var cell = {
                el: el,
                x: x,
                y: y,
                tr: row,
                td: td,
                getNeighbors: game.cell.getNeighbors,
                draw: game.cell.draw
            };

            if (y < (game.rows / 2)) {
                el.classList.add('player2');
            } else {
                el.classList.add('player1');
            }

            return cell;
        },

        draw: function() {
            var cell = this;
            var color = [0, 0, 0];

            if (cell.el.classList.contains('player1')) {
                color = game.player1Color;
            } else {
                color = game.player2Color;
            }

            cell.el.style.background = 'rgba(' + [
                color[0],
                color[1] - Math.floor(25 * cell.y),
                color[2] - Math.floor(15 * cell.x)
            ].join(',') + ')';
        },

        getNeighbors: function() {
            var cell = this;
            var neighbors = [];

            var x = cell.x;
            var y = cell.y;

            var n = game.cell.array[y - 1];
            var s = game.cell.array[y + 1];
            var e = game.cell.array[y][x + 1];
            var w = game.cell.array[y][x - 1];

            if (n) {
                neighbors.push(n[x]);
            }
            if (s) {
                neighbors.push(s[x]);
            }
            if (e) {
                neighbors.push(e);
            }
            if (w) {
                neighbors.push(w);
            }

            var ne, nw;
            if (n) {
                ne = n[x + 1];
                nw = n[x - 1];
            }

            var se, sw;
            if (s) {
                se = s[x + 1];
                sw = s[x - 1];
            }

            if (ne) {
                neighbors.push(ne);
            }
            if (nw) {
                neighbors.push(nw);
            }
            if (se) {
                neighbors.push(se);
            }
            if (sw) {
                neighbors.push(sw);
            }

            return neighbors;
        },

        get: function(target) {
            var x = Number(target.dataset.x);
            var y = Number(target.dataset.y);

            return game.cell.array[y][x];
        }

    },

    input: function(el, cb) {
        el.addEventListener('click', cb);
        el.addEventListener('touchend', cb);
    },

    clickResetUI: function() {
        while (game.board.firstChild) {
            game.board.removeChild(game.board.firstChild);
        }
        game.cell.array = [];
        game.start();
    }
};

game.start();



var colors = new Array(
    [62, 35, 255], [60, 255, 60], [255, 35, 98], [45, 175, 230], [255, 0, 255], [255, 128, 0]);

var step = 0;
//color table indices for: 
// current color left
// next color left
// current color right
// next color right
var colorIndices = [0, 1, 2, 3];

//transition speed
var gradientSpeed = 0.002;

function updateGradient() {

    if ($ === undefined) return;

    var c0_0 = colors[colorIndices[0]];
    var c0_1 = colors[colorIndices[1]];
    var c1_0 = colors[colorIndices[2]];
    var c1_1 = colors[colorIndices[3]];

    var istep = 1 - step;
    var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
    var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
    var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
    var color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";

    var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
    var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
    var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
    var color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";

    $('#gradient').css({
        background: "-webkit-gradient(linear, left top, right top, from(" + color1 + "), to(" + color2 + "))"
    }).css({
        background: "-moz-linear-gradient(left, " + color1 + " 0%, " + color2 + " 100%)"
    });

    step += gradientSpeed;
    if (step >= 1) {
        step %= 1;
        colorIndices[0] = colorIndices[1];
        colorIndices[2] = colorIndices[3];

        //pick two new target color indices
        //do not pick the same as the current one
        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;

    }
}

setInterval(updateGradient, 10);