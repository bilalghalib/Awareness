#!/usr/bin/python
# -*- coding: utf-8 -*-

from twython import Twython
import random
import pickle
import datetime
from datetime import timedelta
from time import sleep
import MySQLdb as mdb
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

#Follow a shortened URL.
def followURL(url):
    request = urllib2.Request(url)
    request.add_header('User-Agent',
                       'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0'
                       )
    opener = urllib2.build_opener()
    f = opener.open(request)
    return f.url

#Find the number of verifications we currently have(?)
urlcount = cur.execute('SELECT URL FROM Verifications;')
urls = list()
i = 0
while i < urlcount:
    urls.append(cur.fetchone()[0])
    i += 1


halfADayAgo = datetime.datetime.now() - timedelta(hours=12)
halfADayAgo = halfADayAgo.strftime('%Y-%m-%d')

#Search Twitter for "iraq car bomb"
results = twitter.search(q='iraq car bomb', since=halfADayAgo,
                         count=200)

#Get the set of users who are volunteering as verifiers
peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list'
        , owner_screen_name='weaware')

#Get our own tweets
ourtweets = twitter.get_user_timeline(screen_name='weaware', count=200)
ourids = list()

for t in ourtweets:
    ourids.append(t['id'])

acceptable = list()
#TODO: Bilal, could you please explain all code after this point? 
#It has changed a bit since I had my hands on it.
for r in results['statuses']:
    if r['id'] not in ourids and len(r['entities']['urls']) != 0:
        try:
            if followURL(r['entities']['urls'][0]['expanded_url'])\
                 not in urls:
                acceptable.append(r)
        except urllib2.HTTPError, e:
            print r['entities']['urls'][0]['expanded_url']
            print e
looper=0
if len(acceptable) != 0:
    for p in peopleWhoCare['users']:
        personToPing = looper % len(acceptable)
        rand = acceptable[personToPing]
        looper=looper+1 #This looper business takes the number of acceptable reported events and sends it to everyone, even if people get duplicates of other 
        print rand['entities']['urls'][0]['expanded_url']
        try:
            print "('%s', '%s', %s, '%s','%s',%s);" % (rand['user']['screen_name'].encode('utf-8'), rand['text'].encode('utf-8'), rand['id'], 
                followURL(rand['entities']['urls'][0]['expanded_url']).encode('latin-1', 'replace'),p['screen_name'].encode('utf-8'),0) 
            cur.execute("INSERT INTO Alerts (OPScreenName, TweetText, Tweetid, URL, ValidatorScreenName, isValid) VALUES ('%s', '%s', %s, '%s','%s','%s');"
            % (rand['user']['screen_name'].encode('utf-8'), rand['text'].encode('utf-8'),
            rand['id'], followURL(rand['entities']['urls'
            ][0]['expanded_url']).encode('utf-8'),p['screen_name'].encode('utf-8'),'NULL'))
            conn.commit()
        except mdb.Error, e:
            print e
        url = 'https://twitter.com/%s/status/%s/' % (rand['user'
            ]['screen_name'], rand['id'])
        message = '@' + p['screen_name']\
        + ' Please retweet if this is a valid event: ' + url
        print message
        try:
            twitter.update_status(status=message)
        except:
            print "probably a dupe"

