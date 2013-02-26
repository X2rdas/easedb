#! /bin/sh
#
# chkconfig: 345 80 20
# description: run fetchmail service
#

if [ ! -x /home/admin/server/main.rb ]; then
    exit 1
fi

if [ -x /etc/rc.d/init.d/functions ]; then
   . /etc/rc.d/init.d/functions
fi

RETVAL=0

start () {
    echo "Starting base"
    cd ~admin/server
    thin start -C config_ssl.yml -R config.ru start --ssl --ssl-verify --ssl-key-file cert/server.key --ssl-cert-file cert/server.crt
    thin start -C config.yml
    RETVAL=$?
    [ $RETVAL -eq 0 ]
    echo
    return $RETVAL
}

stop () {
    echo -n "Stopping base"
    cd ~admin/server
    thin stop -C config_ssl.yml
    thin stop -C config.yml 
    RETVAL=$?
    [ $RETVAL -eq 0 ]
    echo
    return $RETVAL
}

case $1 in
    start)
  start
  ;;
    stop)
  stop
  ;;
    restart|reload)
  stop
  start
  ;;

    *)
  echo "Usage: $0 {start|stop|restart|reload}"
  ;;
esac

RETVAL=$?

exit $RETVAL