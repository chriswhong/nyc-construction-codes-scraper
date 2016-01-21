 var path = require('path'),
  extract = require('pdf-text-extract'),
  fs = require('fs');

  var filePath = path.join(__dirname, "chapter1.pdf");

  var sections = [];



  var outputPath = './output';

 
  if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
  }

  extract(filePath,  { splitPages: false }, function (err, text) {
    if (err) {
      console.dir(err)
      return
    }

    //first get the chapter number and heading

    var match = text.match(/CHAPTER\D+(\d)\D+\s+([A-Z]+)\s+ARTICLE/m);

    var index = {
      prefix: "CHAPTER",
      num: match[1],
      heading: match[2]
    }


    //create a directory
    var dir = outputPath + '/' + index.prefix + '-' + index.num;
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    //save index file
    fs.writeFile(outputPath + '/index.json', JSON.stringify(index, null, 2));

    var articles = text.match(/(ARTICLE[\s\S]*?(?=ARTICLE|$))/g);

    // var split = text.split(/[\s]§/)
    // console.log(split.length);

    // for (var i=0; i<split.length; i++) {
    //   var blob = split[i];

    //   console.log(blob);
     

    //   //blob = blob.replace(/\r\n|\n|\r/g,'')//.replace(/ +(?= )/g,''); //get rid of newlines within the blob
    //         //console.log(blob)
    //   //check to make sure the blob starts with a number pattern
    //   var startNumber = blob.match(/^(\d\d-\d\d\d.*?)\s/);  //2digits-3digits.anything between line start and space

    //   if (startNumber) {
    //     var id = startNumber[0]; 
    //     var title = blob.match(/^\d\d-\d\d\d.*?\s(.*?[.])/)[1].trim(); //anything between section and next period.
    //     var text = blob.split(/^\d\d-\d\d\d.*?\s(.*?[.])/)[2].replace(/\r\n|\n|\r/g,'').trim();

    //     if(text.indexOf('ARTICLE') > -1) {
    //       text = text.split('ARTICLE')[0];
    //     }

    //     if (id) {
    //       var section = {
    //         id: id,
    //         title: title,
    //         text: text
    //       }

    //       console.log(section);

    //       sections.push(section);
    //     }
    //   }
     
      
    // }
   
    // fs.writeFile('output.txt', JSON.stringify(sections))

 



    // fs.writeFile('output.txt', text)
  });