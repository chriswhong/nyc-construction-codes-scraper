 var path = require('path'),
  extract = require('pdf-text-extract'),
  fs = require('fs'),
  walk = require('walk');

  // //input file
  // var filePath = path.join(__dirname, "source/chapter1.pdf");
  var outputPath = './output';

var files   = [];

// Walker options
var walker  = walk.walk('./source', { followLinks: false });


walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});

walker.on('end', function() {
    files.forEach(function( file ) {
      scrape(path.join(__dirname, file))
    })
});
 
  //add output directory
  if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
  }


function scrape(filePath) {

  extract(filePath,  { splitPages: false }, function (err, text) {
    if (err) {
      console.dir(err)
      return
    }

    //first get the chapter number and heading

    var match = text.match(/CHAPTER\D+(\d)\D+\s+([A-Z]+)\s+ARTICLE/);

    var index = {
      prefix: "CHAPTER",
      num: match[1],
      heading: match[2]
    }

    var chapterPath = createDirectory(index,outputPath);

  
    var articles = text.match(/(ARTICLE[\s\S]*?(?=ARTICLE|$))/g);

    articles.forEach(function(article) {
     

      //get the article number and heading
      var match = article.match(/ARTICLE\s(\d+)\s+(.*)/);
 

      var index = {
        prefix: "ARTICLE",
        num: match[1],
        heading: match[2]
      }

      var articlePath = createDirectory(index, chapterPath);

      var sections = article.match(/(^§[\s\S]*?(?=§|$))|(\s*?§[\s\S]*?(?=§|$))/g);
      if (sections) {
        sections.forEach( function(section) {

          //get the section number and heading
          var match = section.match(/§([\d-.]+)\s+([\s\S]*?)\.([\s\S]+)/);

          var index = {
            prefix: "SECTION",
            num: match[1],
            heading: match[2],
            text: match[3]
          }

          createSectionFile(index, articlePath);
        })
      } 
    })


    //create directory and save index file
    function createDirectory(index, path) {

      //update path
      path = path + '/' + index.prefix + '-' + index.num;

      //create a directory
      if (!fs.existsSync(path)){
        fs.mkdirSync(path);
      }

      //save index file
      fs.writeFile(path + '/index.json', JSON.stringify(index, null, 2));

      return path;
    }

    function createSectionFile(index, path) {
      fs.writeFile(path + '/' + index.num + '.json', JSON.stringify(index, null, 2));
    }
  });
}