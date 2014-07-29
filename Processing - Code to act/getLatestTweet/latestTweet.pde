import twitter4j.conf.*;
import twitter4j.internal.async.*;
import twitter4j.internal.org.json.*;
import twitter4j.internal.logging.*;
import twitter4j.json.*;
import twitter4j.internal.util.*;
import twitter4j.management.*;
import twitter4j.auth.*;
import twitter4j.api.*;
import twitter4j.util.*;
import twitter4j.internal.http.*;
import twitter4j.*;
import twitter4j.internal.json.*;
import java.net.HttpURLConnection;    // required for HTML download
import java.net.URL;                  // ditto, etc...
import java.net.URLConnection;
import java.net.URLEncoder;
import java.io.InputStreamReader;     // used to get our raw HTML source
import java.io.File;
import java.util.Date;
import java.util.List;
import processing.serial.*;

String user="weaware";
Serial myPort; 
color currentColor, targetColor;
float timing=200;  //every <timing> frames, we'll change the background color 
float startTime=0;
Twitter twitter;
Date mostRecentTweet;  //keeps track of the last time we got a tweet
long lastPoll=0;
int pollingFrequency = 5;  //the period, in seconds, that we check for a new tweet.  If you go below 60 for long, you risk getting a rate limit error w/twitter

void setup() {
  mostRecentTweet=new Date();  //initializes the most recent tweet date to the time when we start the program
  //Set the size of the stage, and the background to black.
  size(displayWidth, displayHeight);
  currentColor = color(random(256), random(256), random(256));
  targetColor=currentColor;
  smooth();
  
  //initialize the serial port
  // List all the available serial ports:  
  println(Serial.list());
  // Open the port you are using at the rate you want:
  myPort = new Serial(this, Serial.list()[5], 9600);
 
  //Credentials
  ConfigurationBuilder cb = new ConfigurationBuilder();
  cb.setOAuthConsumerKey("Ap6CqNCdXJCN7BYTrrtZQ");
  cb.setOAuthConsumerSecret("ow5rK13ZbA7DoxDH2EoU3fjvsLDI7vh5ono4b9wDU");
  cb.setOAuthAccessToken("33208899-CSsFDf49w4RzL2h4bq2ZgAQxIxOXtwIEC0w0qfARF");
  cb.setOAuthAccessTokenSecret("nY8RAl69Dxpj8uVX8GCstoaSwpDJh20ihDoX4iRZ6WimZ");

  //Now we’ll make the main Twitter object that we can use to do pretty much anything you can do on the twitter website
  //– get status updates, run search queries, find follower information, etc. This Twitter object gets built by something
  //called the TwitterFactory, which needs our configuration information that we set above:
  twitter = new TwitterFactory(cb.build()).getInstance();
}


//checks the latest results from a search for queryString.
//if there's a result more recent than the mostRecentTweet date, it runs updateArduino()
//otherwise nothing
void checkLatestTweets()
{      
  println("checking latest tweets...");
  ArrayList tweets=new ArrayList();
  boolean newTweet=false;
  try {
      List<Status> statuses = twitter.getUserTimeline(user);
      for (Status status : statuses) {
        println("tweet sent at "+status.getCreatedAt() + " :  " + status.getText());
        if(status.getCreatedAt().after(mostRecentTweet))
        {
            newTweet=true;
            mostRecentTweet=new Date();
            println("new tweet:  "+status.getText());
        }
//        else
//          println("we've already seen "+status.getText());
      }
    }
  catch (TwitterException te) {
    println("Couldn't connect: " + te);
  }
  if(newTweet)
    updateArduino();
}

//sends an update character to an arduino
void updateArduino()
{
  println("updating arduino...");
  myPort.write("c");
}

void draw() {
  colorFadingBackground();
  if((millis()-lastPoll)>(pollingFrequency*1000))  
  {
    lastPoll=millis();
    thread("checkLatestTweets");
  }
}

void colorFadingBackground()
{
  background(lerpColor(currentColor, targetColor, (frameCount-startTime)/(timing-startTime)));
  if (frameCount==timing)
  {
    currentColor=targetColor;
    targetColor= color(random(256), random(256), random(256));
    timing=frameCount+(int)random(500);   
    startTime=frameCount;
  }
}

