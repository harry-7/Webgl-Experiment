//Classes

class Matrix_required {
    constructor() {
        this.MID = null;
        this.Model = null;
        this.View = null;
        this.Projection = null;
        this.VID = null;
        this.PID = null;
    }
}


class Cyllinder {

    constructor(x, y, z, h, r, cr, cg, cb) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.h = h;
        this.r = r;
        this.top = null;
        this.bot = null;
        this.side = null;
        this.x_vel = 0;
        this.z_vel = 0;
        this.generate_sides(h, r, cr, cg, cb);
    }

    draw() {
        this.top.draw();
        this.bot.draw();
        this.side.draw();
    }

    generate_sides(h, r, cr, cg, cb) {
        var top_v = [], top_c = [], bot_v = [], bot_c = [], side_v = [], side_c = [];
        var a, b, y, x, z, al = 1.0;
        a = 0, b = 0, y = -h / 2; //The origin
        var segments = 18;
        var theta = (Math.PI / 180) * (360 / segments); //Degrees = radians * (180 / Ï€)


        for (var i = 0; i <= segments; i++) {
            x = r * Math.cos(theta * i);
            z = r * Math.sin(theta * i);

            bot_v.push(x, y, z); //Bottomvertices
            bot_c.push(cr, cg, cb, al); //Color for bottom vertices

            side_v.push(x, y, z); //Sidevertices along the bottom
            side_c.push(cr, cg, cb, al); //Vertex color
            side_v.push(x, y + h, z); //Sidevertices along the top with y = 2
            side_c.push(cr, cg, cb, al); //Vertex color

            top_v.push(x, y + h, z); //Topvertices with y = 2
            top_c.push(cr, cg, cb, al); //Color for top vertices
        }
        this.bot = new VAO(gl.TRIANGLE_FAN, segments, bot_v, bot_c);
        this.top = new VAO(gl.TRIANGLE_FAN, segments, top_v, top_c);
        this.side = new VAO(gl.TRIANGLE_STRIP, 2 * segments, side_v, side_c);
    }
}

function get_dist(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}
function is_collides(a, b) {
    if (a == null || b == null)return false;
    if (get_dist(a.x, a.z, b.x, b.z) <= a.r + b.r) {
        return true;
    }
    return false;
}

class VAO {
    constructor(primitve_mode, num_of_vertices, vertex_buffer_data, color_buffer_data, indices = null) {
        this.PrimitiveMode = primitve_mode;
        this.NumVertices = num_of_vertices;

        this.VertexBuffer = gl.createBuffer();
        this.ColorBuffer = gl.createBuffer();
        this.IndexBuffer = null;
        this.TextureBuffer = null;
        this.TextureID = null;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_buffer_data), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_buffer_data), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

        if (indices != null) {
            this.IndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        }
    }

    insertTexture(texture_buffer_data) {

        this.TextureID = gl.createTexture();
        this.TextureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.TextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_buffer_data), gl.STATIC_DRAW);
        // have to write remaining;

    }

    draw() {

        //gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        //gl.enableVertexAttribArray(vertexColorAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ColorBuffer);
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
        if (this.IndexBuffer != null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexBuffer);
            gl.drawElements(this.PrimitiveMode, this.NumVertices, gl.UNSIGNED_SHORT, 0);
        }
        else {
            gl.drawArrays(this.PrimitiveMode, 0, this.NumVertices);
        }
    }

    draw_texture() {

        gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);


        gl.bindTexture(gl.TEXTURE_2D, this.TextureID);
        gl.enableVertexAttribArray(textureCoordAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.TextureBuffer);
        gl.drawArrays(this.PrimitiveMode, 0, this.NumVertices);

    }

}

class object {
    constructor(x, y, z, vao) {
        this.x = x;
        this.y = y;
        this.z = z
        this.vao = vao;
        this.rot = 0;
    }

    draw() {
        this.vao.draw();
    }
}
//Variables Required

var shaderProgram;
var textureProgram;
var vertexPositionAttribute;
var vertexNormalAttribute;
var textureCoordAttribute;
var vertexColorAttribute;
var boardobj, coinobj;
var canvas;
var gl;
var holes;
var view_mode = 0;
var striker_mode = 0;
var MINX = -25;
var MAXX = 31;
var pow = 2;
var fric = 0.01;
var score = 100;
var red_fl = 0; // Shows whether red is captured
var cnt = 0;
var Matrices = new Matrix_required();


function initWebGL(canvas) {
    gl = null;

    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e) {
    }

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttribute);
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);

    // Didn't find an element with the specified ID; abort.

    if (!shaderScript) {
        return null;
    }

    // Walk through the source element's children, building the
    // shader source string.

    var theSource = "";
    var currentChild = shaderScript.firstChild;

    while (currentChild) {
        if (currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }

    // Now figure out what type of shader script we have,
    // based on its MIME type.

    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;  // Unknown shader type
    }

    // Send the source to the shader object

    gl.shaderSource(shader, theSource);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initialise() {
    make_matrices();
    create_objects();
    view_mode = 0;
    striker_mode = 0;
    pow = 2;
    score = 100;
    cnt = 0;

}

function make_matrices() {
    Matrices.MID = gl.getUniformLocation(shaderProgram, "M");
    Matrices.VID = gl.getUniformLocation(shaderProgram, "V");
    Matrices.PID = gl.getUniformLocation(shaderProgram, "P");
    gl.viewport(0, 0, canvas.width, canvas.height);
    var fov = 100;
    //Matrices.Projection = makeOrtho(-canvas.width/2,canvas.width/2,-canvas.height/2,canvas.height/2, 0.1, 500.0);
    Matrices.Projection = makePerspective(50, canvas.width / canvas.height, 0.1, 1000.0);

}

function init() {
    canvas = document.getElementById("mycanvas");
    //var context1 = canvas.getContext('2d');
    gl = initWebGL(canvas);
    if (gl) {

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        initShaders();
        initialise();
        setInterval(draw_scene, 10);
    }
}

function make_coins() {
    coinobj = new Array();
    coinobj["striker"] = new Cyllinder(24, 11, -37, 2, 3, 33 / 255.0, 182 / 255.0, 168 / 255.0);
    var x, y, z, r, h, n, rad = 14;
    x = 0;
    z = 0;
    y = 4;
    r = 2.5;
    h = 4;
    n = 8;
    var cr, cg, cb;
    cr = 168 / 255.0;
    cg = 32 / 255.0;
    cb = 80 / 255.0;
    coinobj["red"] = new Cyllinder(x, y, z, h, r, cr, cg, cb);

    var theta = (Math.PI / 180) * (360 / n);
    for (var i = 0; i < n; i++) {
        x = rad * Math.cos(theta * i);
        z = rad * Math.sin(theta * i);

        if (i % 2 == 1) {
            var name = "black" + i.toString();
            cr = 35 / 255.0;
            cg = 35 / 255.0;
            cb = 33 / 255.0;
            coinobj[name] = new Cyllinder(x, y, z, h, r, cr, cg, cb);
        }
        else {

            var name = "white" + i.toString();
            cr = 251 / 255.0;
            cg = 219 / 255.0;
            cb = 180 / 255.0;
            coinobj[name] = new Cyllinder(x, y, z, h, r, cr, cg, cb);
        }

    }
    var colors = [
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0]
    ];
    var vao = make_cube(0.1, 0.1, 8, colors);

    coinobj["trig"] = new object(0, 0, 0, vao);
    coinobj["trig"].rot = 0;

    holes = new Array();

    holes["1"] = new Cyllinder(50, 4, -50, 2, 4, 0, 0, 0);
    holes["2"] = new Cyllinder(50, 4, 50, 2, 4, 0, 0, 0);
    holes["3"] = new Cyllinder(-50, 4, -50, 2, 4, 0, 0, 0);
    holes["4"] = new Cyllinder(-50, 4, 50, 2, 4, 0, 0, 0);

}

function make_cube(l, b, h, colors) {
    var vertices = [
        -l, -b, h,
        l, -b, h,
        l, b, h,
        -l, b, h,

        // Back face
        -l, -b, -h,
        -l, b, -h,
        l, b, -h,
        l, -b, -h,

        // Top face
        -l, b, -h,
        -l, b, h,
        l, b, h,
        l, b, -h,

        // Bottom face
        -l, b, -h,
        l, -b, -h,
        l, -b, h,
        -l, -b, h,

        // Right face
        l, -b, -h,
        l, b, -h,
        l, b, h,
        l, -b, h,

        // Left face
        -l, -b, -h,
        -l, -b, h,
        -l, b, h,
        -l, b, -h,

    ];
    var generatedColors = [];

    for (j = 0; j < 6; j++) {
        var c = colors[j];

        // Repeat each color four times for the four vertices of the face

        for (var i = 0; i < 4; i++) {
            generatedColors = generatedColors.concat(c);
        }
    }

    var indices = [
        0, 1, 2,
        0, 2, 3,    // front
        4, 5, 6,
        4, 6, 7,    // back
        8, 9, 10,
        8, 10, 11,   // top
        12, 13, 14,
        12, 14, 15,   // bottom
        16, 17, 18,
        16, 18, 19,   // right
        20, 21, 22,
        20, 22, 23    // left
    ];

    return new VAO(gl.TRIANGLES, 36, vertices, generatedColors, indices);
}

function make_board() {
    boardobj = new Array();
    var l, b, h;
    l = 65;
    b = 4;
    h = 65;
    var colors = [
        [1.0, 0.0, 0.0, 1.0],    // Back face: red
        [66 / 255.0, 6 / 255.0, 5 / 255.0, 1.0],    // Front face: white
        [78 / 255.0, 9 / 255.0, 12 / 255.0, 1.0],    // Top face: green
        [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
        [1.0, 0.0, 1.0, 1.0]     // Left face: purple
    ];

    var vao = make_cube(l, b, h, colors);
    boardobj["base"] = new object(0, 0, 0, vao);
    l = 55;
    b = 4;
    h = 55;
    colors = [
        [1.0, 0.0, 0.0, 1.0],    // Back face: red
        [167 / 255.0, 119 / 255.0, 71 / 255.0, 1.0],    // Front face: white
        [240 / 255.0, 198 / 255.0, 141 / 255.0, 1.0],    // Top face: green
        [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
        [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    ];
    vao = make_cube(l, b, h, colors);
    boardobj["inside"] = new object(0, 0, 0, vao);

    var y = 4.1;
    colors = [
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0]
    ];
    var x = 40, z = 0, y = 3.9, r = 2.5;
    l = 0.08;
    h = 30;
    b = 0.1;
    vao = make_cube(l, b, h, colors);
    boardobj["line01"] = new object(x, y, z, vao);
    boardobj["line02"] = new object(x + r * (1.99), y, z, vao);
    //boardobj["circle010"] = new Cyllinder(x + r, y + b, z - h + r * (0.5), b, r * (0.999), 0, 0, 0);
    boardobj["circle011"] = new Cyllinder(x + r, y + b, z - h + r * (0.5), b, r * (0.999), 1, 0, 0);
    //boardobj["circle020"] = new Cyllinder(x + r, y + b, z + h + r * (0.8), b, r * (0.999), 0, 0, 0);
    boardobj["circle021"] = new Cyllinder(x + r, y + b, z + h + r * (0.8), b, r * (0.999), 1, 0, 0);

    x = -40;
    boardobj["line11"] = new object(x, y, z, vao);
    boardobj["line12"] = new object(x + r * (1.99), y, z, vao);
    //boardobj["circle110"] = new Cyllinder(x + r, y + b, z - h + r * (0.5), b, r * (0.999), 0, 0, 0);
    boardobj["circle111"] = new Cyllinder(x + r, y + b, z - h + r * (0.5), b, r * (0.999), 1, 0, 0);
    //boardobj["circle120"] = new Cyllinder(x + r, y + b, z + h + r * (0.8), b, r * (0.999), 0, 0, 0);
    boardobj["circle121"] = new Cyllinder(x + r, y + b, z + h + r * (0.8), b, r * (0.999), 1, 0, 0);

    z = 40;
    x = 3;
    b = 0.2;
    l = 30;
    h = 0;
    r = 2.5;
    y = 4.2;
    var vao1 = make_cube(l, b, h, colors);
    boardobj["line21"] = new object(x, y, z, vao1);
    boardobj["line22"] = new object(x, y, z + r * (1.99), vao1);
    //boardobj["circle210"] = new Cyllinder(x - l + r * (0.5), y + b, z + r, b, r, 0, 0, 0);
    boardobj["circle211"] = new Cyllinder(x - l + r * (0.5), y + b, z + r, b, r * (0.999), 1, 0, 0);
    //boardobj["circle220"] = new Cyllinder(x + l - r * (0.5), y + b, z + r, b, r, 0, 0, 0);
    boardobj["circle221"] = new Cyllinder(x + l - r * (0.5), y + b, z + r, b, r * (0.999), 1, 0, 0);


    z = -40;
    boardobj["line31"] = new object(x, y, z, vao1);
    boardobj["line32"] = new object(x, y, z + r * (1.99), vao1);
    boardobj["circle310"] = new Cyllinder(x - l + r * (0.5), y + b, z + r, b, r, 0, 0, 0);
    boardobj["circle311"] = new Cyllinder(x - l + r * (0.5), y + b, z + r, b, r * (0.999), 1, 0, 0);
    boardobj["circle320"] = new Cyllinder(x + l - r * (0.5), y + b, z + r, b, r, 0, 0, 0);
    boardobj["circle321"] = new Cyllinder(x + l - r * (0.5), y + b, z + r, b, r * (0.999), 1, 0, 0);

}

function create_objects() {

    make_board();
    make_coins();
}

document.onkeydown = keyboardfunc;

function keyboardfunc(event) {

    if (striker_mode == 3)
        return;
    if (striker_mode == 0) {
        coinobj["trig"].rot = 0;
    }
    if (event.keyCode == KeyEvent.DOM_VK_R) {
        initialise();
    }
    if (striker_mode < 2 && event.keyCode == KeyEvent.DOM_VK_C) {
        view_mode = 3;
    }
    if (event.keyCode == KeyEvent.DOM_VK_V) {
        if (view_mode == 1) {
            coinobj["striker"].x = 24;
            coinobj["striker"].z = -37;
            view_mode = 0;

        }
        else {
            view_mode = 1;
            coinobj["striker"].x = 30;
            coinobj["striker"].z = -47;
        }
        striker_mode = 0;
    }
    if (striker_mode == 0 && event.keyCode == 13) {
        coinobj["trig"].rot = 0;
        striker_mode = 1;
        pow = 2;
    }
    else if (striker_mode == 1 && event.keyCode == 13) {
        striker_mode = 2;
    }
    else if (striker_mode == 2 && event.keyCode == 13) {
        if (view_mode == 3)
            view_mode = 0;
        coinobj["striker"].x_vel = pow * Math.sin(((Math.PI / 180) * coinobj["trig"].rot));
        coinobj["striker"].z_vel = pow * Math.cos(((Math.PI / 180) * coinobj["trig"].rot));
        striker_mode = 3;
    }
    if (striker_mode == 0) {
        curx = coinobj["striker"].x;
        if (event.keyCode == KeyEvent.DOM_VK_RIGHT) {
            curx -= 1;
        }
        else if (event.keyCode == KeyEvent.DOM_VK_LEFT) {
            curx += 1;
        }
        curx = Math.min(curx, MAXX);
        curx = Math.max(curx, MINX);
        coinobj["striker"].x = curx;
    }
    if (striker_mode == 1) {
        var ang = coinobj["trig"].rot;
        if (event.keyCode == KeyEvent.DOM_VK_RIGHT) {
            ang -= 1;
        }
        else if (event.keyCode == KeyEvent.DOM_VK_LEFT) {
            ang += 1;
        }
        ang = Math.min(ang, 90);
        ang = Math.max(ang, -90);
        coinobj["trig"].rot = ang;
    }
    if (striker_mode == 2) {
        if (event.keyCode == KeyEvent.DOM_VK_W) {
            pow += 0.1;
        }
        else if (event.keyCode == KeyEvent.DOM_VK_S) {
            pow -= 0.1;
        }
        pow = Math.min(pow, 5);
        pow = Math.max(pow, 1);
    }
}

function sign(x) {
    if (x < 0)return -1;
    return 1;
}

function draw_scene() {


    cnt += 1;

    //Decrementing Score

    if (cnt == 500) {
        cnt = 0;
        score -= 1;
        if (score < 0) {
            initialise();
            return;
        }
    }

    //Adding Info

    var speed = document.getElementById('speed');
    speed.innerHTML = Math.round(pow * 10).toString();
    var score1 = document.getElementById('score');
    score1.innerHTML = Math.round(score).toString();
    var timer = document.getElementById('timer');
    var num = (5 - cnt * 0.01).toString();
    timer.innerHTML = (Math.round(num)).toString();

    // View Mode

    if (view_mode == 1) {
        Matrices.View = makeLookAt(0, 100, -200, 0, 0, 0, 0, 0, 1);
    }
    else if (view_mode == 0) {
        Matrices.View = makeLookAt(0, 200, 0, 0, 0, 0, 0, 0, 1);

    }
    else if (view_mode == 3) {
        var ex, ey, ez, rad, tx, ty, tz;
        rad = 30;
        ex = coinobj["striker"].x;
        ey = coinobj["striker"].y + 2 * coinobj["striker"].h;
        ez = coinobj["striker"].z;
        tx = ex - rad * (Math.sin(((Math.PI / 180) * coinobj["trig"].rot)));
        tz = ez + rad * (Math.cos(((Math.PI / 180) * coinobj["trig"].rot)));
        ty = 0;
        Matrices.View = makeLookAt(ex, ey, ez, tx, ty, tz, 0, 0, 1);
    }


    gl.useProgram(shaderProgram);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(242 / 255.0, 230 / 255.0, 245 / 255.0, 0.6);
    gl.viewport(0, 0, canvas.width, canvas.height);


    if (striker_mode == 1) {
        coinobj["trig"].x = coinobj["striker"].x;
        coinobj["trig"].z = coinobj["striker"].z + 10 * Math.sin(((Math.PI / 180) * coinobj["trig"].rot)) + 8;
        coinobj["trig"].y = 4;
    }

    for (var key in boardobj) {
        if (boardobj[key] != null) {
            Matrices.Model = Matrix.I(4);
            mvTranslate([boardobj[key].x, boardobj[key].y, boardobj[key].z]);
            setMatrixUniforms();
            boardobj[key].draw();
        }
    }


    for (var key in holes) {

        if (holes[key] != null) {
            Matrices.Model = Matrix.I(4);
            mvTranslate([holes[key].x, holes[key].y, holes[key].z]);
            setMatrixUniforms();
            holes[key].draw();
        }
    }

    for (var key in coinobj) {
        if (key != 'striker' && key != 'trig') {
            if (is_collides(coinobj["striker"], coinobj[key])) {
                var xv = coinobj["striker"].x_vel;
                var zv = coinobj["striker"].z_vel;
                coinobj[key].x_vel = 0.4 * xv;
                coinobj[key].z_vel = 0.4 * zv;
                coinobj["striker"].x_vel = -0.6 * xv;
                coinobj["striker"].z_vel = -0.6 * zv;
            }
        }
    }
    var fl = 0, ofl = 0;

    for (var key in coinobj) {
        if (key != 'striker' && key != 'trig' && (coinobj[key].x_vel != 0 || coinobj[key].z_vel != 0)) {
            for (var key2 in coinobj) {
                if (key2 != 'striker' && key2 != 'trig' && key2 != key) {
                    if (is_collides(coinobj[key2], coinobj[key]) == true) {
                        //console.log(key);
                        //console.log(key2);
                        var xv = coinobj[key].x_vel;
                        var zv = coinobj[key].z_vel;
                        coinobj[key].x_vel = 0.5 * xv;
                        coinobj[key].z_vel = 0.5 * zv;
                        coinobj[key2].x_vel = 0.5 * xv;
                        coinobj[key2].z_vel = 0.5 * zv;
                        if (coinobj[key2].x < coinobj[key].x)
                            coinobj[key].x = coinobj[key2].x - 2 * coinobj[key2].r;
                        else if (coinobj[key2].x >= coinobj[key].x)
                            coinobj[key].x = coinobj[key2].x + 2 * coinobj[key2].r;
                        if (coinobj[key2].z < coinobj[key].z)
                            coinobj[key].z = coinobj[key2].z - 2 * coinobj[key2].r;
                        else if (coinobj[key2].z >= coinobj[key].z)
                            coinobj[key].z = coinobj[key2].z + 2 * coinobj[key2].r;
                    }
                }
            }
        }
        if (key != 'trig') {
            for (var key2 in holes) {
                if (is_collides(coinobj[key], holes[key2])) {
                    coinobj[key] = null;
                    if (key[0] == player_flag) {
                        score += 5;
                        ofl = 1;
                    }
                    else if (key[0] != 's' && key != 'red') {
                        score -= 20;
                    }
                    if (key == 'striker') {
                        score -= 5;
                    }
                    if (key == 'red') {
                        fl = 1;
                    }
                    break;
                }
            }
        }
    }

    if (coinobj["striker"] == null) {
        coinobj["striker"] = new Cyllinder(24, 11, -37, 2, 3, 33 / 255.0, 182 / 255.0, 168 / 255.0);
    }

    if (red_fl == 1 && ofl == 0) {

        red_fl = 0;

        //Placing back the red Coin

        var x, y, z, r, h, n, rad = 14;
        x = 0;
        z = 0;
        y = 4;
        r = 2.5;
        h = 4;
        n = 8;
        var cr, cg, cb;
        cr = 168 / 255.0;
        cg = 32 / 255.0;
        cb = 80 / 255.0;
        coinobj["red"] = new Cyllinder(x, y, z, h, r, cr, cg, cb);
    }
    else if (red_fl == 1 && ofl == 1) {
        score += 20;
        red_fl = 0;
    }
    if (fl == 1) {
        red_fl = 1;
    }

    for (var key in coinobj) {
        if (coinobj[key] != null) {
            Matrices.Model = Matrix.I(4);
            coinobj[key].x += coinobj[key].x_vel;
            coinobj[key].z += coinobj[key].z_vel;
            if (coinobj[key].x_vel != 0) {
                if (Math.abs(coinobj[key].x_vel) > fric) {
                    coinobj[key].x_vel -= sign(coinobj[key].x_vel) * (fric);
                }
                else if (Math.abs(coinobj[key].x_vel) < fric) {
                    coinobj[key].x_vel = 0;
                }
            }
            if (coinobj[key].z_vel != 0) {

                if (Math.abs(coinobj[key].z_vel) > fric) {
                    coinobj[key].z_vel -= sign(coinobj[key].z_vel) * (fric);
                }
                else if (Math.abs(coinobj[key].z_vel) < fric) {
                    coinobj[key].z_vel = 0;
                }
            }
            if (key == "striker" && coinobj[key].x_vel == 0 && coinobj[key].z_vel == 0 && striker_mode == 3) {
                striker_mode = 0;
                coinobj["striker"] = new Cyllinder(24, 11, -37, 2, 3, 33 / 255.0, 182 / 255.0, 168 / 255.0);
                if (view_mode == 1) {
                    coinobj["striker"].x = 30;
                    coinobj["striker"].z = -47;
                }
            }
            if (coinobj[key].x > 50 || coinobj[key].x < -50)coinobj[key].x_vel = -coinobj[key].x_vel;
            if (coinobj[key].z > 50 || coinobj[key].z < -50)coinobj[key].z_vel = -coinobj[key].z_vel;
            if (key == "trig") {
                mvTranslate([coinobj["striker"].x, coinobj["striker"].y, coinobj["striker"].z]);
                mvRotate(coinobj[key].rot, [0, 1, 0]);
                //mvTranslate([-coinobj["striker"].x, -coinobj["striker"].y, -coinobj["striker"].z]);
            }
            else {
                mvTranslate([coinobj[key].x, coinobj[key].y, coinobj[key].z]);
            }
            setMatrixUniforms();
            if (key == "trig" && striker_mode != 0 && striker_mode != 3 && view_mode == 0 || (key != "trig")) {
                coinobj[key].draw();
            }
        }
    }

}


function multMatrix(m) {
    Matrices.Model = Matrices.Model.x(m);
}

function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function mvRotate(angle, v) {
    var inRadians = angle * Math.PI / 180.0;

    var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

function setMatrixUniforms() {

    gl.uniformMatrix4fv(Matrices.MID, false, new Float32Array(Matrices.Model.flatten()));
    gl.uniformMatrix4fv(Matrices.VID, false, new Float32Array(Matrices.View.flatten()));
    gl.uniformMatrix4fv(Matrices.PID, false, new Float32Array(Matrices.Projection.flatten()));

}