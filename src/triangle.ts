function getValidNeighbours([cx, cy]: Vec2, grid: boolean[][]) {
    const yDir = ([cx, cy]: Vec2): Vec2 => (cx + cy) % 2 ? [0, 1] : [0, -1];

    const directions = [
        [-1, 0],
        [1, 0],
        yDir([cx, cy])
    ];

    return directions.map(([dx, dy]) => {
        const x = cx + dx;
        const y = cy + dy;

        const toCheck = [
            [x, y]
        ];

        if (dx) {
            const x1 = x + dx;
            const x2 = x1 + dx;
            const y1 = y + yDir([x, y])[1];

            toCheck.push(
                [x, y1],
                [x1, y],
                [x1, y1],
                [x2, y],
                [x2, y1]
            );
        } else if (dy) {
            const y1 = y + dy;
            const x1 = x + 1;
            const x2 = x - 1;

            toCheck.push(
                [x1, y],
                [x2, y],
                [x, y1],
                [x1, y1],
                [x2, y1]
            );
        }

        
        const isValid = toCheck.every(([x, y]) => {
            const col = grid[x];
            return col ? col[y] : null;
        });

        return isValid ? [x, y] as Vec2 : null;
    }).filter(a => !!a);
}

const SIN60 = Math.sin(Math.PI / 3);

function drawAt(
    ctx: CanvasRenderingContext2D,
    [x, y]: Vec2,
    size: number
) {
    const sx = size / 2;
    const sy = size * SIN60;

    const cx = (sx * x) + size / 4; // add size/4 to centre it better
    const cy = (sy * y) + size / 4; // add size/4 to centre it better

    ctx.beginPath();
    if ((x + y) % 2) {
        ctx.moveTo(cx, cy - (sy / 2));
        ctx.lineTo(cx + sx, cy + (sy / 2));
        ctx.lineTo(cx - sx, cy + (sy / 2));
    } else {
        ctx.moveTo(cx, cy + (sy / 2));
        ctx.lineTo(cx - sx, cy - (sy / 2));
        ctx.lineTo(cx + sx, cy - (sy / 2));
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

export default {
    getValidNeighbours,
    drawAt,
    scale: [2, 1 / SIN60]
}