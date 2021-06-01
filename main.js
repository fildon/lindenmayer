function makeRandomBranch() {
  return {
    baseLength: Math.random() * 0.4 + 0.6,
    scaleFactor: 0.7 + Math.random() * 0.2,
    angle: 2 * Math.PI * Math.random(),
    angleSpeed: 0.01 * Math.random(),
    evolution: 0,
  };
}

function evolveBranch(branch) {
  const { angle, angleSpeed, evolution } = branch;
  return {
    ...branch,
    angle: angle + angleSpeed,
    evolution: evolution + 1,
  };
}

function getScaledLength(branch, depth) {
  return (
    branch.baseLength *
    Math.pow(branch.scaleFactor, depth) *
    (Math.min(window.innerHeight, window.innerWidth) / 6)
  );
}

function getEndpoint(branch, startPoint, rotation, depth) {
  return translatePoint(
    startPoint,
    getScaledLength(branch, depth),
    rotation + branch.angle
  );
}

function drawBranch(canvasContext, branch, startPoint, rotation, depth) {
  const endPoint = getEndpoint(branch, startPoint, rotation, depth);
  canvasContext.strokeStyle =
    "hsl(" + (30 * depth + branch.evolution) + ", 100%, 50%)";
  canvasContext.lineWidth = 4 - 4 * (depth / treeDepth);
  canvasContext.beginPath();
  canvasContext.moveTo(...startPoint);
  canvasContext.lineTo(...endPoint);
  canvasContext.stroke();
}

function translatePoint(point, length, rotation) {
  const [x, y] = point;
  return [x + length * Math.cos(rotation), y + length * Math.sin(rotation)];
}

function drawPaintingTask(paintingTask) {
  const { branchGroup, canvasContext, startPoint, rotation, depth } =
    paintingTask;
  branchGroup.forEach((branch) =>
    drawBranch(canvasContext, branch, startPoint, rotation, depth)
  );
}

function getPaintingTaskChildren(paintingTask) {
  const { depth, branchGroup, canvasContext, rotation, startPoint } =
    paintingTask;
  if (depth > treeDepth) {
    return [];
  }
  return branchGroup
    .filter((branch) => getScaledLength(branch, depth) >= 1)
    .map((branch) => ({
      canvasContext,
      branchGroup,
      rotation: rotation + branch.angle,
      startPoint: getEndpoint(branch, startPoint, rotation, depth),
      depth: depth + 1,
    }));
}

function fadeScreen(canvas) {
  canvas.getContext("2d").fillStyle = "rgba(0,0,0,0.8)";
  canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
}

function breadthFirstPaint(branchGroup, canvas, globalRotation) {
  fadeScreen(canvas);
  let paintingQueue = [
    {
      canvasContext: canvas.getContext("2d"),
      branchGroup,
      rotation: globalRotation,
      startPoint: [canvas.width / 2, canvas.height / 2],
      depth: 0,
    },
  ];

  while (paintingQueue.length > 0) {
    const [currentTask, ...otherTasks] = paintingQueue;
    drawPaintingTask(currentTask);
    paintingQueue = [...otherTasks, ...getPaintingTaskChildren(currentTask)];
  }
}

function tick(branchGroup, canvas, globalRotation = 0) {
  breadthFirstPaint(branchGroup, canvas, globalRotation);
  window.requestAnimationFrame(() =>
    tick(
      branchGroup.map((branch) => evolveBranch(branch)),
      canvas,
      globalRotation - 0.005
    )
  );
}

function start() {
  const canvas = document.getElementById("canvas");
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  const branchGroup = [makeRandomBranch(), makeRandomBranch()];
  window.requestAnimationFrame(() => tick(branchGroup, canvas));
}

const treeDepth = 10;

document.addEventListener("DOMContentLoaded", start, false);
