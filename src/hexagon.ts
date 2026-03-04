function getValidNeighbours([cx, cy]: Vec2, grid: boolean[][]) {
    const directions = (y: number) => {
        const offset = y % 2 ? 1 : -1;
        return [
            [-1, 0],
            [0, -1],
            [offset, -1],
            [1, 0],
            [0, 1],
            [offset, 1]
        ]
    };

    return directions(cy).map(([dx, dy]) => {
        const x = cx + dx;
        const y = cy + dy;

        const toCheck = [
            [x, y],
            ...directions(y)
                .map(([dx, dy]) => [x + dx, y + dy])
                .filter(([x, y]) => x !== cx || y !== cy)
        ];
        
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
    const cx = ((x + (y % 2 ? .5: 0)) * size * 2 * SIN60) + (SIN60 * size);
    const cy = (y * size * 1.5) + (size * .75);

    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + (size * SIN60), cy - (size / 2));
    ctx.lineTo(cx + (size * SIN60), cy + (size / 2));
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - (size * SIN60), cy + (size / 2));
    ctx.lineTo(cx - (size * SIN60), cy - (size / 2));
    
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

export default {
    getValidNeighbours,
    drawAt,
    scale: [1 / (2 * SIN60), 1 / 1.5]
}