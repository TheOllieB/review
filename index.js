const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const express = require('express');
const api = require('./api/api');
const app = express();
var http = require('http');
const server = http.createServer(app)
var io = require('socket.io')(server);
const request = require('request-promise');
const bodyParser = require('body-parser');
require('dotenv').config();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2018-11-16',
    iam_apikey: process.env.WAT_API,
    url: "https://gateway-lon.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2018-11-16"
  });

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/results', (req, res) => {
    res.render('results');
});

io.on('connection', (socket) => {
    console.log('back - connected');
    socket.on('input', (data)=>{
    console.log(data);
    const location = data.location;
    const business = data.business;
    //get the businesses 
    api.getBusiness(business, location).then(result => {
        console.log(result.businesses[0]);
        idArray = [];
        let businesses = result.businesses;
        //loop through each returned business and store their id 
        for(let i = 0; i < businesses.length; i++){
            idArray.push(businesses[i].id);
        }
        // Get the reviews by searching for the business with the id
        for(let i = 0; i < idArray.length; i++){
            api.getReviewById(idArray[i]).then(result => {
                //console.log(result);
                const reviews = result.reviews;
                let reviewsArray = [];
                for(let i = 0; i < reviews.length; i++){
                    reviewsArray.push(reviews[i].text);
                }
                //Join the reviews together
                let allReviews = reviewsArray.join();
                const analyzeParams = {
                    'text': allReviews ,
                    'features': {
                      'emotion': {
                      }
                    }
                  };
                  //Use Watson to analyse the language used.
                  naturalLanguageUnderstanding.analyze(analyzeParams)
                  .then(analysisResults => {
                      let emotions = analysisResults;
                      let sad = JSON.stringify(emotions.emotion.document.emotion.sadness);
                      let joy = JSON.stringify(emotions.emotion.document.emotion.joy);
                      let fear = JSON.stringify(emotions.emotion.document.emotion.fear);
                      let anger = JSON.stringify(emotions.emotion.document.emotion.anger);
                      let disgust = JSON.stringify(emotions.emotion.document.emotion.disgust);
                      console.log('Before emit!');
                      socket.broadcast.emit('output', {sad: sad, joy: joy, fear: fear, disgust: disgust, anger: anger});
                  })
                  .catch(err => {
                      console.log('error:', err);
                  });
                });
            }
        
        });
    });
});


// api.getBusiness('mcdonalds').then(result => {
//     //console.log(result.businesses[0].id);
//     //TQ3yFvw_2OvdavniABbMWQ
//     idArray = [];
//     let businesses = result.businesses;
//     //let id = result.businesses[0].id;
//     for(let i = 0; i < businesses.length; i++){
//         idArray.push(businesses[i].id);
//     }
//     console.log(idArray);
//     api.getReviewById(idArray[0]).then(result =>{
//         const reviews = result.reviews;
//         let reviewsArray = [];
//         //console.log(result);
//         for(let i = 0; i < reviews.length; i++){
//             reviewsArray.push(reviews[i].text);
//         }
//         let allReviews = reviewsArray.join();
//         const analyzeParams = {
//             'text': allReviews ,
//             'features': {
//               'emotion': {
//               }
//             }
//           };

//     naturalLanguageUnderstanding.analyze(analyzeParams)
//         .then(analysisResults => {
//             console.log(JSON.stringify(analysisResults, null, 1));
//         })
//         .catch(err => {
//             console.log('error:', err);
//         });
//     })
// });

// naturalLanguageUnderstanding.analyze(analyzeParams)
//   .then(analysisResults => {
//     console.log(JSON.stringify(analysisResults, null, 2));
//   })
//   .catch(err => {
//     console.log('error:', err);
//   });

console.log(Hello);
    
server.listen(8080, (err) => {
    if(err) {
        console.log(err);
    }
    else {
    console.log('Server started on port 8080!');
    }
});