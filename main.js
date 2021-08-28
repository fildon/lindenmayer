function getRandomBranchValues() {
  return {
    baseLength: Math.random() * 0.4 + 0.6,
    scaleFactor: 0.7 + Math.random() * 0.2,
    angle: 2 * Math.PI * Math.random(),
    angleSpeed: 0.005 * Math.random(),
    evolution: 0,
  };
}

function makeBranch(branchValues = getRandomBranchValues()) {
  const getScaledLength = (depth) =>
    branchValues.baseLength *
    Math.pow(branchValues.scaleFactor, depth) *
    (Math.min(initialScreenHeight, initialScreenWidth) / 6);

  const getEndpoint = ([x, y], rotation, depth) => {
    const length = getScaledLength(depth);
    return [
      x + length * Math.cos(rotation + branchValues.angle),
      y + length * Math.sin(rotation + branchValues.angle),
    ];
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

function tick(
  branchGroup,
  canvas,
  globalRotation = Math.random() * 2 * Math.PI,
  startTickTime = 0
) {
  maximiseCanvas(canvas);
  fadeScreen(canvas);
  breadthFirstPaint(branchGroup, canvas.getContext("2d"), globalRotation);
  const elapsed = performance.now() - startTickTime;
  if (elapsed < 4) treeDepth++;
  if (elapsed > 16) treeDepth--;
  window.requestAnimationFrame(() =>
    tick(
      branchGroup.map((branch) => (movement ? branch.evolve() : branch)),
      canvas,
      globalRotation - (movement ? 0.005 : 0),
      performance.now()
    )
  );
}

function maximiseCanvas(canvas) {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
}

function start() {
  const canvas = document.getElementById("canvas");
  maximiseCanvas(canvas);
  const branchGroup = [makeBranch(), makeBranch()];
  window.requestAnimationFrame(() => tick(branchGroup, canvas));
}

let treeDepth = 3;
let movement = true;
function handleToggleMovementEvent(event) {
  event.preventDefault();
  movement = !movement;
}

const initialScreenWidth = window.innerWidth;
const initialScreenHeight = window.innerHeight;

document.addEventListener("touchend", handleToggleMovementEvent);
document.addEventListener("click", handleToggleMovementEvent);
document.addEventListener("DOMContentLoaded", start);
