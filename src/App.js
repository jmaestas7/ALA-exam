import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

const cheerio = require('cheerio');
const rp = require('request-promise');
const Promise = require('bluebird');
const builder = require('xmlbuilder');
const parseString = require('xml2js').parseString;

class App extends React.Component {

  constructor(props) {
    //do this always
    super(props);
    // This binding is necessary to make `this` work in the callback
    this.getData = this.getData.bind(this);
    this.state = {v: false};
  }

  getData = () => {
    return new Promise(function (resolve, reject, res) {
      let options = {
        uri: 'https://www.madcapsoftware.com/customers/customer-list',
        headers: {
          //'Access-Control-Allow-Origin': true
          //mode: 'no-cors'
        },
        transform: function (body) {
          return cheerio.load(body);
        }
      };
  
      rp(options)
        .then((($) => {
          // REQUEST SUCCEEDED
          //Resolve customer list from html
  
          //create xml using builder and ist. headers
          //<industries>
          var xml = builder.create('industries',
            {version: '1.0', encoding: 'UTF-8', standalone: true},
            {pubID: null, sysID: null},
            {skipNullNodes: false, skipNullAttributes: false, 
              headless: false, ignoreDecorators: false,
              separateArrayItems: false, noDoubleEncoding: false,
              stringify: {}});
              
          //iterate through each coloumn of customer list (industry)
          $('.customerList>div.col-12').each((i,elem)=> {
            //get industry name
            let iName = $(elem)[0].children[1].children[2].next.children[0].data;
            /*create industry header object
            <industries>
              <industry...
            */
            let industry = xml.ele('industry');
            /* add industry attribute name to empty industry object
            <industries>
              <industry name = "...
            */
            industry.att('name', iName);
  
            /*create customers header object
            <industries>
              <industry  name = "">
                <customers>
            */
            let customers = industry.ele('customers');
  
            //create array of list of children from the parent element
            let list = $(elem)[0].children[1].children[6].next.children;
            //iterate through each list item in the array
            $(list).each((i,elem)=> {
              //filter only the ul (unordered list) from the array
              if(elem.name === 'ul') {
                //iterate through each element in the ul
                for(let i in elem.children) {
                  let c = elem.children[i];
                  // filter only the proper nodes of the child elements, in this case if type is equal to tag
                  if(c.type === 'tag') {
                    // get date or the name of the filtered list as string
                    let cName = c.children[0].data;
                    let customer = customers.ele('customer');
                    customer.att('name', cName.trim());
                  }
                }
              }
            });
          });
          //format xml to readable pretty string
          let xmlString = xml.end({ 
            pretty: true,
            indent: '  ',
            newline: '\n',
            allowEmpty: true,
            spacebeforeslash: ''
          });
          //render dom with new pretty xml string
          ReactDOM.render(xmlString, document.getElementById('root'));
          //rexolve case for promise
          resolve();
        }))
        .catch(((err) => {
          // REQUEST FAILED
          // Handle error and reject promise
          reject(err);
        }));
    });
  };


  render() {
    const data = this.state.data;
    return (
      <div>
        <h1>Get Data</h1>
        <button onClick={this.getData}>Let's Do This</button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

export default App;
