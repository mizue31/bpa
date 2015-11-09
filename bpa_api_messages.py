#!/usr/bin/python

from protorpc import messages

from protorpc import message_types

class Post(messages.Message):
    post_title = messages.StringField(1)
    post_content = messages.StringField(2)
    post_timestamp = message_types.DateTimeField(3)
    post_author = messages.StringField(4)
    post_key = messages.StringField(5)

class PostCollection(messages.Message):
    items = messages.MessageField(Post, 1, repeated=True)

class Comment(messages.Message):
    cmt_content = messages.StringField(1)
    cmt_timestamp = message_types.DateTimeField(2)
    cmt_author = messages.StringField(3)

class Post_Comments(messages.Message):
    post_title = messages.StringField(1)
    post_content = messages.StringField(2)
    post_timestamp = message_types.DateTimeField(3)
    post_author = messages.StringField(4)
    post_key = messages.StringField(5)
    comments = messages.MessageField(Comment, 6, repeated=True)

class Comment_to_add(messages.Message):
    cmt_content = messages.StringField(1)
    post_key = messages.StringField(2)

class BooleanResponse(messages.Message):
    result = messages.BooleanField(1)
