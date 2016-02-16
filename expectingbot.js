var TelegramBot = require('node-telegram-bot-api');
var Cleverbot = require('cleverbot-node');
var fs = require('fs');

var token = fs.readFileSync('telegram_token');

var version = "0.9.4";

var iExpectCount = 0;

var startedOn = Date.now();
var iInitialSilenceTime = 300000; // seconds

var countFile = "expectCount.txt";

var lastCount = fs.readFileSync(countFile);

var lastMessageTimestamp = Date.now();
var irritationTime = 60000; // timespan before it gets irritated

if(parseInt(lastCount)>=0) {
    iExpectCount = parseInt(lastCount);
}

var chippianID = -81071314;

var cleverbot = new Cleverbot;

// Setup polling way
var bot = new TelegramBot(token, {polling: true});

// Read all sentences from the file
var sentences = JSON.parse(fs.readFileSync('sentences.json', 'utf-8'));
// Store them in memory - separately
var normalText = sentences.normal_text;
var irritatedText = sentences.irritated_text;
var emojiIrritated = sentences.irritated_emoji;
var boredMessages = sentences.bored_text;

var randomMessages = [];
var maxRandomMessages = 1000;
var iMinRandomInterval = 30;
var iMaxRandomInterval = 90;

function storeMessage(msg) {
    if(randomMessages.length > maxRandomMessages) {
        randomMessages.shift();
    }
    randomMessages.push(msg);
}

function getRandomMessage() {
    if(randomMessages.length > 0) {
        return randomMessages[Math.floor(Math.random() * randomMessages.length)];
    }
    else 
    {
        return false;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendRandomMessage() {
    var randomInterval = getRandomInt(iMinRandomInterval, iMaxRandomInterval);
    resp = getRandomMessage();
    if(resp != false) {

        bot.sendMessage(chippianID, resp, { });
    }
    setTimeout(sendRandomMessage, randomInterval * 60 * 1000);

}
sendRandomMessage();

var iBoredTime = 120;

function sendBoredMessage() {
    var interval = iBoredTime * 60 * 1000;
    var nowTime = Date.now();
    if(nowTime - lastMessageTimestamp > interval) {
        resp = boredMessages[Math.floor(Math.random() * boredMessages.length)]
        bot.sendMessage(chippianID, resp, { });
        lastMessageTimestamp = Date.now();
    }

    setTimeout(sendBoredMessage, 5000);

}
sendBoredMessage();


bot.on("message", function(msg) {

    if(typeof msg.text != "undefined" && msg.text != ''  && msg.text.substring(0,1) != "/") {
        storeMessage(msg.text);        
    }

    //! Check if code contains mention to Expecting Bot or reply to Expecting Bot

    if(msg.chat.id > 0) {
        //! That's a private message 
        var actualMessage = msg.text;
        Cleverbot.prepare(function(){
            cleverbot.write(actualMessage, function (response) {
                var actualResponse = response.message;
                var fromId = msg.chat.id;
                var message_id = msg.message_id;
                bot.sendMessage(fromId, actualResponse, {
                    reply_to_message_id: message_id
                });
                lastMessageTimestamp = Date.now();
            });
        });
    }

    if(msg.text.substring(0, 13) == "@ExpectingBot") {
        //! Need to treat this
        var actualMessage = msg.text.substring(13);
        Cleverbot.prepare(function(){
            cleverbot.write(actualMessage, function (response) {
                var actualResponse = response.message;
                var fromId = msg.chat.id;
                var message_id = msg.message_id;
                bot.sendMessage(fromId, actualResponse, {
                    reply_to_message_id: message_id
                });
                lastMessageTimestamp = Date.now();
            });
        });
    }
    else {
        if(typeof msg.reply_to_message != "undefined") {
            if(msg.reply_to_message.from.username == "ExpectingBot") {
                //! Reply to bot's message
                var actualMessage = msg.text;
                Cleverbot.prepare(function(){
                    cleverbot.write(actualMessage, function (response) {
                        var actualResponse = response.message;
                        var fromId = msg.chat.id;
                        var message_id = msg.message_id;
                        bot.sendMessage(fromId, actualResponse, {
                            reply_to_message_id: message_id
                        });
                        lastMessageTimestamp = Date.now();
                    });
                });
            }
        }
    }

});

bot.onText(/^(?!\/).*(expecting|expect)(.*)/, function (msg, match) {
    var nowTime = Date.now();
    if(nowTime - startedOn <= iInitialSilenceTime) {
        iExpectCount++;
        return;
    }
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = normalText[Math.floor(Math.random() * normalText.length)];


    if(nowTime - lastMessageTimestamp <= irritationTime) {
        resp = irritatedText[Math.floor(Math.random() * irritatedText.length)] + " " + emojiIrritated[Math.floor(Math.random() * emojiIrritated.length)];
    }

    lastMessageTimestamp = Date.now();
    iExpectCount++;
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/\/stop/, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "Abe teri aukaat nahi mere ko rokne ki!";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
    lastMessageTimestamp = Date.now();
});

bot.onText(/\/start/, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "Abe gandu me chalu hi hoon!";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/(.*)okBotRaj(.*)/i, function (msg, match) {
    var nowTime = Date.now();
    if(nowTime - startedOn <= iInitialSilenceTime) {
        iExpectCount++;
        return;
    }
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "Jaa be chutiye";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
    lastMessageTimestamp = Date.now();
});

bot.onText(/(.+)pls/i, function (msg, match) {
    var nowTime = Date.now();
    if(nowTime - startedOn <= iInitialSilenceTime) {
        iExpectCount++;
        return;
    }
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "hoomanRajpls";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
    lastMessageTimestamp = Date.now();
});

bot.onText(/ok([a-z]*)Raj/i, function (msg, match) {
    var nowTime = Date.now();
    if(nowTime - startedOn <= iInitialSilenceTime) {
        iExpectCount++;
        return;
    }
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "oKHOOMANRAJ";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
    lastMessageTimestamp = Date.now();
});

bot.onText(/\/version/, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "Current Version is v" + version;
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/\/sendrandom/i, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = getRandomMessage();
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/\/randomstorecount/i, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = randomMessages.length;
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/\/sendrandomx ([0-9]+)/i, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = randomMessages[match[1]];
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/\/expect/, function (msg, match) {
    iExpectCount++;
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "Haha. Chutiya banaya. Is command se kuch nahi hota.";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
    lastMessageTimestamp = Date.now();
});


bot.onText(/\/count/, function (msg, match) {
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "People have expected " + iExpectCount + " times so far. This is why people get depressed.";
    bot.sendMessage(fromId, resp, {
        reply_to_message_id: message_id
    });
});

bot.onText(/kimochi warui/i, function (msg, match) {
    var nowTime = Date.now();
    if(nowTime - startedOn <= iInitialSilenceTime) {
        iExpectCount++;
        return;
    }
    var fromId = msg.chat.id;
    var message_id = msg.message_id;
    var resp = "BQADAgAD0wAD1DtKAqEY7t9ksdg6Ag";
    bot.sendSticker(fromId, resp, {
        reply_to_message_id: message_id
    });
    lastMessageTimestamp = Date.now();
});

// catch exit
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

function exitHandler(options, err) {
    fs.writeFileSync('expectCount.txt', iExpectCount);
    process.exit();   // Don't think you'll need this line any more
}
