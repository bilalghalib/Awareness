from twython import Twython
import random
import pickle
from time import sleep


#### This stuff connects us to twitter.com

APP_KEY = 'ask'
APP_SECRET = 'me'
OAUTH_TOKEN = 'on'
OAUTH_TOKEN_SECRET = 'bg@bilalghalib.com'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

tweetsChecked = pickle.load( open( "tweetsChecked.p", "rb" ) )

#tweetsChecked is  a pickle of tuples that contain the ID of a tweet and tuple of the person who RT it and the original tweeter
#this is used to validate an events. When someone is sent a tweet to validate they are asked to RT if it's real
#if they RT it then we add 1pt for it being real (right now it just is validated since the "Admin" team is so small)
#example: {439741328134799360: (u'MaraimMasoud', u'zuhair47'), 440800798893957120: (u'SarzRepublic', u'MuhammadAryanpo'), 440148331113631744: (u'bilalghalib', u'DouglasPClement')}

results = twitter.search(q='iraq car bomb')
pickRandomTweet = random.randint(0,totalStatuses)
totalStatuses=len(results['statuses'])
# grabs a twitter search that I think will give us potential events. For some reason complex searches like: 
# car%20bomb%20near%3A"baghdad"%20within%3A15mi
# should work, it says so in the twitter API, help?
# https://dev.twitter.com/docs/using-search

twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')
peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

#There is a twitter list on @weaware : https://twitter.com/weaware/lists/iraq-car-bomb-admin-list
#for people who volunteer to validate events
# this grabs them and puts them into a crazy dictionary JSON thing called peopleWhoCare

for member in peopleWhoCare['users']:
	pickRandomTweet = random.randint(0,len(results['statuses'])-1)
	textOut=results['statuses'][pickRandomTweet]['text']
	tweetPerson=results['statuses'][pickRandomTweet]['user']['screen_name']	
	idOut=results['statuses'][pickRandomTweet]['id']
	nameOut = member['screen_name']
	print textOut
	print nameOut
	#twitter.update_status(screen_name=nameOut, text=textOut)
	URLOut = "https://twitter.com/%s/status/%s/" % (tweetPerson, idOut) 
	messageToMember ="@" + nameOut + " Help by checking event and RT if valid " + URLOut 
	messageToMember = messageToMember + """ " """ + textOut[0:42] + """ " """
	print messageToMember[0:139]
	twitter.update_status(status=messageToMember[0:139])
	tweetsChecked[idOut] = (nameOut, tweetPerson)
	print tweetPerson

#Go throught the list of the people who care and pick a random tweet from the search and send it to them
#Sending is commented out because I don't want to get rate limited (help?)

#tweetsChecked[tweet ID][x] - by putting the tweet ID here you access the twitter handel of 
##tweetsChecked[tweet ID][0] = RT person from the admin list
#tweetsChecked[tweet ID][1] = original twitter handle 

sleep(0.1) #trying not to be rate limited, is this a good idea?

 #send the message to the admin that requests them to RT a valid event

### the code below doesn't work, I'll explain what I was trying to do: ###
#my goal was to go through all the 
# HAHAHA, in trying to describe how the code was broken, I fixed it. All this can be much cleaner, I don't like the stuff
# that looks like: tweetsChecked.items()[x][1][0] - it's hard to read, how can we make this more legible?
# Also to make this more robust we should have a larger admin list and make sure to cross validate / or NLP to find events in 
numPotentialRetweets = len(tweetsChecked)
for x in range(0,numPotentialRetweets):
	currentTweetId = tweetsChecked.items()[x][0]
	currentTweetUser = tweetsChecked.items()[x][1][0]
	#curRT = twitter.get_retweets(id=439681336559685632)
	sleep(0.1)
	print currentTweetId
	print currentTweetUser
	for y in range(0,len(curRT)):			
		print "current RT username:" 
		print curRT[y]['user']['screen_name']
		if curRT[y]['user']['screen_name'] == tweetsChecked.get(currentTweetId)[0]:
			print "I believe in miricles!"
			URLOut2 = "https://twitter.com/%s/status/%s/" % (currentTweetUser, currentTweetId) 
			messageToMember2 ="@" + currentTweetUser + " has verified this attack: " + URLOut2
			print messageToMember2[0:139]
			#twitter.update_status(status=messageToMember[0:139])

pickle.dump(tweetsChecked, open( "tweetsChecked.p", "wb" ) )
