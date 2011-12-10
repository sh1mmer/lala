var http = require('https')
  , argv = require('optimist').argv
  , lev = require('./lib/lev-words')
  , fs = require('fs')


if(argv.help) {
  var help = "Help\n"  +
  "  --toprepos - Find licenses in the toprepos on Github\n" +
  "  --user - Username of repo\n" +
  "  --repo - Repo name\n" +
  "  --likely - Only show likely licenses (90%+)"
  
  console.log(help) 
  process.exit()
}

var rawCfg = {
  host: 'raw.github.com'
  , port: 443
}
var apiCfg = {
  host: 'api.github.com'
  , port: 443
}
var cfg = {}

loadLicenses()

if(argv.toprepos) {
  repos = fs.readFileSync(process.cwd() + '/repos1.txt').toString().split('\n')
  for(var i=0;i<repos.length;i++) {
    var data = repos[i].split(" ")
    checkLicense(data[0], data[1])
  }
} else if (argv.user && argv.repo) {

}


function checkLicense(user, repo) { 
  //check repo exists
  cfg = apiCfg
  cfg.path = "/repos/" + user + "/" + repo
  http.get(cfg, function(res) {
    if(res.statusCode !== 404) {
      //check for license file
      cfg = rawCfg;
      cfg.path = '/' + user + '/' + repo + '/master/LICENSE'
      var data = ""
      http.get(cfg, function(res) {
        if(res.statusCode === 404) {
          console.log("Project " + user + "/" + repo + " doesn't have a license file")
        } else {
          res.setEncoding('utf8')
          res.on('data', function(d) {
            data += d
          })
          res.on('end', function() {
            console.log('Checking ' + user + '/' + repo)
            matchLicense(data)
          })
        }
      })
    }
  })
} 

function matchLicense(lText) {
  for (license in licenses) {
    dist = lev.wordDist(lText, licenses[license])
    if(argv.likely && dist < 90) continue
    console.log(dist + '% likely to be ' + license)
  }
}

function loadLicenses() {
  licenses = {}  
  licenses.bsd3 = fs.readFileSync(process.cwd() + '/templates/bsd3.txt').toString()
  licenses.bsd2 = fs.readFileSync(process.cwd() + '/templates/bsd2.txt').toString()
  licenses.mit = fs.readFileSync(process.cwd() + '/templates/mit.txt').toString()
  licenses.apache2 = fs.readFileSync(process.cwd() + '/templates/apache2.txt').toString()
  licenses.gpl2 = fs.readFileSync(process.cwd() + '/templates/gpl2.txt').toString()
  licenses.gpl3 = fs.readFileSync(process.cwd() + '/templates/gpl3.txt').toString()
}
