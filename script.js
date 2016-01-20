 var path = require('path'),
  extract = require('pdf-text-extract'),
  fs = require('fs');

  var filePath = path.join(__dirname, "chapter1.pdf");

  var sections = [];

  extract(filePath,  { splitPages: false }, function (err, text) {
    if (err) {
      console.dir(err)
      return
    }

    //console.log(text);

    //console.log(text);
    var split = text.split(/[\s]§/)
    console.log(split.length);

    for (var i=0; i<split.length; i++) {
      var blob = split[i];

      console.log(blob);
      //blob = blob.replace(/\r\n|\n|\r/g,'')//.replace(/ +(?= )/g,''); //get rid of newlines within the blob
            //console.log(blob)
      //check to make sure the blob starts with a number pattern
      var startNumber = blob.match(/^(\d\d-\d\d\d.*?)\s/);  //2digits-3digits.anything between line start and space

      if (startNumber) {
        var id = startNumber[0]; 
        var title = blob.match(/^\d\d-\d\d\d.*?\s(.*?[.])/)[1].trim(); //anything between section and next period.
        var text = blob.split(/^\d\d-\d\d\d.*?\s(.*?[.])/)[2].replace(/\r\n|\n|\r/g,'').trim();

        if(text.indexOf('ARTICLE') > -1) {
          text = text.split('ARTICLE')[0];
        }

        if (id) {
          var section = {
            id: id,
            title: title,
            text: text
          }

          console.log(section);

          sections.push(section);
        }
      }
     
      
    }
   
    fs.writeFile('output.txt', JSON.stringify(sections))

 



    //fs.writeFile('output.txt', text)
  });