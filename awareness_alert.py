from twython import Twython
import random
import pickle
from time import sleep
import MySQLdb as mdb

#MySQL Time!
conn = mdb.connect('localhost', 'awareness', 'changeme', 'awareness')
cur = conn.cursor()

#### This stuff connects us to twitter.com

APP_KEY = 'nope'
APP_SECRET = 'nope'
OAUTH_TOKEN = 'nope'
OAUTH_TOKEN_SECRET = 'nope'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

results = twitter.search(q='iraq car bomb', count=200)

#Looks like we're catching a lot of lame conversation. Time to get rid of replies...

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

rand = random.choice(results['statuses'])

#This is a temporary hacked solution. Ideally we just insert the IDs of all of our own tweets into a table.
#However I'd like a little more time to think about the structure 
#Disgustin' hack. MAKE ME PRETTIER.
ourtweets =  twitter.get_user_timeline(screen_name='weaware', count=200)
ourids = list()

for t in ourtweets:
	ourids.append(t['id'])

while rand['id'] in ourids:
	rand = random.choice(results['statuses'])

try:
	cur.execute("INSERT INTO Alerts (OPScreenName, TweetText, Tweetid) VALUES ('%s', '%s', %s);" % (rand['user']['screen_name'], rand['text'], rand['id']))
	conn.commit() 
	for p in peopleWhoCare['users']:
		url = "https://twitter.com/%s/status/%s/" % (rand['user']['screen_name'], rand['id'])
		message = "@" + p['screen_name'] + " Please retweet if this is a valid event: " + url
		twitter.update_status(status=message)
except mdb.Error, e:
	print e

