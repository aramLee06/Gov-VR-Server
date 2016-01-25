# src/com/cspmedia

	+-- auth/
	|   +-- gameparty_auth.js
	+-- database/
	|   +-- query/
	|   +-- gameparty_mongo.js
	|   +-- gameparty_mysql.js
	|   +-- hiq_mysql.js
	|   +-- spacerunner_mysql.js
	+-- gameparty/
	|   +-- hiq/
	|   |   +-- hiq_error.js
	|   |   +-- host.js
	|   +-- spacerunner/
	|   |   +-- ImageUtil.js
	|   |   +-- spacerunner.js
	|   +-- gameparty_error.js
	|   +-- gameparty_game.js
	|   +-- gameparty_launcher.js
	|   +-- gameparty_user.js
	+-- log/
	|   +-- gameparty_logger.js
	+-- net/tcp/
	|   +-- gp_console_log.js
	|   +-- gp_integrated_roommanager.js
	|   +-- gp_tcpsoc_connector.js
	+-- util
	|   +-- gameparty_check_rest.js
	|   +-- gameparty_room_info.js

## auth/gameparty_auth.js

REST 에서 유저의 인증에 쓰이는 파일

## database/

데이터베이스 관련 유틸

### query

내부에서 사용되는 SQL 파일들이 존재

### gameparty_mongo.js

MongoDB 관련 유틸 파일이며, MongoDB는 게임서버상에서 Room의 관리에 사용된다.

별도의 Query없이 작성된 함수를 통해 접근 가능

### gameparty_mysql.js

Mysql 관련 유틸 파일. REST 쪽과 연결되어 사용되므로, 사용시 주의를 요함

관련 파일 : [app_rest.js](file_structure.md#app_restjs), [gameparty_game.js](#gameparty_gamejs), [gameparty_launcher.js](#gameparty_launcherjs), [gameparty_user.js](#gameparty_userjs)

### hiq_mysql.js, spacerunner_mysql.js

현재 **hiq** 와 **spacerunner**는 게임 동작시 DB를 사용하므로 이와 대응되는 MySql 유틸 파일

위와 유사하게 REST쪽과 연결되어 사용되므로 [gameparty_mysql.js](#gameparty_mysqljs) 의 사용법을 참조 

## gameparty/

**hiq** 와 **spacerunner** 및 Controller, Laucnher 의 REST 통신부의 로직

### hiq/, spacerunner/

게임 관련 REST 로직, [app_rest.js](file_structure.md#app_restjs) 에서 URL(action)과 연결 됨

### gameparty_error.js

Game Server 의 에러 메시지 생성 모듈

관련 파일 : [errorCode.json](file_structure.md#errorcodejson)

### gameparty_game.js

WebSite에 등록된 Game Data Information 처리 모듈

### gameparty_launcher.js

Game Launcher 조인등 Launcher에서 사용되는 api 모듈

### gameparty_user.js

Profile, Picture 등 Controller에서 사용되는 User 관련 처리 모듈

## log/gameparty_logger.js

REST 서버에서 사용하는 Logger 유틸, Log는 [ROOT/log/](file_structure.md#log)에 생성되며, yyyy-mm-dd-{{type}}.log 로 생성됨. `log4js` 사용

{{type}} 으로는

* debug
* error
* info

## net/tcp

Socket 통신 관련 모듈

### gp_console_log.js

Socket 통신에서는 상술한 Logger를 사용하지 않고 별도의 Logger를 사용함. `sm-log` 사용

### gp_intergrated_roommanger.js

Socket Message 를 처리하는 로직 코드. Game Room, Data Transfer 관련 처리 모듈

### gp_tcpsoc_connector.js

TCP 서버를 생성하고, 이에 대한 이벤트 처리를 해주는 코드. [app_game.js](file_structure.md#app_gamejs)에서 이 파일을 호출하여 서버를 생성함

## util/

### gameparty_check_rest.js

REST 서버에서 접속 URL(action)에 대한 validate.

### gameparty_room_info.js

[net/tcp](#nettcp) 에서 사용되는 Room 및 Client등의 객체 정의 및 상수 정의