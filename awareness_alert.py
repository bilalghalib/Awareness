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
conn = mdb.connect('chang', 'chang', 'chang', 'chang')
cur = conn.cursor()

APP_KEY = 'chang'
APP_SECRET = 'chang'
OAUTH_TOKEN = 'chang'
OAUTH_TOKEN_SECRET = 'chang'

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

#What tweets have already been flagged as unverified?
def getUnverified():
    alertids = list()
    numentries = \
        cur.execute('SELECT isValid, Tweetid FROM Alerts WHERE isValid=2;' #isValid = 2 is for someone who's confirmed it NOT valid
                    )
    for row in cur:
        print row[1]
        if row[1] not in alertids:
            alertids.append(row[1])
    return alertids

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

unverifiedList = getUnverified()

looper=0
if len(acceptable) != 0:
    for p in peopleWhoCare['users']:
        personToPing = looper % len(acceptable)
        rand = acceptable[personToPing]
        looper=looper+1 #This looper business takes the number of acceptable reported events and sends it to everyone, even if people get duplicates of other 
        print rand['entities']['urls'][0]['expanded_url']
        try:
            if rand['id'] not in unverifiedList:
                print "Has not been classified as not real yet"
                try:
                    print "('%s', '%s', %s, '%s','%s',%s);" % (rand['user']['screen_name'].encode('utf-8'), rand['text'].encode('utf-8'), rand['id'], 
                        followURL(rand['entities']['urls'][0]['expanded_url']).encode('latin-1', 'replace'),p['screen_name'].encode('utf-8'),'NULL') 
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
            else:
                print "Classed as not real"
                print rand['id']
        except:
            print "something is up with unverifiedList or rand['id]"