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
    headers: {
    	'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
    },
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
		url: '/api/authenticate',
		type: 'post',
		data: JSON.stringify({
			username: username,
			password: password,
			grant_type: 'password'
		}),
		contentType: "application/json", dataType: 'json',
    	success: function (response) {
    		sessionStorage.removeItem('accessToken');
    		sessionStorage.setItem('accessToken', response.token);
    		window.location.replace("http://localhost:8080/index.html");
    	},
    	error: function (data) {
    		alert('error');
    	}
	});
}

getPosts(resultData);


function resultData(data) {
	const outputHtml = data.map(function (item) 
{		return `<div class="blog-info box" data-id="${item.id}">
			<h3>${item.title}</h3>
			<p class="p-author">Author: ${item.author}</p>
			<p>${item.content}</p>
			<img src="${item.image}" alt="" />
			<div class="button-wrapper">
				<button>Delete Post</button>
			</div>
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
	const value = $(this).parent().parent().data("id")
	const element = $(this).parent().parent();
	deletePost(value, element);
});

$('.login-btn').on('click', function(event) {
	event.preventDefault();;
	const usernameInput = $('.username-input').val();
	const passwordInput = $('.password-input').val();
	accountSignin(usernameInput, passwordInput, displaySuccess, displayError);
});

$('#register-form').on('submit', function(event) {
	event.preventDefault();
	const token = $(this)
	const $firstNameInput = $('.r-first-name-input');
	const $lastNameInput = $('.r-last-name-input');
	const $username = $('.r-username-input');
	const $emailInput = $('.r-email-input');
	const $password = $('.r-password-input');
	const $confirmPassword = $('.r-password-input2');
	const values = {
		firstName: $firstNameInput.val(),
		lastName: $lastNameInput.val(),
		username: $username.val(),
		email: $emailInput.val(),
		password: $password.val(),
		confirmPassword: $confirmPassword.val()
	};
	$.ajax({
		type: 'POST',
		url: '/api/register',
		dataType: 'json',
		data: values,
		success: function (data) {
    		$('#register-form').empty().html("<h2>User created</h2>");
    		console.log(data);
    	},
    	error: function(data) {
    		$('#register-form').prepend(`<p>${data.responseJSON.message}</p>`);
    	}
	});
});

function parseJwt (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        };

$('.show-user').on('click', function(){
	sessionStorage.removeItem('accessToken');
	location.href=location.href;
});

$(function(){
	$('.blog-create-box').hide();
	$('.show-user').hide();
	const token = sessionStorage.getItem('accessToken');
	if (token) {
		$('.hide-user').hide();
		$('.show-user').show();
		const payloadData = parseJwt(token);
		const role = payloadData.role;
		if (token && role === 'Admin') {
			$('.blog-create-box').show();
		}
	};
});
