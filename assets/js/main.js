var TMAX = 3;
var TMX = new Array(TMAX);
var NON = 0;
var RTL = 1;
var LTR = TMAX - RTL;
var transition = NON;


/* Document ready handler */

function onReady()
{
	var width = $(document).width();
	TMX[RTL] = [width, 0];
	TMX[LTR] = [-width, 0];
	
	$('.tab-button').click(function()
	{
		$('.tab-button.active').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.tab-button1').click(function()
	{
		$('.tab-button1.active').removeClass('active');
		$(this).addClass('active');
	});
	
	if(window.location.hash != '') window.location.hash = '';
	setTimeout(function()
	{ 
		$('#home').addClass('active').show(0);
		$('#splash').fadeOut(500, function() { $(this).remove(); });
	}, 2000);

	//var fbid = window.localStorage.getItem("key3");
	var username = window.localStorage.getItem("key");
	var password = window.localStorage.getItem("key2");
	if(username){    //alert(1)
		autoLogin(username, password);
	}
}

function onMonthChange()
{
	$('.day[data-time="1437314400000"]').addClass('event');
	$('.day[data-time="1438264800000"]').addClass('event');
	$('.day').click(function()
	{
		$('.events').stop().hide(0);
		if($(this).attr('data-time') == '1437314400000')
		{
			$('.events .event-item').remove();
			$('.events').append('<div class="event-item">8:00am - School Opening</div>').fadeIn(300);
		}
		else if($(this).attr('data-time') == '1438264800000')
		{
			$('.events .event-item').remove();
			$('.events').append('<div class="event-item">9:00am - Team Building</div>').fadeIn(300);
		}
	});
	
	$('.next, .prev').click(function()
	{
		$('.events').stop().hide(0);
		setTimeout(onMonthChange, 100);
	});
}


/* Window load handler */

function onLoad()
{
	$(window).bind('hashchange', hashChangeHandler);
	document.addEventListener('backbutton', backButtonHandler, false);
}


/* Hash change handler */

function hashChangeHandler()
{
	eval($('.page.active').attr('onClose'));
	if(transition)
		$('.page.active').stop().removeClass('active').animate({ left:TMX[TMAX-transition][0], top:TMX[TMAX-transition][1] }, { easing:'easeOutQuint', duration:300, complete:function() { $(this).hide(0); }});
	else
		$('.page.active').stop().removeClass('active').hide(0);
	
	var hash = window.location.hash;
	if(hash == '' || hash == '#') hash = '#home';
	if(transition)
		$(hash).stop().addClass('active').css({ left:TMX[transition][0], top:TMX[transition][1], display:'block' }).animate({ left:0, top:0 }, { easing:'easeOutQuint', duration:300 });
	else
		$(hash).stop().addClass('active').css({ left:0, top:0, display:'block' });
	eval($(hash).attr('onOpen'));
}


/* Back button handler */
var backCount = 0;
var hasPushPage = false;
function backButtonHandler(evt)
{
	evt.preventDefault();
	evt.stopPropagation();
	if(window.location.hash == '#home' || window.location.hash =='#profile' || !hasPushPage){
		backCount++;
		if(backCount >= 2) navigator.notification.confirm("Are you sure want to exit?", onConfirmExit, "Confirmation", "Yes,No"); 
		return;
	} else {
		popPage();
	}
}

function onConfirmExit(button) {
    if(button==2){ //If User select a No, then return back;
        return;
    }else{
        navigator.app.exitApp(); // If user select a Yes, quit from the app.
    }
}

/* Push page */
function pushPage(id, animation)
{
	backCount = 0;
	transition = (animation ? animation : NON);
	window.location.hash = id;
}

/* Pop page */
function popPage()
{
	backCount = 0;
	transition = (transition ? TMAX - transition : NON);
	window.history.back();
}

/* Login button clicked */

function onLogin()
{
	var username = $.trim($('#login #username').val());
	var password = $('#login #password').val();
	
	if(username == '')
	{
		navigator.notification.alert('Please enter your username', function()
		{
			$('#login #username').focus();
		}, 'Missing info');
		return;
	}
	if(password == '')
	{
		navigator.notification.alert('Please enter your password', function()
		{
			$('#login #password').focus();
		}, 'Missing info');
		return;
	}
	
	loginCallback = function()
	{
		pushPage('profile', LTR);
	};
	login(username, password);
}


/* Logout button clicked */

function onLogout()
{
	logout();
	/*navigator.notification.confirm
	(
		'Do you want to logout?',
		function(buttonIndex)
		{
			if(buttonIndex == 1) logout();
		},
		'Confirm logout',
		['Logout', 'Cancel']
	);*/
}

function onfbLogout()
{
	navigator.notification.confirm
	(
		'Do you want to logout?',
		function(buttonIndex)
		{
			if(buttonIndex == 1) fblogout();logout();
		},
		'Confirm logout',
		['Logout', 'Cancel']
	);
}
/* Register button clicked */

function onRegister()
{
	var fullName	= $.trim($('#register #full-name').val());
	var gender		= $('#register #gender').val();
	var dob			= $('#register #dob').val();
	var mobile		= $.trim($('#register #mobile').val());
	var email		= $.trim($('#register #email').val());
	var username	= $.trim($('#register #user-name').val());
	var password	= $.trim($('#register #password').val());
	var password2	= $.trim($('#register #password2').val());

	if(fullName == '')
	{
		navigator.notification.alert('Please enter your full name', function()
		{
			$('#register #full-name').focus();
		}, 'Missing info');
		return;
	}
	if(username == '')
	{
		navigator.notification.alert('Please enter your user name', function()
		{
			$('#register #user-name').focus();
		}, 'Missing info');
		return;
	}
	if(!isPhoneNumber(mobile))
	{
		navigator.notification.alert('Please enter your valid mobile number', function()
		{
			$('#register #mobile').focus();
		}, 'Missing info');
		return;
	}
	if(!isEmailAddress(email))
	{
		navigator.notification.alert('Please enter your valid email address', function()
		{
			$('#register #email').focus();
		}, 'Missing info');
		return;
	}
	if(password == '' || password.length < 6)
	{
		navigator.notification.alert('Please enter your password with at least 6 characters', function()
		{
			$('#register #password').focus();
		}, 'Error');
		return;
	}
	if(password2 != password)
	{
		navigator.notification.alert('Password does not match', function()
		{
			$('#register #password2').focus();
		}, 'Error');
		return;
	}
	
	register(fullName, username, password, mobile, email, dob, gender);
}



/* Validate email address */

function isEmailAddress(email)
{
	var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}


/* Validate phone number */

function isPhoneNumber(num)
{
	var intRegex = /[0-9 -()+]+$/;
	return (num.length >= 9 && intRegex.test(num));
}


/* Execution */

$(onReady);
$(window).load(onLoad);