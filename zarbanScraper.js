const Scraper = require('./scraper')

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

const zarbanScraper = new Scraper('http://www.zarban.ca/',0,replaces);
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
