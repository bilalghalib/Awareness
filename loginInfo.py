#!/usr/bin/python

import MySQLdb as mdb
from twython import Twython
#Connect to our database.\

def connectToMySQL():
	conn = mdb.connect(host="50.57.98.114", port=3306, user="bilal", passwd="34ghD4Db)b", db="awareness")
	return conn

def connectToTwitter():
	APP_KEY = 'JBWxj33Qv1fXPgzossjV3g'
	APP_SECRET = '0uSXJYofTiiyz2nNkgP2ko1c1niFSBABYO3BpQgzg'
	OAUTH_TOKEN = '2362763762-3n6lBjHvvoE5tcMKRJS0iMyF8kWYlhLhiH5j6U5'
	OAUTH_TOKEN_SECRET = 'IrVhcN6edKbMy06ItGoRxIlxLh1CFbhO8UyBx5l3QIELg'
	#Authenticate our app with twitter
	twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)
	return twitter
