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

function deletePost(successCallback, errorCallback) {
  $.ajax({
    url: '/posts',
    type: 'delete',
    success: successCallback,
    error: errorCallback,
  });
}

var resultTemplate = '<div class="container"><h4>Blogs></h4><div class="js-information">'
	

getPosts(resultData);


function resultData(data) {
	const outputHtml = data.map(function (item) {
		return `<div class="blog-info">
			<h1>${item.title}</h1>
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
	let titleInput =  $('.title-input').val();
	let contentInput =  $('.content-input').val();
	let author = {
		firstName: $('.first-name-input').val(),
		lastName: $('.last-name-input').val()
	};
	let image = $('.image-input').val()
	createPost(titleInput, contentInput, author, image, displaySuccess, displayError);
});

$('#js-posts').on('click', 'button', function() {
	console.log("clicked");
	event.preventDefault();
	$(this).closest($('.blog-info')).remove();
});