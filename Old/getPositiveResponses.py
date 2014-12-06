#!/usr/bin/python
# -*- coding: utf-8 -*-

from twython import Twython
import random
import pickle
import datetime
from datetime import datetime
from time import sleep
import MySQLdb as mdb
import sys
import urllib2

#Connect to our database.
conn = mdb.connect('change', 'change', 'change', 'change')
cur = conn.cursor()

APP_KEY = 'change'
APP_SECRET = 'change'
OAUTH_TOKEN = 'change'
OAUTH_TOKEN_SECRET = 'change'
#Authenticate our app with twitter
twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

#What tweets have already been flagged as unverified?
def getResponses():
    alertids = dict()
    numentries = \
        cur.execute('SELECT responseTweetID, respondedToTweetID FROM Responders;' #isValid = 2 is for someone who's confirmed it NOT valid
                    )
    count = 0
    while count < numentries:
        responseTweetID, respondedToTweetID = cur.fetchone()
        if respondedToTweetID in alertids:
            alertids[respondedToTweetID].append(responseTweetID)                
        else:
            alertids[respondedToTweetID] = [responseTweetID]
        count += 1
    return alertids

potentialResponses= getResponses()
del potentialResponses[None]

kindnessResponders = twitter.get_list_members(slug='kindness-responders'
    , owner_screen_name='weaware')

for p in kindnessResponders['users']:
    timeline = twitter.get_user_timeline(screen_name=p['screen_name'],count=200, exclude_replies=False)
    retweets = list()
    for t in timeline:
        if  (t['in_reply_to_status_id'] in potentialResponses):
            print "username :" + str(t['user']['screen_name'])
            print "the original tweet:" + str(t['in_reply_to_status_id'])
            print "the tweet that is the response" + str(t['id'])
            print "the event:" + str(potentialResponses[t['in_reply_to_status_id']])
            positiveResponseText= twitter.show_status(id=t['id'])['text']
            positiveResponseTime = twitter.show_status(id=t['id'])['created_at']
            cur.execute("SELECT percentDamaged FROM Response ORDER BY timeAndDate DESC LIMIT 1;")
            updatedDamageLevel = cur.fetchone()[0]+10
            print updatedDamageLevel
            try:
                print positiveResponseTime
                cur.execute("INSERT INTO Response (percentDamaged, damageURL, positiveAction, positiveScreenName, timeAndDate, timePositive, badEventID) VALUES (%s,'%s','%s','%s','%s', '%s', %s);" % 
                    (updatedDamageLevel, 'NULL', positiveResponseText.encode('utf-8'), t['user']['screen_name'], datetime.now().isoformat(' '), positiveResponseTime, potentialResponses[t['in_reply_to_status_id']][0]) )
            except Exception, e:
                print e
            conn.commit()

sys.exit()

