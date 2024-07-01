const express = require('express');
const app = express();
var cors = require ("cors");
const multer=require ("multer");
const finnhub = require('finnhub');
app.use(cors());
var symbolAndName = {}
const uri = "mongodb+srv://admin:csci571hw3@cluster0.hdxgdrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "cn2n2o1r01qt9t7ut4q0cn2n2o1r01qt9t7ut4qg";
const finnhubClient = new finnhub.DefaultApi()

const { MongoClient } = require('mongodb');

const client = new MongoClient(uri);
var database;
var collection;

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const formattedDateToday = `${year}-${month}-${day}`;

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB server successfully');

        database = client.db('hw3');

        collection = database.collection('hw3'); 

        const query = {}; 
        documents = await collection.find(query).toArray();

        console.log('WatchlistTicker elements:', documents);

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
     }
    
}

connectToMongoDB();

var companyDetails;

app.listen(8080, () => {
    console.log("server started on port 8080");
});

app.get("/test", (req, res)=>{
    res.send(documents)
})

app.get('/autocomplete/:partialSymbol', async (req,res)=>{
    console.log("Inside autocomplete");
    var partialSymbol = req.params.partialSymbol;
    var url = "https://finnhub.io/api/v1/search?q=" + partialSymbol + "&token=cn2n2o1r01qt9t7ut4q0cn2n2o1r01qt9t7ut4qg";
    response = await fetch(url);
    var autoCompSuggestions = await response.json();
    const resultSubset = autoCompSuggestions.result.map(item => [item.symbol, item.description]);
    const newJson = JSON.stringify(resultSubset, null, 2);
    const filteredData = resultSubset.filter(subArray => !subArray[0].includes('.'));
    console.log("autocomplete done");
    res.send(filteredData);
    
})

app.get("/search/companyProfile/:ticker", (req,res)=>{
    console.log("Inside company profile");
    var tickerName = req.params.ticker;
    finnhubClient.companyProfile2({'symbol': tickerName}, (error, data, response) => {
        
        symbolAndName[data['ticker']] = data['name'];
        console.log("company profile done");
        res.send(data);
    });
})

app.get("/search/companyQuote/:ticker", async(req,res)=>{
    console.log("Inside company quote");
    var tickerName = req.params.ticker;
    var tp = await quoteCall(tickerName);
    console.log("company quote done");
    res.send(tp);
})

app.get("/search/peers/:ticker", async(req,res)=>{
    console.log("Inside peers");
    var tickerNam = req.params.ticker;
    var url = "https://finnhub.io/api/v1/stock/peers?symbol=" + tickerNam + "&token=cn2n2o1r01qt9t7ut4q0cn2n2o1r01qt9t7ut4qg";
    response = await fetch(url);
    var peers = await response.json();
    console.log("peers done");
    res.send(peers);
})

app.get("/search/charts/hourly/:ticker/:from/:to", async(req,res)=>{
    console.log("Inside charts hourly");
    var tickerNam = req.params.ticker;
    tickerNam = tickerNam.toUpperCase();
    var from = req.params.from;
    var to = req.params.to;
    var url = `https://api.polygon.io/v2/aggs/ticker/${tickerNam}/range/1/hour/${from}/${to}?adjusted=true&sort=asc&apiKey=YzLOupt6B9xcE91frptcCxsRG0QVEI3v`;
    response = await fetch(url);
    var chartHourlyInfo = await response.json();
    console.log("charts hourly done");
    res.send(chartHourlyInfo);
})

app.get("/search/charts/daily/:ticker/:from/:to", async(req,res)=>{
    console.log("Inside charts daily");
    var tickerNam = req.params.ticker;
    tickerNam = tickerNam.toUpperCase();
    var from = req.params.from;
    var to = req.params.to;
    var url = `https://api.polygon.io/v2/aggs/ticker/${tickerNam}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=YzLOupt6B9xcE91frptcCxsRG0QVEI3v`;
    response = await fetch(url);
    var chartDailyInfo = await response.json();
    console.log("charts daily done");
    res.send(chartDailyInfo);
})



app.get('/news/:ticker', (req,res)=>{
    console.log("Inside news");
    var tickerName = req.params.ticker;
    
    const oneWeekBefore = new Date(currentDate);
    oneWeekBefore.setDate(currentDate.getDate() - 7);

    const yearBefore = oneWeekBefore.getFullYear();
    const monthBefore = String(oneWeekBefore.getMonth() + 1).padStart(2, '0');
    const dayBefore = String(oneWeekBefore.getDate()).padStart(2, '0');
    var formattedDateBefore = `${yearBefore}-${monthBefore}-${dayBefore}`;

    finnhubClient.companyNews(tickerName, formattedDateBefore, formattedDateToday, (error, data, response) => {
        console.log("news done");
        res.send(data);
    });
})


app.get('/insights/insiderSenti/:ticker' , (req,res)=>{
    console.log("Inside insider senti");
    var tickerName = req.params.ticker;
    finnhubClient.insiderSentiment(tickerName, '2022-01-01', formattedDateToday, (error, data, response) => {
        console.log("insider senti done");
        res.send(data);
    });
})

app.get('/insights/recomm/:ticker' , (req,res)=>{
    console.log("Inside recom");
    var tickerName = req.params.ticker;
    finnhubClient.recommendationTrends(tickerName, (error, data, response) => {
        console.log("recom done");
        res.send(data);
    });
})

app.get('/insights/earnings/:ticker' , (req,res)=>{
    console.log("Inside earnings");
    var tickerName = req.params.ticker;
    finnhubClient.companyEarnings(tickerName, {'limit': 20}, (error, data, response) => {
        console.log("earnings done")
        res.send(data);
    });
})

app.get('/watchlist',async (req,res)=>{
    await connectToMongoDB();

    console.log("Inside watchlist");
    documents = await collection.find({}).toArray();
    watchlistArray = documents[0]['watchlist'].split(',')
    var watchlistDetailed = {};
    if (watchlistArray[0]==''){
        console.log("watchlist empty done");
        res.send({});
    }else{
        for(var i of watchlistArray){
            var tp = await quoteCall(i);
            watchlistDetailed[i] = tp;
            console.log(watchlistDetailed[i]);
            tick = i.toUpperCase();
            watchlistDetailed[i]['name'] = symbolAndName[tick];
            watchlistDetailed[i]['symbol'] = tick;
        }
        console.log("watchlist not empty done");
        res.send(watchlistDetailed);
    }
})

app.get('/watchlistAsArray',async (req,res)=>{
    console.log("inside watchlist as array");
    documents = await collection.find({}).toArray();
    var watchlistAsArray = documents[0]['watchlist'].split(',');
    console.log("watchlist as array done");
    res.send(watchlistAsArray);
})


app.get('/watchlist/add/:ticker', async(req,res)=>{
    console.log("inside watchlist add");
    var ticker = req.params.ticker;
    symbol = "," + ticker;
    documents = await collection.find({}).toArray();
    watchlistArray = documents[0]['watchlist'].split(',')
    if (watchlistArray[0]==''){
        symbol = ticker;
    }
    
    
    collection.updateMany(
        { watchlist: { $exists: true } }, 
        [
          {
            $set: {
              watchlist: { $concat: ["$watchlist", symbol] }
            }
          }
        ]
      );
      console.log("watchlist add done");
    res.send("added"); 
})


app.get('/watchlist/remove/:ticker' , async(req, res)=>{
    var ticker = req.params.ticker;
    console.log("inside watchlist remove");
    symbol = "," + ticker;
    documents = await collection.find({}).toArray();
    watchlistArray = documents[0]['watchlist'].split(',')

    if(watchlistArray.length==1){
        symbol = ticker;
    }
    else if(watchlistArray.indexOf(ticker)==0){
        symbol = ticker + ",";
    }

    collection.updateMany(
        { watchlist: { $exists: true } }, 
        [
          {
            $set: {
              watchlist: {
                $replaceOne: {
                  input: "$watchlist", 
                  find: symbol, 
                  replacement: ""
                }
              }
            }
          }
        ]
      );
      console.log("watchlist remove done");
    res.send("deleted");  
})

app.get("/fundsAvailable", async(req,res)=>{
    await connectToMongoDB();

    console.log("inside funds");
    documents = await collection.find({}).toArray();
    fundsAvailable = documents[0]['fundsAvailable']
    console.log("funds done");
    res.send(String(fundsAvailable));
})

app.get("/fundsAvailable/edit/:change", async(req,res)=>{
    console.log("funds edit");
    var change = Number(req.params.change);
    documents = await collection.find({}).toArray();
    fundsRemaining = Number(documents[0]['fundsAvailable']);
    fundsRemaining = change;
    collection.updateMany(
        {}, 
        { $set: { fundsAvailable: fundsRemaining } } 
      );
      console.log("funds edit done");
    res.send("changed");
})

async function quoteCall(i){
    console.log("quote call with url");
    var apiURl = `https://finnhub.io/api/v1/quote?symbol=${i}&token=cn2n2o1r01qt9t7ut4q0cn2n2o1r01qt9t7ut4qg`
    response = await fetch(apiURl);
    var quote = await response.json();
    console.log("quote call with url done");
    return quote;

}


app.get("/getPortfolio", async(req,res)=>{
    await connectToMongoDB();

    console.log("inside get portfolio");
    documents = await collection.find({}).toArray();
    portfolioArray = documents[0]['portfolio'];
    var portFinal = portfolioArray.map(item => JSON.parse(item));
    console.log("get portfolio done");
    res.send(portFinal);
})

app.get("/updatePortfolio/:updates", async(req,res)=>{
    console.log("inside update portfolio");
    var updates = req.params.updates;
    var updatedPortElement = JSON.parse(updates);
    let tickerToUpdate = updatedPortElement.ticker;
    let newQty = updatedPortElement.qty; 
    let newAvgCost = updatedPortElement.avgCost; 
    let name = updatedPortElement.name;

    let documents = await collection.find({}).toArray();
    let portfolioArray = documents[0]['portfolio'];
    let portFinal = portfolioArray.map(item => JSON.parse(item));

    let index = portFinal.findIndex(item => item.ticker === tickerToUpdate);
    if (index !== -1) {
        portFinal[index].qty = newQty;
        portFinal[index].avgCost = newAvgCost;
    } else {
        portFinal.push({ ticker: tickerToUpdate, name : name, qty: newQty, avgCost: newAvgCost });
    }

    let updatedPortfolioArray = portFinal.map(item => JSON.stringify(item));

    let docId = documents[0]['_id'];

    await collection.updateOne(
        { _id: docId },
        { $set: { portfolio: updatedPortfolioArray } }
    );

    console.log("Portfolio updated successfully");
    res.send(portFinal);
})


app.get("/removePortfolioElement/:ticker", async(req,res)=>{
    console.log("inside remove portfolio");
    var tickerToRemove = req.params.ticker;
    let documents = await collection.find({}).toArray();
    let portfolioArray = documents[0]['portfolio'];
    let portFinal = portfolioArray.map(item => JSON.parse(item));
    let modifiedPortfolio = portFinal.filter(item => item.ticker !== tickerToRemove);
    let stringifiedPortfolio = modifiedPortfolio.map(item => JSON.stringify(item));
    let docId = documents[0]['_id'];
    await collection.updateOne(
    { _id: docId },
    { $set: { portfolio: stringifiedPortfolio } }
    );
    console.log("Portfolio removed successfully");
    res.send(portFinal);
})