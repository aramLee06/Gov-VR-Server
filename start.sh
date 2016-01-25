#!/bin/bash

case "$1" in
  start)
    forever start bin/$2
    ;;
  stop)
    forever stop bin/$2
    ;;
  restart)
    forever restart bin/$2
    ;;
  list)
    forever list
    ;;
  *)
    echo ###partial###FFD562AA-48AB-4E71-A427-27C213D60728quot;Usage: $0 {start|stop|list}"
    exit 1
esac
exit 0