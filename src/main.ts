import './style.css'

import triangle from './triangle'
import square from './square';
import hexagon from './hexagon';
import rhombille from './rhombille';


type Vec2 = [number, number]



const canvas = document.getElementById('app');

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Invalid #app element');
}

canvas.height = canvas.offsetHeight;
canvas.width = canvas.offsetWidth;

const ctx = canvas.getContext('2d');

if (!ctx) {
    throw new Error('Couldn\'t get context');
}


const types = [
    triangle,
    square,
    hexagon,
    rhombille
];



const SIZE = 4;
const REAL_WALLS = true;



const mazes = types.map(type => {
    const H = Math.floor((canvas.height / 2) * type.scale[1] / SIZE)
        , W = Math.floor((canvas.width / 2) * type.scale[0] / SIZE);
    /* const H = Math.floor((canvas.height) * type.scale[1] / SIZE)
        , W = Math.floor((canvas.width) * type.scale[0] / SIZE); */

    const grid: boolean[][] = Array(W).fill(true).map(() => Array(H).fill(true));
    const backtrack: [Vec2, number][] = [];

    const drawOrder: Vec2[] = [];
    const portals: [Vec2, Vec2][] = [];

    let distance: number = 1;
    const distances: number[][] = Array(W).fill(0).map(() => Array(H).fill(0));

    //let cursor: Vec2 = [Math.floor(W / 2), Math.floor(H / 2)];
    let cursor: Vec2 = [2, 0];

    function step(fn: (c: Vec2, g: boolean[][], s: boolean) => Vec2[]) {
        const [cx, cy] = cursor;
        
        if (grid[cx][cy]) {
            drawOrder.push(cursor);
            distances[cx][cy] = distance;
            distance++;
        }
        grid[cx][cy] = false;

        const neighbours = fn(cursor, grid, !REAL_WALLS);

        if (neighbours.length) {
            const next = pickRandom(neighbours);

            backtrack.push([cursor, distance]);
            portals.push([cursor, next]);
            cursor = next;
        } else if (backtrack.length) {
            const back = pickRandom(backtrack);

            backtrack.splice(backtrack.indexOf(back), 1);
            [cursor, distance] = back;
        } else return false;
        return true;// drawOrder.length < (W * H * .25);
    }

    while(step(type.getValidNeighbours));

    return {
        type,
        grid,
        drawOrder,
        portals,
        dimensions: [W, H],
        distance: {
            grid: distances,
            max: distances.reduce((max, dists) => {
                return Math.max(max, dists.reduce((max2, dist) => Math.max(max2, dist), 0));
            }, 0)
        }
    };
});

function pickRandom<T>(array: T[]): T {
    return array[
        Math.floor(Math.random() * array.length) % array.length
    ];
}





const perframe = 400;

const frame = () => {
    let running = false;
    mazes.forEach(({ type, distance: { grid, max }, drawOrder, portals, dimensions: [W, H] }, mazeNo) => {
        const canvasOffsetX = (canvas.width / 2) * (mazeNo % 2);
        const canvasOffsetY = (canvas.height / 2) * Math.floor(mazeNo / 2);

        ctx.save();
        ctx.translate(
            canvasOffsetX + ((canvas.width / 2) - (W * SIZE / type.scale[0])) / 2,
            canvasOffsetY + ((canvas.height / 2) - (H * SIZE / type.scale[1])) / 2
        );


        for (let i = 0; i < perframe; i++) {
            const coord = drawOrder.shift();
            if (coord) {
                const [x, y] = coord;

                //const color = `hsl(${270 + (180 * grid[x][y] / max)} 75 50)`
                const color = `hsl(${mazeNo * 90} ${33 - (25 * grid[x][y] / max)} ${75 - (33 * grid[x][y] / max)})`

                ctx.fillStyle = color;//'transparent';
                ctx.strokeStyle = color;
                type.drawAt(ctx, coord, SIZE);
            }

            /* ctx.lineCap = 'round';
            ctx.lineWidth = 3*SIZE/8;
            ctx.fillStyle = ctx.strokeStyle = `rgba(255,255,255,0.5)`;
            const port = portals.shift();
            if (port) {
                const [x1, y1] = type.getCentre(port[0], SIZE);
                const [x2, y2] = type.getCentre(port[1], SIZE);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            } */
        }

        ctx.restore();

        if (drawOrder.length) {
            running = true;
        }
    });

    running && requestAnimationFrame(frame);
}

frame();
