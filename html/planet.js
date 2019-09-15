/* 과제2_201024411_김규민
	미구현 사항 : 명왕성의 타원궤도
*/
var canvas;
var gl;
var program;

/////도형 buffer//////////
var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;

var octahedronVertexPositionBuffer;
var octahedronVertexColorBuffer;

var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

var tetrahedronVertexPositionBuffer;
var tetrahedronVertexColorBuffer;
///////////////////////////

var lookAtMatrix; //camera

var mvMatrix; //modelViewMatirx
var pMatrix; //perspectiveMatirx

var mode = 0;			//   정지/시작/축 보이기
var camera_mode = 0;	//   카메라 화면전환
var axis_show= 0;		//   축보이기


var rEarth = 180;
var rcEarth = 180;
var rPluto = 0;
var rSat = 90;
var revEarth = 0;
var revPluto = 0;
var revSat = 0;
var cSin, cCos, cpSin, cpCos, csCos, csSin , crrSin, crrCos;

var lastTime = 0;
var RotateTime = 1000.0;

//행성들의 각속도 초기값.
var arevEarth = 30;
var arevPluto = 7.5;
var arevSatellite = 120;

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert("WebGL isn't available");}
	
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

 
    //정지 / 시작 / 축 보이기
	document.getElementById( "btn_stop" ).onclick = function () {
        mode =0;
    };
	
	document.getElementById( "btn_start" ).onclick = function () {
        mode =1;
    };
        
    document.getElementById( "show_axis" ).onclick = function () {

	if(axis_show==1){
		axis_show = 0;
		document.getElementById( "show_axis" ).innerHTML = "Show Axis";
	}else{
		axis_show = 1;
		document.getElementById( "show_axis" ).innerHTML = "Hide Axis";		
	}
    };
	
	//카메라 화면 전환 (추가구현 10번)
	document.getElementById("change_camera").onclick = function() {
		camera_mode++;
		if(camera_mode == 5) {
			camera_mode = 0;
		}
	}
	
	//Slide bar 를 이용한 지구 / 명왕성 / 인공위성 공전스피드 조정 (추가구현 9번)
	document.getElementById( "EarthRevolutionTime" ).onchange = function () {
		arevEarth = event.srcElement.value;
	};
	document.getElementById( "PlutoRevolutionTime" ).onchange = function () {
		arevPluto = event.srcElement.value;
	};
	document.getElementById( "SatelliteRevolutionTime" ).onchange = function () {
		arevSatellite = event.srcElement.value;
	};
	
    initShaderProgram();
    initBuffer();
    render();
}

function initShaderProgram(){
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    program.vertexPositionAttribute = gl.getAttribLocation( program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.vertexColorAttribute = gl.getAttribLocation( program, "vColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);

    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	
    
	
}

function initBuffer(){

	//8면체(earth)//////////////////////////////////////////////////////////////
	octahedronVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, octahedronVertexPositionBuffer);

    var vertices = [
            // Upper Front face
             0.0,  0.7,  0.0,
            -0.5,  0.0,  0.5,
             0.5,  0.0,  0.5,

            // Upper Right face
             0.0,  0.7,  0.0,
             0.5,  0.0,  0.5,
             0.5,  0.0, -0.5,

            // Upper Back face
             0.0,  0.7,  0.0,
             0.5,  0.0, -0.5,
            -0.5,  0.0, -0.5,

            // Upper Left face
             0.0,  0.7,  0.0,
            -0.5,  0.0, -0.5,
            -0.5,  0.0,  0.5,
			
			//lower Front Face
			-0.5,  0.0,  0.5,
			 0.0, -0.7,  0.0,
			 0.5,  0.0,  0.5,
			 
			//lower Right face
			 0.5,  0.0,  0.5,
			 0.0, -0.7,  0.0,
			 0.5,  0.0, -0.5,
			 
			//lower Back face
			 0.5,  0.0, -0.5,
			 0.0, -0.7,  0.0,
			-0.5,  0.0, -0.5,
			
			//lower Left face
			-0.5,  0.0, -0.5,
			 0.0, -0.7,  0.0,
			-0.5,  0.0,  0.5			
    ];
        
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    octahedronVertexPositionBuffer.itemSize = 3;
    octahedronVertexPositionBuffer.numItems = 24;

    octahedronVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, octahedronVertexColorBuffer);

    var colors = [
			// Front face
            0.0, 0.1, 1.0, 1.0,
            0.0, 0.3, 1.0, 1.0,
            0.0, 0.2, 1.0, 1.0,

            // Right face
            0.4, 0.2, 1.0, 1.0,
            0.5, 0.6, 1.0, 1.0,
            0.7, 0.3, 1.0, 1.0,

            // Back face
            0.1, 0.0, 1.0, 1.0,
            0.0, 0.2, 1.0, 1.0,
            0.4, 0.0, 1.0, 1.0,

            // Left face
            0.0, 0.1, 1.0, 1.0,
            0.0, 0.3, 1.0, 1.0,
            0.0, 0.2, 1.0, 1.0,
			
			// Front face
            0.0, 0.1, 1.0, 1.0,
            0.0, 0.3, 1.0, 1.0,
            0.0, 0.2, 1.0, 1.0,

            // Right face
            0.4, 0.2, 1.0, 1.0,
            0.5, 0.6, 1.0, 1.0,
            0.7, 0.3, 1.0, 1.0,

            // Back face
            0.1, 0.0, 1.0, 1.0,
            0.0, 0.2, 1.0, 1.0,
            0.4, 0.0, 1.0, 1.0,

            // Left face
            0.0, 0.1, 1.0, 1.0,
            0.0, 0.3, 1.0, 1.0,
            0.0, 0.2, 1.0, 1.0,
    ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    octahedronVertexColorBuffer.itemSize = 4;
    octahedronVertexColorBuffer.numItems = 24;
	//////////////////////////////////////////////////////////////////////////////////
	
	//4각뿔(Pluto)
	pyramidVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
	
	vertices = [
            // Upper Front face
             0.0,  1.0,  0.0,
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,

            // Upper Right face
             0.0,  1.0,  0.0,
             0.5, -0.5,  0.5,
             0.5, -0.5, -0.5,

            // Upper Back face
             0.0,  1.0,  0.0,
             0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,

            // Upper Left face
             0.0,  1.0,  0.0,
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
    ];
        
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pyramidVertexPositionBuffer.itemSize = 3;
    pyramidVertexPositionBuffer.numItems = 12;

    pyramidVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);

    colors = [
	
			// front face
            1.0, 1.0, 0.9, 1.0,
            1.0, 1.0, 0.8, 1.0,
            1.0, 1.0, 0.7, 1.0,

            // Right face
            1.0, 0.8, 1.0, 1.0,
            1.0, 0.7, 1.0, 1.0,
            1.0, 0.9, 1.0, 1.0,

            // Back face
            1.0, 0.6, 0.8, 1.0,
            1.0, 0.5, 0.9, 1.0,
            1.0, 0.7, 0.7, 1.0,

            // Left face
            0.7, 1.0, 1.0, 1.0,
            0.8, 1.0, 1.0, 1.0,
            0.9, 1.0, 1.0, 1.0
    ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    pyramidVertexColorBuffer.itemSize = 4;
    pyramidVertexColorBuffer.numItems = 12;
	//////////////////////////////////////////////////////////////////////////////////
	
	//4면체(Satellite)
	tetrahedronVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
	
	vertices = [
            // Upper Front face
              0.0,    0.4,  0.0,
            -0.25,  -0.4,  0.43,
              0.5,   -0.4,  0.0,

            // Upper back face
              0.0,    0.4,   0.0,
              0.5,   -0.4,   0.0,
            -0.25,   -0.4, -0.43,

            // Upper left face
             0.0,    0.4,   0.0,
            -0.25,  -0.4, -0.43,
            -0.25,  -0.4,  0.43,

            // Upper bottom face
            -0.25,  -0.4,  0.43,
            -0.25,  -0.4, -0.43,
              0.5,  -0.4,  0.0,
    ];
        
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    tetrahedronVertexPositionBuffer.itemSize = 3;
    tetrahedronVertexPositionBuffer.numItems = 12;

    tetrahedronVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexColorBuffer);

    colors = [
	
			// front face
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // back face
            0.0, 1.0, 0.7, 1.0,
            0.0, 1.0, 0.5, 1.0,
            0.0, 1.0, 0.6, 1.0,

            // left face
            0.7, 1.0, 0.0, 1.0,
            0.8, 1.0, 0.0, 1.0,
            0.6, 1.0, 0.0, 1.0,

            // bottom face
            0.2, 1.0, 0.3, 1.0,
            0.4, 1.0, 0.1, 1.0,
            0.1, 1.0, 0.4, 1.0
    ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    tetrahedronVertexColorBuffer.itemSize = 4;
    tetrahedronVertexColorBuffer.numItems = 12;
	//////////////////////////////////////////////////////////////////////////////////
				
	//cube (Sun)
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);

    colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 0.1, 0.0, 1.0], // Back face
            [1.0, 0.2, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.0, 1.0], // Bottom face
            [1.0, 0.4, 0.0, 1.0], // Right face
            [1.0, 0.3, 0.0, 1.0]  // Left face
    ];

    var unpackedColors = [];
    for (var i in colors) {
	var color = colors[i];
	for (var j=0; j < 4; j++) {
		unpackedColors = unpackedColors.concat(color);
	}
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	
    var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;	
	//////////////////////////////////////////////////////////////////////////////////
}


function drawScene() {
	
    pMatrix = perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	
	
    //mvMatrix for Earth(octahedron)
    mvMatrix = lookAtMatrix;
    if(axis_show){
        xyzAxisObject(gl, 0.3, pMatrix, mvMatrix);	
    }
    mvMatrix = mult(mvMatrix, rotate(revEarth, [0, 1, 0]));			//공전
    mvMatrix = mult(mvMatrix, translate(5.0, 0.0, 0.0));			//태양중심(원점)에서 5만큼 떨어짐
    if(axis_show) rotateAxisObject(1.2);

	//자전 수직에서 15도 = 수평축에서 75도 기울어져있는것과 같음.
    mvMatrix = mult(mvMatrix, rotate(rEarth, [Math.cos(Math.PI/180*75), Math.sin(Math.PI/180*75), 0]));	
    if(axis_show) xyzAxisObject(gl, 1.2, pMatrix, mvMatrix);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, octahedronVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, octahedronVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, octahedronVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, octahedronVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, octahedronVertexPositionBuffer.numItems);
	
	
	
	//mvMatrix for Satellite(tetrahedron)
    mvMatrix = lookAtMatrix;
    if(axis_show){
        xyzAxisObject(gl, 0.3, pMatrix, mvMatrix);	
    }
	mvMatrix = mult(mvMatrix, translate(5*cCos,0,-(5*cSin)));			//지구 중심으로 이동
    mvMatrix = mult(mvMatrix, rotate(revSat, [csCos, csSin, 0]));		//축이 움직이며 자전
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -2.0));				//지구 중심에서 2만큼 떨어트려놓음
    if(axis_show) rotateAxisObject(1.2);

    if(axis_show) xyzAxisObject(gl, 1.2, pMatrix, mvMatrix);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, tetrahedronVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, tetrahedronVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, tetrahedronVertexPositionBuffer.numItems);
	
	
	//mvMatrix for Pluto(pyramid)
	mvMatrix = lookAtMatrix;
	
    if(axis_show){
        xyzAxisObject(gl, 0.3, pMatrix, mvMatrix);	
    }
	
    mvMatrix = mult(mvMatrix, rotate(revPluto, [0, 1, 0]));				//공전 (타원궤도 미구현)
    mvMatrix = mult(mvMatrix, translate(10.0, 0.0, 0.0));				//태양중심(원점)에서 10만큼 떨어짐
    if(axis_show) rotateAxisObject(1.2);

    mvMatrix = mult(mvMatrix, rotate(rPluto, [0, 1, 0]));				//자전
    if(axis_show) xyzAxisObject(gl, 1.2, pMatrix, mvMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
	
	
    //mvMatrix for Sun(cube)
    mvMatrix = lookAtMatrix;			//원점에 그대로 있음.
	
    if(axis_show)xyzAxisObject(gl, 1.2, pMatrix, mvMatrix);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
	
}

function setNextTimeScene() {
    var timeNow = new Date().getTime();
    var elapsed;
    
    switch(mode){
    case 0: 
		lastTime = timeNow;
		break;
    case 1: 
        if (lastTime != 0) {
            elapsed = timeNow - lastTime;
            
		rEarth += (3*arevEarth * elapsed) / RotateTime;					//지구의 자전만을 위한
		rPluto += (7*arevPluto * elapsed) / RotateTime;					//명왕성 자전
		/* 지구,명왕성 자전에 4와 8을 안쓰고 3과 7을 쓰는 이유
		지구,명왕성을 공전시키는데 쓰는 rotate함수의 성질때문에
		공전을 위한 rotate에 공전 속도와 같은 속도로 자전이 같이 이루어진다.
		따라서 지구는 4배대신 3배빠르게 돌리면 공전 rotate에 있는 자전성분과 합쳐져서 4배 빠르게 돌리는 결과가 나온다.
		
		즉, 공전 시행 (공전 : +30 자전 : +30) -> 자전 시행 (공전: +0 자전 :+3*30) = 공전 :30 자전 :120 -> 1공전 = 4자전
		*/
		rSat += (arevSatellite/12 * elapsed) / RotateTime;				//인공위성 공전궤도 변화
		
	    revEarth += (arevEarth * elapsed) / RotateTime;			//지구 공전 	초당 30도   arevEarth=30
		revPluto += (arevPluto * elapsed) / RotateTime;			//명왕성 공전 	초당 7.5도  arevPluto=7.5
		revSat += (arevSatellite * elapsed) / RotateTime;		//인공위성 공전	초당 120도  arevSatellite=120
		
		
		rcEarth += (4*arevEarth * elapsed) / RotateTime;		//지구카메라를 위한 
        }
        lastTime = timeNow;
		break;
    }
}
//각각의 회전 속도를 이용한 sin/cos 값 계산
function setAngle() {
	cSin = Math.sin(Math.PI/180*revEarth);
	cCos = Math.cos(Math.PI/180*revEarth);
	
	cpSin = Math.sin(Math.PI/180*revPluto);
	cpCos = Math.cos(Math.PI/180*revPluto);
		
	csSin = Math.sin(Math.PI/180*rSat);
	csCos = Math.cos(Math.PI/180*rSat);
	
	crrSin = Math.sin(Math.PI/180*rcEarth);
	crrCos = Math.cos(Math.PI/180*rcEarth);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    setNextTimeScene();		
	setAngle();
	
	switch(camera_mode) {
	case 0: //4분할 화면
	//전체 조형도
    lookAtMatrix = lookAt(vec3(0, 25, 0), vec3(0, 0, 0), vec3(0, 0, -1));
    gl.viewport(0, gl.viewportHeight/2, gl.viewportWidth/2, gl.viewportHeight/2);
    drawScene();
     	
	//태양 -> 12시방향
    lookAtMatrix = lookAt(vec3(0, 0,-1), vec3(0, 0, -5), vec3(0, 1, 0));
    gl.viewport(gl.viewportWidth/2, gl.viewportHeight/2, gl.viewportWidth/2, gl.viewportHeight/2);
    drawScene();
    
	//지구(한국) -> 밖
	lookAtMatrix = lookAt(vec3(5*cCos + crrCos, 0,-(5*cSin + crrSin)),
						  vec3(5*cCos + 5*crrCos, 0, -(5*cSin + 5*crrSin)), vec3(0, 1, 0));
    gl.viewport(0, 0, gl.viewportWidth/2, gl.viewportHeight/2);
    drawScene();
    
	//명왕성 -> 지구
    lookAtMatrix = lookAt(vec3(10*cpCos, 1, -(10*cpSin)), vec3(5*cCos, 0, -(5*cSin)), vec3(0, 1, 0));
    gl.viewport(gl.viewportWidth/2, 0, gl.viewportWidth/2, gl.viewportHeight/2);
    drawScene();
	break;
    
	case 1: //1번화면 전체모드
	//전체 조형도
    lookAtMatrix = lookAt(vec3(0, 25, 0), vec3(0, 0, 0), vec3(0, 0, -1));
    gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
    drawScene();
    break;
	
	case 2: //2번화면
	//태양 -> 12시방향
    lookAtMatrix = lookAt(vec3(0, 0,-1), vec3(0, 0, -5), vec3(0, 1, 0));
    gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
    drawScene();
	break;
	
	case 3: //3번화면
	//지구(한국) -> 밖
	lookAtMatrix = lookAt(vec3(5*cCos + crrCos, 0,-(5*cSin + crrSin)),
						  vec3(5*cCos + 5*crrCos, 0, -(5*cSin + 5*crrSin)), vec3(0, 1, 0));
    gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
    drawScene();
	break;
	
	case 4: //4번화면
	//명왕성 -> 지구
    lookAtMatrix = lookAt(vec3(10*cpCos, 1, -(10*cpSin)), vec3(5*cCos, 0, -(5*cSin)), vec3(0, 1, 0));
    gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
    drawScene();
	}
    window.requestAnimFrame(render);	
}
