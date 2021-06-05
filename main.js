function getRandomBranchValues() {
  return {
    baseLength: Math.random() * 0.4 + 0.6,
    scaleFactor: 0.7 + Math.random() * 0.2,
    angle: 2 * Math.PI * Math.random(),
    angleSpeed: 0.01 * Math.random(),
    evolution: 0,
  };
}

function makeBranch(branchValues = getRandomBranchValues()) {
  const getScaledLength = (depth) =>
    branchValues.baseLength *
    Math.pow(branchValues.scaleFactor, depth) *
    (Math.min(window.innerHeight, window.innerWidth) / 6);

  const getEndpoint = ([x, y], rotation, depth) => {
    const length = getScaledLength(depth);
    return [x + length * Math.cos(rotation), y + length * Math.sin(rotation)];
  };

  const draw = (canvasContext, startPoint, rotation, depth) => {
    const endPoint = getEndpoint(startPoint, rotation, depth);
    canvasContext.strokeStyle =
      "hsl(" + (30 * depth + branchValues.evolution) + ", 100%, 50%)";
    canvasContext.lineWidth = 4 - 4 * (depth / treeDepth);
    canvasContext.beginPath();
    canvasContext.moveTo(...startPoint);
    canvasContext.lineTo(...endPoint);
    canvasContext.stroke();
  };

  const evolve = () =>
    makeBranch({
      ...branchValues,
      angle: branchValues.angle + branchValues.angleSpeed,
      evolution: branchValues.evolution + 1,
    });

  return {
    ...branchValues,
    draw,
    evolve,
    getEndpoint,
    getScaledLength,
  };
}

function makePaintingTask(taskValues) {
  const { canvasContext, branchGroup, rotation, startPoint, depth } =
    taskValues;
  const getChildren = () =>
    branchGroup
      .filter(() => depth <= treeDepth)
      .filter((branch) => branch.getScaledLength(depth) >= 1)
      .map((branch) =>
        makePaintingTask({
          ...taskValues,
          rotation: rotation + branch.angle,
          startPoint: branch.getEndpoint(startPoint, rotation, depth),
          depth: depth + 1,
        })
      );
  const draw = () =>
    branchGroup.forEach((branch) =>
      branch.draw(canvasContext, startPoint, rotation, depth)
    );
  return {
    ...taskValues,
    draw,
    getChildren,
  };
}

function breadthFirstPaint(branchGroup, canvasContext, rotation) {
  let paintingQueue = [
    makePaintingTask({
      canvasContext,
      branchGroup,
      rotation,
      startPoint: [window.innerWidth / 2, window.innerHeight / 2],
      depth: 0,
    }),
  ];

  while (paintingQueue.length > 0) {
    const [currentTask, ...otherTasks] = paintingQueue;
    currentTask.draw();
    paintingQueue = [...otherTasks, ...currentTask.getChildren()];
  }
}

function fadeScreen(canvas) {
  canvas.getContext("2d").fillStyle = "rgba(0,0,0,0.8)";
  canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
}

function tick(branchGroup, canvas, globalRotation = 0) {
  fadeScreen(canvas);
  breadthFirstPaint(branchGroup, canvas.getContext("2d"), globalRotation);
  window.requestAnimationFrame(() =>
    tick(
      branchGroup.map((branch) => branch.evolve()),
      canvas,
      globalRotation - 0.005
    )
  );
}

function start() {
  const canvas = document.getElementById("canvas");
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  const branchGroup = [makeBranch(), makeBranch()];
  window.requestAnimationFrame(() => tick(branchGroup, canvas));
}

const treeDepth = 10;

document.addEventListener("DOMContentLoaded", start, false);
