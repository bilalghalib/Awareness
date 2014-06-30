
#!/usr/bin/env python

from twython import Twython
import random
import pickle
import datetime
from datetime import timedelta
from time import sleep
import MySQLdb as mdb

#MySQL Time!
conn = mdb.connect('localhost', 'awareness', '-5-fqRG7h1C1w93v4cXZLreFx', 'awareness')
cur = conn.cursor()

#### This stuff connects us to twitter.com

APP_KEY = 'ask'
APP_SECRET = 'me'
OAUTH_TOKEN = 'on'
OAUTH_TOKEN_SECRET = 'twitter.com/weaware'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)
twoDaysAgo=datetime.datetime.now() - timedelta(days=2)
twoDaysAgo=twoDaysAgo.strftime('%Y-%m-%d')

results = twitter.search(q='iraq car bomb', since=twoDaysAgo, count=200)

#Looks like we're catching a lot of lame conversation. Time to get rid of replies...

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

rand = random.choice(results['statuses'])



for p in peopleWhoCare['users']:
        rand = random.choice(results['statuses'])
        try:
                cur.execute("INSERT INTO Alerts (OPScreenName, TweetText, Tweetid) VALUES ('%s', '%s', %s);" % (rand['user']['screen_name'], rand['text'], rand['id']))
                conn.commit()
                url = "https://twitter.com/%s/status/%s/" % (rand['user']['screen_name'], rand['id'])
                message = "@" + p['screen_name'] + " Please retweet if this is a valid event: " + url
                twitter.update_status(status=message)
        except mdb.Error, e:
                print e


