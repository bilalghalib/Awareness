#!/usr/bin/python
# -*- coding: utf-8 -*-
from twython import Twython
import random
import urllib2
import httplib
import MySQLdb as mdb

conn = mdb.connect('change', 'change', '-5-change', 'change')
cur = conn.cursor()

def followURL(url):
    request = urllib2.Request(url)
    request.add_header('User-Agent',
                       'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0'
                       )
    opener = urllib2.build_opener()
    f = opener.open(request)
    return f.url

def tweetUponAngels(tweetPerson,URLOut):
    for kindPerson in kindnessResponders['users']:
        messageOfKindness = '@' + kindPerson['screen_name']\
        + ' Something bad happened. Please respond with an act of kindness. This event was validated by: @' + tweetPerson + ' '  + URLOut
        try:
            #twitter.update_status(status=messageOfKindness[0:139])
            print message
        except:
            print "probably a dupe"

def sendVerifiedTweet(tweetPerson,idOut):
    messageOfVerification = '.@' + tweetPerson\
    + ' has verified this attack: ' + 'https://twitter.com/%s/status/%s/' % (tweetPerson, idOut)
    print messageOfVerification[0:139]
    try:
        print messageOfVerification
        #twitter.update_status(status=messageOfVerification[0:139])
    except:
        print "dupe"

def getAlertedTweets():
    alertids = list()
    numentries = \
        cur.execute('SELECT Tweetid FROM Alerts where isPublished is NULL;'
                    )
    count = 0
    while count < numentries:
        alertids.append(cur.fetchone()[0])
        count += 1
    return alertids

APP_KEY = 'change'
APP_SECRET = 'change'
OAUTH_TOKEN = 'change-change'
OAUTH_TOKEN_SECRET = 'change'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list'
        , owner_screen_name='weaware')
kindnessResponders = twitter.get_list_members(slug='kindness-responders'
        , owner_screen_name='weaware')


alertedtweets = getAlertedTweets()

for p in peopleWhoCare['users']:
    timeline = twitter.get_user_timeline(screen_name=p['screen_name'],
            count=200, exclude_replies=True)
    retweets = list()
    for t in timeline:
        try:
            if t['retweeted_status'] is not None:
                retweets.append(t)
        except KeyError:
            print 'Not a retweet'
    for r in retweets:
        if ( long(r['retweeted_status']['id']) in alertedtweets ):
            try:
                cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);"
                    % (r['retweeted_status']['user']['screen_name'], r['retweeted_status'
                        ]['text'], r['retweeted_status']['id'],
                        r['user']['screen_name'], r['id']))
                cur.execute("UPDATE Alerts SET isPublished=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id']) )
                cur.execute("UPDATE Alerts SET isValid=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id']) )
                sendVerifiedTweet(r['user']['screen_name'],r['retweeted_status']['id']) 
                for kindPerson in kindnessResponders['users']:
                    tweetUponAngels(r['user']['screen_name'],'https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id']))
                conn.commit()
            except mdb.Error, e:
                print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'

##the following code checks to see if anyone has validated things from alternatie sources.

cur.execute("SELECT URL, ValidatorScreenName, Tweetid FROM Alerts where isPublished IS NULL AND isValid=1;")
for ValidatedEvents in cur:
    tweetUponAngels(ValidatedEvents[1],ValidatedEvents[0])
    try:
        cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);"
        % (tweetPerson, 'noTweetText', 00000,
        ValidatedEvents[1], ValidatedEvents[2]))
    except mdb.Error, e:
        print '1Something went wrong. Probably a primary key violation, which is Okey dokey!'
    try:
        cur.execute("UPDATE Alerts SET isPublished=1 WHERE (Tweetid=(%s) AND ValidatorScreenName='%s');" % (ValidatedEvents[2],ValidatedEvents[1]))
    except mdb.Error, e:
        print '2Something went wrong. Probably a primary key violation, which is Okey dokey!'
    conn.commit()
