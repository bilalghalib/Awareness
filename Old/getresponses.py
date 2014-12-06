
#!/usr/bin/python
# -*- coding: utf-8 -*-

from twython import Twython
import random
import pickle
import datetime
from datetime import timedelta
from datetime import datetime
from time import sleep
import MySQLdb as mdb
import sys
import urllib2

#Connect to our database.
conn = mdb.connect('localhost', 'awareness', '-5-fqRG7h1C1w93v4cXZLreFx', 'awareness')
cur = conn.cursor()

APP_KEY = 'JBWxj33Qv1fXPgzossjV3g'
APP_SECRET = '0uSXJYofTiiyz2nNkgP2ko1c1niFSBABYO3BpQgzg'
OAUTH_TOKEN = '2362763762-3n6lBjHvvoE5tcMKRJS0iMyF8kWYlhLhiH5j6U5'
OAUTH_TOKEN_SECRET = 'IrVhcN6edKbMy06ItGoRxIlxLh1CFbhO8UyBx5l3QIELg'
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
    for t in timeline:
        if  (t['in_reply_to_status_id'] in potentialResponses):
            print "the original tweet:" + str(t['in_reply_to_status_id'])
            print "the tweet that is the response" + str(t['id'])
            print "the event:" + str(potentialResponses[t['in_reply_to_status_id']])
            positiveResponseText= twitter.show_status(id=t['id'])['text']
            positiveResponseTime = twitter.show_status(id=t['id'])['created_at']
            cur.execute("SELECT percentDamaged FROM Response ORDER BY timeAndDate DESC LIMIT 1;")
            updatedDamageLevel = cur.fetchone()[0]+10
            try:
                print positiveResponseTime
                cur.execute("INSERT INTO Response (percentDamaged, damageURL, positiveAction, timeAndDate, timePositive) VALUES (%s,'%s','%s','%s', '%s');" %
                    (updatedDamageLevel, 'NULL', positiveResponseText.encode('utf-8'), datetime.now().isoformat(' '), positiveResponseTime) )
            except Exception, e:
                print e
            conn.commit()

