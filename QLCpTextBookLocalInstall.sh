#!/bin/bash

if [ ! -d inclext ]; then
  mkdir -p inclext
  curl https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css -o inclext/bootstrap.min.css
  curl https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css.map -o inclext/bootstrap.min.css.map
  curl https://code.jquery.com/jquery-3.5.1.min.js -o inclext/jquery-3.5.1.min.js
  curl https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js -o inclext/bootstrap.min.js
  curl -L https://github.com/summernote/summernote/archive/refs/tags/v0.8.20.zip -o summernote-0.8.20.zip
  unzip -o summernote-0.8.20.zip
  mv summernote-0.8.20/dist/font inclext/
  mv summernote-0.8.20/dist/lang inclext/
  mv summernote-0.8.20/dist/plugin inclext/
  mv summernote-0.8.20/dist/summernote.min.* inclext/
  rm -R summernote-0.8.20*
fi
