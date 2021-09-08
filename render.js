const { createCanvas } = require('canvas');
const { paper } = require('paper');
const { BigNumber } = require('ethers');

const colors = [
    '5e72e4',
    '5603ad',
    '8965e0',
    'e14eca',
    'f3a4b5',
    'f5365c',
    'fb6340',
    'ffd600',
    '2dce89',
    '11cdef',
    '2bffc6',
];

function render(itemId) {

    const bnItemId = BigNumber.from(itemId);
    itemId = bnItemId.toHexString();

    const canvasWidth = 800;
    const canvasHeight = 800;
    const canvas = createCanvas(canvasWidth, canvasHeight)

    const scope = new paper.PaperScope();
    scope.setup(canvas);
    scope.activate();

    let itemType = 0;
    let itemOvershoot = 0;
    if(bnItemId.gte(256) && bnItemId.lt(4096)) {
        itemType = 1;
        itemOvershoot = bnItemId.sub(255).toNumber();
    }
    else if(bnItemId.gte(4096) && bnItemId.lt(8192)) {
        itemType = 2;
        itemOvershoot = bnItemId.sub(255).toNumber();
    }
    if(bnItemId.gte(8192)) {
        itemType = 3;
    }

    const rndColor = () =>
        '#' + colors[Math.round(Math.random() * colors.length)] + 'ff';
    const colorAt = (ndx) => '#' + colors[ndx % colors.length] + 'ff';

    let centerSides = 3 + Math.round(Math.random() * 9);
    let centerDiameter = 400 + Math.round(Math.random() * 500);
    const centerPoint = new scope.Point(canvasWidth / 2, canvasHeight / 2);

    const drawFlowerIter = (iter, max, rot) => {
        let petalSides = 3 + Math.round(Math.random() * 9);
        let petalDiameter = 400 + Math.round(Math.random() * 500);
        let centerColor = rndColor();
        let petalColor = rndColor();
        let backShapeColor = rndColor();

        if (itemType === 1) {
            centerSides = 3;
            centerDiameter = 300;
            petalSides = 3;
            petalDiameter = 300 + itemOvershoot * 30;
            petalColor = colorAt(0 + itemOvershoot);
            centerColor = colorAt(1 + itemOvershoot);
            backShapeColor = colorAt(2 + itemOvershoot);
        }
        if (itemType === 2) {
            centerSides = 6;
            centerDiameter = 300;
            petalSides = 6;
            petalDiameter = 300 + itemOvershoot * 60;
            petalColor = colorAt(1 + itemOvershoot);
            centerColor = colorAt(2 + itemOvershoot);
            backShapeColor = colorAt(3 + itemOvershoot);
        }
        if (itemType === 3) {
            petalColor = colorAt(
                parseInt(
                '0x' +
                    itemId.substring(
                    itemId.length - 1 - iter,
                    itemId.length - iter
                    )
                )
            );
            centerColor = colorAt(
                parseInt(
                '0x' +
                    itemId.substring(
                    itemId.length - 2 - iter,
                    itemId.length - 1 - iter
                    )
                )
            );
            backShapeColor = colorAt(
                parseInt(
                '0x' +
                    itemId.substring(
                    itemId.length - 3 - iter,
                    itemId.length - 2 - iter
                    )
                )
            );
            centerSides = parseInt(
                '0x' +
                itemId.substring(
                    itemId.length - 4 - iter,
                    itemId.length - 3 - iter
                )
            );
            petalSides = parseInt(
                '0x' +
                itemId.substring(
                    itemId.length - 5 - iter,
                    itemId.length - 4 - iter
                )
            );
            centerDiameter = parseInt(
                '0x' +
                itemId.substring(
                    itemId.length - 7 - iter,
                    itemId.length - 5 - iter
                )
            );
            petalDiameter = parseInt(
                '0x' +
                itemId.substring(
                    itemId.length - 9 - iter,
                    itemId.length - 7 - iter
                )
            );
        }

        if (iter === 1) {
        let backShape;
        if (itemType === 1 || itemType === 2) {
            backShape = new scope.Path.Circle(
            centerPoint,
            petalDiameter + centerDiameter
            );
        } else {
            backShape = new scope.Path.RegularPolygon(
                centerPoint,
                centerSides,
                petalDiameter + centerDiameter
            );
        }
        backShape.fillColor = new scope.Color(backShapeColor);
        backShape.blendMode = 'xor';
        }

        const scale = iter;
        const centerPath = new scope.Path.RegularPolygon(
            centerPoint,
            petalSides,
            centerDiameter / scale
        );
        centerPath.rotate(rot);
        centerPath.fillColor = new scope.Color(petalColor);
        centerPath.strokeColor = new scope.Color(petalColor);
        centerPath.strokeWidth = 6 / scale;
        centerPath.blendMode = 'xor';
        centerPath.segments.forEach((segment) => {
            const polygon = new scope.Path.RegularPolygon(
                new scope.Point(segment.point.x, segment.point.y),
                petalSides,
                petalDiameter / scale
            );
            polygon.rotate(rot);
            polygon.fillColor = new scope.Color(centerColor);
            polygon.strokeWidth = 60 / scale;
            polygon.blendMode = 'xor';
        });
        if (iter < max) {
            drawFlowerIter(iter + 1, max, rot / 2);
        }
    };

    // backShape = new scope.Path.RegularPolygon(
    //     centerPoint,
    //     4,
    //     400
    // );
    // backShape.fillColor = new scope.Color('#000000');


    drawFlowerIter(1, 5, 0);
    scope.project.activeLayer.fitBounds(scope.view.bounds);
    scope.view.draw();

    return { scope, canvas };
}
  
module.exports = render;
  