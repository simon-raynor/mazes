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



const SIZE = 8;



const mazes = types.map(type => {
    const H = Math.floor((canvas.height / 2) * type.scale[1] / SIZE)
        , W = Math.floor((canvas.width / 2) * type.scale[0] / SIZE);

    const grid = Array(W).fill(true).map(() => Array(H).fill(true));
    const backtrack: Vec2[] = [];

    const drawOrder: Vec2[] = [];

    let cursor: Vec2 = [Math.floor(W / 2), Math.floor(H / 2)];

    function step(fn: (c: Vec2, g: boolean[][]) => Vec2[]) {
        const [cx, cy] = cursor;
        
        if (grid[cx][cy]) {
            drawOrder.push(cursor);
        }
        grid[cx][cy] = false;

        const neighbours = fn(cursor, grid);

        if (neighbours.length) {
            const next = pickRandom(neighbours);

            backtrack.push(cursor);
            cursor = next;
        } else if (backtrack.length) {
            const back = pickRandom(backtrack);

            backtrack.splice(backtrack.indexOf(back), 1);
            cursor = back;
        } else return false;
        return true;
    }

    while(step(type.getValidNeighbours));

    return { type, grid, drawOrder, dimensions: [W, H] };
});

function pickRandom<T>(array: T[]): T {
    return array[
        Math.floor(Math.random() * array.length) % array.length
    ];
}





const perframe = 2;

const frame = () => {
    let running = false;
    mazes.forEach(({ type, grid, drawOrder, dimensions: [W, H] }, mazeNo) => {
        const canvasOffsetX = (canvas.width / 2) * (mazeNo % 2);
        const canvasOffsetY = (canvas.height / 2) * Math.floor(mazeNo / 2);

        ctx.save();
        ctx.translate(
            canvasOffsetX + ((canvas.width / 2) - (W * SIZE / type.scale[0])) / 2,
            canvasOffsetY + ((canvas.height / 2) - (H * SIZE / type.scale[1])) / 2
        );

        ctx.fillStyle = ctx.strokeStyle = `hsl(${mazeNo * 90} 75 50)`;

        for (let i = 0; i < perframe; i++) {
            const coord = drawOrder.shift();
            if (coord) {
                type.drawAt(ctx, coord!, SIZE);
            }
        }

        ctx.restore();

        if (drawOrder.length) {
            running = true;
        }
    });

    running && requestAnimationFrame(frame);
}

frame();
