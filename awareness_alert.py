from twython import Twython
import random
import MySQLdb as mdb
import urllib2

#Follow a URL to get the actual story URL
def followURL(url):
	request = urllib2.Request(url)
	request.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0')
	opener = urllib2.build_opener()
	f = opener.open(request)
	return f.url


#MySQL Time!
conn = mdb.connect('localhost', 'awareness', 'changeme', 'awareness')
cur = conn.cursor()

#### This stuff connects us to twitter.com

APP_KEY = ''
APP_SECRET = ''
OAUTH_TOKEN = ''
OAUTH_TOKEN_SECRET = ''


urlcount = cur.execute('SELECT URL FROM Verifications;')
urls = list()
i = 0
while i < urlcount:
	urls.append(cur.fetchone()[0])
	i += 1


twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

results = twitter.search(q='iraq car bomb', count=200)

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

#rand = random.choice(results['statuses'])

#This is a temporary hacked solution. Ideally we just insert the IDs of all of our own tweets into a table.
#However I'd like a little more time to think about the structure 
#Disgustin' hack. MAKE ME PRETTIER.
ourtweets =  twitter.get_user_timeline(screen_name='weaware', count=200)
ourids = list()

for t in ourtweets:
	ourids.append(t['id'])

#We don't want our own tweets and we aren't interested if there is not a URL

acceptable = list()

for r in results['statuses']:
	if r['id'] not in ourids and len(r['entities']['urls']) != 0:
		try:
			if followURL(r['entities']['urls'][0]['expanded_url']) not in urls:
				acceptable.append(r)
		except urllib2.HTTPError, e:
			print r['entities']['urls'][0]['expanded_url']
			print e

if len(acceptable) != 0:

	rand = random.choice(acceptable)
	print rand['entities']['urls'][0]['expanded_url']

	try:
		cur.execute("INSERT INTO Alerts (OPScreenName, TweetText, Tweetid, URL) VALUES ('%s', '%s', %s, '%s');" % (rand['user']['screen_name'], rand['text'], rand['id'], followURL(rand['entities']['urls'][0]['expanded_url'])))
		conn.commit() 
		for p in peopleWhoCare['users']:
			url = "https://twitter.com/%s/status/%s/" % (rand['user']['screen_name'], rand['id'])
			message = "@" + p['screen_name'] + " Please retweet if this is a valid event: " + url
			twitter.update_status(status=message)
	except mdb.Error, e:
		print e
