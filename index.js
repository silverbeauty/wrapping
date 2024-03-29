const express = require('express'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      uuidv1 = require('uuid/v1'),
      path = require('path')
      
let app = express(),
    cheerio = require('cheerio'),
    urlParser = require('url'),
    isUrl = require('is-url'),
    puppeteer = require('puppeteer'),
    port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const catchError = (callback) => {
  return async (req, res) => {
    try {
      await callback(req, res)
    } catch (e) {
      console.error(e)
      res.status(500).send({
        status: false,
        error: 'internal_server_error'
      })
    }
  }
}

  
const srapping = async(req, res) => {
  const {url} = req.body
  const hostname = urlParser.parse(url).protocol + '//' + urlParser.parse(url).hostname;
  if(url){
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 0
    });
    const  html = await page.content();
        let $ = cheerio.load(html);
        let images = $('body').find('img');
      
        if(images.length > 0) {
          let data = []
          for(let i=0; i<images.length; i++) {
            let imageLink = images[i].attribs.src;
                    
            if(!isUrl(imageLink)) {
              imageLink = hostname + imageLink;
            }
            
            const image = {
              '_id': uuidv1(),
              'src': imageLink
            };
            data.push(image)
          }
          res.json({
            data
          })
        } else {
          res.status(400).json({
            status: 'false'
          })
        }
  } else {
    res.status(400).json({
      status: 'false'
    })
  }
}
app.post('/', catchError(srapping));
app.get('/',  (req, res) => { res.send('OK'); });
const server = app.listen(port, (err) => {
  if(!err) {
    const port = server.address().port;
    console.log('App Listening on ', port);
  }
});