type Type = 'top' | 'left' | 'right'

/***********************************************

each y of the grid has all three types like so:

    0   3   6
   1 2 4 5 7 8

************************************************/

function getType([cx]: Vec2): Type {
    while (cx < 0) {
        cx += 3;
    }
    switch(cx % 3) {
        case 0:
            return 'top';
        case 1:
            return 'left';
        case 2:
            return 'right';
        default:
            throw new Error(`Bad x coord ${cx}`);
    }
}

function getDirections([cx, cy]: Vec2): Vec2[] {
    const type = getType([cx, cy]);
    switch(type) {
        case 'top':
            return [
                [1, 0],
                [2, 0],
                ...(
                    cy % 2
                    ? [
                        [2, -1],
                        [4, -1]
                    ]
                    : [
                        [1, -1],
                        [-1, -1]
                    ]
                ) as Vec2[]
            ];
        case 'left':
            return [
                [-1, 0],
                [1, 0],
                [-2, 0],
                cy % 2
                ? [-1, 1]
                : [-4, 1]
            ];
        case 'right':
            return [
                [-1, 0],
                [2, 0],
                [-2, 0],
                cy % 2
                ? [1, 1]
                : [-2, 1]
            ];
        default:
            return [];
    }
}

function getCornerDirections([cx, cy]: Vec2, [dx, dy]: Vec2) {
    const sourceType = getType([cx, cy]);

    const cornerDirs: Vec2[] = [];

    const x = cx + dx;
    const y = cy + dy;
    const type = getType([x, y]);
    
    switch(type) {
        case 'top':
            if (
                (sourceType === 'left' && dy)
                || (sourceType === 'right' && !dy)
            ) {
                cornerDirs.push(
                    ...[
                        [-1, 0],
                        [-3, 0],
                        y % 2
                        ? [1, -1]
                        : [-2, -1]
                    ] as Vec2[]
                );
            } else {
                cornerDirs.push(
                    ...[
                        [3, 0],
                        [4, 0],
                        y % 2
                        ? [5, -1]
                        : [2, -1]
                    ] as Vec2[]
                );
            }
            break;
        case 'left':
            if (sourceType === 'top' && dy || dx === -1) {
                if (y % 2) {
                    cornerDirs.push(
                        [-4, 0],
                        [0, -1],
                        [1, -1]
                    );
                } else {
                    cornerDirs.push(
                        [-4, 0],
                        [-2, -1],
                        [-3, -1]
                    );
                }
            } else {
                if (y % 2) {
                    cornerDirs.push(
                        [2, 1],
                        [3, 1],
                        [1, 1]
                    );
                } else {
                    cornerDirs.push(
                        [-1, 1],
                        [0, 1],
                        [-2, 1]
                    );
                }
            }
            break;
        case 'right':
            if (
                (sourceType === 'top' && !dy)
                || (sourceType === 'left' && dx < 0)
            ) {
                if (y % 2) {
                    cornerDirs.push(
                        [-2, 1],
                        [0, 1],
                        [2, 1]
                    );
                } else {
                    cornerDirs.push(
                        [-1, 1],
                        [-3, 1],
                        [-5, 1]
                    );
                }
            } else {
                if (y % 2) {
                    cornerDirs.push(
                        [1, 0],
                        [3, -1],
                        [2, -1]
                    );
                } else {
                    cornerDirs.push(
                        [1, 0],
                        [0, -1],
                        [-1, -1]
                    );
                }
            }
            break;
    }

    return cornerDirs
}


function getValidNeighbours([cx, cy]: Vec2, grid: boolean[][], simple: boolean) {
    const directions = getDirections([cx, cy]);
    
    return directions.map(([dx, dy]) => {
        const x = cx + dx;
        const y = cy + dy;

        const toCheck = [
            [x, y]
        ];
        
        if (!simple) {
            const neighbours = getDirections([x, y]);
            const cornerDirs = getCornerDirections([cx, cy], [dx, dy]);

            toCheck.push(
                ...[
                    ...neighbours,
                    ...cornerDirs
                ]
                .map(([dx, dy]) => [x + dx, y + dy] as Vec2)
                .filter(([x, y]) => x !== cx || y !== cy)
            );
        }

        
        const isValid = toCheck.every(([vx, vy]) => {
            const col = grid[vx];
            if (!col) return false;
            if (col[vy]) return true;

            const dirs = getDirections([vx, vy]);

            //return false
            return dirs.some(
                ([dx, dy]) => dx + vx === cx && dy + vy === cy
                    && (vx !== x || vy !== y)
            );
        });

        return isValid ? [x, y] as Vec2 : null;
    }).filter(a => !!a);
}


const SIN60 = Math.sin(Math.PI / 3);


function getCentre([x, y]: Vec2, size: number): Vec2 {
    const type = getType([x, y]);

    // work out the hexagonal grid center
    const hexX = ((Math.floor(x / 3) + (y % 2 ? .5: 0)) * size * 2 * SIN60) + (SIN60 * size);
    const hexY = (y * size * 1.5) + (size * .75);

    switch(type) {
        case 'top':
            return [hexX, hexY - (size / 2)];
        case 'left':
            return [hexX - (SIN60 * size / 2), hexY + (size / 4)];
        case 'right':
            return [hexX + (SIN60 * size / 2), hexY + (size / 4)];
    }
}


function drawAt(
    ctx: CanvasRenderingContext2D,
    [x, y]: Vec2,
    size: number
) {
    const type = getType([x, y]);

    const centre = getCentre([x, y], size);

    ctx.beginPath();
    
    if (type === 'top') {
        draw_top(ctx, centre, size);
    } else if (type === 'left') {
        draw_left(ctx, centre, size);
    } else if (type === 'right') {
        draw_right(ctx, centre, size);
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}



function draw_top(ctx: CanvasRenderingContext2D, [cx, cy]: Vec2, size: number) {
    ctx.moveTo(cx - (SIN60 * size), cy);
    ctx.lineTo(cx, cy - (size / 2));
    ctx.lineTo(cx + (SIN60 * size), cy);
    ctx.lineTo(cx, cy + (size / 2));
}

function draw_left(ctx: CanvasRenderingContext2D, [cx, cy]: Vec2, size: number) {
    ctx.moveTo(cx + (SIN60 * size / 2), cy - (size / 4));
    ctx.lineTo(cx + (SIN60 * size / 2), cy + (3 * size / 4));
    ctx.lineTo(cx - (SIN60 * size / 2), cy + (size / 4));
    ctx.lineTo(cx - (SIN60 * size / 2), cy - (3 * size / 4));
}

function draw_right(ctx: CanvasRenderingContext2D, [cx, cy]: Vec2, size: number) {
    ctx.moveTo(cx + (SIN60 * size / 2), cy - (3 * size / 4));
    ctx.lineTo(cx + (SIN60 * size / 2), cy + (size / 4));
    ctx.lineTo(cx - (SIN60 * size / 2), cy + (3 * size / 4));
    ctx.lineTo(cx - (SIN60 * size / 2), cy - (size / 4));
}


export default {
    getValidNeighbours,
    getCentre,
    drawAt,
    scale: [3 / (2 * SIN60), 1 / 1.5]
}