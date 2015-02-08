//Get the objects of Box2d Library
var b2Vec2 = Box2D.Common.Math.b2Vec2
	,  	b2AABB = Box2D.Collision.b2AABB
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	,  	b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	,  	b2Shape = Box2D.Collision.Shapes.b2Shape
	,	b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
	,	b2Joint = Box2D.Dynamics.Joints.b2Joint
	,	b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
	, 	b2ContactListener = Box2D.Dynamics.b2ContactListener
	, 	b2Settings = Box2D.Common.b2Settings
	;
         
//max speed = 10 mps for higher velocity
b2Settings.b2_maxTranslation = 10.0;
b2Settings.b2_maxRotation = 1.0;

var game = {
	
	'key_down' : function(e)
	{
		var code = e.keyCode;
		
		//left
		if(code == 37)
		{
			now.key(true,37);
		}
		//up
		if(code == 38)
		{
			now.key(true,38);
		}
		
		//right
		if(code == 39)
		{
			now.key(true,39);
		}
		
		//down
		if(code == 40)
		{
			now.key(true,40);
		}
		
		//f (atirar)
		if(code == 70)
		{
			now.key(true,70);
		}
	} ,
	
	'key_up' : function(e)
	{
		var code = e.keyCode;
		
		//stop forward velocity only when up or down key is released
		if(code == 38 || code == 40)
		{
			now.key(false,38);
		}
		if(code == 37 || code == 39)
		{
			now.key(false,37);
		}
	} ,
	
	'screen_width' : 800 ,
	'screen_height' : 600 ,
	'collision_count' : 0 ,
	
};

var world;
var ctx;

/*
	Say scale for drawing 1 metre = 100 pixel
	then 1000px wide monitor can display upto 10 metre
	and 0.1 metre would need 10 pixel :)
*/
var scale = 10;

var n = now.name;

var car = new Array();



	

now.drawShapes = function(o)
{

	
	$('.obj').addClass('obj_del');
	
	for ( var i in o)
	{
		//alert(i);
		drawShape(o[i].position, o[i].transform, o[i].shape, o[i].userData);
		
	}
	
	$('.obj_del').remove();
	
	
}


function drawShape(position, R , shape, userData) 
{
	
	var largura;
	var altura;
	
	switch (shape.m_type) 
	{
		case b2Shape.e_polygonShape:
		{
			var poly = shape;
			var vert = shape.m_vertices;
			
			largura = vert[1].x * 2;
			altura = vert[2].y * 2;
			
			//$('#debug').append($('#obj_'+ userData.id).length + '<br>')
			
		}
		break;
		case b2Shape.e_circleShape:  
        {  
			var circle = shape;  
            largura = circle.m_radius * 2;  
			altura = circle.m_radius * 2;  
        }  
        break; 
	}
	
	
	
			var obj = $('#obj_'+ userData.id);
			
			if (obj.length > 0)
			{
				obj.css('top', (position.y - (altura/2))  * scale);
				obj.css('left', (position.x - (largura/2)) * scale);
				obj.css('width', largura * scale);
				obj.css('height', altura * scale);
				obj.removeClass('obj_del');
				
				obj.css('-webkit-transform', 'rotate(' + Math.atan(R.col1.y/R.col1.x) * (180/Math.PI) + 'deg)');
				obj.css('-moz-transform', 'rotate(' + Math.atan(R.col1.y/R.col1.x) * (180/Math.PI) + 'deg)');
				
				//$('#obj_debug_'+userData.id).text(R.col1.x + '|' + R.col1.y + '|' + R.col2.x+ '|' + R.col2.y);
				//$('#obj_debug_'+userData.id).css('top', position.y  * scale);
				//$('#obj_debug_'+userData.id).css('left', position.x  * scale);
				
			}
			else
			{
				$('#arena').append('<div id="obj_'+userData.id+'" class="obj obj_"'+userData.objeto+' style="display:block;position:absolute;border: 1px solid #000;"></div>')
				//$('#arena').append('<span id="obj_debug_'+userData.id+'" style="display:block;position:absolute;"></span>')
			}
	
	
	
}



// main entry point
$(function() 
{

setTimeout(function() {
    window.ondevicemotion = function(event) {  

    		var accelerationX = event.accelerationIncludingGravity.x;  
    		var accelerationY = event.accelerationIncludingGravity.y;  
    		var accelerationZ = event.accelerationIncludingGravity.z;  
	
	if (accelerationY > 2)
	{
		now.key(true,39);
	}
	else if (accelerationY < -2)
	{
		now.key(true,37);
	}
	else
	{
		now.key(false,37);
	}
	
	if (accelerationZ > 2)
	{
		now.key(true,40);
	}
	else if (accelerationZ < -2)
	{
		now.key(true,38);
	}
	else
	{
		now.key(false,38);
	}

    }
	
},2000);	
	
	
	$(document).keydown(function(e)
	{
		game.key_down(e);
		
	});
	
	$(document).keyup(function(e)
	{
		game.key_up(e);
		
	});
	
	//Override a few functions of class b2ContactListener
	b2ContactListener.prototype.BeginContact = function (contact) 
	{
	
		game.collision_count++;
		var bodyA = contact.GetFixtureA().GetBody();
	}
   	b2ContactListener.prototype.EndContact = function (contact) 
   	{
   		
   	}
	
});
