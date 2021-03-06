// Generated by CoffeeScript 2.1.0
(function() {
  var Mysql, Opt, ZJ, argv, mysql, options, parseAddress, server, source, target;

  ZJ = require('zongji');

  Opt = require('optimist');

  Mysql = require('mysql2');

  argv = Opt.usage('Usage: $0 [ -s localhost ] [ -t 192.168.1.2 ]').demand(['s', 't', 'd', 'source_user', 'target_user', 'binlog_name', 'binlog_pos']).boolean('h').alias('i', 'id').alias('s', 'source').alias('t', 'target').alias('h', 'help').alias('n', 'binlog_name').alias('p', 'binlog_pos').alias('c', 'charset').alias('d', 'database').default('i', 10).default('c', 'utf8mb4').default('source_password', null).default('target_password', null).argv;

  if (argv.h) {
    Opt.showHelp();
    process.exit(0);
  }

  parseAddress = function(address) {
    var host, parts;
    host = [null, 3306];
    parts = address.split(':');
    host[0] = parts[0];
    if (parts.length > 1) {
      host[1] = parseInt(parts[1]);
    }
    return host;
  };

  source = parseAddress(argv.s);

  target = parseAddress(argv.t);

  options = {
    includeEvents: ['unknown', 'query', 'tablemap', 'writerows', 'updaterows', 'deleterows', 'rotate'],
    serverId: parseInt(argv.i)
  };

  if (argv.binlog_name != null) {
    options.binlogName = argv.binlog_name;
  }

  if (argv.binlog_pos != null) {
    options.binlogNextPos = argv.binlog_pos;
  }

  mysql = Mysql.createConnection({
    host: target[0],
    port: target[1],
    user: argv.target_user,
    password: argv.target_password + '',
    database: argv.d + '',
    charset: argv.c
  });

  mysql.query('SET sql_mode = ""');

  server = new ZJ({
    host: source[0],
    port: source[1],
    user: argv.source_user,
    password: argv.source_password + '',
    charset: argv.c
  });

  server.on('binlog', function(e) {
    console.log(server.binlogName + ':' + e.nextPosition);
    if (e.getEventName() === 'query' && !e.query.match(/^(BEGIN|COMMIT)\s*$/i)) {
      //console.log e.query
      return mysql.query(e.query, function(err, result) {
        if (err != null) {
          return console.log(err);
        }
      });
    }
  });

  server.on('error', function(e) {
    return console.log(e);
  });

  server.start(options);

}).call(this);
