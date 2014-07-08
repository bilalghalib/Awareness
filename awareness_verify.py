#!/usr/bin/python
# -*- coding: utf-8 -*-
from twython import Twython
import random
import urllib2
import httplib
import MySQLdb as mdb

conn = mdb.connect('cga', 'cga', '-5-cga', 'cga')
cur = conn.cursor()

def followURL(url):
    request = urllib2.Request(url)
    request.add_header('User-Agent',
                       'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0'
                       )
    opener = urllib2.build_opener()
    f = opener.open(request)
    return f.url

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

#def rallyKindnessTroups():

APP_KEY = 'cga'
APP_SECRET = 'cga'
OAUTH_TOKEN = 'cga-cga'
OAUTH_TOKEN_SECRET = 'cga'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list'
        , owner_screen_name='weaware')
peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list'
        , owner_screen_name='weaware')


alertedtweets = getAlertedTweets()
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
        if long(r['retweeted_status']['id']) in alertedtweets:
            try:
                tweetPerson = r['user']['screen_name']
                idOut = r['retweeted_status']['id']
                URLOut = 'https://twitter.com/%s/status/%s/'\
                     % (tweetPerson, idOut)
                messageToMember2 = '.@' + tweetPerson\
                     + ' has verified this attack: ' + URLOut
                print messageToMember2[0:139]
                
                for kindPerson in kindnessResponders['users']:
                    messageOfKindness = '@' + kindPerson['screen_name']\
                    + ' Something bad happened. Please respond with an act of kindness. This event was validated by: @' + tweetPerson + ' '  + URLOut
                    try:
                        #twitter.update_status(status=messageOfKindness)
                        print "badness"
                    except:
                        print "probably a dupe"
                try:
                    #twitter.update_status(status=messageToMember2[0:139])
                    cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);"
                                 % (r['retweeted_status']['user'
                                ]['screen_name'], r['retweeted_status'
                                ]['text'], r['retweeted_status']['id'],
                                r['user']['screen_name'], r['id']))
                    cur.execute("UPDATE Alerts SET isPublished=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id'])
                                )
                    conn.commit()
                except:
                    print 'poooplicate'
            except mdb.Error, e:
                print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'