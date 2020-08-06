// const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
var fs = require("fs");
const tabletojson = require('tabletojson').Tabletojson;

class Scraper{
    url = ''
    tableIndex = 0;
    replaces= [];

    constructor(url,tableIndex,replaces){
        this.url = url;
        this.tableIndex = tableIndex;
        this.replaces = replaces;

        this.getPageContent = this.getPageContent.bind(this);
        this.tableToJson = this.tableToJson.bind(this);
        this.replace = this.replace.bind(this);
        this.replaceAll = this.replaceAll.bind(this);
        this.jsonToCurrencies = this.jsonToCurrencies.bind(this);
    }
            

    async getPageContent(){
        var url = this.url;
        return await new Promise((res,rej) => {
            puppeteer
                .launch()
                .then(browser => {
                    console.log('browser launched')
                    return browser.newPage()})
                .then(page => {
                    page.setDefaultNavigationTimeout(50000); // change timeout to 50 s
                    console.log('loading page')
                    return page.goto(url,{
                        waitUntil: 'networkidle0',
                    }).then(() => page)
                })
                .then((page) => {
                    console.log('getting page content')
                    return page.content();
                })
                .then(html => {
                    res(html);
                })
                .catch(rej);
        })
    }

    tableToJson(html){
        return tabletojson.convert(html)[this.tableIndex];
    }

    replace(val){
        if(val)
            this.replaces.forEach(({from,to, exactly, maxCharDiff, type}) => {
                val = val.trim();
                if(exactly && val === from) {
                    val = to;
                }
                else{
                    var replacedVal = val;
                    replacedVal = replacedVal.replace(from, to)
                    if(!exactly && (val.includes(from) || replacedVal.includes(to))){
                        if(Math.abs(val.length - from.length) <= maxCharDiff || Math.abs(replacedVal.length - to.length) <= maxCharDiff){
                            val = to;
                        }
                    }
                }
            })
        return val.trim();
    }

    replaceAll(json){
        return json.map(row => {
            var newRow = {};
            Object.keys(row).forEach(key => {
                newRow[this.replace(key)] = this.replace(row[key]);
            })
            return newRow;
        })
    }

    jsonToCurrencies(replacedJson){
        // return replacedJson;
        var json = {};
        //isNaN: isNaN(val),
        var validCurrencies = [
            'CAD',
            'USD',
            'AUD',
            'EURO'
        ];

        var validHeaders = [
            'Date',
            'Buy',
            'Sell'
        ];

        replacedJson.forEach(row => {
            if(validCurrencies.includes(row.Currency)){
                var newRow = {};
                Object.keys(row).forEach(key => {
                    if(validHeaders.includes(key)){
                        newRow[key] = row[key];
                    }
                })
                json[row.Currency] = newRow;
            }
        })
        
        return json;
    }

    async getCurrencies(){
        return await this.getPageContent()
                .then(this.tableToJson)
                .then(this.replaceAll)
                .then(this.jsonToCurrencies)
    }

    async getCurrenciesFromHTML(html){
        var json = this.tableToJson(html);
        json = this.replaceAll(json);
        json = this.jsonToCurrencies(json);
        return json;
    }
}


var replaces = [
    {
        from: 'تاریخ',
        to: 'Date',
        exactly: true,
    },
    {
        from: 'نام کالا',
        to: 'Currency',
        exactly: true,
    },
    {
        from: 'خرید',
        to: 'Buy',
        exactly: true,
    },
    {
        from: 'فروش',
        to: 'Sell',
        exactly: true,
    },
    {
        from: 'دلار کانادا - کارتخوان',
        to: 'CAD',
        exactly: true,
    },
    {
        from: 'دلار آمريکا اسکناس',
        to: 'USD',
        exactly: false,
        maxCharDiff: 1
    }
];

var zarbanScraper = new Scraper('http://www.zarban.ca/',0,replaces);
zarbanScraper.getCurrencies().then(console.log).catch(console.error);

// zarbanScraper.getPageContent().then(html => {
//     fs.writeFile('zarban.html', html, function(err) {
//         if(err) console.error(err);
//     })
// })

// fs.readFile('zarban.html', function(err, buf) {
//     if(err) console.error(err);
//     else if(buf){
//         zarbanScraper.getCurrenciesFromHTML(buf).then(console.log).catch(console.error);
//     }
// })
