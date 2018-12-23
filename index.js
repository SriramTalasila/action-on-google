const express = require('express')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000
const {
    dialogflow,
    BasicCard,
    BrowseCarousel,
    BrowseCarouselItem,
    Button,
    Image

} = require('actions-on-google');

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": "valiant-39346",
        "private_key_id": "8f5daaa97641459bc7fd6f46e01c474c00f76660",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkMEYmu1WWn679\nChxzodVJim2NS4n0vsooT+niCju3RzERyRD+ll3AKaN7dUkSaasOx13XCqNreW/e\niWn/PvD/bQdMVlxgitViGzQQUFnZwUTNDHP89r7UbWykgGiKInZKcXJhjtL00DCe\nzq1iBzf22bcfqo5edD/NJWk35Fq6qc10Y5VbWurSrvvPGQ2niLYLK8p8hx6huMDD\n5kRZ0kgxh0F8w85cqIwI4mhnq65BpJZQpiFILmjPvrvfQZ3VQzqN1daB/bNttdkY\nMsYWEHd/OUS/SqwhPLlt+MY8DV87w73Nm8mizsIZUB8VpH5gXUYAQx2LQyB42mmz\nkjpU83sjAgMBAAECggEARlF2efgZe9z/8Nd3v/47freOm8kSWIOtyP4QyQJg+OnA\nlkFqyd5UYIx0u9dLaFthK38vLX4c51anFsP7ZZnrVTm4unTyM1bCdLX54lLHaH9h\nnAANXPXAXPJQaVOlciO4TcGwnx+wMbFIYXtavnUg/tPXnfRJ7SIUgSPYoFtokDCh\ncqHH0McKVZzborRF18N7ictCqRhrEDjFCAOVXi+WOxkhvQyYCZprNt878g8Y8+A9\nVglFo6Bwjm2C76KamugnMq4E4JgeXvJSDvhZUjanI2YJdZTvlDgfnJTRra+F1myv\n/Cgv6y/Yqk6uNKCsnMXOcHditpmtxBI2wZccrD7wAQKBgQDPIdb21iDmp12arotw\nuPXDfwPqxUYcS5DALNECz5p3cQiXGnaW6ZNr4if5BSa7GftgXV/JWH+0JiGpWmin\n6BCFkXGUTzq1tIjSF45DSyBLAS1VaOOwTlOw7Kqf5HxEbWFBcb2F+re/n8pF5gg0\n0OYe9q2B3FB7ZERKWk1jjLBuAQKBgQDK7MTtJ3CQ81L5J7Rjp0+bRNfA4nVAR08s\nZh4Sf1ZiXeyLUTTWDozIJJcFY/NtyHdmj6ciqcMrwLmNkKdlg4TGLhH1FhO8rthO\nGIRUlQRMzCVIW+0C0WrN3uqRSW/filI6m+404wMEt4yz1Xi95BVivTWObAjlYjjY\nuEDOJEZxIwKBgQCR6zv+DmGFPFjD9LzE/3gbbip7RNicbFugFrJz8X7XMCkmEf2D\nWS+C7ALO+mMLokUl4QHu3Uqxxb8nCEr8Jo8lGY5TNfGdOn68yt1s6MrqK/0c01S7\nyqJI3KFjHNqydf/y08b5UOQLue0Miv4y/wtuuscG2gdUthEp9C3auK0+AQKBgGHy\nUMcrf0DnwcfzazWin2ERpJY8eF3TTZrfm2pQPlDyhudkBf3APiGoz6BRc0EtPryp\nYAHyMPtgZe+3v6TXC3Jg8Ff9FP/A4TUozk7JMq8i5mf7vvXaQRQnoc8IxFAAwtn5\nQ8wROva+5dIzmrkFa3EiZMRezxhxBYFNxjH5/mpDAoGAXb7uBJPNsOLkyjcZitMI\njpu1NGhZabLdCEMs81vzgoh6asFNIA9cIKKV054cSeXgyypPTr1zV7klIe05M9LG\n8IaDt/mOj9cKM+A5UcIsJr4oRKSjXTenkcc+lqcm2EKFpLyiMO16k8rlBEVu8GrW\nstv2AzkZIPYsilOQ7stLw4c=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-vre21@valiant-39346.iam.gserviceaccount.com",
        "client_id": "112342537911687257481",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-vre21%40valiant-39346.iam.gserviceaccount.com"
    }),
    databaseURL: "https://valiant-39346.firebaseio.com"
});
var db = admin.database();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const app = dialogflow({ debug: true });

app.intent('Default Welcome Intent', (conv) => {
    conv.close("Hi, Welcome to valiant 2k18 how can i help you?");
});


const expressApp = express().use(bodyParser.json())

app.intent('depteventsinfo', (conv, params) => {
    var it = [];
    var ref = db.ref("Departments/" + params.department_info + "/events");
    ref.on("value", function (snapshot) {
        for (var key in snapshot.val()) {
            it.push(new BrowseCarouselItem({
                title: snapshot.val()[key].name,
                url: snapshot.val()[key].link,
                image: new Image({
                    url: snapshot.val()[key].image,
                    alt: 'Image alternate text',
                }),
            }));
        }
        conv.close("Here is the list of " + params.department_info + " department events");
        conv.close(new BrowseCarousel({
            items: it,
        }));
    });

});

// regfee
app.intent('Regfee', (conv, params) => {
    var event = params.event_info;
    var ref = db.ref("Departments/" + event);
    ref.on('value', function (snapshot) {
        if (snapshot.val().regfee) {
            conv.close('Registration fee for ' + snapshot.val().name + " is " + snapshot.val().regfee + " Rupees");
        }
        else {
            conv.close("Sorry, we don't have information.\n Please contact student Co-ordinator");
        }
    });
});

// aboutEvents
app.intent('aboutEvents', (conv, params) => {
    var ref = db.ref("Departments/" + params.event_info);
    ref.on('value', function (snapshot) {
        var ob = snapshot.val();
        conv.close("Here is details about the event");
        conv.close(new BasicCard({
            text: ob.description,
            title: ob.name,
            buttons: new Button({
                title: 'Visit site',
                url: ob.link,
            }),
            image: new Image({
                url: ob.image,
                alt: 'Image alternate text',
            }),
            display: 'CROPPED',
        }));
    });
});

//Spot Registration
app.intent('spot', (conv, params) => {
    var event = params.event_info;
    var ref = db.ref("Departments/" + event);
    ref.on('value', function (snapshot) {
        conv.close('Spot registrations are ' + snapshot.val().spot + ' ' + snapshot.val().name);
    });
});

//registration link
app.intent('RegisterMe', (conv, params) => {
    var event = params.event_info;
    var ref = db.ref("Departments/" + event);
    ref.on('value', function (snapshot) {
        if (snapshot.val().reglink) {
            conv.close("You can register using the link ");
            conv.close(new BasicCard({
                title: snapshot.val().name,
                image: new Image({
                    url: snapshot.val().image,
                    alt: 'Image alternate text',
                }),
                buttons: new Button({
                    title: 'Register',
                    url: snapshot.val().reglink,
                }),

                display: 'CROPPED',
            }));
        }
        else {
            conv.close("Sorry, we don't have information.\n Please contact student Co-ordinator");
        }
    });
});

//about event Coordinator
app.intent('Eventcoordinator', (conv, params) => {
    var ref = db.ref("Departments/" + params.event_info);
    var p = params.person_info;
    ref.on("value", function (snapshot) {
        var obj = snapshot.val();
        var c = "";
        if (p == 'Faculty') {
            c = "Faculty Co-ordinator for " + obj.name + " is " + obj.Faculty.name;
        }
        if (p == 'student') {
            var t = obj.student.phone.toString();
            t = t.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, "$1-$2-$3");
            console.log(t);
            c = "Student Co-ordinator for " + obj.name + " is " + obj.student.name + "and contact is " + t;

        }
        conv.close(c);
    });
});


expressApp.post('/fulfillment', (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }


    function yourFunctionHandler(agent) {
        agent.add(`This message is from Dialogflow's Cloud Functions for Firebase inline editor!`);
        agent.add(new Card({
            title: `Title: this is a card title`,
            imageUrl: 'https://dialogflow.com/images/api_home_laptop.svg',
            text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
            buttonText: 'This is a button',
            buttonUrl: 'https://docs.dialogflow.com/'
        })
        );
        agent.add(new Suggestion(`Quick Reply`));
        agent.add(new Suggestion(`Suggestion`));
        agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' } });
    }


    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
    // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
    agent.handleRequest(intentMap);
});

expressApp.listen(PORT, () => console.log(`Listening on ${PORT}`))