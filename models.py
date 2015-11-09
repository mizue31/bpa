#!/usr/bin/python

"""Helper model class for Blog Posting Application API.
"""

import endpoints
from google.appengine.ext import ndb

TIME_FORMAT_STRING = '%b %d, %Y %I:%M:%S %p'

class Post01(ndb.Model):
	post_title = ndb.TextProperty()
	post_content = ndb.TextProperty()
	post_timestamp = ndb.DateTimeProperty(auto_now_add=True)
	post_author = ndb.UserProperty(indexed=True)
	#post_cmt = ndb.StructuredProperty(Comment01, repeated=True)
	@property
	def post_date(self):
		return self.post_timestamp.strftime(TIME_FORMAT_STRING)

class Comment01(ndb.Model):
	cmt_content = ndb.TextProperty()
	cmt_timestamp = ndb.DateTimeProperty(auto_now_add=True)
	cmt_post = ndb.KeyProperty(kind=Post01, repeated=False)
	@property
	def cmt_date(self):
		return self.cmt_timestamp.strftime(TIME_FORMAT_STRING)
