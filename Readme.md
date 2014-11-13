Awareness
===============

Awareness is an app that detects media-reported car bomb events that occur in Iraq. Awarness continously monitors Twitter for discussion of a car bomb event. When an event is found, it ranks the event to see how legitimate that event is. This removes the need for a human to validate the event.

Awareness was originally created for use in an art project as shown by crushStatue.jpg.

Background to The Awareness Project and future work. The Story:

Last summer while I was in Iraq helping the crew establish the Fikra Space hackerspace there was a day where three simultaneous car bombs went off. My heart clenched as I watched the plumes of smoke take the bodies of the innocents up to the clouds and had no clue what to do. But I started thinking about it. I felt the need to do something. I knew earlier from the news that these kinds of attacks happen all the time, even previous times I’ve been to Iraq, but seeing the smoke really changed things for me. And that’s when it dawned on me.

To inspire people to act, people have to feel connected to the issue, people have to //see//. This is why journalists have such an important job finding and sharing information for people to be able to understand their world and to do something about it. In politics this happens all the time, they’re called political scandals. Parallel to journalists are sensors which pick up information about our planet and relay them to us. This flood of information is the craziness that is your news feed. How do we connect with the deluge in a useful way? This is what The Awareness project comes in. 

The project began as a sculpture and twitter experiment exploring engaging people in positive actions when car bombs went off in Iraq. You can see the old code here on github. What would happen is if you followed @weaware on twitter and requested to be a Kindness First Responder you would be put on a list and informed when car bombs happened in Iraq. The idea is that the people on this list would respond with a positive action whenever something awful happened because kindness anywhere matters everywhere. The sculptural element was a bit of data visualization where a car jack would crush / uncrush a sculpture that represented mesopotamian history depending on if a bad event happened or a kind event happened respectively. 

The Awareness Project Today:
Awareness is evolving from a single art piece and becoming a generalized wearable community news platform. What does that mean and why? 

Purpose: 
Awareness connects people to news that inspires them be their best selves and recognize their participation in making the world what it is.
Mission:
The Awareness platform connects people in meditative moments of connection to understand and communicate how best to respond to live news events. 
Vision:
Communities of care connecting globally in real time to chat about their role in participating and affecting the world around them.

Ideas important to the Awareness Project:
Single Issue News: The hypothesis is that people only have so much time and energy to act on information. Awareness will only let people select one issue to be aware of and chat about.
Packs: Connecting people in smaller communities means that deeper conversations can be had. Packs are assigned when signing up for Awareness and are distributed geographically and based on times available for conversation (Ex. Dinner time in San Francisco and Breakfast in Manilla) 
Moments: Rather than notifying people about all the news that matters, only deliver a digest to the pack when there is an anomaly in the news stream.
Tangible connectivity: Rather than vibrating people’s pockets, engaging a community in a realtime tangible experience globally helps create a sense of bonding with a team of people who care. Also a slow warming of the wrist is less frenetic than a buzz or tone and will symbolize a new way of interacting with this data, one that is slower and kinder. 
Tone and depth: Awareness is not for everyone. The tone of the onboarding process should indicate the sort of engagement we hope for, calm, peaceful, positive responses and a long term engagement. This is not twitter. 

Today:
Today I’m working with Tessel on creating the wristband that will act as the notification system for Awareness. The wristband is important since it brings peoples awareness to the issue without buzzing or vibrating. I’d like all the bands to heat up simultaniously, a way to represent hand holding / touch that can transcend borders. 

What I’m trying to do today is take that platform and expand it with the things that I have learned. Some of the Kindness First Responders (KFR) have been telling me they have been feeling disempowered by the constant requests to do something kind since they felt their actions were too small to matter. One of changes I’d like to implement is to create a community of kindness first responders to show support, also to understand that sometimes the best way to be kind is to be kind to yourself and not to spread the hurt. 

Another thing that bothered some of the Kindness First Responders was the frequency of the information and the odd times it could happen. I believed that there was something interesting about responding quickly to an event, but this does not jive with how emotions work. It takes time to digest something and to decide to act on it in a meaningful way. So another  change to the platform is the idea of a Moment. A Moment is pulled from the constant news streams of the internet and only trips an event to be sent out to people if there’s something of note. As I write there is a moment happening with the Palestinian issue right now. Since the platform I’ve been previously using is twitter it’s exciting to note that they’ve implemented an anomaly detection algorithm and have released it publicly: Breakout Detection In The Wild. This will allow us to be more effective at only pinging people when there is //motion// around the issue they care about without burning people out.

Awareness Architecture:

Starting this project fresh as a Tessel artist in resident I decided to take a different approach to architecting the system and started off with a brush and ink. These are currently the major systems that I think we will be working on:


Awareness User Stories:
I’ve been drawing stories to imagine the different people who use Awareness and how I imagine they will be discovering the platform and signing up:



Currently working on the following and could use help :D  :
I’ve been programming a Tessel microcontroller to connect a push notification from an iOS application to the Bluetooth Module. Simple code for receiving a notification on a tessel is up on the awareness git now :). iOS help is much welcome ;D!

The other part of the project I’m working on here is the heating element. Currently I’ve been exploring using this element from Sparkfun. Which will take around 12V at 1A to give me the warmth I’d like to have. There is an alternative method that I’m exploring that will use a thermoelectric element to both act as a trickle charger using the temperature gradient between your body and the air and a heating element. This might help with battery life :) Some tiny peltiers are available now too! :)

Thanks for reading and reach out if you’re interested in the project!

+BG
