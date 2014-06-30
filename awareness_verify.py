
#!/usr/bin/env python

from twython import Twython
import random
import pickle
from time import sleep
import MySQLdb as mdb

#MySQL Time!
conn = mdb.connect('localhost', 'awareness', '-5-fqRG7h1C1w93v4cXZLreFx', 'awareness')
cur = conn.cursor()


def getAlertedTweets():
        alertids = list()
        numentries = cur.execute("SELECT Tweetid FROM Alerts where isPublished is NULL;")
        count = 0
        while count < numentries:
                alertids.append(cur.fetchone()[0])
                count += 1
        return alertids


#### This stuff connects us to twitter.com

APP_KEY = 'ask'
APP_SECRET = 'me'
OAUTH_TOKEN = 'on'
OAUTH_TOKEN_SECRET = 'twitter.com/weaware'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

alertedtweets = getAlertedTweets()

for p in peopleWhoCare['users']:
        timeline = twitter.get_user_timeline(screen_name=p['screen_name'], count=200, exclude_replies=True)
        retweets = list()
        for t in timeline:
                try:
                        if t['retweeted_status'] is not None:
                                retweets.append(t)
                except KeyError:
                        print "Not a retweet"
        for r in retweets:
                if long(r['retweeted_status']['id']) in alertedtweets:
                        try:
                                tweetPerson= r['user']['screen_name']
                                idOut=r['retweeted_status']['id']
                                URLOut = "https://twitter.com/%s/status/%s/" % (tweetPerson, idOut)
                                messageToMember2 =".@" + tweetPerson + " has verified this attack: " + URLOut
                                print messageToMember2[0:139]
                                try:
                                        twitter.update_status(status=messageToMember2[0:139])
                                        cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);" % (r['retweeted_status']['user']['screen_name'], r['retweeted_status']['text'], r['retweeted_status']['id'], r['user']['screen_name'], r['id']))
                                        cur.execute("UPDATE Alerts SET isPublished=1 WHERE Tweetid=r['retweeted_status']['id']")
                                        conn.commit()
                                except:
                                        print "doooplicate"
                        except mdb.Error, e:
                                print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'