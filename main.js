function generateBranchSystem(branchingFactor) {
    branches = [];
    for (i = 0; i < branchingFactor; ++i) {
        branches.push(
            {
                baseLength: 40 * (Math.random() * 0.4 + 0.6),
                scaleChange: Math.random() * 0.4 / ((i + 1) * (i + 1)) + 0.55,
                angleChange: 2 * Math.PI * Math.random()
            });
    }
    return branches;
}

function draw_line(x, y, length, angle, depth) {
    let ctx = can.getContext("2d");
    ctx.strokeStyle = "hsl(" + (40 * depth) + ", 100%, 50%)";
    ctx.lineWidth = depth / 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length * Math.cos(angle), y + length * Math.sin(angle));
    ctx.stroke();
}

function draw_lsystem(lsystem, x, y, depth = 12, scale = 4, angle = 0) {
    if (depth <= 0)
        return;
    if (x < 0 || y < 0 || x > width || y > height)
        return;
    while (branchesToDraw[branchesToDraw.length - 1] < lsystem.length) {
        branch = lsystem[branchesToDraw[branchesToDraw.length - 1]];
        scaledLength = branch.baseLength * scale;
        newAngle = angle + branch.angleChange;
        branchesToDraw.push(0);
        if (scaledLength > 2) {
            draw_line(x, y, scaledLength, newAngle, depth);
            draw_lsystem(
                lsystem,
                x + Math.cos(newAngle) * scaledLength,
                y + Math.sin(newAngle) * scaledLength,
                depth - 1,
                scale * branch.scaleChange,
                newAngle
            );
        }
        branchesToDraw.pop();
        ++branchesToDraw[branchesToDraw.length-1]
    }
}

var branchesToDraw = [0];

document.addEventListener("DOMContentLoaded", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    can.width = width;
    can.height = height;
    draw_lsystem(generateBranchSystem(2), width / 2, height / 2);
}, false)
