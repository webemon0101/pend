// Matter.jsの設定
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

let engine;
let world;
let cart, pendulum, ground;
let canvas;

function setup() {
    // キャンバスの設定
    canvas = createCanvas(800, 400);

    // Matter.jsのエンジンとワールドの初期化
    engine = Engine.create();
    world = engine.world;

    // 重力の設定（倒れやすさの調整）
    engine.world.gravity.y = 0.5;

    // 台車の作成（水平のみに移動させたいので、inertiaをInfinityに設定）
    cart = Bodies.rectangle(400, 320, 100, 20, { friction: 0.1, restitution: 0, inertia: Infinity });
    World.add(world, cart);

    // 振り子（棒）の作成
    pendulum = Bodies.rectangle(400, 220, 10, 100, { friction: 0.01, restitution: 0.1 });
    World.add(world, pendulum);

    // 振り子を台車の上に位置させ、左右に倒れるように接続
    let pendulumConstraint = Constraint.create({
        bodyA: cart,
        bodyB: pendulum,
        pointA: { x: 0, y: -30 },
        pointB: { x: 0, y: 50 },
        stiffness: 0.5, // 揺れやすさの調整
        length: 0
    });
    World.add(world, pendulumConstraint);

    // 地面（床）の作成
    ground = Bodies.rectangle(400, 380, 810, 20, { isStatic: true });
    World.add(world, ground);

    // マウス操作の設定
    let mouse = Mouse.create(canvas.elt);
    let mouseParams = {
        mouse: mouse,
        constraint: {
            stiffness: 0.1,
            render: { visible: false }
        }
    };
    let mouseConstraint = MouseConstraint.create(engine, mouseParams);
    World.add(world, mouseConstraint);
}

// 描画処理
function draw() {
    background(255);

    // エンジンの更新
    Engine.update(engine);

    // 台車、振り子、地面の描画
    drawBody(cart);
    drawBody(pendulum);
    drawBody(ground);

    // タッチされた場合、振り子を倒す力を与える
    if (mouseIsPressed) {
        let forceDirection = mouseY < pendulum.position.y ? -0.002 : 0.002;
        Body.applyForce(pendulum, pendulum.position, { x: 0, y: forceDirection });
    }

    // 振り子が倒れないようにバランスを取るための力を台車に与える
    let angle = pendulum.angle;
    let forceMagnitude = angle * 0.005; // 振り子の角度に応じて台車を調整
    Body.applyForce(cart, cart.position, { x: forceMagnitude, y: 0 });
}

// 台車や振り子、地面を描画する関数
function drawBody(body) {
    let pos = body.position;
    let angle = body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);

    // 円形（車輪）か矩形（台車、振り子、地面）かを判断して描画
    rect(0, 0, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
    pop();
}
