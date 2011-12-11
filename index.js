var http = require('https')
  , argv = require('optimist').argv
  , lev = require('./lib/lev-words')
  , fs = require('fs')

function logError(msg) {
  var red   = '\u001b[31m';
  var reset = '\u001b[0m';
  console.log(red + msg + reset)
}

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
    checkLicense(argv.user, argv.repo)
}


function checkLicense(user, repo) { 
  //check repo exists
  cfg = apiCfg
  cfg.path = "/repos/" + user + "/" + repo
  var licenseNames = ['LICENSE', 'LICENSE-MIT', 'COPYING', 'LICENSE.TXT', 'license.txt', 'Copying', 'MIT-LICENSE', 'LICENCE', 'LICENSE.txt']

  var next = function() {
    if(licenseNames.length === 0) {
      logError("Project " + user + "/" + repo + " doesn't have a license file")
    } else {
      file = licenseNames.pop()
      validateLicense(user, repo, file, next)
    }
  }

  http.get(cfg, function(res) {
    if(res.statusCode !== 404) {
      next()
    }
  })
} 

function validateLicense(user, repo, file, next) {
      //check for license file
      cfg = rawCfg;
      cfg.path = '/' + user + '/' + repo + '/master/' + file
      var data = ""
      http.get(cfg, function(res) {
        if(res.statusCode === 404) {
          next()
        } else {
          res.setEncoding('utf8')
          res.on('data', function(d) {
            data += d
          })
          res.on('end', function() {
            console.log('Checking ' + user + '/' + repo)
            console.log('Found ' + file)
            matchLicense(data)
          })
        }
      })
}

function matchLicense(lText) {
  var winner = {name:'', pc:0}
  for (license in licenses) {
    dist = lev.wordDist(lText, licenses[license])
    if(dist > winner.pc) {
      winner.name = license
      winner.pc = dist
    }
  }
  
  var output = (winner.pc > 0) ? 'I think this repo is licensed: ' + winner.name + ' (' + winner.pc + '%)' : 'No match found'
  console.log(output)
  console.log(new Array(output.length + 1).join('-')) //pad
}

function loadLicenses() {
  licenses = {}  
  licenses.bsd3 = fs.readFileSync(process.cwd() + '/templates/bsd3.txt').toString()
  licenses.bsd2 = fs.readFileSync(process.cwd() + '/templates/bsd2.txt').toString()
  licenses.mit = fs.readFileSync(process.cwd() + '/templates/mit.txt').toString()
  licenses.apache2 = fs.readFileSync(process.cwd() + '/templates/apache2.txt').toString()
  licenses.apache2short = fs.readFileSync(process.cwd() + '/templates/apache2-short.txt').toString()
  licenses.gpl2 = fs.readFileSync(process.cwd() + '/templates/gpl2.txt').toString()
  licenses.gpl3 = fs.readFileSync(process.cwd() + '/templates/gpl3.txt').toString()
  licenses.lgpl3 = fs.readFileSync(process.cwd() + '/templates/lgpl3.txt').toString()
  licenses.lgpl2 = fs.readFileSync(process.cwd() + '/templates/lgpl2.txt').toString()
  licenses['lgpl2.1'] = fs.readFileSync(process.cwd() + '/templates/lgpl2-1.txt').toString()
  licenses.artistic2 = fs.readFileSync(process.cwd() + '/templates/artistic2.txt').toString()
}
