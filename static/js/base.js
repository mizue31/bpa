/*************************************************************
AngularJS
**************************************************************/
'use strict';

var app = angular.module('bpa', [
/*  'ngCookies', */
/*  'ngSanitize', */
  'ngRoute',
  'mobile-angular-ui'
]);

/*************************************************************
CONFIG Router
*************************************************************/
app.config(function($routeProvider){
	$routeProvider
/*
	.when('/', {
		templateUrl: 'templates/menu.html',
		controller: 'MainController'
	})
*/
	.when('/newpost', {
		templateUrl: 'templates/newpost.html',
		controller: 'PostController'
	})
	.when('/listall', {
		templateUrl: 'templates/list.html',
		controller: 'MainController'
	})
	.when('/listmine', {
		templateUrl: 'templates/listMy.html',
		controller: 'MainController'
	})
	.when('/viewpost', {
		templateUrl: 'templates/viewpost.html',
		controller: 'CmtController'
	})
	.when('/cmt', {
		templateUrl: 'templates/cmt.html',
		controller: 'CmtController'
	})
	.otherwise({
		redirectTo: '/'
	});
});

/*********************
Factory : sharedData
*********************/
app.factory('sharedData', function(){
  return{
    text: 'sharedData'
  };
});
/**********************
Factory : f_listMyPost
**********************/
app.factory('f_listMyPost', ['$q', '$timeout', function($q, $timeout){
	return {
		data: function(){
			/*alert("called listMyPost()");*/
			var deferred = $q.defer();
			gapi.client.bpa.myposts.getmypost().execute(function(resp) {
				if (resp.items) {
					deferred.resolve(resp.items);
				} else {
					deferred.reject();
				}
			});
			return deferred.promise;
		}
	}
}]);
/*******************
Factory : f_listAll
********************/
app.factory('f_listAll', ['$q', '$timeout', function($q, $timeout){
	return {
		data: function(){
			/*alert("called listAll");*/
			var deferred = $q.defer();
			gapi.client.bpa.posts.getall().execute(function(resp) {
				if (resp.items) {
					deferred.resolve(resp.items);
				} else {
					deferred.reject();
				}
			});
			return deferred.promise;
		}
	}
}]);

/**********************
Factory : f_getPostComments
**********************/
app.factory('f_getPostComments', ['$q', '$timeout', 'sharedData', function($q, $timeout, sharedData){
	return {
		data: function(){
			/*alert("called listMyPost()");*/
			var deferred = $q.defer();
			gapi.client.bpa.post.getpost({"post_key":sharedData.post_key}).execute(function(resp) {
				if (resp) {
					deferred.resolve(resp);
				} else {
					deferred.reject();
				}
			});
			return deferred.promise;
		}
	}
}]);

/******************
Factory : get a Post
******************/
app.factory('getPost', ['$q', '$timeout', function($q, $timeout){
	return {
		data: function(post_key){
			var deferred = $q.defer();
			gapi.client.bpa.posts.get({'key':post_key}).execute(function(resp) {
				if (resp.items) {
					deferred.resolve(resp.items);
				} else {
					deferred.reject();
				}
			});
			return deferred.promise;
		}
	}
}]);

/*********************************************************************
Controller : PostController
**********************************************************************/
app.controller('PostController', ['$scope', '$location', function($scope, $location){
  $scope.posts = [];
  $scope.addPost = function(){
    gapi.client.bpa.posts.submitpost({'post_title':$scope.post_title, 'post_content':$scope.post_content}).execute(function(resp) {
      var result = document.getElementById('submit_new_post_result');
    })
    $location.path('/');
  };
}]);

/*********************************************************************
Controller : CmtController
**********************************************************************/
app.controller('CmtController', ['$scope', '$location', 'sharedData', 'f_getPostComments', function($scope, $location, sharedData, f_getPostComments){

	$scope.post_key = sharedData.post_key;
	$scope.post_title = "";

	var promise = f_getPostComments.data();
	/*$scope.postcomments.post_title = "waiting";*/
	/*alert("called CmtController 1:" + $scope.post_key);*/

	promise.then(function(items){
		$scope.post_title = items.post_title;
		/*alert("called CmtController 2:" + $scope.post_title);*/
		$scope.post_content = items.post_content;
		$scope.post_timestamp =items.post_timestamp;
		$scope.post_author =items.post_author;
		$scope.comments = items.comments
	});

	$scope.addComment = function(){
		/*
		alert("POST_KEY:" + $scope.post_key + ",CMT:" + $scope.cmt_content);
		*/
		gapi.client.bpa.comment.submitcomment({'cmt_content':$scope.cmt_content, 'post_key':$scope.post_key}).execute(function(resp) {
		var result = document.getElementById('submit_new_post_result');
		});
		$location.path('/');
	};
}]);

/********************************************************************
Controller : ListAllController
*********************************************************************/
app.controller('ListAllController', 
	['$scope', '$location', 'f_listAll', 'sharedData', 
	function($scope, $location, f_listAll, sharedData){

	$scope.posts = [];

	var promise = f_listAll.data();
	/*$scope.posts.push({post_title : "waiting"});*/
	promise.then(function(items){
        	for (var i = 0; i< items.length; i++){
			$scope.posts.push({
				post_title: items[i].post_title,
				post_timestamp: items[i].post_timestamp,
				post_author: items[i].post_author,
				post_key: items[i].post_key,
			});
		}
	});

}]);

/********************************************************************
Controller : ListMyController
*********************************************************************/
app.controller('ListMyController', 
	['$scope', '$location', 'f_listMyPost', 'sharedData', 
	function($scope, $location, f_listMyPost, sharedData){

	$scope.posts = [];

	var promise = f_listMyPost.data();
	/* $scope.posts.push({post_title : "waiting"}); */
	promise.then(function(items){
		$scope.posts = [];
        	for (var i = 0; i< items.length; i++){
			$scope.posts.push({
			post_title: items[i].post_title,
			post_timestamp: items[i].post_timestamp,
			post_author: items[i].post_author,
			post_key: items[i].post_key,
			});
		}
	});

}]);

/********************************************************************
Controller : MainController
*********************************************************************/
app.controller('MainController', 
	['$scope', '$location', 'f_listAll', 'f_listMyPost', 'sharedData', 
	function($scope, $location, f_listAll, f_listMyPost, sharedData){

  $scope.sel = -1;
  $scope.posts = [];
  $scope.key = "nullstring";


  /****************************
  line color change
  $scope.chg = function(index, flag){
    $scope.posts[index].pcol = flag ? {"background-color": 'gray'} : {};
  };
  *****************************/
  /****************************
  go newPost
  *****************************/
  $scope.goNewPost = function(){
    $location.url('/newpost');
  };
  /****************************
  go list My Posts
  *****************************/
  $scope.goListMyPosts = function(){
    $location.path('/listmine');
  };
  /****************************
  go list All
  *****************************/
  $scope.goListAll = function(){
    /*alert("called go list all posts");*/
    $location.path('/listall');
  };
  /****************************
  go view Post
  *****************************/
  $scope.goViewPost = function(key){
    sharedData.post_key = key;
    /*$scope.data.text = key;*/
    /*$scope.p.post_key = key;*/
    /*alert("called go view post:" + key);*/
    $location.path('/viewpost');
  };

  /****************************
  addComment
  *****************************/

  $scope.addComment = function(){
    /*alert("POST_KEY:" + $scope.post_key + ",CMT:" + $scope.cmt_content);*/
    gapi.client.bpa.comment.submitcomment({'cmt_content':$scope.cmt_content, 'post_key':$scope.post_key}).execute(function(resp) {
      var result = document.getElementById('submit_new_post_result');
    });
    location.href = '/';
    $scope.post_title   = '';
    $scope.post_content = '';
  };

  /****************************
  list My Post Titles
  *****************************/

  $scope.listMyPosts = function(){
	var promise = f_listMyPost.data();
	/* $scope.posts.push({post_title : "waiting"}); */
	promise.then(function(items){
		$scope.posts = [];
        	for (var i = 0; i< items.length; i++){
			$scope.posts.push({
			post_title: items[i].post_title,
			post_timestamp: items[i].post_timestamp,
			post_author: items[i].post_author,
			post_key: items[i].post_key,
			});
		}
	});
  };
  /****************************
  list All Post Titles
  *****************************/

  $scope.listPosts = function(){
	var promise = f_listAll.data();
	/* $scope.posts.push({post_title : "waiting"}); */
	promise.then(function(items){
		$scope.posts = [];
        	for (var i = 0; i< items.length; i++){
			$scope.posts.push({
			post_title: items[i].post_title,
	post_timestamp: items[i].post_timestamp,
			post_author: items[i].post_author,
			post_key: items[i].post_key,
			});
		}
	});
  };

}]); 
/* end MainController */

/********************************************************************/
/********************************************************************/
/********************************************************************/

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** samples namespace for DevRel sample code. */
google.devrel.samples = google.devrel.samples || {};

/** TicTacToe namespace for this sample. */
google.devrel.samples.ttt = google.devrel.samples.ttt || {};


/**
 * Whether or not the user is signed in.
 * @type {boolean}
 */
google.devrel.samples.ttt.signedIn = false;

/**
 * Signs the user out.
 */
google.devrel.samples.ttt.signout = function() {
  document.getElementById('signinButtonContainer').classList.add('visible');
  document.getElementById('signedInStatus').classList.remove('visible');
/*  google.devrel.samples.ttt.setBoardEnablement(false); */
  google.devrel.samples.ttt.signedIn = false;
}

/**
 * Initializes the application.
 * @param {string} apiRoot Root of the API's path.
 * @param {string} tokenEmail The email parsed from the auth/ID token.
 */
google.devrel.samples.ttt.init = function(apiRoot, tokenEmail) {
  var callback = function() {
    google.devrel.samples.ttt.signedIn = true;
    document.getElementById('userLabel').innerHTML = tokenEmail;
  }

  gapi.client.load('bpa', 'v1', callback, apiRoot);

};

