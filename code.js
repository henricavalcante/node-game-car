var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2AABB = Box2D.Collision.b2AABB;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;
var b2Shape = Box2D.Collision.Shapes.b2Shape;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
var b2Joint = Box2D.Dynamics.Joints.b2Joint;
var b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;

var game = {
     
    'key_down' : function(e)
    {
        var code = e.keyCode;
         
       
        if(code == 37)
        {
            steering_angle = max_steer_angle;
            steer_speed = 1.0;
        }
       
        if(code == 38)
        {
            car.gear = 1;
            car.start_engine();
        }
         
       
        if(code == 39)
        {
            steering_angle = -1 * max_steer_angle;
            steer_speed = 1.0;
        }
         
       
        if(code == 40)
        {
            car.gear = -1;
            car.start_engine();
        }
    } ,
     
    'key_up' : function(e)
    {
        var code = e.keyCode;
         
       
        if(code == 38 || code == 40)
        {
            car.stop_engine();
        }
       
        if(code == 37 || code == 39)
        {
            steering_angle = 0.0;
           
            steer_speed = 8.0;
        }
    } ,
     
    'screen_width' : 0 ,
    'screen_height' : 0 ,
};
 
var engine_speed = 0;
var steering_angle = 0;
var steer_speed = 1.0;
var max_steer_angle = Math.PI/3;   
var world;
var ctx;
var canvas_height;
 
var scale = 100;
 
var car = {
     
    'top_engine_speed' : 2.5 ,
    'engine_on' : false ,
     
    'start_engine' : function()
    {
        car.engine_on = true;
        car.engine_speed = car.gear * car.top_engine_speed;
    } ,
     
    'stop_engine' : function()
    {
        car.engine_on = false;
        car.engine_speed = 0;
    } ,
     
    'gear' : 1
};
   
function redraw_world(world, context) 
{
   
    ctx.save();
    ctx.translate(0 , canvas_height);
    ctx.scale(1 , -1);
    world.DrawDebugData();
    ctx.restore();
     
    ctx.font = 'bold 15px arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Use arrow keys to move the car', canvas_width/2, 20);
    ctx.fillText('Car Gear : ' + car.gear + ' Car Engine Speed : ' + car.engine_speed + ' mps ', canvas_width/2, 40);
}
 
function createWorld() 
{
    var gravity = new b2Vec2(0, 0);
    var doSleep = true;
     
    world = new b2World(gravity , doSleep);
     
   
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
     
    world.SetDebugDraw(debugDraw);
     
    createBox(world , game.screen_width / 2 , 0.5 , game.screen_width/2 - 1 , 0.1 , { 'type' : b2Body.b2_staticBody , 'restitution' : 0.5 });
    createBox(world , game.screen_width -1  , game.screen_height / 2 , 0.1 , game.screen_height/2 -1 , { 'type' : b2Body.b2_staticBody , 'restitution' : 0.5 });
     
   
    var free = {'restitution' : 1.0 , 'linearDamping' : 1.0 , 'angularDamping' : 1.0 , 'density' : 0.2};
    createBox(world , 2 , 2 , 0.5 , 0.5 , free);
    createBox(world , 5 , 2 , 0.5 , 0.5 , free);
     
    return world;
}       
 
function createBox(world, x, y, width, height, options) 
{
    
    options = $.extend(true, {
        'density' : 1.0 ,
        'friction' : 0.0 ,
        'restitution' : 0.2 ,
         
        'linearDamping' : 0.0 ,
        'angularDamping' : 0.0 ,
         
        'gravityScale' : 1.0 ,
        'type' : b2Body.b2_dynamicBody
    }, options);
     
    var body_def = new b2BodyDef();
    var fix_def = new b2FixtureDef;
     
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
     
    fix_def.shape = new b2PolygonShape();
     
    fix_def.shape.SetAsBox( width , height );
     
    body_def.position.Set(x , y);
     
    body_def.linearDamping = options.linearDamping;
    body_def.angularDamping = options.angularDamping;
     
    body_def.type = options.type;
     
    var b = world.CreateBody( body_def );
    var f = b.CreateFixture(fix_def);
     
    return b;
}

function game_loop() 
{
    var fps = 60;
    var time_step = 1.0/fps;
     
    update_car();
   
    world.Step(time_step , 8 , 3);
   
    world.ClearForces();
     
   
    redraw_world(world , ctx);
     
   
    setTimeout('game_loop()', 1000/60);
}
 
 
$(function() 
{
    game.ctx = ctx = $('#canvas').get(0).getContext('2d');
    var canvas = $('#canvas');
     
    game.canvas_width = canvas_width = parseInt(canvas.width());
    game.canvas_height = canvas_height = parseInt(canvas.height());
     
    game.screen_width = game.canvas_width / scale;
    game.screen_height = game.canvas_height / scale;
     
   
    world = createWorld();
     
    create_car();
     
    $(document).keydown(function(e)
    {
        game.key_down(e);
        return false;
    });
     
    $(document).keyup(function(e)
    {
        game.key_up(e);
        return false;
    });
     
   
    game_loop();
});
 
function create_car()
{
    car_pos = new b2Vec2(3 , 3);
    car_dim = new b2Vec2(0.2 , 0.35);
    car.body = createBox(world , car_pos.x , car_pos.y , car_dim.x , car_dim.y , {'linearDamping' : 10.0 , 'angularDamping' : 10.0});
     
    var wheel_dim = car_dim.Copy();
    wheel_dim.Multiply(0.2);
     
   
    left_wheel = createBox(world , car_pos.x - car_dim.x , car_pos.y + car_dim.y / 2 , wheel_dim.x , wheel_dim.y , {});
    right_wheel = createBox(world , car_pos.x + car_dim.x, car_pos.y + car_dim.y / 2 , wheel_dim.x , wheel_dim.y , {});
     
   
    left_rear_wheel = createBox(world , car_pos.x - car_dim.x , car_pos.y - car_dim.y / 2 , wheel_dim.x , wheel_dim.y , {});
    right_rear_wheel = createBox(world , car_pos.x + car_dim.x, car_pos.y - car_dim.y / 2 , wheel_dim.x , wheel_dim.y , {});
     
    var front_wheels = {'left_wheel' : left_wheel , 'right_wheel' : right_wheel};
     
    for (var i in front_wheels)
    {
        var wheel = front_wheels[i];
         
        var joint_def = new b2RevoluteJointDef();
        joint_def.Initialize(car.body , wheel, wheel.GetWorldCenter());
         
       
        joint_def.enableMotor = true;
        joint_def.maxMotorTorque = 100000;
         
       
        joint_def.enableLimit = true;
        joint_def.lowerAngle =  -1 * max_steer_angle;
        joint_def.upperAngle =  max_steer_angle;
         
       
        car[i + '_joint'] = world.CreateJoint(joint_def);
    }
     
    var rear_wheels = {'left_rear_wheel' : left_rear_wheel , 'right_rear_wheel' : right_rear_wheel};
     
    for (var i in rear_wheels)
    {
        var wheel = rear_wheels[i];
         
        var joint_def = new b2PrismaticJointDef();
        joint_def.Initialize( car.body , wheel, wheel.GetWorldCenter(), new b2Vec2(1,0) );
     
        joint_def.enableLimit = true;
        joint_def.lowerTranslation = joint_def.upperTranslation = 0.0;
         
        car[i + '_joint'] = world.CreateJoint(joint_def);
    }
     
    car.left_wheel = left_wheel;
    car.right_wheel = right_wheel;
    car.left_rear_wheel = left_rear_wheel;
    car.right_rear_wheel = right_rear_wheel;
     
    return car;
}
 
function update_car()
{
    var wheels = ['left' , 'right'];
   
    for(var i in wheels)
    {
        var d = wheels[i] + '_wheel';
        var wheel = car[d];
         
       
        var direction = wheel.GetTransform().R.col2.Copy();
       
        direction.Multiply( car.engine_speed );
         
       
        wheel.ApplyForce( direction , wheel.GetPosition() );
    }   
     
   
    for(var i in wheels)
    {
        var d = wheels[i] + '_wheel_joint';
        var wheel_joint = car[d];
         
       
        var angle_diff = steering_angle - wheel_joint.GetJointAngle();
        wheel_joint.SetMotorSpeed(angle_diff * steer_speed);
    }
}