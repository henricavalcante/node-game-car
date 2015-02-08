//console.log('Iniciando ...');
var fs = require('fs');
var porta = 9999;

var objetoId = 1;

var Box2D = require("box2d");
//Get the objects of Box2d Library
var b2Vec2 = Box2D.b2Vec2
	,  	b2AABB = Box2D.b2AABB
	,	b2BodyDef = Box2D.b2BodyDef
	,	b2Body = Box2D.b2Body
	,	b2FixtureDef = Box2D.b2FixtureDef
	,	b2Fixture = Box2D.b2Fixture
	,	b2World = Box2D.b2World
	,	b2MassData = Box2D.b2MassData
	,	b2PolygonShape = Box2D.b2PolygonShape
	,	b2CircleShape = Box2D.b2CircleShape
	,	b2DebugDraw = Box2D.b2DebugDraw
	,  	b2MouseJointDef =  Box2D.b2MouseJointDef
	,  	b2Shape = Box2D.b2Shape
	,	b2RevoluteJointDef = Box2D.b2RevoluteJointDef
	,	b2Joint = Box2D.b2Joint
	,	b2PrismaticJointDef = Box2D.b2PrismaticJointDef
	, 	b2ContactListener = Box2D.b2ContactListener
	, 	b2Settings = Box2D.b2Settings
	;

	


var game = {
	
	'screen_width' : 800 ,
	'screen_height' : 600 	
};
var carros = new Array();
var worlds = new Array();
var roomcount = 1;

var server = require('http').createServer(
	function(req, response){
		console.log(req.url);
		if(req != null)
		{
			fs.readFile(__dirname+req.url, function(err, data){
				//	
				if (err)
				{
					response.writeHead(404, {'Content-Type':'text/html'}); 
					response.write("404");
					response.end();
				}
				else
				{
					response.writeHead(200, {'Content-Type':'text/html'}); 
					response.write(data);
					response.end();
					
				}
				 
			});
		}else
		{
			console.log("404");
				response.writeHead(404, {'Content-Type':'text/html'}); 
				response.write("404");
				response.end();
		}
		
	}
);

console.log('Iniciado na porta ' + porta);
	server.listen(porta);
	
	//var nowjs = require("now");
	console.log('Inicializando Now.JS')
	var nowjs = require("now");
console.log('Inicializando Servidor Now.JS')
	var everyone = nowjs.initialize(server);
	
	
	nowjs.on('connect', function () {

	this.now.room = roomcount;
	var salaNova = true;
	
	
	for (var i in carros)
	{
		var carrosNaSala = 0;
		for (var j in carros[i])
		{
			carrosNaSala++;
			
		}
		if (carrosNaSala < 2)
		{
			this.now.room = i;
			console.log('vai dar break, carros na '+i+': ' + carrosNaSala);
			salaNova = false;
			break;
		}
		
		
	}
	
	if (salaNova)
	{
		roomcount += 1;
		this.now.room = roomcount;
		console.log('nova sala: ' + roomcount);
		carros[this.now.room] = new Array();
	}
	
	
    var grupo = nowjs.getGroup(this.now.room);
	//var salaNova = false;
    grupo.addUser(this.user.clientId);
    if (grupo.now.usuarios == null) {
        grupo.now.usuarios = new Array();
    }
	if (carros[this.now.room] == null)
	{
		salaNova = true;
	    carros[this.now.room] = new Array();
		console.log('array de carros criado');
	}
    
	if (worlds[this.now.room] == null)
	{
		worlds[this.now.room] = createWorld();
	}
	
	//console.log(carros[this.now.room]);
	
    this.now.name = this.now.name;
    this.now.indice = grupo.now.usuarios.push(this.now.name) - 1;

	createCar(50,50, this.now.room,this.now.name );
	
	console.log('guardando usuários ativos');
	
    grupo.now.rxUsuariosAtivos(grupo.now.usuarios);

	//setInterval('game_loop( 0 ,  ' + this.now.room + ' );' , 2000);
	
	if (salaNova)
	{
		console.log('iniciando game loop');
		game_loop(0,this.now.room);
		//setInterval('game_loop(0 ,\''+  this.now.room+'\' );', 50);
		
		//fun = 'game_loop(0,\''+  this.now.room+'\');';
		//console.log(fun);
		//setInterval(fun,1000);
	}
	
});

nowjs.on('disconnect', function(){

	carros

	var grupo = nowjs.getGroup(this.now.room);

	grupo.now.rxMensagemSistema(this.now.name + " Saiu.");

	delete grupo.now.usuarios[this.now.indice];

	grupo.now.rxUsuariosAtivos(grupo.now.usuarios);
	
	worlds[this.now.room].DestroyBody( carros[this.now.room][this.now.name].left_wheel);
	worlds[this.now.room].DestroyBody( carros[this.now.room][this.now.name].right_wheel);
	worlds[this.now.room].DestroyBody( carros[this.now.room][this.now.name].left_rear_wheel);
	worlds[this.now.room].DestroyBody( carros[this.now.room][this.now.name].right_rear_wheel);
	worlds[this.now.room].DestroyBody( carros[this.now.room][this.now.name].body);
	
	delete carros[this.now.room][this.now.name];
	
	if (carros[this.now.room].length = 0)
	{
		delete carros[this.now.room];
		delete worlds[this.now.room];
		
	}
});

everyone.now.changeRoom = function(newRoom){

	nowjs.getGroup(this.now.room).removeUser(this.user.clientId);

	nowjs.getGroup(newRoom).addUser(this.user.clientId);

	this.now.room = newRoom;
	this.now.rxMensagemSistema("Você está no " + this.now.room);

};

everyone.now.distributeMessage = function (message) {


    if (message.trim().length > 0) {
        if (message.trim().length > 1024) {

            message = message.substring(0, 1024);
        }

        message = message;

        nowjs.getGroup(this.now.room).now.rxMensagemUsuario(this.now.name, message);

    }

};

function previneXSS(message)
{
	message = replaceAll(message, "<", "&lt;");
    message = replaceAll(message, ">", "&gt;");
    message = replaceAll(message, "eval\\((.*)\\)", "");
    message = replaceAll(message, "[\\\"\\\'][\\s]*((?i)javascript):(.*)[\\\"\\\']", "\"\"");
    message = replaceAll(message, "((?i)script)", "");
	return message;
}


function replaceAll(string, token, newtoken) {
	while (string.indexOf(token) != -1) {
 		string = string.replace(token, newtoken);
	}
	return string;
}


function urldecode(str) {

    var histogram = {};
    var ret = str.toString();

    var replacer = function (search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };

    // The histogram is identical to the one in urlencode.
    histogram["'"] = '%27';
    histogram['('] = '%28';
    histogram[')'] = '%29';
    histogram['*'] = '%2A';
    histogram['~'] = '%7E';
    histogram['!'] = '%21';
    histogram['%20'] = '+';
    histogram['\u20AC'] = '%80';
    histogram['\u0081'] = '%81';
    histogram['\u201A'] = '%82';
    histogram['\u0192'] = '%83';
    histogram['\u201E'] = '%84';
    histogram['\u2026'] = '%85';
    histogram['\u2020'] = '%86';
    histogram['\u2021'] = '%87';
    histogram['\u02C6'] = '%88';
    histogram['\u2030'] = '%89';
    histogram['\u0160'] = '%8A';
    histogram['\u2039'] = '%8B';
    histogram['\u0152'] = '%8C';
    histogram['\u008D'] = '%8D';
    histogram['\u017D'] = '%8E';
    histogram['\u008F'] = '%8F';
    histogram['\u0090'] = '%90';
    histogram['\u2018'] = '%91';
    histogram['\u2019'] = '%92';
    histogram['\u201C'] = '%93';
    histogram['\u201D'] = '%94';
    histogram['\u2022'] = '%95';
    histogram['\u2013'] = '%96';
    histogram['\u2014'] = '%97';
    histogram['\u02DC'] = '%98';
    histogram['\u2122'] = '%99';
    histogram['\u0161'] = '%9A';
    histogram['\u203A'] = '%9B';
    histogram['\u0153'] = '%9C';
    histogram['\u009D'] = '%9D';
    histogram['\u017E'] = '%9E';
    histogram['\u0178'] = '%9F';

    for (replace in histogram) {
        search = histogram[replace]; // Switch order when decoding
        ret = replacer(search, replace, ret) // Custom replace. No regexing   
    }

    // End with decodeURIComponent, which most resembles PHP's encoding functions
    ret = decodeURIComponent(ret);

    return ret;
}

	
	//max speed = 10 mps for higher velocity
b2Settings.b2_maxTranslation = 10.0;
b2Settings.b2_maxRotation = 1.0;


	
/*
	Create box2d world object
*/ 
function createWorld() 
{
	
	console.log('criando mundo');
	var world = new b2World(
            new b2Vec2(0, 0), //gravity
            true //allow sleep
        );
	
	//bouncy boxes :)
	console.log('Criando Caixas');
	criarRetangulo(world , 0 , 0 , 80 , 1 , 0, 1, 0, 1, 1, 1, b2Body.b2_staticBody, "Parede" );
	criarRetangulo(world , 0 , 0 , 1 , 60 , 0, 1, 0, 1, 1, 1, b2Body.b2_staticBody, "Parede"  );
	criarRetangulo(world , 0 , 60 , 80 , 1 , 0, 1, 0, 1, 1, 1, b2Body.b2_staticBody, "Parede"  );
	criarRetangulo(world , 80 , 0 , 1 , 60 , 0, 1, 0, 1, 1, 1, b2Body.b2_staticBody, "Parede"  );
	
	//few lightweight boxes
	//var free = {'restitution' : 1.0 , 'linearDamping' : 1.0 , 'angularDamping' : 1.0 , 'density' : 0.2};
	
	
	//criarRetangulo(world , 60 , 40 , 2 , 2 , 1  , 0  , 0.5  , 0  , 0, 1, b2Body.b2_dynamicBody, "Caixa" );
	
	for (var i = 0 ; i <= 5 ; i += 1)
	{
	//	criarCirculo(world , (Math.random() * 80) + 0.1 , (Math.random() * 80) + 0.1, (Math.random() + 0.1) /2 , 1 , 0.1, 1, 1, 1, 1, b2Body.b2_dynamicBody, "Bola" );
	//	criarRetangulo(world , (Math.random() * 80) + 0.1 , (Math.random() * 80) + 0.1, 5 , 5 , 20, 0.0, 0, 1, 1, 1, b2Body.b2_dynamicBody, "Caixa" );
	
	}
	//criarRetangulo(world , 4 , 4 , 2 , 2 , 200, 10.0, 0, 1.0, 1.0, 1.0, b2Body.b2_dynamicBody, "Caixa" );
	
	console.log('mundo criado');
	return world;
}		


function criarCirculo(world, x, y, r, density, friction, restitution, linearDamping, angularDamping, gravityScale, type, userData)
{

var body_def = new b2BodyDef();

	var fix_def = new b2FixtureDef;
	
	fix_def.density = density*10;
	fix_def.friction = friction*10;
	fix_def.restitution = restitution;
	
	fix_def.shape = new b2CircleShape(r); //Math.random() + 0.1


	body_def.linearDamping = 0;
	body_def.angularDamping = 0.1;

	body_def.type = type;
	
	body_def.position.Set(x,y);

	
	var b = world.CreateBody( body_def );
	
	b.userData = {'id': objetoId++, 'objeto': userData};
	
	var f = b.CreateFixture(fix_def);
	
	return b;
}


/*
	Create standard boxes of given height , width at x,y
*/
function criarRetangulo(world, x, y, width, height, density, friction, restitution, linearDamping, angularDamping, gravityScale, type, userData) 
{

	var body_def = new b2BodyDef();
	var fix_def = new b2FixtureDef;
	
	fix_def.density = density;
	fix_def.friction = friction;
	fix_def.restitution = restitution;
	
	fix_def.shape = new b2PolygonShape();
	
	fix_def.shape.SetAsBox( width , height );
	
	body_def.position.Set(x , y);
	body_def.linearDamping = linearDamping;
	body_def.angularDamping = angularDamping;
	
	body_def.type = type;
	//body_def.gravityScale = 0;
	
	var b = world.CreateBody( body_def );
	
	b.userData = {'id': objetoId++, 'objeto': userData};
	var f = b.CreateFixture(fix_def);
	
	return b;

}

/*
	This method will draw the world again and again
	called by settimeout , self looped ,
	game_loop
*/
function game_loop(cnt, room) 
{

	setInterval(function()
	{
		var grupo = nowjs.getGroup(room);
		
		//fps = 60 , time steps
		var fps = 10;
		var time_step = 1.0/fps;

		//se existir carros no grupo dê update
		if (carros[room])
		{
			for (var i in carros[room])
			{
				update_car(i, room);
			}
			
			//move the world ahead , step ahead man!!
			worlds[room].Step(time_step , 8 , 3);
			//Clear the forces , Box2d 2.1a	
			worlds[room].ClearForces();
			
			//console.log('desenhando juntas');
			
			//não desenhando as juntas pois não precisamos a principio.
			//for (var j = world.GetJointList() ; j ; j = j.GetNext()) 
			//{
				//grupo.now.drawJoint(j.GetBodyA());
			//}
			
			var objetos = new Array();
			//console.log('desenhando corpos')
			
			for( var b = worlds[room].GetBodyList() ; b ; b = b.GetNext())
			{
				for( var f = b.GetFixtureList() ; f != null ; f = f.GetNext())
				{
					var shape = f.GetShape();
					var shapeType = shape.GetType();
					if(isNaN(b.GetPosition().x))
					{
						console.log('Invalid Position : ' + b.GetPosition().x);
					}
					else
					{
						objetos.push({'position': b.GetPosition(),
										'transform' : b.GetTransform().R ,
										'shape': shape,
										'userData': b.userData});
					}
				}
			}
			
			grupo.now.drawShapes(objetos);
			
		}
	}, 20);
	//call this function again after 10 seconds
	//setTimeout('game_loop(' + (cnt || 0) + ' , \'' + room + '\');', 100);
}

function createCar(x,y, room, name)
{
	console.log('Iniciando criação do carro na sala '+room+' para o usuário '+ name);
	
	var car_pos = new b2Vec2(x , y);
	var car_dim = new b2Vec2(2 , 3);
	
	carros[room][name] = {
		'top_engine_speed' : 100000,
		'engine_on' : false ,
		'start_engine' : function()
		{
			this.engine_on = true;
			this.engine_speed = -1 * this.gear * this.top_engine_speed;
		} ,
		'stop_engine' : function()
		{
			this.engine_on = false;
			this.engine_speed = 0;
		} ,
		'atirar' : function()
		{
			var pos = carros[room][name].body.GetPosition();
			criarRetangulo(worlds[room] , pos.x , pos.y , 0.1 , 0.1 , 1.0, 0.0, 0, 10.0, 10.0, 1.0, b2Body.b2_dynamicBody, "Tiro" );
		} ,
		'gear' : 1,
		'steering_angle' : 0,
		'engine_speed' : 0,
        'steer_speed' : 2,
		'max_steer_angle' : Math.PI/4
	};
	
	carros[room][name].body = criarRetangulo(worlds[room] , car_pos.x , car_pos.y , car_dim.x , car_dim.y ,  1000, 0.0, 0, 1.0, 1.0, 1.0, b2Body.b2_dynamicBody, "Carro" );
	var wheel_dim = car_dim.Copy();
	wheel_dim.Multiply(0.2);
	
	//front wheels
	left_wheel = criarRetangulo(worlds[room] , car_pos.x - car_dim.x , car_pos.y - car_dim.y / 2 , wheel_dim.x , wheel_dim.y , 20, 0.0, 0, 0.0, 0.0, 1.0, b2Body.b2_dynamicBody, "Carro" );
	right_wheel = criarRetangulo(worlds[room] , car_pos.x + car_dim.x, car_pos.y - car_dim.y / 2 , wheel_dim.x , wheel_dim.y , 20, 0.0, 0, 0.0, 0.0, 1.0, b2Body.b2_dynamicBody, "Carro" );
	//rear wheels
	left_rear_wheel = criarRetangulo(worlds[room] , car_pos.x - car_dim.x , car_pos.y + car_dim.y / 2 , wheel_dim.x , wheel_dim.y ,  20, 0.0, 0, 0.0, 0.0, 1.0, b2Body.b2_dynamicBody, "Carro" );
	right_rear_wheel = criarRetangulo(worlds[room] , car_pos.x + car_dim.x, car_pos.y + car_dim.y / 2 , wheel_dim.x , wheel_dim.y, 20, 0.0, 0, 0.0, 0.0, 1.0, b2Body.b2_dynamicBody, "Carro" );
	
	var front_wheels = {'left_wheel' : left_wheel , 'right_wheel' : right_wheel};
	
	for (var i in front_wheels)
	{
		var wheel = front_wheels[i];
		
		var joint_def = new b2RevoluteJointDef();
		joint_def.Initialize(carros[room][name].body , wheel, wheel.GetWorldCenter());
		
		//after enablemotor , setmotorspeed is used to make the joins rotate , remember!
		joint_def.enableMotor = true;
		joint_def.maxMotorTorque = 1000000;
		
		//joint_def.localAnchorA = carros[room][name].GetLocalPoint(wheel.GetPosition().Copy()).Copy();
		//joint_def.localAnchorB.Set(0,0);
		
		//this will prevent spinning of wheels when hit by something strong
		joint_def.enableLimit = true;
  		joint_def.lowerAngle =  -1 * carros[room][name].max_steer_angle;
		joint_def.upperAngle =  carros[room][name].max_steer_angle;
		
		//create and save the joint
		carros[room][name][i + '_joint'] = worlds[room].CreateJoint(joint_def);
	}
	
	var rear_wheels = {'left_rear_wheel' : left_rear_wheel , 'right_rear_wheel' : right_rear_wheel};
	
	for (var i in rear_wheels)
	{
		var wheel = rear_wheels[i];
		
		var joint_def = new b2PrismaticJointDef();
		joint_def.Initialize( carros[room][name].body , wheel, wheel.GetWorldCenter(), new b2Vec2(1,0) );
	
		joint_def.enableLimit = true;
		joint_def.lowerTranslation = joint_def.upperTranslation = 0.0;
		
		carros[room][name][i + '_joint'] = worlds[room].CreateJoint(joint_def);
	}
	
	carros[room][name].left_wheel = left_wheel;
	carros[room][name].right_wheel = right_wheel;
	carros[room][name].left_rear_wheel = left_rear_wheel;
	carros[room][name].right_rear_wheel = right_rear_wheel;
	console.log('finalizando criação de carro');
	
}

//This function applies a "friction" in a direction orthogonal to the body's axis.
function killOrthogonalVelocity(b)
{
	var localPoint = new b2Vec2(0,0);
	var velocity = b.GetLinearVelocityFromLocalPoint(localPoint);
	var sidewaysAxis = b.GetTransform().R.col2.Copy();
	//multiply vector with a constant;
	sidewaysAxis.Multiply( velocity.x*sidewaysAxis.x + velocity.y*sidewaysAxis.y)
	b.SetLinearVelocity(sidewaysAxis); //b.GetWorldPoint(localPoint));
}
/*
	Method to update the car
*/
function update_car(n, room)
{
			
	killOrthogonalVelocity(carros[room][n].left_wheel);
	killOrthogonalVelocity(carros[room][n].right_wheel);
	killOrthogonalVelocity(carros[room][n].left_rear_wheel);
	killOrthogonalVelocity(carros[room][n].right_rear_wheel);
 
	var wheels = ['left' , 'right'];
	
	//Driving
	for(var i in wheels)
	{
		var d = wheels[i] + '_wheel';
		var wheel = carros[room][n][d];
		
		//get the direction in which the wheel is pointing
		var direction = wheel.GetTransform().R.col2.Copy();
		direction.Multiply( carros[room][n].engine_speed );
		
		//apply force in that direction
		wheel.ApplyForce( direction , wheel.GetPosition() );
		//wheel.SetLinearVelocity(direction);
	}	
	
	//Steering
	for(var i in wheels)
	{
		var d = wheels[i] + '_wheel_joint';
		var wheel_joint = carros[room][n][d];
		//set the motor speed
		var mspeed;
		//max speed - current speed , should be the motor speed , so when max speed reached , speed = 0;
		mspeed = carros[room][n].steering_angle - wheel_joint.GetJointAngle();
		wheel_joint.SetMotorSpeed(mspeed * carros[room][n].steer_speed);
	}
	
}
everyone.now.key = function(up,code){

carros[this.now.room][this.now.name]
	if(up)
	{
		//left
		if(code == 37)
		{
			carros[this.now.room][this.now.name].steering_angle = -1 * carros[this.now.room][this.now.name].max_steer_angle;
			carros[this.now.room][this.now.name].steer_speed = 0.2;
		}
		//up
		if(code == 38)
		{
			carros[this.now.room][this.now.name].gear = 1;
			carros[this.now.room][this.now.name].start_engine();
		}
		//right
		if(code == 39)
		{
			carros[this.now.room][this.now.name].steering_angle = carros[this.now.room][this.now.name].max_steer_angle;
			carros[this.now.room][this.now.name].steer_speed = 0.2;
		}
		//down
		if(code == 40)
		{
			carros[this.now.room][this.now.name].gear = -1;
			carros[this.now.room][this.now.name].start_engine();
		}
		
		//f (atira)
		if(code == 70)
		{
			carros[this.now.room][this.now.name].atirar();
		}
		
	}
	else
	{
		//stop forward velocity only when up or down key is released
		if(code == 38 || code == 40)
		{
			carros[this.now.room][this.now.name].stop_engine();
		}
		if(code == 37 || code == 39)
		{
			carros[this.now.room][this.now.name].steering_angle = 0;
			carros[this.now.room][this.now.name].steer_speed = 2;
		}
	}
}

