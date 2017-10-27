// API functions
function createPost(title, content, author, image, successCallback, errorCallback) {
  $.ajax({
    url: '/api/posts',
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
	headers: {
    	'Authorization': sessionStorage.getItem('accessToken')
    },
	contentType: 'application/json', dataType: 'json',
    success: function (response) {
    	location.href='index.html';
    },
    error: errorCallback,
  });
}

function getPosts(successCallback, errorCallback) {
  $.ajax({
    url: '/api/posts',
    type: 'get',
    success: successCallback,
    error: errorCallback,
  });
}

function deletePost(id, element) {
  $.ajax({
    url: '/api/posts/' + id,
    type: 'delete',
    headers: {
    	'Authorization': sessionStorage.getItem('accessToken')
    },
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
		contentType: 'application/json', dataType: 'json',
    	success: function (response) {
    		sessionStorage.removeItem('accessToken');
    		sessionStorage.setItem('accessToken', response.token);
    		location.href='index.html';
    	},
    	error: function (data) {
    		alert('error');
    	}
	});
}

function deleteComment(id, element) {
	 $.ajax({
    url: '/api/comments/' + id,
    type: 'delete',
    headers: {
    	'Authorization': sessionStorage.getItem('accessToken')
    },
    success: function (data) {
       element.remove();
    },
    error: displayError,
  });
}

// Retrieve data and display
getPosts(resultData);


function resultData(data) {
	const outputHtml = data.map(function (item) {
			const comments = item.postComments.map(function(comment){
				return `<div class="comment-box" data-id="${comment._id}"><p><strong>${comment.username}:</strong> ${comment.content}</p>
				<span class="delete-comment-button">X</span></div>`;
			});
			const post = `<div class="blog-info box" data-id="${item._id}">
			<h3>${item.title}</h3>
			<p class="p-author">Author: ${item.author.firstName} ${item.author.lastName}</p>
			<img src="${item.image}" class="blog-image" alt="" />
			<p>${item.content}</p>
			<div class="comment-section">
				<textarea placeholder="Comment" class="comment-text-area" required="" data-id="${item._id}"></textarea>
				<button type="submit" class="post-button">Post</button>
				<h5>Comments</h5>
				${comments.join('')}
			</div>
			<div class="button-wrapper">
				<button class="delete-post">Delete Post</button>	
			</div>
		</div>
		<hr>`;
		return post;
	});
	$('#js-posts').html(outputHtml);
}

function displayError() {
	$('.container').show().text('something went wrong');
}

function scroll() {
	$('html, body').animate({
    scrollTop: $(".search-results").offset().top
}, 1000);
}

// Event Handlers
$('#search-button').on('click', function(event){
	event.preventDefault();
	const titleInput =  $('.title-input').val();
	const contentInput =  $('.content-input').val();
	const author = {
		firstName: $('.first-name-input').val(),
		lastName: $('.last-name-input').val()
	};
	const image = $('.image-input').val();
	createPost(titleInput, contentInput, author, image, displayError);
});

$('#js-posts').on('click', '.delete-post', function() {
	const value = $(this).parent().parent().data('id');
	const element = $(this).parent().parent();
	deletePost(value, element);
});

$('.login-btn').on('click', function(event) {
	event.preventDefault();;
	const usernameInput = $('.username-input').val();
	const passwordInput = $('.password-input').val();
	accountSignin(usernameInput, passwordInput, displayError);
});

$('#register-form').on('submit', function(event) {
	event.preventDefault();
	const token = $(this);
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
    		$('#register-form').empty().html('<h2>User created</h2>');
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

$('#js-posts').on('click', '.post-button', function() {
	const comment = $(this).prev().val();
	const postId = $(this).prev().data('id');
	const whereToRender = $(this).parent();
	const token = sessionStorage.getItem('accessToken');
	const payloadData = parseJwt(token);
	const username = payloadData.username; 
	$.ajax({
		type: 'POST',
		url: '/api/comments',
		dataType: 'json',
		headers: {
    	'Authorization': sessionStorage.getItem('accessToken')
   		},
		data: {
			content: comment,
			postId: postId,
			username: username
		},
		success: function (data) {
			const display = `<div class="comment-box" data-id="${data._id}"><p><strong>${username}:</strong> ${comment}</p>
			<span class="delete-comment-button">X</span></div>`;		
			whereToRender.append(display)
			$('.comment-text-area').val('');
		},
		error: function(data) {
			alert('error');
		}
	});
});

$('#js-posts').on('click', '.delete-comment-button', function() {
	const value = $(this).parent().data('id');
	const element = $(this).parent();
	deleteComment(value, element);
});

// On load function
$(function(){
	$('.blog-create-box').hide();
	$('.show-user').hide();
	$('.button-wrapper').hide();
	$('.comment-text-area').hide();
	$('.post-button').hide();
	$('.delete-comment-button').hide();
	$('.delete-post').hide();
	const token = sessionStorage.getItem('accessToken');
	if (token) {
		$('.hide-user').hide();
		$('.show-user').show();
		$('.comment-text-area').show();
		$('.post-button').show();
		const payloadData = parseJwt(token);
		const role = payloadData.role;
		if (token && role === 'Admin') {
			$('.blog-create-box').show();
			$('.button-wrapper').show();
			$('.comment-text-area').show();
			$('.delete-comment-button').show();
			$('.delete-post').show();
		}
	};
});
