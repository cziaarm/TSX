# TSX
Transcriptorium Crowd Sourcing Platform

TSX is a web interface for transcription of digitised handwritten material "by the crowd". TSX was developed as part of the <a href="http://transcriptorium.eu/">tranScripotium project</a> and uses the <a href="https://transkribus.eu/Transkribus/">Transkribus</a> web servicces to manage transcripts and access digitised images and HTR tool outputs.

###Pre-reququisites

apache, php

### Instalation

Clone this repository on to the docroot or sub-directory thereof on server.

### Brief overview of code

Most of the functionailty and interaction with transkribus is handled client side. There are some php scripts that handle some very simple config, html templating and also a php proxy to the transkribus server to avoid X-domain issues.

js/tsx.js comtains all the tsx clientside functionailty with the help of the following libraries:

- jQuery
  - jQuery-ui
  - jQuery-cookie
  - jQuery-json2xml
  - jQuery-mousewheel
  - jQuery validate
  - Jquery-xslt
- jstree
- xml2json
- codemirror
  - show-hint
  - xml
  - merge
  - diff_match_patch
- bootstrap
  - bootstrap-dialog
- raphael
  - raphael-pan-zoom
