function getValidNeighbours([cx, cy]: Vec2, grid: boolean[][]) {
    const directions = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1]
    ];

    return directions.map(([dx, dy]) => {
        const x = cx + dx;
        const y = cy + dy;

        const toCheck = [
            [x, y]
        ];

        if (dx) {
            const x1 = x + dx;
            const y1 = y + 1;
            const y2 = y - 1;

            toCheck.push(
                [x, y1],
                [x, y2],
                [x1, y],
                [x1, y1],
                [x1, y2]
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

function drawAt(
    ctx: CanvasRenderingContext2D,
    [x, y]: Vec2,
    size: number
) {
    ctx.strokeRect(x * size, y * size, size, size);
    ctx.fillRect(x * size, y * size, size, size);
}

export default {
    getValidNeighbours,
    drawAt,
    scale: [1, 1]
}