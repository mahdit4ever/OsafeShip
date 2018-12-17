var loginCallback;
var loggedIn = false;
var userID;

var pushNotification;
var RegID;
var deviceID;
var messagePage;

/* Notification */

document.addEventListener("deviceready", function(){
	pushNotification = window.plugins.pushNotification;
    
	if ( device.platform == 'android' || device.platform == 'Android'){
		pushNotification.register(
		successHandler,
		errorHandler,
		{
			"senderID":"52365757768",
			"ecb":"onNotification"
		});
	} else {
		pushNotification.register(
		tokenHandler,
		errorHandler,
		{
			"badge":"true",
			"sound":"true",
			"alert":"true",
			"ecb":"onNotificationAPN"
		});
	}
	
	function successHandler (result) {
		//alert('result = ' + result);
	}
	
	function errorHandler (error) {
		//alert('error = ' + error);
	}
	
	function tokenHandler (result) {
		// Your iOS push server needs to know the token before it can push to this device
		// here is where you might want to send it the token for later use.
		//alert('device token = ' + result);
		RegID = result;
	}

});

function onNotificationAPN (event) {
	if ( event.alert )
	{
		navigator.notification.alert(event.alert);
	}

	if ( event.sound )
	{
		var snd = new Media(event.sound);
		snd.play();
	}

	if ( event.badge )
	{
		pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
	}
}

function onNotification(e) {
	switch( e.event )
	{
	case 'registered':
		if ( e.regid.length > 0 )
		{
			//console.log("regID = " + e.regid);
			//alert("regID = " + e.regid);
			RegID = e.regid;
		}
	break;

	case 'message':
		if ( e.foreground )
		{
			
		}
		else
		{  // otherwise we were launched because the user touched a notification in the notification tray.
			if ( e.coldstart )
			{	
				//alert(e.payload.message);
				var temp = e.payload.message;
				if(temp.indexOf("message") > -1){
					messagePage = "message";
				} 
			}
			else
			{
				//alert(e.payload.message);
			}
		}
	break;

	case 'error':
		
	break;

	default:
		
	break;
  }
}

function updateDeviceId(){
	$.ajax(
	{
		url: 'http://mobionfire.com/savenow_api/register_device.php',
		method: 'post',
		cache: false,
		data:
		{
			user: uid,
			device: deviceID
		}
	})
	.done(function(response){
				  
	})
	.fail(function(){
	});
}


function isLogin(){
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
		{
			pushPage('profile', LTR);
		}, 'User not found');
		return false;
	} else return true;
}

/* Login with username */

function login(username, password)
{
	$('#login').addClass('loading');
	$('#login .content').hide();

	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/telelogin.php',
		method: 'get',
		cache: false,
		data:
		{
			email: username,
			password: password
		}
		})
	    .done(function(response){
			var json = $.parseJSON(response);
			if(json.length > 1 && json[1].status == 'Active')
			{
				loggedIn = true;
				//navigator.notification.alert('Login', null, 'Successful');
				window.localStorage.setItem("key", username);
				window.localStorage.setItem("key2", password);
				
				deviceID = json[1].deviceid;
				window.uid= json[1].index;
				window.myphone = json[1].mobile;
				window.myemail = json[1].email;
				window.myage = json[1].age;
				

				deviceID = RegID;
				updateDeviceId();
				
				var html = '<div class="item clearfix"><div style="border-bottom: 2px solid #eee; padding-bottom: 20px;"><img class="avatar" id="profile_pic" onClick="profile_picChange();playMP3(); vibrate();" src="http://sunday-tech.com/auto/upload/' + json[1].photo_url + '"></div>';
				
				html += '<div><table width="100%">';
				
				html += '<td style="width:15%; border:none"><div class="bio3" style><font size="5"><i class="icon ion-android-person"></i></font></div></td><td ><b>Name</b></td><td style="text-align:right; width:60%;">' + json[1].name + '</td></tr>';
				
				//html += '<tr><td style="border:none"><div class="bio3" style><font size="5"><i class="icon ion-male"></i></font></div></td><td><b>Gender</b></td><td style="text-align:right">' + json[1].gender + '</td></tr>';
				
				html += '<tr><td style="border:none"><div class="bio3" style><font size="5"><i class="icon ion-ios-email"></i></font></div></td><td><b>Email</b></td><td style="text-align:right">' + json[1].email + '</td></tr> ';
				
				html += '<tr><td><div class="bio3" style><font size="5"><i class="icon ion-android-call"></i></font></div></td><td><b>Mobile</b></td><td style="text-align:right">' + json[1].mobile + '</td></tr>';
				
				//html +='<tr><td><div class="bio3" style><font size="5"><i class="icon ion-ios-star-half"></i></font></div></td><td><b>Point</b></td><td style="text-align:right">' + json[1].point + '</td></tr>';
				
				html +='</table></div></div>';
				
				//html += '<a class="button col-2 mb-18" onClick="pushPage(\'inbox\', RTL);loadinbox();playMP3(); vibrate();"><i style="float:left" class="icon ion-chatbox-working"></i> Inbox</a>';
				
				html += '<a class="button col-2 mb-18" onClick="profile_edit();playMP3(); vibrate();"><i style="float:left" class="icon ion-compose"></i> Edit Profile</a>';
				
				html += '<a class="button col-5 mb-18" onClick="onLogout();playMP3(); vibrate();"><i style="float:left" class="icon ion-log-out"></i> Logout</a>';
				
				html += '<a class="button fit mb-18" style="background:#28272b;" onClick="pushPage(\'change_password\', RTL);playMP3(); vibrate();"><i style="float:left" class="icon ion-locked"></i> Change Password</a>';
				
				$('#profile .content').html(html);
				
				$('#login input').val('');
				if(loginCallback)
				{
					loginCallback();
					loginCallback = null;
				}
			}
			else
			{
				navigator.notification.alert('Incorrect username or password!', function()
				{
					$('#login input').val('');
				}, 'Error');
			}
			$('#login').removeClass('loading');
			$('#login .content').show();
		})
		.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#login').removeClass('loading');
		$('#login .content').show();
	});
}

/* Auto Login */

function autoLogin(username, password)
{
	$('#login').addClass('loading');
	$('#login .content').hide();
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/telelogin.php',
		method: 'get',
		cache: false,
		data:
		{
			email: username,
			password: password
		}
		})
	    .done(function(response){
			var json = $.parseJSON(response);
			if(json.length > 1 && json[1].status == 'Active')
			{
				loggedIn = true;
				
				window.localStorage.setItem("key", username);
				window.localStorage.setItem("key2", password);
				
				window.uid= json[1].index;
				window.myphone = json[1].mobile;
				window.myemail = json[1].email;
				window.myage = json[1].age;
				

				var html = '<div class="item clearfix"><div style="border-bottom: 2px solid #eee; padding-bottom: 20px;"><img class="avatar" id="profile_pic" onClick="profile_picChange();playMP3(); vibrate();" src="http://sunday-tech.com/auto/upload/' + json[1].photo_url + '"></div>';
				
				html += '<div><table width="100%">';
				
				html += '<td style="width:15%; border:none"><div class="bio3" style><font size="5"><i class="icon ion-android-person"></i></font></div></td><td ><b>Name</b></td><td style="text-align:right; width:60%;">' + json[1].name + '</td></tr>';
				
				//html += '<tr><td style="border:none"><div class="bio3" style><font size="5"><i class="icon ion-male"></i></font></div></td><td><b>Gender</b></td><td style="text-align:right">' + json[1].gender + '</td></tr>';
				
				html += '<tr><td style="border:none"><div class="bio3" style><font size="5"><i class="icon ion-ios-email"></i></font></div></td><td><b>Email</b></td><td style="text-align:right">' + json[1].email + '</td></tr> ';
				
				html += '<tr><td><div class="bio3" style><font size="5"><i class="icon ion-android-call"></i></font></div></td><td><b>Mobile</b></td><td style="text-align:right">' + json[1].mobile + '</td></tr>';
				
				//html +='<tr><td><div class="bio3" style><font size="5"><i class="icon ion-ios-star-half"></i></font></div></td><td><b>Point</b></td><td style="text-align:right">' + json[1].point + '</td></tr>';
				
				html +='</table></div></div>';
				
				//html += '<a class="button col-2 mb-18" onClick="pushPage(\'inbox\', RTL);loadinbox();playMP3(); vibrate();"><i style="float:left" class="icon ion-chatbox-working"></i> Inbox</a>';
				
				html += '<a class="button col-2 mb-18" onClick="profile_edit();playMP3(); vibrate();"><i style="float:left" class="icon ion-compose"></i> Edit Profile</a>';
				
				html += '<a class="button col-5 mb-18" onClick="onLogout();playMP3(); vibrate();"><i style="float:left" class="icon ion-log-out"></i> Logout</a>';
				
				html += '<a class="button fit mb-18" style="background:#28272b;" onClick="pushPage(\'change_password\', RTL);playMP3(); vibrate();"><i style="float:left" class="icon ion-locked"></i> Change Password</a>';
				
				$('#profile .content').html(html);
				$('#login input').val('');
			}
			$('#login').removeClass('loading');
			$('#login .content').show();
		
				if(messagePage == "message"){
					setTimeout(pm_checkPage, 3000);
					//pm_checkPage();
				} 
		})
		.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#login').removeClass('loading');
		$('#login .content').show();
	});
}

/* Register */

function register(fullName, username, password, mobile, email, dob, gender)
{
	$('#register').addClass('loading');
	$('#register .content').hide();
	$.ajax(
	{
		url: '',
		method: 'get',
		cache: false,
		data:
		{
			name: fullName,
			username: username,
			password: password,
			mobile: mobile,
			email: email,
			birthday: dob,
			gender: gender
		}
	})
	.done(function(response)
	{
		if($.trim(response) == '0')
		{
			$('#register input').val('');
			$('#register #gender').val('Male');
			navigator.notification.alert('Your account has been successfully registered. It is now pending for admin approval.', function()
			{
				pushPage('login', LTR);
			}, 'Successful');
		}
		else if($.trim(response) == '1')
		{
			navigator.notification.alert('Your username has already been registered. Please login or try another username.', null, 'Error');
		}
		else
		{
			navigator.notification.alert('Your email has already been registered. Please login or try another email.', null, 'Error');
		}
		$('#register').removeClass('loading');
		$('#register .content').show();
	})
	.fail(function()
	{
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#register').removeClass('loading');
		$('#register .content').show();
	});
}


/* Change Password */

function password_change(){
	var oldPassword = $.trim($('#change_password #password-old').val());
	var password = $.trim($('#change_password #password').val());
	var password2 = $.trim($('#change_password #password2').val());
	
	if(oldPassword != window.localStorage.getItem("key2"))
	{
		navigator.notification.alert('Your old password is incorrect!', function()
		{
			$('#change_password #password-old').focus();
		}, 'Error');
		return;
	}
	if(password == '' || password.length < 6)
	{
		navigator.notification.alert('Your password must have at least 6 characters', function()
		{
			$('#change_password #password').focus();
		}, 'Error');
		return;
	}
	if(password2 != password)
	{
		navigator.notification.alert('Password does not match', function()
		{
			$('#change_password #password2').focus();
		}, 'Error');
		return;
	}
	
	$('#change_password').addClass('loading');
	$('#change_password .content').hide();
	
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/tel_password_change.php',
		method: 'post',
		cache: false,
		data:
		{
			user: uid,
			password: password
		}
	})
	.done(function(response){
		if(response != '')
		{
			navigator.notification.alert('You have successfully changed your password, please login using your new password', function()
			{
				
			}, 'Successful');
		}
		$('#change_password input').val('');
		logout();
		$('#change_password').removeClass('loading');
		$('#change_password .content').show();
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#change_password').removeClass('loading');
		$('#change_password .content').show();
	});
}

function profile_edit(){
	pushPage('edit_profile');
	$('#edit_profile #mobile').val(window.myphone);
	$('#edit_profile #email').val(window.myemail);
}

function profile_update(){
	var mobile = $.trim($('#edit_profile #mobile').val());
	var email = $.trim($('#edit_profile #email').val());
	
	if(!isPhoneNumber(mobile))
	{
		navigator.notification.alert('Please enter your valid mobile number in the format of 60171234567', function()
		{
			$('#edit_profile #mobile').focus();
		}, 'Error');
		return;
	}
	if(!isEmailAddress(email))
	{
		navigator.notification.alert('Please enter your valid email address', function()
		{
			$('#edit_profile #email').focus();
		}, 'Error');
		return;
	}
	
	$('#edit_profile').addClass('loading');
	$('#edit_profile .content').hide();
	
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/tel_profile_update.php',
		method: 'post',
		cache: false,
		data:
		{
			user: uid,
			phone: mobile,
			email: email
		}
	})
	.done(function(response){
		if(response != '')
		{
			navigator.notification.alert('You have successfully updated your profile', function()
			{
				popPage();
			}, 'Successful');
		}
		var username = window.localStorage.getItem("key");
		var password = window.localStorage.getItem("key2");
		login(username, password);
		$('#edit_profile').removeClass('loading');
		$('#edit_profile .content').show();
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#edit_profile').removeClass('loading');
		$('#edit_profile .content').show();
	});
}


/* Logout */

function logout()
{
	//window.localStorage.clear();
	localStorage.removeItem("key");
	localStorage.removeItem("key2");
	clearUserInfo();
	loggedIn = false;
}

function profile_picChange(){
	navigator.notification.confirm
	(
		'Do you want to capture a photo or upload a photo?',
		function(buttonIndex)
		{
			if(buttonIndex == 1) profile_postAddPic();
			if(buttonIndex == 2) profile_postGetPhoto();
		},
		'Photo Option',
		['Capture', 'Upload']
	);
}

function profile_postAddPic() {
	
    navigator.camera.getPicture (profile_cameraSuccess, profile_cameraFail, 
    { quality: 30,  
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 800,
      correctOrientation: true
      //saveToPhotoAlbum: true
	});

    // A callback function when snapping picture is success.
    function profile_cameraSuccess (imageData) {
        profile_updatePic(imageURI);
    }

    // A callback function when snapping picture is fail.
    function profile_cameraFail (message) {
        //alert ('Error occured: ' + message);
    }
}

function profile_postGetPhoto() {
      // Retrieve image file location from specified source
	navigator.camera.getPicture(profile_onPhotoURISuccess, profile_onPhotoURIFail, 
	{ quality: 30,
      destinationType: navigator.camera.DestinationType.FILE_URI,
	  encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 800,
      correctOrientation: true,
      sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
		
	function profile_onPhotoURISuccess(imageURI) {
		profile_updatePic(imageURI);
	}
	
	function profile_onPhotoURIFail(message) {
		//alert('Failed because: ' + message);
	}
}


function profile_updatePic(src)
{
	var imageURI = src;
	
	$('#profile').addClass('loading');
	$('#profile .content').hide();
	
	var date_time = new Date();
	
    //set upload options
	var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=userID + "_" + date_time.getFullYear() + "-" + date_time.getMonth() + "-" + date_time.getDate() + "_" + date_time.getHours() + "-" + date_time.getMinutes() + "-" + date_time.getSeconds() + ".jpg";
        options.mimeType="image/jpeg";
        
    var params = new Object();
        params.value1 = userID;
 
        options.params = params;
        options.chunkedMode = false;
      
    var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI ("http://sunday-tech.com/resident/api/profile_pic.php"), win, fail, options);
		
	function win(r) {
		$('#profile').removeClass('loading');
		$('#profile .content').show();
		navigator.notification.alert('Your profile picture has been updated.', null, 'Successful');
		var libraryImage = document.getElementById('profile_pic');
		libraryImage.src = imageURI;
    }

    function fail(error) {
		$('#profile').removeClass('loading');
		$('#profile .content').show();
        navigator.notification.alert('An error has occurred, please try again later.', null, 'Error');
	}	
}

function password_retrieve()
{
	var username = $.trim($('#retrieve_password #username').val());

	if(username == '')
	{
		navigator.notification.alert('Please enter your username.', function()
		{
			$('#retrieve_password #username').focus();
		}, 'Missing info');
		return;
	}
	
	$('#retrieve_password').addClass('loading');
	$('#retrieve_password .content').hide();
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/retrieve_password.php',
		method: 'post',
		cache: false,
		data:
		{
			email: username,
		}
	})
	.done(function(response){
		var json = $.parseJSON(response);
		var password;
		var mobile;
		if(json.length > 1){
			password = json[1].password;
			mobile = json[1].mobile;
			password_sendSMS(mobile, password);
			navigator.notification.alert('Your password has been sent to your phone.', null, 'Successful');
			$('#retrieve_password').removeClass('loading');
			$('#retrieve_password .content').show();
			popPage();
		}
		else {
			navigator.notification.alert('Username not found, please try again or contact admin for username retrieval.', null, 'Error');
			$('#retrieve_password').removeClass('loading');
			$('#retrieve_password .content').show();
		}
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#retrieve_password').removeClass('loading');
		$('#retrieve_password .content').show();
	});
}

function password_sendSMS(mobile, password)
{
	var content = 'Your password for Iremi SRMS mobile application account is ' + password;
	content = encodeURI(content);
	
	$.ajax(
	{
		url: 'http://sunday-tech.com/iteksi/api/server_receiver.php',
		method: 'get',
		cache: false,
		data:
		{
			port: 'COM4',
			type: '1',
			msisdn: mobile,
			content: content
		}
	})
	.done(function(response){
		
	})
	.fail(function(){
		
	});
}


/* Show login, register buttons */

function clearUserInfo()
{
	var html = '<div class="mb-18">You are not logged in.</div>';	
	html += '<a class="button fit mb-18" onClick="pushPage(\'login\', RTL);playMP3(); vibrate();"><i style="float:left;" class="icon ion-log-in"></i> Login</a>';

	$('#profile .content').html(html);
}
   
/* -------------------------------------------------- Sound -------------------------------------------------- */	 

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	document.querySelector("#playMp3").addEventListener("touchend", playMP3, false);
};

function playMP3() {
    var mp3URL = getMediaURL("assets/sounds/Effect_Tick.ogg");
    var media = new Media(mp3URL, null, mediaError);
    media.play();
}

function getMediaURL(s) {
    if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}

function mediaError(e) {
    alert('Media Error');
    alert(JSON.stringify(e));
}

/* -------------------------------------------------- Vibrate -------------------------------------------------- */

function vibrate() {
	navigator.notification.vibrate(50);
	}

////////////////////////////////////////////////////////////////////////////////////////
/* Leave Functions */
////////////////////////////////////////////////////////////////////////////////////////

var leaveEntry;
var leaveCurrentPage = 1;
var leaveJson;

function leave_login(){
	if(isLogin()){
		pushPage('leave', RTL); 
	}
}

function leave_checkPage()
{
	$('#leave').addClass('loading');
	$('#leave .content').hide();
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/leave_counter.php',
		method: 'post',
		cache: false,
		data:
		{
			user: uid
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		if(json[1].total > 0)
		{
			leaverEntry = json[1].total;
		}
		
		leave_load();
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#leave').removeClass('loading');
		$('#leave .content').show();
	});
}


function leave_load()
{	
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/leave_list.php',
		method: 'post',
		cache: false,
		data:
		{
			page: leaveCurrentPage,
			user: uid
		}
	})
	.done(function(response){
		leaveJson = $.parseJSON(response);
		var html = '';
		if(leaveJson.length > 1){
			for(var i = 1; i < leaveJson.length; i++){
				if(leaveJson[i].status == "Pending")
				{
				html += '<div class="item clearfix" onClick="leave_onDetails(' + i + '); pushPage(' + "'leave-detail'" + ', RTL); playMP3();vibrate();">';
				html += '<div class="item-desc mt-10"><div class="title">' + leaveJson[i].date_from + ' To ' + leaveJson[i].date_to + '</div><div class="date"></div><div class="mt-10"><b>Status:</b> ' + leaveJson[i].status +'</div></div><div class="item-info1"></div></div>';
				}
				else if(leaveJson[i].status == "Approved")
				{
				html += '<div class="item clearfix" onClick="leave_onDetails(' + i + '); pushPage(' + "'leave-detail'" + ', RTL); playMP3();vibrate();">';
				html += '<div class="item-desc mt-10"><div class="title">' + leaveJson[i].date_from + ' To ' + leaveJson[i].date_to + '</div><div class="date"></div><div class="mt-10"><b>Status:</b> ' + leaveJson[i].status +'</div></div><div class="item-info2"></div></div>';
				}
			}
			
			if(leaveEntry > 10){
				html += '<select id="developer_page" onchange="leave_pageNavigation()">';
				var page = 1;
				for(var i = leaveEntry; i > 0; i -=10){
					if(page == leaveCurrentPage){
						html += '<option value="' + page + '" selected>' + 'Page ' + page + '</option>';
					}
					else html += '<option value="' + page + '">' + 'Page ' + page + '</option>';
					page++;
				}
				html += '</select>';
			}
		}
		else{
			html += '<div style="text-align: center"><b>No results found.</b></div>';
		}
		$('#leave .content').html(html);
		$('#leave .content').show();
		$('#leave').removeClass('loading');
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#leave .content').show();
		$('#leave').removeClass('loading');
	});
}


function leave_pageNavigation()
{
	var pageSelected = document.getElementById("leave_page")
	leaveCurrentPage = pageSelected.options[pageSelected.options.selectedIndex].value;
	leave_load();
	$('#leave').addClass('loading');
	$('#leave .content').hide();
}


function leave_onDetails(index)
{
	var html = '<div class="item clearfix">';
		html += '<div class="title">' + leaveJson[index].date_from + ' To ' + leaveJson[index].date_to + '</div>';
		html += '<div class="mt-10"><b>Status:</b> ' + leaveJson[index].status + '</div>';
		
		html += '</div>';
		
	$('#leave-detail .content').html(html);
}
/* -------------------------------------------------- Leave Register -------------------------------------------------- */

function leave_register(){
	
	var fdate = document.getElementById("from_date").value;
	var tdate = document.getElementById("to_date").value;
	
	fdate = encodeURI(fdate);
	tdate = encodeURI(tdate);
	
	
	if(fdate == ""){
		navigator.notification.alert('Plesae select date from.', function()
		{
			$('#leave-request #from_date').focus();
		}, 'Missing info');
		return;
	}
	
	if(tdate == ""){
		navigator.notification.alert('Plesae select date to.', function()
		{
			$('#leave-request #to_date').focus();
		}, 'Missing info');
		return;
	}
	
	$('#leave-request').addClass('loading');
	$('#leave-request .content').hide();
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/leave_register.php',
		method: 'post',
		cache: false,
		data:
		{
			sales: uid,
			date_from: fdate,
			date_to: tdate
		}
	})
	.done(function(response)
	{
		if($.trim(response) == '0')
		{
			$('#leave-request').removeClass('loading');
			$('#leave-request .content').show();
			navigator.notification.alert('You have successfully registered.', null, 'Successful');
			
			$('#from_date').val(null);
			$('#to_date').val(null);
			popPage();
		}
		else
		{
			navigator.notification.alert('An error has occur, please try again later.', null, 'Error');
			$('#leave-request').removeClass('loading');
			$('#leave-request .content').show();
		}
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#leave-request').removeClass('loading');
		$('#leave-request .content').show();
	});
}

/* -------------------------------------------------- Date Pick -------------------------------------------------- */
function datePick(dateId){
	datePicker.show({
		date: new Date(),
		mode: 'date',
		allowFutureDates: false
	}, function(date){  
		var dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
		$(dateId).val(dateString);
		if(dateId == '#mcl_fromDate') window.mcl_fromDate = dataString;
		if(dateId == '#mcl_toDate') window.mcl_toDate = dataString;
	});
}

function leave_book_datePick(dateId){
	var today = new Date();
	if($(dateId).val()==''){
		datePicker.show({
			date: new Date(),
			mode: 'date',
			minDate: today
		}, function(date){  
			var dateString = date.getFullYear() + "-" + facility_book_addZero(date.getMonth()+1) + "-" + facility_book_addZero(date.getDate());
			$(dateId).val(dateString);
		});
	}
	else{
		var chosenDate = $(dateId).val();
		datePicker.show({
			date: new Date('"' + chosenDate + '"'),
			mode: 'date',
			minDate: today
		}, function(date){  
			var dateString = date.getFullYear() + "-" + facility_book_addZero(date.getMonth()+1) + "-" + facility_book_addZero(date.getDate());
			$(dateId).val(dateString);
		});
	}
}
/* -------------------------------------------------- Check In Page Functions -------------------------------------------------- */
 
// Find user location at checkin page 
function ci_findLocation() {
	var output = document.getElementById("ci_locationStatus");
		output.innerHTML ="Searching for location...";	
	
	navigator.geolocation.getCurrentPosition(ci_onSuccess, ci_onFail, {maximumAge: 0, timeout: 5000, enableHighAccuracy:true});
			
	function ci_onSuccess(position) {
		
		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;
		//var timestamp = new Date (position.timestamp);
		
		window.ci_latitude = latitude;
		window.ci_longitude = longitude;
		//window.ci_timestamp = timestamp;	
	
		$('#ci_latitude').val(position.coords.latitude);
		$('#ci_longitude').val(position.coords.longitude);
		//$('#ci_timestamp').val(new Date (position.timestamp));
				
		var img = document.getElementById('ci_mapImg');
		var imgWidth = screen.width - 60;
		var imgHeight = Math.round(screen.width * 0.6);
		img.src = "http://maps.google.com/maps/api/staticmap?" + latitude + "," + longitude + "&zoom=15&size=" + imgWidth + "x" + imgHeight + "&maptype=roadmap&markers=" + latitude + "," + longitude;
		img.style.display = 'block';
		
		output.innerHTML ="Location found";
	};
			
	function ci_onFail() {
		navigator.notification.alert('Unable to retrieve your location, please enable your GPS and try again.', null, 'GPS not found');
		var output = document.getElementById("ci_locationStatus");
		output.innerHTML ="Location not found";
	};			
}


// Clear content of checkin page 
function ci_clearContent(){
	window.ci_latitude = null;
	window.ci_longitude = null;
	//window.ci_timestamp = null;
	window.ci_company = null;
	window.ci_description = null;
	$('#ci_latitude').val(null);
	$('#ci_longitude').val(null);
	//$('#ci_timestamp').val(null);
	$('#ci_company').val(null);
	$('#ci_description').val(null);
	var output = document.getElementById("ci_locationStatus");
		output.innerHTML = null;
	var img = document.getElementById('ci_mapImg');
		img.style.display = 'none';
}


// Submit checkin function
function ci_submit(){
	
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}
	
	if(window.ci_latitude == null){
		navigator.notification.alert('Please check in your location first.', null, 'Location not found');
		return; 
	}
	
	window.ci_company = document.getElementById("ci_company").value;
	window.ci_description = document.getElementById("ci_description").value;
	
	if(window.ci_company == ""){
		navigator.notification.alert('Please key in visiting company name or place.', function()
		{
			$('#checkin #ci_company').focus();
		}, 'Missing info');
		return; 
	}
	
	if(window.ci_description == ""){
		navigator.notification.alert('Please enter description.', function()
		{
			$('#checkin #ci_description').focus();
		}, 'Missing info');
		return; 
	}
	
	$('#checkin').addClass('loading');
	$('#checkin .content').hide();
	
	$.ajax(
	{
		
		url: 'http://sunday-tech.com/almushin/api/attendance_log.php?lang='+ ci_latitude +'&long='+ ci_longitude +'&company='+ ci_company +'&user='+ userIndex + '&description='+ ci_description,
		data:
		{

		}
	})
	.done(function(data)
	{
		ci_clearContent();
		$('#notes').html('');
		if($.trim(data) == '0')
			navigator.notification.alert('You have successfully checked in.', null, 'Successful');
		else
			navigator.notification.alert('Check in was denied by server, please contact administrator about this issue.', null, 'Error');
	})
	.fail(function()
	{
		$('#notes').html('');
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
	});
	
	$('#checkin').removeClass('loading');
	$('#checkin .content').show();
}




////////////////////////////////////////////////////////////////////////////////////////
/* Sales Functions */
////////////////////////////////////////////////////////////////////////////////////////

var saleEntry;
var saleCurrentPage = 1;
var saleJson;

function sale_checkPage()
{
	$('#sale').addClass('loading');
	$('#sale .content').hide();
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/sale_counter.php',
		method: 'post',
		cache: false,
		data:
		{
			sales: uid
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		if(json[1].total > 0)
		{
			saleEntry = json[1].total;
		}

		sale_load(); 
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#sale').removeClass('loading');
		$('#sale .content').show();
	});
}


function sale_load()
{	
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/sale_list.php',
		method: 'post',
		cache: false,
		data:
		{
			page: saleCurrentPage,
			sales: uid
		}
	})
	.done(function(response){
		saleJson = $.parseJSON(response);
		var html = '';
		
		if(saleJson.length > 1){

			for(var i = 1; i < saleJson.length; i++){
				html += '<div class="item clearfix", onClick="sale_onDetails(' + i + '); pushPage(' + "'sale_detail'" + '); vibrate(); playMP3();">';
				html += '<div class="item-desc" ><div class="title">' + saleJson[i].company_name + '</div><div class="date"><i style="padding-right:5px" class="icon ion-calendar"></i> ' + saleJson[i].date + '</div><br><div class="text"><b>Customer Name:</b> ' + saleJson[i].name + '<br><b>Status:</b> ' + saleJson[i].status + '</div></div><div class="item-info"></div></div>';
			}
			
			if(saleEntry > 10){
				html += '<select id="sale_page" onchange="sale_pageNavigation()">';
				var page = 1;
				for(var i = saleEntry; i > 0; i -=10){
					if(page == saleCurrentPage){
						html += '<option value="' + page + '" selected>' + 'Page ' + page + '</option>';
					}
					else html += '<option value="' + page + '">' + 'Page ' + page + '</option>';
					page++;
				}
				html += '</select>';
			}
		}
		else{
			html += '<div style="text-align: center"><b>No results found.</b></div>';
		}
		$('#sale .content').html(html);
		$('#sale .content').show();
		$('#sale').removeClass('loading');
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#sale .content').show();
		$('#sale').removeClass('loading');
	});
}


function sale_pageNavigation()
{
	var pageSelected = document.getElementById("sale_page")
	saleCurrentPage = pageSelected.options[pageSelected.options.selectedIndex].value;
	sale_load();
	$('#sale').addClass('loading');
	$('#sale .content').hide();
}


function sale_onDetails(index)
{

	var html = '<div class="item clearfix">';
		html += '<div class="title">' + saleJson[index].company_name + '</div>';
		html += '<div class="date"><i style="padding-right:5px" class="icon ion-calendar"></i> ' + saleJson[index].date + '</div><br>';
		
		
		html += '<div class="mt-10 first-desc"><b>Name:</b><br> ' + saleJson[index].name + '</div>';
		html += '<div class="mt-10 text"><b>Status:</b><br> ' + saleJson[index].status + '</div>';
		html += '<div class="mt-10 text"><b>Contact No:</b><br> ' + saleJson[index].contact + '</div><br>';
		
		html += '<div class="mt-10 first-desc"><b>Product:</b><br> ' + saleJson[index].product_quantity + '</div>';
		html += '<div class="mt-10 text"><b>Discount:</b><br>RM ' + saleJson[index].discount + '</div>';
		html += '<div class="mt-10 text"><b>Total:</b><br>RM ' + saleJson[index].total + '</div><br>';
		
		html += '<div class="mt-10 first-desc"><b>Payment Method:</b><br> ' + saleJson[index].payment_method + '</div>';
		html += '<div class="mt-10 text"><b>First Payment:</b><br>RM ' + saleJson[index].first_payment + '</div>';
		html += '<div class="mt-10 first-desc"><b>Pending Payment:</b><br>RM ' + saleJson[index].pending_payment + '</div>';
		
		html += '<div class="mt-10 text"><b>Warranty:</b><br> ' + saleJson[index].warranty + '</div>';
		
		html += '<br><div class="mt-10 text"><b>Remarks:</b><br> ' + saleJson[index].remarks + '</div></div>';

		
		html += '<a href="tel:' + saleJson[index].contact + '" onClick="playMP3();" class="button fit mb-18"><i style="float:left;" class="icon ion-android-call"></i>  Call</a>';
		
	$('#sale_detail .content').html(html);
}


function sale_register(){
	
	var c_name = document.getElementById("customer_name").value;
	var product = document.getElementById("searchproduct").value;
	var quanity = document.getElementById("number").value;
	var contact = document.getElementById("contact").value;
	var discount = document.getElementById("discount").value;
	var total = document.getElementById("total").value;
	var remarks = document.getElementById("remark").value;
	
	c_name = encodeURI(c_name);
	product = encodeURI(product);
	quanity = encodeURI(quanity);
	contact = encodeURI(contact);
	discount = encodeURI(discount);
	total = encodeURI(total);
	remarks = encodeURI(remarks);
	
	
	if(c_name == ""){
		navigator.notification.alert('Please enter customer name.', function()
		{
			$('#new_sale #customer_name').focus();
		}, 'Missing info');
		return;
	}
	
	if(product == ""){
		navigator.notification.alert('Please select product.', function()
		{
			$('#new_sale #searchproduct').focus();
		}, 'Missing info');
		return;
	}
	
	if(quanity == ""){
		navigator.notification.alert('Please enter quantity.', function()
		{
			$('#new_sale #number').focus();
		}, 'Missing info');
		return;
	}
	
	if(contact == ""){
		navigator.notification.alert('Please enter contact number.', function()
		{
			$('#new_sale #contact').focus();
		}, 'Missing info');
		return;
	}
	
	if(remarks == ""){
		navigator.notification.alert('Please enter your remarks.', function()
		{
			$('#new_sale #remark').focus();
		}, 'Missing info');
		return;
	}
	
	$('#new_sale').addClass('loading');
	$('#new_sale .content').hide();
	$.ajax(
	{
		url: 'http://sunday-tech.com/osafe/api/sale_register.php',
		method: 'post',
		cache: false,
		data:
		{
			telemarketer: window.telid,
			sales: uid,
			customer: window.custid,
			name: c_name,
			contact: contact,
			product_quantity: product + ":" + quanity + " , ",
			discount: discount,
			total: total,
			remarks: remarks
		}
	})
	.done(function(response)
	{
		if($.trim(response) == '0')
		{
			$('#new_sale').removeClass('loading');
			$('#new_sale .content').show();
			navigator.notification.alert('You have successfully registered your customer.', null, 'Successful');
			
			$('#customer_name').val(null);
			$('#searchproduct').val(null);
			$('#number').val(null);
			$('#contact').val(null);
			$('#discount').val(null);
			$('#total').val(null);
			$('#remark').val(null);
			
			popPage();
		}
		else
		{
			navigator.notification.alert('An error has occur, please try again later.', null, 'Error');
			$('#new_sale').removeClass('loading');
			$('#new_sale .content').show();
		}
	})
	.fail(function(){
		navigator.notification.alert('Wifi connection required.\nConnect to Wi-Fi network and try again.', null, 'No internet connection');
		$('#new_sale').removeClass('loading');
		$('#new_sale .content').show();
	});
}

function clearSalesInfo()
{
	$('#customer_name').val(null);
	$('#searchproduct').val('Select Product');
	$('#number').val('0');
	$('#contact').val(null);
	$('#discount').val(null);
	$('#total').val(null);
	$('#remark').val(null);


	$('#new_sale .content').html(html);
}

/* -------------------------------------------------- Product List -------------------------------------------------- */

function loadproduct()
{
	$.ajax(
	{
	//	url: 'http://localhost/kelakar/api/video_details.php?id=1',
	    url: 'http://sunday-tech.com/osafe/api/product_category.php',
		method: 'get',
		cache: false,
	})
	.done(function(response)
	{
			var json = $.parseJSON(response);
				
		    window.search_product= json[1].name;
			var object = document.getElementById('searchproduct');
    		object.value=window.search_product;
			var html = '';
			html += '<option>Select Product</option>';

			for(var i = 1; i < json.length; i++){
				html += '<option value="' + json[i].name + '">' + json[i].name + '</option>';
			}
		 	
			$('#searchproduct').html(html);
	})
	.fail(function()
	{
		
	});
}
