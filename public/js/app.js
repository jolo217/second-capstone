function createPost(title, content, author, image, successCallback, errorCallback) {
  $.ajax({
    url: '/posts',
    type: 'post',
    data: JSON.stringify({
    	author: {
   			firstName: author.firstName,
    		lastName: author.lastName
  		},
		title: title,
		content: content,
		image: image,
		created: Date.now()
	}),
	contentType: "application/json", dataType: 'json',
    success: successCallback,
    error: errorCallback,
  });
}

function getPosts(successCallback, errorCallback) {
  $.ajax({
    url: '/posts',
    type: 'get',
    success: successCallback,
    error: errorCallback,
  });
}

function deletePost(id, element) {
  $.ajax({
    url: '/posts/' + id,
    type: 'delete',
    success: function (data) {
       element.remove();
    },
    error: displayError,
  });
}

function accountSignin(username, password, successCallback, errorCallback) {
	$.ajax({
		url: '/login/',
		type: 'post',
		data: JSON.stringify({
			username: username,
			password: password
		}),
		contentType: "application/json", dataType: 'json',
    	success: successCallback,
    	error: errorCallback,
	});
}	

function accountCreate(firstName, lastName, username, password, email, password, confirmPassword, successCallback, errorCallback) {
	$.ajax({
		url: '/api/register/',
		type: 'post',
		data: JSON.stringify({
			firstName: firstName,
			lastName: lastName,
			username: username,
			email: email,
			password: password,
			confirmPassword: confirmPassword
		}),
		contentType: "application/json", dataType: 'json',
    	success: function (data) {
    		alert("user created successfully")
    	},
    	error: errorCallback,
	});
}	


getPosts(resultData);


function resultData(data) {
	const outputHtml = data.map(function (item) 
{		return `<div class="blog-info" data-id="${item.id}">
			<h3>${item.title}</h3>
			<p>${item.content}</p>
			<img src="${item.image}" alt="" />
			<button>Delete Post</button>
			<hr />
		</div>`;
	});
	$('#js-posts').html(outputHtml);
}


function displaySuccess(data) {
	console.log("successfully posted data");
}

function displayError() {
	$('.container').show().text('something went wrong');
}


$('#search-button').on('click', function(event){
	event.preventDefault();
	const titleInput =  $('.title-input').val();
	const contentInput =  $('.content-input').val();
	const author = {
		firstName: $('.first-name-input').val(),
		lastName: $('.last-name-input').val()
	};
	const image = $('.image-input').val();
	createPost(titleInput, contentInput, author, image, displaySuccess, displayError);
});

$('#js-posts').on('click', 'button', function() {
	console.log("clicked");
	const value = $(this).parent().data("id")
	const element = $(this).parent();
	deletePost(value, element);
});

$('.login-btn').on('click', function(event) {
	event.preventDefault();
	console.log("clicked");
	const usernameInput = $('.username-input').val();
	const passwordInput = $('password-input').val();
	accountSignin(usernameInput, passwordInput, displaySuccess, displayError);
});

$('.register-btn').on('click', function(event) {
	event.preventDefault();
	console.log("clicked");
	//const $firstNameInput = $('r-first-name-input');
	//const $lastNameInput = $('r-last-name-input');
	//const $username = $('r-username-input');
	const $emailInput = $('r-email-input');
	const $password = $('r-password-input');
	//const $confirmPassword = $('r-password-input2');
	const values = {
		//firstName: $firstname.val(),
		//lastName: $lastName.val(),
		//username: $username.val(),
		email: $email.val(),
		password: $password.val(),
		//confirmPassword: $confirmPassword.val()
	};
	console.log(values);
	/*.ajax({
		type: 'POST',
		url: '/api/register',
		dataType: 'json',
		data: JSON.stringify(values),
		success: function (data) {
    		alert("user created successfully")
    	},
    	error: function() {
    		alert("error");
	});*/
});