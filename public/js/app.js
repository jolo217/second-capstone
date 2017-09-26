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
	$('#wrapper').show().text('something went wrong');
}


$('#search-button').on('click', function(event){
	event.preventDefault();
	const titleInput =  $('.title-input').val();
	const contentInput =  $('.content-input').val();
	const author = {
		firstName: $('.first-name-input').val(),
		lastName: $('.last-name-input').val()
	};
	createPost(titleInput, contentInput, author, image, displaySuccess, displayError);
});

$('#js-posts').on('click', 'button', function() {
	console.log("clicked");
	const value = $(this).parent().data("id")
	const element = $(this).parent();
	deletePost(value, element);
});