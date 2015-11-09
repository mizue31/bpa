#!/usr/bin/python

import logging
from google.appengine.ext import ndb
from google.appengine.api import oauth
import random
import re
from protorpc import messages
from protorpc import message_types

#from google.appengine.ext import endpoints
import endpoints
from protorpc import remote

from models import Post01
from models import Comment01

from bpa_api_messages import Post
from bpa_api_messages import PostCollection
from bpa_api_messages import Comment
from bpa_api_messages import Comment_to_add
from bpa_api_messages import BooleanResponse
from bpa_api_messages import Post_Comments

scope = 'https://www.googleapis.com/auth/userinfo.email'

#CLIENT_ID = 'YOUR-CLIENT-ID'
CLIENT_ID = '439651642710-1n0j15gslluinq9v5s88qi18qs193ik3.apps.googleusercontent.com'

TWITTER_APP = 'bpa_mizue'
TWITTER_CONSUMER_KEY = 'g9j5kdrK2FmcrAKG698PyQxVa'
TWITTER_CONSUMER_SECRET = '3qsCGqq27n9PXTCBU4rTBIYHCTFafSQ063os1WbKucrJNUewEw'

FB_APPID = '506030706236869'
FB_SECRET = 'notasecret'

@endpoints.api(name='bpa', version='v1',
               description='BPA API',
               allowed_client_ids=[CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID])
class bpaApi(remote.Service):
    """Class which defines BPA API v1."""

    #############################################################
    # Get a post (with comments)
    #############################################################
    @endpoints.method(Post, Post_Comments,
                      path='post', http_method='POST',
                      name='post.getpost')
    def get_a_post(self, request):
        """Exposes an API endpoint to GET a Post to current user.
        """
	logging.debug("KEY1:" + str(request.post_key))
	key = ndb.Key(urlsafe=request.post_key)
	logging.debug("KEY2:" + str(key))
        p = Post01.get_by_id(key.id())
	logging.debug("p.TITLE:" + p.post_title)

	q_cmt = Comment01.query(Comment01.cmt_post == p.key).order(-Comment01.cmt_timestamp)
	clist = []
	for c in q_cmt:
		clist.append(
			Comment(
			cmt_content=c.cmt_content,
			cmt_timestamp=c.cmt_timestamp
			)
		)

	pc = Post_Comments(
		post_title = p.post_title,
		post_content = p.post_content,
		post_timestamp = p.post_timestamp,
		post_author = p.post_author.email(),
		post_key = p.key.urlsafe(),
		comments = clist)


	# user = oauth.get_current_user(scope) 
	logging.debug("post_key:" + p.key.urlsafe())
	return pc

    #################################################################
    # Get MY post titles (no comments)
    #################################################################
    @endpoints.method(message_types.VoidMessage, PostCollection,
                      path='myposts', http_method='GET',
                      name='myposts.getmypost')
    def get_my_post_titles(self, request):
        #user = oauth.get_current_user(scope)
        user = endpoints.get_current_user()
        query = Post01.query(Post01.post_author == user).order(-Post01.post_timestamp)

        plist = []

        for p in query:
            if user is None:
		raise endpoints.UnauthorizedException('unauthorized error')
            plist.append(
		Post(post_title=p.post_title, 
		     post_timestamp=p.post_timestamp, 
		     post_key=p.key.urlsafe(), 
		     post_author=p.post_author.email()))

        ALL_POSTS = PostCollection(items=plist)
        return ALL_POSTS

    #################################################################
    # Get All post titles (no comments)
    #################################################################
    @endpoints.method(message_types.VoidMessage, PostCollection,
                      path='posts', http_method='GET',
                      name='posts.getall')
    def get_all_post_titles(self, request):
        """Exposes an API endpoint to GET All Posts to current user.
        """
        query = Post01.query().order(-Post01.post_timestamp)

        #user = endpoints.get_current_user(scope)
        user = endpoints.get_current_user()
        plist = []

        for p in query:
            if user is None:
		raise endpoints.UnauthorizedException('unauthorized error')

            if p.post_author is None:
		email = "temporary@temp.com"
            else:
		email = p.post_author.email()

	    logging.debug("get_all_post_titles:email:" + email)
            plist.append(
		Post(post_title=p.post_title, 
		     post_timestamp=p.post_timestamp, 
		     post_key=p.key.urlsafe(), 
		     post_author=email))


        # temporary
        # temporary
        # temporary

        #token_audience = oauth.get_client_id(scope)
        
        """
        author_str = "email:"+user.email() + \
                     ", auth_domain:" + user.auth_domain() + \
                     ", user_id:" + str(user.user_id()) + \
                     ", nickname:" + user.nickname() + \
                     ", user:" + str(user) + \
                     ", client_id:" + token_audience
        plist.append(Post(post_author=author_str))
        """

        ALL_POSTS = PostCollection(items=plist)

        return ALL_POSTS

    #############################################################
    # Post a new post
    #############################################################
    @endpoints.method(Post, BooleanResponse,
                      path='posts', http_method='POST',
                      name='posts.submitpost')
    def submit_new_post(self, request):
        user = endpoints.get_current_user()
        if (request.post_title is None):
        	p = Post01(post_title='default title', post_content='default content', post_author=user)
        else:
        	p = Post01(post_title=request.post_title, post_content=request.post_content, post_author=user)
        p.put()
        return (BooleanResponse(result=True))

    ################################################################
    # Post a new comment
    ################################################################
    @endpoints.method(Comment_to_add, Comment,
                      path='comment', http_method='POST',
                      name='comment.submitcomment')
    def submit_new_comment(self, request):

	logging.debug("POSTKEY:" + str(request.post_key))
	logging.debug("CMT_CONTENT:" + str(request.cmt_content))

        user = endpoints.get_current_user()
        if (request.cmt_content is None):
		return Comment(cmt_content="error")
	if (request.post_key is None):
		return Comment(cmt_content="error")
	key = ndb.Key(urlsafe=request.post_key)
	logging.debug("KEY:" + str(key))
       	c = Comment01(cmt_content=request.cmt_content, cmt_post=key)
        c.put()
        return (Comment())


APPLICATION = endpoints.api_server([bpaApi], restricted=False)
