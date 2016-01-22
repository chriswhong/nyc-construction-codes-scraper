var path = require('path'),
  extract = require('pdf-text-extract'),
  fs = require('fs'),
  walk = require('walk');

var outputPath = '../nyc-construction-codes-data/GENERAL-ADMINISTRATIVE-PROVISIONS';

var files   = [];
var topIndex = {
  heading: "GENERAL-ADMINISTRATIVE-PROVISIONS",
  children: []
};

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
 
//scrape the pdf
function scrape(filePath) {
  console.log('Scraping ' + filePath + '...');

  extract(filePath,  { splitPages: false }, function (err, text) {
    if (err) {
      console.dir(err);
      return;
    }

    //first get the chapter number and heading

    var match = text.match(/CHAPTER\D+(\d)\D+\s+([A-Z]+)\s+ARTICLE/);

    var chapterIndex = {
      prefix: "CHAPTER",
      num: match[1],
      heading: match[2],
      children: []
    }

    topIndex.children.push(chapterIndex.prefix + '-' + chapterIndex.num);

    var chapterPath = createDirectory(chapterIndex,outputPath);

  
    var articles = text.match(/(ARTICLE[\s\S]*?(?=ARTICLE|$))/g);


    articles.forEach(function(article) {
      

      //get the article number and heading
      var match = article.match(/ARTICLE\s(\d+)\s+(.*)/);
 

      var articleIndex = {
        prefix: "ARTICLE",
        num: match[1],
        heading: match[2],
        children: []
      }

      chapterIndex.children.push(articleIndex.prefix + '-' + articleIndex.num);

      var articlePath = createDirectory(articleIndex, chapterPath);

      var sections = article.match(/(^§[\s\S]*?(?=§|$))|(\s*?§[\s\S]*?(?=§|$))/g);
      if (sections) {
        sections.forEach( function(section) {

          //get the section number and heading
          var match = section.match(/§([\d-.]+)\s+([\s\S]*?)\.([\s\S]+)/);

          var sectionIndex = {
            prefix: "SECTION",
            num: match[1],
            heading: match[2],
            text: match[3]
          }

          articleIndex.children.push(sectionIndex.num)

          createSectionFile(sectionIndex, articlePath);
        })

        //write article index
        fs.writeFile(articlePath + '/index.json', JSON.stringify(articleIndex, null, 2));
      } 
    })

    //write chapter index
    fs.writeFile(chapterPath + '/index.json', JSON.stringify(chapterIndex, null, 2));


    //write top index every time... lazy
    topIndex.children.sort();
    fs.writeFile(outputPath + '/index.json', JSON.stringify(topIndex, null, 2));


    //create directory and save index file
    function createDirectory(index, path) {

      //update path
      path = path + '/' + index.prefix + '-' + index.num;

      //create a directory
      if (!fs.existsSync(path)){
        fs.mkdirSync(path);
      }

      return path;
    }

    function createSectionFile(index, path) {
      fs.writeFile(path + '/' + index.num + '.json', JSON.stringify(index, null, 2));
    }
  });



}


