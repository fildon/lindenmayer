function BranchGroup(canvasContext) {
    this.branches = [new Branch(canvasContext), new Branch(canvasContext)];
    this.draw = (startPoint, rotation, depth) => {
        this.branches.forEach(branch => {
            branch.draw(startPoint, rotation, depth);
        })
    };
    this.evolve = () => {
        this.branches.forEach(branch => {
            branch.evolve();
        })
    };
}

function Branch(canvasContext) {
    this.canvasContext = canvasContext;
    this.baseLength = Math.random() * 0.4 + 0.6;
    this.scaleFactor = 0.7 + (Math.random() * 0.2);
    this.angle = 2 * Math.PI * Math.random();
    this.evolution = 0;
    this.getEndpoint = (startPoint, rotation, depth) => {
        const length = this.baseLength * (Math.pow(this.scaleFactor, depth)) * (Math.min(window.innerHeight, window.innerWidth) / 7);
        return startPoint.translate(length, rotation + this.angle);
    };
    this.draw = (startPoint, rotation, depth) => {
        const endPoint = this.getEndpoint(startPoint, rotation, depth)
        canvasContext.strokeStyle = "hsl(" + (30 * depth + this.evolution) + ", 100%, 50%)";
        canvasContext.lineWidth = 2 - 2 * (depth / 6);
        canvasContext.beginPath();
        canvasContext.moveTo(startPoint.x, startPoint.y);
        canvasContext.lineTo(endPoint.x, endPoint.y);
        canvasContext.stroke();
    };
    this.evolve = () => {
        this.angle += 0.005;
        this.evolution++;
    };
}

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.translate = (length, rotation) => {
        return new Point(
            this.x + length * Math.cos(rotation),
            this.y + length * Math.sin(rotation)
        );
    }
}

function PaintingTask(branchGroup, startPoint, rotation, depth) {
    this.branchGroup = branchGroup;
    this.startPoint = startPoint;
    this.rotation = rotation;
    this.depth = depth;
    this.draw = () => {
        this.branchGroup.draw(this.startPoint, this.rotation, this.depth);
    };
    this.getChildren = () => {
        if (this.depth > 10) {
            return [];
        }
        const children = [];
        this.branchGroup.branches.forEach(branch => {
            children.push(new PaintingTask(
                this.branchGroup,
                branch.getEndpoint(this.startPoint, this.rotation, this.depth),
                this.rotation + branch.angle,
                this.depth + 1)
            );
        });
        return children;
    };
}

function clearScreen(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function breadthFirstPaint(branchGroup, canvas) {
    clearScreen(canvas);
    let paintingQueue = [
        new PaintingTask(
            branchGroup,
            new Point(canvas.width / 2, canvas.height / 2),
            0,
            0
        )
    ];

    while (paintingQueue.length > 0) {
        // shift lets us use an array like a queue
        const currentTask = paintingQueue.shift();
        currentTask.draw();
        paintingQueue = paintingQueue.concat(currentTask.getChildren());
    }
}

function start() {
    const canvas = document.getElementById("canvas");
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    const canvasContext = canvas.getContext("2d");
    const branchGroup = new BranchGroup(canvasContext);
    tick(branchGroup, canvas);
}

function tick(branchGroup, canvas) {
    breadthFirstPaint(branchGroup, canvas);
    branchGroup.evolve();
    setTimeout(() => {tick(branchGroup, canvas)}, 20);
}

document.addEventListener("DOMContentLoaded", start, false)
